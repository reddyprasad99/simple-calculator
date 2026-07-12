import { useEffect, useRef, useState } from 'react';
import { Upload, FileText, Loader2, Sparkles, RefreshCcw, Trash2, StickyNote } from 'lucide-react';
import { toast } from 'sonner';
import { parseFile } from '@/lib/fileParser';
import { analyzeResume } from '@/lib/gemini';
import { getKeys, getPrefs, getResume, setResume, getAnalysis, setAnalysis, pushHistory, getNotes, setNotes } from '@/lib/storage';

const MAX = 10 * 1024 * 1024;

export default function Resume() {
  const inputRef = useRef(null);
  const [resume, setLocalResume] = useState(null);
  const [analysis, setLocalAnalysis] = useState(null);
  const [notes, setLocalNotes] = useState('');
  const [notesSaved, setNotesSaved] = useState(true);
  const [busy, setBusy] = useState('');
  const [drag, setDrag] = useState(false);

  useEffect(() => {
    setLocalResume(getResume());
    setLocalAnalysis(getAnalysis());
    setLocalNotes(getNotes());
  }, []);

  const saveNotes = () => {
    setNotes(notes);
    setNotesSaved(true);
    toast.success('Notes saved');
  };

  const runAnalysis = async (text) => {
    const keys = getKeys();
    if (!keys.gemini) { toast.error('Add your Gemini API key in Settings first.'); return; }
    setBusy('analyze');
    try {
      const prefs = getPrefs();
      const out = await analyzeResume({ apiKey: keys.gemini, model: prefs.model, text, notes: getNotes() });
      setAnalysis(out); setLocalAnalysis(out);
      pushHistory({ type: 'resume-analysis', role: out.role });
      toast.success('Analysis ready');
    } catch (e) {
      toast.error(e.message || 'Analysis failed');
    } finally {
      setBusy('');
    }
  };

  const handleFiles = async (files) => {
    const file = files?.[0];
    if (!file) return;
    if (file.size > MAX) { toast.error('File too large (max 10 MB).'); return; }
    const name = file.name.toLowerCase();
    if (!name.match(/\.(pdf|docx|txt)$/)) { toast.error('Use PDF, DOCX, or TXT.'); return; }

    setBusy('parse');
    try {
      const text = await parseFile(file);
      if (!text || text.length < 50) throw new Error('Could not extract text');
      const r = { name: file.name, size: file.size, text, ts: Date.now() };
      setResume(r); setLocalResume(r);
      toast.success('Resume loaded — running analysis…');
      await runAnalysis(text);
    } catch (e) {
      toast.error(e.message || 'Parse failed');
    } finally {
      setBusy('');
    }
  };

  const clear = () => {
    setResume(null); setAnalysis(null);
    setLocalResume(null); setLocalAnalysis(null);
    toast.success('Cleared');
  };

  return (
    <div className="max-w-5xl mx-auto px-8 py-10" data-testid="resume-page">
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h1 className="text-3xl font-medium tracking-tight">Resume Analysis</h1>
          <p className="text-white/45 text-[13px] mt-1">Upload your resume — we'll extract skills and generate tailored interview questions.</p>
        </div>
        {resume && (
          <button onClick={clear} data-testid="resume-clear-btn" className="text-[12px] text-white/50 hover:text-rose-300 flex items-center gap-1.5">
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 mb-6" data-testid="notes-panel">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <StickyNote className="w-4 h-4 text-emerald-400" />
            <div className="text-[10px] uppercase tracking-wider text-white/40 font-mono-ui">Your Project Notes</div>
          </div>
          <button onClick={saveNotes} disabled={notesSaved} data-testid="notes-save-btn"
            className="text-[11.5px] px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 disabled:opacity-40 disabled:cursor-default hover:bg-emerald-500/25">
            {notesSaved ? 'Saved' : 'Save notes'}
          </button>
        </div>
        <textarea
          value={notes}
          onChange={(e) => { setLocalNotes(e.target.value); setNotesSaved(false); }}
          data-testid="notes-textarea"
          placeholder="Add specifics only you'd know — architecture decisions, metrics, what you'd do differently, tricky bugs you solved. Analysis and Whisper answers will use these for extra depth."
          rows={4}
          className="w-full bg-black/20 border border-white/10 rounded-lg px-3.5 py-2.5 text-[13px] text-white/90 outline-none focus:border-emerald-500/40 placeholder:text-white/25 resize-y"
        />
        <div className="text-[11px] text-white/35 mt-2">Stored locally in your browser, same as your resume — never sent anywhere except with your own analysis/answer requests.</div>
      </div>

      {!resume && (
        <div onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
          data-testid="resume-dropzone"
          className={`rounded-2xl border-2 border-dashed p-14 text-center cursor-pointer transition-colors ${
            drag ? 'border-emerald-500/60 bg-emerald-500/[0.04]' : 'border-white/15 hover:border-white/30 bg-white/[0.02]'
          }`}>
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 grid place-items-center mx-auto mb-4">
            <Upload className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="text-[15px] font-medium mb-1">Drop your resume here</div>
          <div className="text-[12.5px] text-white/50 mb-4">PDF, DOCX, or TXT · up to 10 MB · everything stays in your browser</div>
          <button className="px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-[12px] font-medium">
            Choose file
          </button>
          <input ref={inputRef} type="file" accept=".pdf,.docx,.txt" className="hidden"
            data-testid="resume-file-input"
            onChange={(e) => handleFiles(e.target.files)} />
        </div>
      )}

      {resume && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-1 rounded-xl border border-white/10 bg-white/[0.02] p-5">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-emerald-400" />
              <div className="text-[10px] uppercase tracking-wider text-white/40 font-mono-ui">Uploaded</div>
            </div>
            <div className="text-[14px] font-medium mb-1 break-all" data-testid="resume-filename">{resume.name}</div>
            <div className="text-[11px] text-white/40 mb-4">{(resume.size / 1024).toFixed(1)} KB · {resume.text.length.toLocaleString()} chars</div>
            <button onClick={() => runAnalysis(resume.text)} disabled={!!busy}
              data-testid="resume-reanalyze-btn"
              className="w-full px-3 py-2 rounded-lg border border-white/10 hover:border-emerald-500/40 text-[12px] flex items-center justify-center gap-2 text-white/80 hover:text-emerald-300">
              {busy === 'analyze' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" />}
              Re-analyze
            </button>
          </div>

          <div className="lg:col-span-2 rounded-xl border border-white/10 bg-white/[0.02] p-5 min-h-[180px]">
            {busy === 'parse' && <Busy label="Parsing resume…" />}
            {busy === 'analyze' && <Busy label="Analyzing with Gemini…" />}
            {!busy && analysis && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[10px] uppercase tracking-wider text-white/40 font-mono-ui">Snapshot</div>
                  <div className="text-[11px] text-white/40">Target: <span className="text-emerald-300">{analysis.role}</span> · {analysis.years_experience}</div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(analysis.skills || []).map((s, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11.5px] text-white/85 font-mono-ui">{s}</span>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-emerald-400 font-mono-ui mb-2">Strengths</div>
                    <ul className="space-y-1.5">
                      {(analysis.strengths || []).map((s, i) => (
                        <li key={i} className="text-[12.5px] text-white/80 flex gap-2"><span className="text-emerald-400">▸</span>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-amber-400 font-mono-ui mb-2">Gaps to close</div>
                    <ul className="space-y-1.5">
                      {(analysis.gaps || []).map((s, i) => (
                        <li key={i} className="text-[12.5px] text-white/80 flex gap-2"><span className="text-amber-400">▸</span>{s}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            {!busy && !analysis && (
              <div className="text-white/40 text-[13px]">Analysis will appear here.</div>
            )}
          </div>
        </div>
      )}

      {analysis?.questions?.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5" data-testid="resume-questions">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <div className="text-[10px] uppercase tracking-wider text-white/40 font-mono-ui">Tailored interview questions</div>
            <div className="ml-auto text-[11px] text-white/40">{analysis.questions.length}</div>
          </div>
          <div className="space-y-2">
            {analysis.questions.map((q, i) => (
              <div key={i} className="rounded-lg border border-white/5 bg-black/20 p-3.5">
                <div className="flex items-start gap-3">
                  <div className="text-[11px] text-white/30 font-mono-ui mt-0.5 w-6">{String(i + 1).padStart(2, '0')}</div>
                  <div className="flex-1">
                    <div className="text-[13.5px] text-white/90 leading-relaxed">{q.q}</div>
                    <div className="flex gap-2 mt-2">
                      <Tag color="emerald">{q.type}</Tag>
                      <Tag color="amber">{q.difficulty}</Tag>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Busy({ label }) {
  return (
    <div className="flex items-center gap-2 text-white/60 text-[13px]">
      <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> {label}
    </div>
  );
}
function Tag({ children, color }) {
  const m = { emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25', amber: 'bg-amber-500/10 text-amber-300 border-amber-500/25' };
  return <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border font-mono-ui ${m[color]}`}>{children}</span>;
}
