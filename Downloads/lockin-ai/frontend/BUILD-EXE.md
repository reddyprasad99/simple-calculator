# Building the Windows `.exe` — LockIn AI (HelperService)

You will build this on your **local Windows machine** (no Wine, no cross-compilation). Takes ~5–10 minutes.

## 1. One-time setup
```powershell
# In your project root, on Windows
cd frontend
yarn install
yarn add -D electron@33.0.2 electron-builder@25.1.8 concurrently@9.1.0 wait-on@8.0.1 cross-env@7.0.3
```

## 2. Patch `frontend/package.json`
Add these fields (keep everything else you already have):

```json
{
  "main": "electron/main.js",
  "homepage": "./",
  "scripts": {
    "start": "craco start",
    "build": "craco build",
    "test": "craco test",
    "electron:dev": "concurrently -k \"cross-env BROWSER=none yarn start\" \"wait-on http://localhost:3000 && electron .\"",
    "electron:build": "yarn build && electron-builder --win --x64",
    "electron:build:portable": "yarn build && electron-builder --win portable --x64",
    "electron:build:mac": "yarn build && electron-builder --mac --x64",
    "electron:build:linux": "yarn build && electron-builder --linux AppImage"
  },
  "build": {
    "appId": "com.helper.service",
    "productName": "HelperService",
    "asar": true,
    "files": [
      "electron/**/*",
      "build/**/*",
      "package.json"
    ],
    "extraMetadata": {
      "main": "electron/main.js"
    },
    "directories": {
      "buildResources": "electron/assets",
      "output": "dist"
    },
    "win": {
      "target": [
        { "target": "nsis",     "arch": ["x64"] },
        { "target": "portable", "arch": ["x64"] }
      ],
      "artifactName": "HelperService-${version}-${arch}.${ext}",
      "requestedExecutionLevel": "asInvoker"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true,
      "shortcutName": "Helper Service"
    },
    "portable": {
      "artifactName": "HelperService-portable-${version}.exe"
    },
    "mac":   { "target": "dmg", "category": "public.app-category.productivity" },
    "linux": { "target": "AppImage", "category": "Utility" }
  }
}
```

> **Rename tip for stealthier taskbar:** change `"productName": "HelperService"` to something generic like `"WindowsUpdateHelper"`, `"SvcHost"`, or `"chrome-updater"`. Do NOT impersonate a real system binary — that can trip antivirus + is legally risky.

## 3. Build

```powershell
# HTTPS-only build (installer + portable together)
yarn electron:build

# just the portable .exe (single file, no installer)
yarn electron:build:portable

# quick dev run without packaging
yarn electron:dev
```

Output lands in `frontend/dist/`:
- `HelperService Setup 0.1.0.exe` — NSIS installer
- `HelperService-portable-0.1.0.exe` — single-file portable
- `win-unpacked/` — raw runnable folder (double-click `HelperService.exe`)

## 4. Global Hotkeys (work even without window focus)
| Shortcut              | Action                                                          |
|-----------------------|-----------------------------------------------------------------|
| `Ctrl + Shift + H`    | Show / hide entire window                                       |
| `Ctrl + Shift + L`    | Toggle stealth mode (content-protection + taskbar hide)         |
| `Ctrl + Shift + M`    | Toggle click-through (mouse passes through window)              |
| `Ctrl + Shift + Space`| Trigger "Suggest" in the Stealth Overlay                        |
| `Ctrl + Shift + ↑↓←→` | Nudge window position by 40 px                                  |
| `Ctrl + Shift + S`    | Open/close Stealth Overlay (in-app hotkey, works anywhere)      |

## 5. Stealth capabilities implemented
- `win.setContentProtection(true)` → **invisible to Zoom / Meet / Teams / OBS screen share**
- `win.setSkipTaskbar(true)` → not in taskbar
- `frame: false, transparent: true` → no titlebar, no OS chrome
- `win.setAlwaysOnTop(true, 'screen-saver')` → floats above everything
- `win.setIgnoreMouseEvents(true, { forward: true })` → click-through mode
- Global hotkeys via `globalShortcut` → works when app has no focus
- macOS: `app.dock.hide()` → no dock icon

## 6. Icon (optional but recommended)
Create `frontend/electron/assets/icon.ico` (256×256, .ico format). electron-builder picks it up automatically. Skip and it uses the default electron icon.

## 7. Reducing installer size
The default build is ~110 MB (electron runtime). To shrink:
```json
// add to "build" block above
"compression": "maximum",
"asarUnpack": [],
"npmRebuild": false
```

## 8. Code signing (optional, removes Windows SmartScreen warning)
```json
"win": {
  "certificateFile": "path/to/cert.pfx",
  "certificatePassword": "envVar:CSC_KEY_PASSWORD"
}
```
Without signing the .exe still works — users just click "More info → Run anyway" on first launch.

## ⚠️ Ethics reminder
`setContentProtection` is legit for practice/rehearsal but using it during a real proctored interview may violate the employer's policy, the platform's ToS (HackerRank/Codility), and in some jurisdictions may qualify as fraud. Position the product as **practice-only**. Add a disclaimer screen on first launch.
