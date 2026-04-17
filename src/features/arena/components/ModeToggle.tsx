/***
Path:/kingskolossium/src/features/arena/components/ModeToggle.tsx
Created by: Christopher Echevarria
Date of creation: 07Apr2026
Purpose and Description: Toggle buttons (Combat/Build mode)
***/

import { useArenaStore, type ArenaMode } from '../stores/arenaStore';

const MODES: { key: ArenaMode; label: string }[] = [
  { key: 'combat', label: 'Combat' },
  { key: 'build',  label: 'Build'  },
];

export function ModeToggle() {
  const { mode, setMode } = useArenaStore();

  return (
    <div className="flex items-center justify-center gap-2">
      {MODES.map((m) => (
        <button
          key={m.key}
          onClick={() => setMode(m.key)}
          className={`
            liquid-glass-btn min-w-[5rem] h-9 px-4 rounded-lg
            text-xs font-mono font-bold transition-all duration-150
            ${mode === m.key
              ? 'liquid-glass-btn--active'
              : 'liquid-glass-btn--idle'}
          `}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}

export default ModeToggle;