# React ↔ Electron integration snippet (optional Phase 3 polish)
# Drop this into a new file: frontend/src/hooks/useElectron.js
# Then hook into your StealthProvider + StealthOverlay as shown below.

import { useEffect, useState } from 'react';

export function useElectron() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setIsDesktop(!!window.lockin?.isDesktop);
  }, []);

  return {
    isDesktop,
    platform: window.lockin?.platform,
    minimize: () => window.lockin?.minimize?.(),
    close:    () => window.lockin?.close?.(),
    hide:     () => window.lockin?.hide?.(),
    setStealth: (on) => window.lockin?.setStealth?.(on),
    onSuggest: (cb) => window.lockin?.onSuggest?.(cb),
    onStealthChanged: (cb) => window.lockin?.onStealthChanged?.(cb),
    onClickThroughChanged: (cb) => window.lockin?.onClickThroughChanged?.(cb),
  };
}

# ============================================================
# Wire up the global "Suggest" hotkey in StealthOverlay.jsx:
# ============================================================
#
# import { useElectron } from '@/hooks/useElectron';
#
# export default function StealthOverlay() {
#   const el = useElectron();
#   ...
#   useEffect(() => {
#     if (!el.isDesktop) return;
#     el.onSuggest(() => {
#       setOpen(true);          // open overlay
#       setTimeout(suggest, 200); // then run the whisper
#     });
#   }, [el.isDesktop]);
#   ...
# }
#
# ============================================================
# Add a custom titlebar with min/close for the frameless window:
# ============================================================
# Because we set frame:false, drop this into Shell.jsx <header> :
#
# {el.isDesktop && (
#   <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' }}>
#     <button onClick={el.minimize} className="p-1.5 rounded hover:bg-white/5">
#       <Minus className="w-3.5 h-3.5" />
#     </button>
#     <button onClick={el.close} className="p-1.5 rounded hover:bg-rose-500/20">
#       <X className="w-3.5 h-3.5" />
#     </button>
#   </div>
# )}
#
# And add `style={{ WebkitAppRegion: 'drag' }}` to the outer <header> so users
# can drag the frameless window from the top bar.
