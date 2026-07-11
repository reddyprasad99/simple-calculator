// electron/main.js — LockIn AI stealth desktop wrapper
// Loads the built React app (frontend/build) and applies stealth features.

const { app, BrowserWindow, globalShortcut, ipcMain, screen } = require('electron');
const path = require('path');

const isDev = !app.isPackaged;

let mainWin = null;
let stealthEnabled = true; // start in stealth-on for interview mode

function createWindow() {
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;

  mainWin = new BrowserWindow({
    width: 1280,
    height: 820,
    x: Math.floor((sw - 1280) / 2),
    y: Math.floor((sh - 820) / 2),
    frame: false,               // no titlebar
    transparent: true,          // allow transparent bg
    hasShadow: false,
    resizable: true,
    skipTaskbar: stealthEnabled, // hide from taskbar
    alwaysOnTop: true,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // 🥷 The magic: hide from screen-sharing (Zoom/Meet/Teams cannot capture this window)
  //    Works on Windows (SetWindowDisplayAffinity) and macOS 10.15+.
  mainWin.setContentProtection(stealthEnabled);

  // Keep above every app including full-screen
  mainWin.setAlwaysOnTop(true, 'screen-saver');
  if (process.platform === 'win32') {
    mainWin.setSkipTaskbar(stealthEnabled);
  }

  // Load the React build (or dev server in dev mode)
  const url = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../frontend/build/index.html')}`;
  mainWin.loadURL(url);

  if (isDev) mainWin.webContents.openDevTools({ mode: 'detach' });

  mainWin.on('closed', () => { mainWin = null; });
}

function registerHotkeys() {
  // Toggle window visibility entirely
  globalShortcut.register('Control+Shift+H', () => {
    if (!mainWin) return;
    mainWin.isVisible() ? mainWin.hide() : mainWin.show();
  });

  // Toggle stealth (content protection + taskbar)
  globalShortcut.register('Control+Shift+L', () => {
    if (!mainWin) return;
    stealthEnabled = !stealthEnabled;
    mainWin.setContentProtection(stealthEnabled);
    if (process.platform === 'win32') mainWin.setSkipTaskbar(stealthEnabled);
    mainWin.webContents.send('stealth-changed', stealthEnabled);
  });

  // Click-through toggle — mouse events pass through to app behind
  let clickThrough = false;
  globalShortcut.register('Control+Shift+M', () => {
    if (!mainWin) return;
    clickThrough = !clickThrough;
    mainWin.setIgnoreMouseEvents(clickThrough, { forward: true });
    mainWin.webContents.send('clickthrough-changed', clickThrough);
  });

  // Move window with keyboard when mouse is unusable during an interview
  const nudge = (dx, dy) => {
    if (!mainWin) return;
    const [x, y] = mainWin.getPosition();
    mainWin.setPosition(x + dx, y + dy);
  };
  globalShortcut.register('Control+Shift+Up',    () => nudge(0, -40));
  globalShortcut.register('Control+Shift+Down',  () => nudge(0,  40));
  globalShortcut.register('Control+Shift+Left',  () => nudge(-40, 0));
  globalShortcut.register('Control+Shift+Right', () => nudge( 40, 0));

  // Suggest hotkey — forwarded to renderer to trigger the whisper answer
  globalShortcut.register('Control+Shift+Space', () => {
    if (!mainWin) return;
    mainWin.webContents.send('trigger-suggest');
  });
}

// IPC — renderer window controls (since frame is hidden)
ipcMain.on('win-minimize', () => mainWin?.minimize());
ipcMain.on('win-close',    () => mainWin?.close());
ipcMain.on('win-hide',     () => mainWin?.hide());
ipcMain.on('set-stealth',  (_e, on) => {
  stealthEnabled = !!on;
  mainWin?.setContentProtection(stealthEnabled);
  if (process.platform === 'win32') mainWin?.setSkipTaskbar(stealthEnabled);
});

app.whenReady().then(() => {
  // macOS: hide from dock
  if (process.platform === 'darwin' && app.dock) app.dock.hide();

  createWindow();
  registerHotkeys();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('will-quit', () => globalShortcut.unregisterAll());
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
