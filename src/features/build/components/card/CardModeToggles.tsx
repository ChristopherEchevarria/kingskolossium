/***
Path:/kingskolossium/src/features/build/components/card/CardModeToggles.tsx
***/

import type { CardMode, CardColors } from './cardColors';

interface Props { mode: CardMode; setMode: (m: CardMode) => void; colors: CardColors; }

const MODES: { key: CardMode; label: string }[] = [
  { key: 'max',    label: 'Max'    },
  { key: 'range',  label: 'Range'  },
  { key: 'recipe', label: 'Recipe' },
];

export function CardModeToggles({ mode, setMode, colors }: Props) {
  return (
    <div className="flex items-center gap-1 px-2 py-1.5">
      {MODES.map((m) => {
        const active = mode === m.key;
        return (
          <button key={m.key}
            onClick={(e) => { e.stopPropagation(); setMode(m.key); }}
            className="flex-1 h-5 rounded font-mono text-[9px] font-bold
                       transition-all duration-150 border"
            style={{
              background:  active ? colors.badge  : 'transparent',
              borderColor: active ? colors.accent : 'rgba(255,255,255,0.1)',
              color:       active ? colors.accent : 'rgba(255,255,255,0.3)',
            }}
          >
            {m.label}
          </button>
        );
      })}
    </div>
  );
}