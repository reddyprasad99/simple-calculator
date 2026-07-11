# LockIn AI — Interview Copilot

## Original Problem Statement
Rebuild the LockIn AI frontend (React + CRA/CRACO) using the code snippets shared by the user. Prior session ran out of credits mid-way; this session recreated Phase 1 quickly under credit constraints.

## Architecture
- **Frontend only** (no backend needed for Phase 1). All state in `localStorage`.
- React 19 + react-router-dom v7 + Tailwind + lucide-react + sonner
- `@` alias points to `src/` (via craco.config.js)
- External deps installed: `pdfjs-dist@4.7.76`, `mammoth@1.8.0`
- Direct fetch calls to Gemini `generativelanguage.googleapis.com` from the browser using user-supplied API key.

## What's Implemented (Phase 1 — Jan 2026)
- **Dashboard** (`/`) — hero, stat cards, 5 module cards, Start Mock / Enable Stealth buttons
- **Resume** (`/resume`) — drag-drop PDF/DOCX/TXT upload → Gemini analysis → tailored questions
- **Settings** (`/settings`) — Gemini/OpenAI/Tavily API keys, voice mode, answer length (Auto/1–5), model picker
- **Stealth Overlay** — draggable floating whisper panel triggered via Ctrl+Shift+S (or top-bar / dashboard button)
- **Hide App** — Ctrl+Shift+H fades UI to 2% opacity
- `Mock`, `Coding`, `Files` — placeholder pages for Phase 2
- Full design system: Instrument Serif hero + Geist body + JetBrains Mono UI, emerald accent, grid+noise background
- All interactive elements have `data-testid` attributes

## Bugs Fixed from Source Snippets
- `StealthProvider.jsx` had `value={ … }` and `style={ … }` (missing double braces) — fixed
- `StealthOverlay.jsx` had `style={ … }` and unterminated `onKeyDown` handler — fixed
- `Resume.jsx` had unterminated `onDragOver`/`onDrop` handlers — fixed

## Backlog (Prioritized from user's roadmap)
### P0 — Phase 2
- [ ] Mock Interview: timer + question queue + per-answer scoring
- [ ] Coding Interview: DSA problem bank + reference solutions + complexity
- [ ] File Study Kit: multi-format upload → summaries + generated MCQs
- [ ] Voice: system-audio capture + Whisper transcription (interviewer-only mode)
- [ ] Voice: mic + tab audio + speaker labels (interviewer + student mode)
- [ ] Live "Listen" button inside Stealth Overlay with waveform

### P1
- [ ] Tavily web enrichment for company-specific prep
- [ ] Session history with recharts trend & PDF export
- [ ] Prompt customization (STAR / bullet / conversational)

### P2 — Phase 3 (Electron)
- [ ] `.exe` wrapper with `setContentProtection`, `setSkipTaskbar`, `setAlwaysOnTop`
- [ ] Global hotkeys via `globalShortcut`
- [ ] Native system audio loopback (WASAPI)
- [ ] Screen-region OCR
- [ ] Code-sign + auto-updater

## Test Credentials
Users bring their own Gemini API key (added in Settings page). No credentials seeded.

## Files
```
frontend/src/
├── App.js, App.css, index.css
├── lib/{storage,gemini,fileParser}.js
├── components/{Shell,StealthProvider,StealthOverlay,Placeholder}.jsx
└── pages/{Dashboard,Resume,Settings,Mock,Coding,Files}.jsx
```
