import { useEffect, useRef, useState } from 'react';
import { useStealth } from '@/components/StealthProvider';
import { X, Sparkles, Send, Loader2, Minimize2, Mic, MicOff } from 'lucide-react';
import { getKeys, getPrefs, getResume, getNotes } from '@/lib/storage';
import { whisperAnswer } from '@/lib/gemini';
import { toast } from 'sonner';

const SpeechRecognitionAPI = typeof window !== 'undefined'
  ? (window.SpeechRecognition || window.webkitSpeechRecognition)
  : null;

export default function StealthOverlay() {
  const { open, setOpen } = useStealth();
  const [pos, setPos] = useState({ x: 100, y: 90 });
  const [size] = useState({ w: 640, h: 460 });
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [thinking, setThinking] = useState(false);
  const [min, setMin] = useState(false);
  const [listening, setListening] = useState(false);
  const dragRef = useRef(null);
  const dragging = useRef(null);
  const recogRef = useRef(null);
  const baseTextRef = useRef('');

  useEffect(() => {
    if (!SpeechRecognitionAPI) return;
    const rec = new SpeechRecognitionAPI();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.onresult = (e) => {
      let finalText = '';
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t;
        else interim += t;
      }
      if (finalText) baseTextRef.current = (baseTextRef.current + ' ' + finalText).trim();
      setQuestion((baseTextRef.current + ' ' + interim).trim());
    };
    rec.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        toast.error('Microphone permission denied — allow mic access in your browser.');
      }
      setListening(false);
    };
    rec.onend = () => setListening(false);
    recogRef.current = rec;
    return () => { try { rec.stop(); } catch {} };
  }, []);

  const toggleMic = () => {
    if (!SpeechRecognitionAPI) {
      toast.error('Voice input not supported in this browser — try Chrome or Edge.');
      return;
    }
    if (listening) {
      recogRef.current?.stop();
      setListening(false);
    } else {
      baseTextRef.current = question;
      try {
        recogRef.current?.start();
        setListening(true);
      } catch {
        toast.error('Could not start microphone.');
      }
    }
  };

  useEffect(() => {
    if (!open) return;
    const onMove = (e) => {
      if (!dragging.current) return;
      setPos({
        x: Math.max(0, e.clientX - dragging.current.dx),
        y: Math.max(0, e.clientY - dragging.current.dy),
      });
    };
    const onUp = () => { dragging.current = null; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [open]);

  const startDrag = (e) => {
    dragging.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
  };

  const suggest = async () => {
    const keys = getKeys();
    if (!keys.gemini) { toast.error('Add your Gemini API key in Settings first.'); return; }
    if (!question.trim()) { toast.error('Type or paste an interview question first.'); return; }
    setThinking(true); setAnswer('');
    try {
      const prefs = getPrefs();
      const resume = getResume();
      const out = await whisperAnswer({
        apiKey: keys.gemini,
        model: prefs.model,
        question: question.trim(),
        prefs,
        resumeContext: resume?.text,
        notes: getNotes(),
      });
      setAnswer(out);
    } catch (e) {
      toast.error(e.message || 'Failed to generate');
    } finally {
      setThinking(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed z-[100] stealth-overlay rounded-2xl overflow-hidden" data-testid="stealth-overlay"
      style={{ left: pos.x, top: pos.y, width: size.w, height: min ? 56 : size.h }}>
      <div ref={dragRef} onMouseDown={startDrag}
        className="h-14 px-4 flex items-center justify-between border-b border-white/5 cursor-grab active:cursor-grabbing">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-emerald-500/20 border border-emerald-500/40 grid place-items-center">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-[13px] font-medium">LockIn AI <span className="text-white/40">· Whisper</span></div>
          <div className="pulse-dot ml-2" />
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setMin(m => !m)} data-testid="overlay-min-btn" className="p-1.5 rounded-md hover:bg-white/5 text-white/60 hover:text-white">
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setOpen(false)} data-testid="overlay-close-btn" className="p-1.5 rounded-md hover:bg-white/5 text-white/60 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {!min && (
        <div className="flex flex-col h-[calc(100%-3.5rem)]">
          <div className="px-4 pt-3 pb-2">
            <div className="text-[10px] uppercase tracking-wider text-emerald-400/80 font-mono-ui mb-1">Whisper</div>
            <input value={question} onChange={(e) => setQuestion(e.target.value)}
              data-testid="overlay-question-input"
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); suggest(); } }}
              placeholder="Type or paste an interview question, press Enter…"
              className="w-full bg-transparent text-[14px] outline-none placeholder:text-white/30 text-white/95" />
          </div>
          <div className="h-px bg-white/5 mx-4" />

          <div className="px-4 py-3 flex-1 overflow-auto">
            <div className="text-[10px] uppercase tracking-wider text-white/40 font-mono-ui mb-2">Answer</div>
            {thinking && (
              <div className="flex items-center gap-2 text-white/50 text-[13px]">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Thinking…
              </div>
            )}
            {!thinking && !answer && (
              <div className="text-white/30 text-[13px] leading-relaxed">
                Answers appear here. Adjust <span className="text-emerald-400">answer length</span> and <span className="text-emerald-400">model</span> in Settings.
              </div>
            )}
            {answer && (
              <div className="text-[14px] leading-relaxed text-white/90 whitespace-pre-wrap" data-testid="overlay-answer">
                {answer}
              </div>
            )}
          </div>

          <div className="h-12 px-4 flex items-center justify-between border-t border-white/5">
            <button onClick={toggleMic} data-testid="overlay-mic-btn"
              className={`text-[11px] flex items-center gap-2 px-2.5 py-1.5 rounded-full border transition-colors ${
                listening
                  ? 'border-rose-500/40 bg-rose-500/10 text-rose-300'
                  : 'border-white/10 text-white/40 hover:text-white/70 hover:border-white/25'
              }`}>
              {listening ? <Mic className="w-3 h-3 animate-pulse" /> : <MicOff className="w-3 h-3" />}
              <span>{listening ? 'Listening…' : 'Voice input'}</span>
            </button>
            <button onClick={suggest} disabled={thinking} data-testid="overlay-suggest-btn"
              className="px-4 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-[12px] font-medium flex items-center gap-2 disabled:opacity-50">
              <Send className="w-3 h-3" /> Suggest
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
