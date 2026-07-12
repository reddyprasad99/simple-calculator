import { useEffect, useState } from 'react';
import { getKeys, setKeys, getPrefs, setPrefs } from '@/lib/storage';
import { Eye, EyeOff, Save, KeyRound, Sliders, Check } from 'lucide-react';
import { toast } from 'sonner';

const MODELS = [
  { id: 'gemini-flash-lite-latest', label: 'Gemini Flash Lite — latest (auto-updates, recommended)' },
  { id: 'gemini-flash-latest', label: 'Gemini Flash — latest (auto-updates, higher quality)' },
  { id: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash Lite (pinned version)' },
  { id: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash (pinned, newest flagship)' },
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (older — may be retired soon)' },
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (retired — will not work)' },
];

export default function Settings() {
  const [keys, setLocalKeys] = useState({ gemini: '', openai: '', tavily: '' });
  const [prefs, setLocalPrefs] = useState({ voiceMode: 'interviewer', answerLength: 'auto', model: 'gemini-flash-lite-latest' });
  const [show, setShow] = useState({ gemini: false, openai: false, tavily: false });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLocalKeys(getKeys());
    setLocalPrefs(getPrefs());
  }, []);

  const save = () => {
    setKeys(keys);
    setPrefs(prefs);
    setSaved(true);
    toast.success('Settings saved locally');
    setTimeout(() => setSaved(false), 1600);
  };

  return (
    <div className="max-w-3xl mx-auto px-8 py-10" data-testid="settings-page">
      <h1 className="text-3xl font-medium tracking-tight mb-1">Settings</h1>
      <p className="text-white/45 text-[13px] mb-8">
        Everything is stored locally in this device (localStorage). Nothing leaves your machine except API calls to the providers you configure.
      </p>

      <section className="rounded-xl border border-white/10 bg-white/[0.02] p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <KeyRound className="w-4 h-4 text-emerald-400" />
          <h2 className="text-[15px] font-medium">API Keys</h2>
        </div>

        <KeyRow label="Gemini API Key" badge="required" testId="gemini-key-input"
          value={keys.gemini} show={show.gemini}
          onToggle={() => setShow(s => ({ ...s, gemini: !s.gemini }))}
          onChange={(v) => setLocalKeys(k => ({ ...k, gemini: v }))}
          help={<>Get one at <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">aistudio.google.com/apikey</a> — used for resume analysis, mock scoring, whisper answers.</>} />
        <KeyRow label="OpenAI API Key (Whisper)" testId="openai-key-input"
          value={keys.openai} show={show.openai}
          onToggle={() => setShow(s => ({ ...s, openai: !s.openai }))}
          onChange={(v) => setLocalKeys(k => ({ ...k, openai: v }))}
          help={<>Optional. Only used for voice transcription in Phase 2. <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">platform.openai.com/api-keys</a></>} />
        <KeyRow label="Tavily API Key" testId="tavily-key-input"
          value={keys.tavily} show={show.tavily}
          onToggle={() => setShow(s => ({ ...s, tavily: !s.tavily }))}
          onChange={(v) => setLocalKeys(k => ({ ...k, tavily: v }))}
          help={<>Optional. Used to enrich prep with company/role context (Phase 2). <a href="https://tavily.com" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">tavily.com</a></>} />
      </section>

      <section className="rounded-xl border border-white/10 bg-white/[0.02] p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <Sliders className="w-4 h-4 text-emerald-400" />
          <h2 className="text-[15px] font-medium">Preferences</h2>
        </div>

        <Label>Voice recognition mode</Label>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <RadioTile active={prefs.voiceMode === 'interviewer'}
            onClick={() => setLocalPrefs(p => ({ ...p, voiceMode: 'interviewer' }))}
            title="Interviewer only"
            desc="Listen to the interviewer's audio (system/playback), whisper as candidate." />
          <RadioTile active={prefs.voiceMode === 'both'}
            onClick={() => setLocalPrefs(p => ({ ...p, voiceMode: 'both' }))}
            title="Interviewer + Student"
            desc="Capture both voices for full transcript & smarter follow-ups." />
        </div>

        <Label>Answer length (lines)</Label>
        <div className="flex gap-2 mb-6 flex-wrap">
          {['auto', 1, 2, 3, 4, 5].map(v => (
            <button key={v} onClick={() => setLocalPrefs(p => ({ ...p, answerLength: v }))}
              data-testid={`length-${v}`}
              className={`px-4 py-1.5 rounded-full text-[12px] border transition-colors ${
                prefs.answerLength === v
                  ? 'bg-emerald-500 border-emerald-500 text-black font-medium'
                  : 'border-white/15 text-white/70 hover:border-white/30'
              }`}>
              {v === 'auto' ? 'Auto' : v}
            </button>
          ))}
        </div>
        <div className="text-[11px] text-white/40 -mt-3 mb-6">Auto lets AI pick 1–5 lines based on question.</div>

        <Label>Gemini model</Label>
        <select value={prefs.model} onChange={(e) => setLocalPrefs(p => ({ ...p, model: e.target.value }))}
          data-testid="model-select"
          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[13px] text-white/90 outline-none focus:border-emerald-500/40">
          {MODELS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>
      </section>

      <button onClick={save} data-testid="settings-save-btn"
        className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-[13px] font-medium flex items-center gap-2">
        {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
        {saved ? 'Saved' : 'Save Settings'}
      </button>
    </div>
  );
}

function Label({ children }) {
  return <div className="text-[10px] uppercase tracking-wider text-white/40 font-mono-ui mb-2">{children}</div>;
}

function KeyRow({ label, badge, value, onChange, show, onToggle, help, testId }) {
  return (
    <div className="mb-5 last:mb-0">
      <div className="flex items-center gap-2 mb-1.5">
        <label className="text-[13px] text-white/85">{label}</label>
        {badge && <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-mono-ui">{badge}</span>}
      </div>
      <div className="relative">
        <input type={show ? 'text' : 'password'} value={value}
          data-testid={testId}
          onChange={(e) => onChange(e.target.value)} placeholder="sk-…"
          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 pr-10 text-[13px] text-white/90 outline-none focus:border-emerald-500/40 font-mono-ui" />
        <button onClick={onToggle} type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-white/5 text-white/50 hover:text-white">
          {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
      </div>
      <div className="text-[11px] text-white/40 mt-1.5">{help}</div>
    </div>
  );
}

function RadioTile({ active, onClick, title, desc }) {
  return (
    <button onClick={onClick}
      className={`text-left rounded-lg border p-3.5 transition-colors ${
        active ? 'border-emerald-500/50 bg-emerald-500/[0.06]' : 'border-white/10 hover:border-white/25 bg-white/[0.02]'
      }`}>
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-3.5 h-3.5 rounded-full border ${active ? 'border-emerald-400 bg-emerald-400' : 'border-white/30'}`} />
        <div className="text-[13px] font-medium">{title}</div>
      </div>
      <div className="text-[11.5px] text-white/50 leading-relaxed ml-5">{desc}</div>
    </button>
  );
}
