import { useState } from 'react';
import { Code2, Loader2, Sparkles, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { getKeys, getPrefs } from '@/lib/storage';
import { codingAnswer } from '@/lib/gemini';

const LANGS = ['Auto', 'Python', 'JavaScript', 'Java', 'C++', 'Go', 'TypeScript'];

export default function Coding() {
  const [question, setQuestion] = useState('');
  const [language, setLanguage] = useState('Auto');
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const run = async () => {
    const keys = getKeys();
    if (!keys.gemini) { toast.error('Add your Gemini API key in Settings first.'); return; }
    if (!question.trim()) { toast.error('Paste or type a coding question first.'); return; }
    setBusy(true); setAnswer('');
    try {
      const prefs = getPrefs();
      const out = await codingAnswer({
        apiKey: keys.gemini,
        model: prefs.model,
        question: question.trim(),
        language: language === 'Auto' ? '' : language,
      });
      setAnswer(out);
    } catch (e) {
      toast.error(e.message || 'Failed to generate');
    } finally {
      setBusy(false);
    }
  };

  const copyAnswer = () => {
    navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-8 py-10" data-testid="coding-page">
      <div className="flex items-center gap-2 mb-1">
        <Code2 className="w-5 h-5 text-sky-400" />
        <h1 className="text-3xl font-medium tracking-tight">Coding Practice</h1>
      </div>
      <p className="text-white/45 text-[13px] mb-8">
        Paste a DSA / coding question you're studying — get an approach, complexity, working solution, and an edge case to mention out loud. Self-study mode, review before or after practice.
      </p>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 mb-6">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          data-testid="coding-question-input"
          placeholder="e.g. Given an array of integers, find two numbers that add up to a target sum. Return their indices."
          rows={4}
          className="w-full bg-black/20 border border-white/10 rounded-lg px-3.5 py-2.5 text-[13px] text-white/90 outline-none focus:border-sky-500/40 placeholder:text-white/25 resize-y mb-3"
        />
        <div className="flex items-center justify-between gap-3">
          <select value={language} onChange={(e) => setLanguage(e.target.value)}
            data-testid="coding-language-select"
            className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-[12.5px] text-white/80 outline-none focus:border-sky-500/40">
            {LANGS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <button onClick={run} disabled={busy} data-testid="coding-solve-btn"
            className="px-5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-black text-[13px] font-medium flex items-center gap-2">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Solve
          </button>
        </div>
      </div>

      {answer && (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5" data-testid="coding-answer">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] uppercase tracking-wider text-sky-400 font-mono-ui">Solution</div>
            <button onClick={copyAnswer} className="text-[11.5px] text-white/50 hover:text-white/80 flex items-center gap-1.5">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="whitespace-pre-wrap text-[13px] leading-relaxed text-white/90 font-mono-ui">{answer}</pre>
        </div>
      )}

      {!busy && !answer && (
        <div className="text-center py-16 text-white/30 text-[13px]">
          Paste a question above to get a taught walkthrough.
        </div>
      )}
    </div>
  );
}
