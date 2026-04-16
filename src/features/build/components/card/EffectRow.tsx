import type { MappedEffect } from '../../../../api/equipment';
import type { CardColors, CardMode } from './cardColors';
import { API_BASE_URL } from '../../../../api/client';

interface EffectRowProps {
  eff:    MappedEffect;
  index:  number;
  lang:   string;
  colors: CardColors;
  mode:   CardMode;
}

/**
 * In 'max' mode: replace the leading "X to Y" range with just "Y".
 * e.g. "351 to 400 Vitality" → "400 Vitality"
 *      "-20 Dodge"           → "-20 Dodge"   (no range, unchanged)
 */
function resolveDisplay(eff: MappedEffect, lang: string, mode: CardMode): string {
  const raw = eff.templated[lang as keyof typeof eff.templated]
           || eff.templated.en
           || `${eff.min}`;

  // Single-value effects — always return raw regardless of mode
  if (eff.min_max_irrelevant !== 0 || eff.min === eff.max) return raw;

  if (mode === 'max') {
    const label = raw.replace(/^-?\d+[^\d]+-?\d+\s*/, '');
    return `${eff.max}${label ? ' ' + label.trim() : ''}`;
  }

  // range — full templated string
  return raw;
}

export function EffectRow({ eff, index, lang, colors, mode }: EffectRowProps) {
  if (mode === 'recipe') return null;
  const display    = resolveDisplay(eff, lang, mode);
  const isNegative = eff.min < 0 || (eff.min === 0 && eff.max < 0);

  // Icon keyword: English type name lowercased, spaces → underscores
  // e.g. "Spell Damage" → "spell_damage", "Vitality" → "vitality"
  const iconKeyword = (eff.type.en || '').toLowerCase().replace(/\s+/g, '_');
  const iconUrl     = iconKeyword
    ? `${API_BASE_URL}/assets/characteristic-icons/${iconKeyword}.png`
    : null;

  return (
    <div
      key={`effect-${eff.element_id}-${index}`}
      className="grid grid-cols-[14px,1fr] gap-x-2 items-center font-mono text-[10px]"
    >
      {/* Characteristic icon — falls back to accent dot if image missing */}
      {iconUrl ? (
        <img
          src={iconUrl}
          alt=""
          className="w-3.5 h-3.5 flex-shrink-0 object-contain"
          onError={(e) => {
            const el = e.currentTarget;
            el.style.display = 'none';
            const dot = el.nextElementSibling as HTMLElement | null;
            if (dot) dot.style.display = 'block';
          }}
        />
      ) : null}
      <span
        className="w-1 h-1 rounded-full flex-shrink-0"
        style={{ background: colors.accent, display: iconUrl ? 'none' : 'block' }}
      />

      {/* Display string — color indicates sign */}
      <span
        className="text-left truncate"
        style={{ color: isNegative ? '#f87171' : '#4ade80' }}
      >
        {display}
      </span>
    </div>
  );
}