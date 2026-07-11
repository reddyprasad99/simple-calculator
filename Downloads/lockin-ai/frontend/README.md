# LockIn AI — recovered project

This folder was reconstructed from a text backup (`lockin.txt`) of a chat log where the code
was originally generated. Files were extracted programmatically from the exact `file_editor create`
commands in that log, so contents should match what was actually written to disk originally.

## Setup

```bash
cd frontend
yarn install
yarn add pdfjs-dist@4.7.76 mammoth@1.8.0
yarn start
```

Requires Node.js + Yarn. Uses CRA + CRACO, with a `@` → `src/` alias (see `craco.config.js`).

## Structure
- `src/App.js`, `src/App.css`, `src/index.css` — app shell & global styles
- `src/lib/` — storage (localStorage helpers), Gemini API client, file parsing (PDF/DOCX/TXT)
- `src/components/` — Shell (nav/layout), StealthProvider/StealthOverlay, Placeholder
- `src/pages/` — Dashboard, Resume, Settings, Mock, Coding, Files
- `electron/` — optional desktop wrapper (main.js, preload.js) + build docs
- `BUILD-EXE.md` — instructions for packaging a Windows .exe with electron-builder

⚠️ Note: the electron stealth overlay (content-protection / hide-from-screen-share) was built
for interview *practice*. Using it to hide AI assistance during an actual live/proctored interview
would likely violate the interviewing platform's terms of service and could be considered
misrepresentation to an employer — worth keeping in mind before deploying this beyond personal practice.
