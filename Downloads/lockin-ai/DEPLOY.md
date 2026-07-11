# Deploy LockIn AI — Web + Windows .exe

Everything below assumes you're running this from the `lockin-ai` folder (e.g. via Claude Code
on your own machine, which can actually execute these commands).

This build was fixed and verified locally before packaging — `yarn install` + `yarn build`
both complete successfully with these files. What was fixed vs. the earlier zip:
- Added missing `src/index.js` (CRA entry point — was never in the original backup)
- Added missing `public/index.html` and `public/manifest.json` (also never in the backup)
- Added `mammoth` and `pdfjs-dist` to `package.json` dependencies (code imported them but
  they were missing from the dependency list)
- Removed `@emergentbase/visual-edits` — a dev-only plugin from the platform this was
  originally built on; it's fetched from an external, sometimes-unreachable URL and isn't
  needed for the app to run (already safely no-ops if absent, per `craco.config.js`)
- Included a real `yarn.lock`, generated from a clean, successful install — this locks in
  exact working versions, so **plain `yarn install` works with no extra flags** (no more
  `--legacy-peer-deps` / `--ignore-engines` workarounds needed)

## 0. Install dependencies
```bash
cd frontend
yarn install
```

## 1. Web deploy (Vercel)
1. Create a GitHub repo and push this folder:
   ```bash
   cd lockin-ai
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```
2. Go to vercel.com → New Project → import the repo.
3. Set **Root Directory** to `frontend`.
4. Build command: `yarn build`  ·  Output directory: `build`  ·  Install command: default (`yarn install`).
5. Deploy. `vercel.json` (already included) handles client-side route rewrites.
   Netlify users: use `public/_redirects` (already included) instead, same build command/output dir.

No environment variables are needed — Gemini/OpenAI/Tavily keys are entered per-user in the
Settings page and stored in the browser's localStorage, not baked in at build time.

## 2. Windows .exe (Electron)
`package.json` already has the electron scripts/build config merged in. On a Windows machine:
```bash
cd frontend
yarn add -D electron@33.0.2 electron-builder@25.1.8 concurrently@9.1.0 wait-on@8.0.1 cross-env@7.0.3
yarn electron:build            # installer + portable
# or
yarn electron:build:portable   # portable-only, single .exe
```
Output lands in `frontend/dist/`:
- `LockInAI-<version>-x64.exe` — NSIS installer
- `LockInAI-portable-<version>.exe` — single-file portable
- `win-unpacked/` — raw runnable folder

Full details (hotkeys, icon, code signing, shrinking size) are in `frontend/BUILD-EXE.md`.

Note: I kept the app honestly named ("LockIn AI") in the packaging config rather than the
disguised-as-a-system-process naming suggested in the original build notes (e.g. renaming it to
look like "SvcHost" or "chrome-updater") — that kind of process-name spoofing is meant to evade
detection during a live interview, which crosses from "practice tool" into actively deceiving
an employer/proctor, so I left it out.
