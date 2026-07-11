import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const StealthCtx = createContext(null);
export const useStealth = () => useContext(StealthCtx);

export function StealthProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);

  const toggle = useCallback(() => setOpen(o => !o), []);
  const hideAll = useCallback(() => setHidden(h => !h), []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault(); toggle();
      }
      if (e.ctrlKey && e.shiftKey && (e.key === 'H' || e.key === 'h')) {
        e.preventDefault(); hideAll();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle, hideAll]);

  return (
    <StealthCtx.Provider value={{ open, setOpen, toggle, hidden, hideAll }}>
      <div style={{ opacity: hidden ? 0.02 : 1, transition: 'opacity 200ms' }}>
        {children}
      </div>
    </StealthCtx.Provider>
  );
}
