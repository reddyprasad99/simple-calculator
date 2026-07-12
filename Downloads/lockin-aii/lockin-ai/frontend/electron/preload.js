// electron/preload.js — safe bridge between renderer (React) and main process.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('lockin', {
  // Window controls (since we removed the titlebar)
  minimize: () => ipcRenderer.send('win-minimize'),
  close:    () => ipcRenderer.send('win-close'),
  hide:     () => ipcRenderer.send('win-hide'),
  setStealth: (on) => ipcRenderer.send('set-stealth', on),

  // Listen for global hotkey events triggered from main
  onSuggest: (cb) => ipcRenderer.on('trigger-suggest', () => cb()),
  onStealthChanged: (cb) => ipcRenderer.on('stealth-changed', (_e, v) => cb(v)),
  onClickThroughChanged: (cb) => ipcRenderer.on('clickthrough-changed', (_e, v) => cb(v)),

  // Feature flag so the React app knows it's running inside Electron
  isDesktop: true,
  platform: process.platform,
});
