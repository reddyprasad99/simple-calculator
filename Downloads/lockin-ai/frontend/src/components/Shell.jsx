import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Timer, Code2, BookOpenText, Settings as SettingsIcon, EyeOff, Sparkles } from 'lucide-react';
import { useStealth } from '@/components/StealthProvider';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/resume', label: 'Resume', icon: FileText },
  { to: '/mock', label: 'Mock', icon: Timer },
  { to: '/coding', label: 'Coding', icon: Code2 },
  { to: '/files', label: 'Files', icon: BookOpenText },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

export default function Shell() {
  const { toggle, hideAll } = useStealth();
  const nav = useNavigate();

  return (
    <div className="noise min-h-screen grid-bg text-foreground" data-testid="app-shell">
      <div className="relative z-10 flex min-h-screen">
        <aside className="w-[220px] shrink-0 border-r border-white/5 bg-black/30 backdrop-blur-sm flex flex-col">
          <button onClick={() => nav('/')} data-testid="brand-home-btn" className="px-5 py-5 flex items-center gap-2 text-left hover:opacity-90">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-emerald-400 to-emerald-600 grid place-items-center">
              <Sparkles className="w-4 h-4 text-black" strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-[15px] font-semibold tracking-tight">LockIn <span className="text-emerald-400">AI</span></div>
              <div className="text-[10px] uppercase tracking-[0.16em] text-white/40 font-mono-ui">Interview Copilot</div>
            </div>
          </button>

          <nav className="px-3 py-2 flex-1">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end}
                data-testid={`nav-${label.toLowerCase()}`}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] mb-0.5 transition-colors ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/25'
                      : 'text-white/60 hover:text-white hover:bg-white/[0.04] border border-transparent'
                  }`
                }>
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="px-4 py-4 border-t border-white/5">
            <div className="text-[10px] uppercase tracking-wider text-white/30 mb-2 font-mono-ui">Hotkeys</div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-white/50">
                <span>Overlay</span><span className="kbd">Ctrl+Shift+S</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-white/50">
                <span>Hide App</span><span className="kbd">Ctrl+Shift+H</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b border-white/5 flex items-center justify-end px-6 gap-3 bg-black/20 backdrop-blur-sm">
            <button onClick={toggle} data-testid="header-stealth-toggle" className="text-[12px] flex items-center gap-2 text-white/70 hover:text-emerald-300 transition-colors">
              <div className="pulse-dot" />
              Stealth Overlay
              <span className="kbd">Ctrl+Shift+S</span>
            </button>
            <button onClick={hideAll} data-testid="header-hide-app" className="text-[12px] flex items-center gap-2 text-white/70 hover:text-white transition-colors">
              <EyeOff className="w-3.5 h-3.5" />
              Hide App
              <span className="kbd">Ctrl+Shift+H</span>
            </button>
          </header>

          <div className="flex-1 overflow-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
