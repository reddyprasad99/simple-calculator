import { useNavigate } from 'react-router-dom';
import { FileText, Timer, Code2, BookOpenText, Settings as Cog, Sparkles, EyeOff, Rocket, TrendingUp } from 'lucide-react';
import { useStealth } from '@/components/StealthProvider';
import { getKeys, getHistory } from '@/lib/storage';
import { useEffect, useState } from 'react';

const MODULES = [
  { id: 'resume', to: '/resume', title: 'Resume Analysis', desc: 'Upload PDF/DOCX/TXT — extract skills, get tailored questions.', icon: FileText, tag: 'AI', color: 'emerald' },
  { id: 'mock', to: '/mock', title: 'Mock Interview', desc: 'Timed practice with per-question scoring & feedback.', icon: Timer, tag: 'Timed', color: 'amber' },
  { id: 'coding', to: '/coding', title: 'Coding Interview', desc: 'DSA problems with reference solutions & complexity.', icon: Code2, tag: 'Q&A', color: 'sky' },
  { id: 'files', to: '/files', title: 'File Study Kit', desc: 'Summarise + auto-generate questions from any document.', icon: BookOpenText, tag: 'Study', color: 'rose' },
  { id: 'settings', to: '/settings', title: 'API Keys & Config', desc: 'Gemini + OpenAI + Tavily keys, voice mode, answer length.', icon: Cog, tag: 'Setup', color: 'slate' },
];

const badgeCls = {
  emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
  amber: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
  sky: 'bg-sky-500/10 text-sky-300 border-sky-500/25',
  rose: 'bg-rose-500/10 text-rose-300 border-rose-500/25',
  slate: 'bg-white/5 text-white/70 border-white/10',
};
const iconCls = {
  emerald: 'bg-emerald-500/15 text-emerald-400',
  amber: 'bg-amber-500/15 text-amber-400',
  sky: 'bg-sky-500/15 text-sky-400',
  rose: 'bg-rose-500/15 text-rose-400',
  slate: 'bg-white/10 text-white/80',
};

export default function Dashboard() {
  const nav = useNavigate();
  const { toggle } = useStealth();
  const [hasKey, setHasKey] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    setHasKey(!!getKeys().gemini);
    setCount(getHistory().length);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-8 py-10" data-testid="dashboard-page">
      <div className="mb-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[11px] font-mono-ui uppercase tracking-wider">
          <Rocket className="w-3 h-3" />
          Interview Copilot
        </div>
      </div>

      <h1 className="font-serif-hero text-5xl md:text-6xl leading-[1.02] tracking-tight mb-4 mt-3">
        Land the job.<br />
        <span className="text-emerald-400 italic">Lock in</span> your prep.
      </h1>
      <p className="text-white/55 text-[15px] leading-relaxed max-w-2xl mb-8">
        AI-powered mock interviews, resume tear-downs, coding drills, and a discrete stealth overlay
        that whispers answers during live calls — invisible to Zoom / Meet / Teams screen share.
      </p>

      <div className="flex flex-wrap items-center gap-3 mb-10">
        <button onClick={toggle} data-testid="dashboard-start-mock-btn"
          className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-[13px] font-medium flex items-center gap-2 transition-colors">
          <Timer className="w-4 h-4" /> Start Mock Interview
        </button>
        <button onClick={toggle} data-testid="dashboard-stealth-btn"
          className="px-5 py-2.5 rounded-full border border-white/15 hover:border-emerald-500/50 hover:text-emerald-300 text-white/85 text-[13px] font-medium flex items-center gap-2 transition-colors">
          <EyeOff className="w-4 h-4" /> Enable Stealth
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-10">
        <StatCard label="Sessions" value={count} icon={<Sparkles className="w-4 h-4 text-emerald-400" />} />
        <StatCard label="Avg score" value="—" icon={<TrendingUp className="w-4 h-4 text-amber-400" />} />
        <StatCard label="Status" value={hasKey ? 'Ready' : 'Add Gemini key'}
          onClick={() => nav('/settings')} icon={<Cog className="w-4 h-4 text-sky-400" />} highlight={!hasKey} />
      </div>

      <div className="flex items-baseline gap-3 mb-4">
        <h2 className="text-[13px] uppercase tracking-[0.18em] text-white/50 font-mono-ui">Modules</h2>
        <div className="h-px bg-white/5 flex-1" />
        <span className="text-[11px] text-white/30 font-mono-ui">05</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MODULES.map((m) => (
          <button key={m.id} onClick={() => nav(m.to)} data-testid={`module-${m.id}`}
            className="card-hover text-left rounded-xl border border-white/10 bg-white/[0.02] p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div className={`w-9 h-9 rounded-lg grid place-items-center ${iconCls[m.color]}`}>
                <m.icon className="w-4 h-4" />
              </div>
              <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border font-mono-ui ${badgeCls[m.color]}`}>
                {m.tag}
              </span>
            </div>
            <div>
              <div className="text-[15px] font-medium mb-1">{m.title}</div>
              <div className="text-[12.5px] text-white/50 leading-relaxed">{m.desc}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-16 text-[11px] text-white/25 font-mono-ui">
        Everything is stored locally in this browser. Nothing leaves your machine except AI calls to the providers you configure.
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, onClick, highlight }) {
  return (
    <button onClick={onClick}
      className={`text-left rounded-xl border p-4 transition-colors ${
        highlight ? 'border-emerald-500/40 bg-emerald-500/[0.04] hover:bg-emerald-500/[0.08]' : 'border-white/10 bg-white/[0.02] hover:border-white/20'
      }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] uppercase tracking-wider text-white/40 font-mono-ui">{label}</div>
        {icon}
      </div>
      <div className={`text-2xl font-medium ${highlight ? 'text-emerald-300' : 'text-white'}`}>{value}</div>
    </button>
  );
}
