/***
Path:/kingskolossium/src/features/build/components/card/EffectRow.tsx
***/

import { API_BASE_URL } from '../../../../api/client';
import type { EquipmentEffect } from '../../../../api/equipment';
import type { CardMode, CardColors } from './cardColors';

interface EffectRowProps {
  eff:      EquipmentEffect;
  index:    number;
  mode:     CardMode;
  colors:   CardColors;
  label:    string;
  keyword:  string | null;
  operator: string;           // "+" or "-" from effect_definitions
}

export function resolveVal(
  eff: EquipmentEffect,
  mode: CardMode,
  operator: string,
): { val: string; isNegative: boolean } {
  // Operator from DB is ground truth for sign — never infer from diceNum/diceSide
  const isNegative = operator === '-';
  const absA = Math.abs(eff.diceNum);
  const absB = Math.abs(eff.diceSide);
  const hasRange = absA !== absB && absB !== 0;

  let val: string;

  if (mode === 'max') {
    // Max positive → largest absolute value; max negative → largest absolute, negated
    const best = hasRange ? Math.max(absA, absB) : absA || eff.value || 0;
    val = isNegative ? `-${best}` : String(best);
  } else {
    // Range mode
    if (!hasRange) {
      const single = absA || eff.value || 0;
      val = isNegative ? `-${single}` : String(single);
    } else {
      const lo = Math.min(absA, absB);
      const hi = Math.max(absA, absB);
      val = isNegative ? `-${hi}–-${lo}` : `${lo}–${hi}`;
    }
  }

  return { val, isNegative };
}

export function EffectRow({ eff, index, mode, colors, label, keyword, operator }: EffectRowProps) {
  const { val, isNegative } = resolveVal(eff, mode, operator);

  const iconUrl = keyword
    ? `${API_BASE_URL}/assets/characteristic-icons/${keyword}.png`
    : null;

  return (
    <div
      key={`${eff.effectId}-${index}`}
      className="grid grid-cols-[16px,auto,1fr] gap-x-2 items-center font-mono text-[10px]"
    >
      {/* Icon — hidden if missing, dot shown as fallback via onError */}
      {iconUrl && (
        <img
          src={iconUrl}
          className="w-4 h-4 object-contain flex-shrink-0"
          onError={(e) => {
            const el = e.target as HTMLImageElement;
            el.style.display = 'none';
            const dot = el.nextElementSibling as HTMLElement | null;
            if (dot) dot.style.removeProperty('display');
          }}
        />
      )}
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{
          background: colors.accent,
          display: iconUrl ? 'none' : 'block',
        }}
      />

      {/* Value — color speaks for itself, no sign prefix */}
      <span
        className="font-bold tabular-nums text-right"
        style={{ color: isNegative ? '#f87171' : '#4ade80' }}
      >
        {val}
      </span>

      {/* Label */}
      <span className="text-white/80 text-left truncate">{label}</span>
    </div>
  );
}