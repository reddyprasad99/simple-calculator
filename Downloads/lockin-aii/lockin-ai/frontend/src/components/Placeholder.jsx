import { Rocket } from 'lucide-react';

export default function Placeholder({ icon: Icon, title, desc, phase = 'Coming soon' }) {
  return (
    <div className="max-w-3xl mx-auto px-8 py-16">
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 grid place-items-center mx-auto mb-5">
          <Icon className="w-6 h-6 text-emerald-400" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[10px] uppercase tracking-wider font-mono-ui mb-3">
          <Rocket className="w-3 h-3" /> {phase}
        </div>
        <h1 className="text-2xl font-medium mb-2">{title}</h1>
        <p className="text-white/50 text-[13.5px] max-w-lg mx-auto leading-relaxed">{desc}</p>
        <div className="mt-6 text-[11px] text-white/30 font-mono-ui">
          Try the <span className="text-emerald-400">Resume Analysis</span> & <span className="text-emerald-400">Stealth Overlay</span> in Phase 1.
        </div>
      </div>
    </div>
  );
}
