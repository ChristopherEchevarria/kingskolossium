/***
Path:/kingskolossium/src/features/build/components/EquipmentCard.tsx
Created by: Christopher Echevarria
Date of creation: 09Apr2026
Purpose and Description: Single equipment card — colored by super_type, name, level, stats
***/

import type { EquipmentItem } from '../../../api/equipment';
import { API_BASE_URL } from '../../../api/client';
import { useBuildStore } from '../stores/buildStore';

// ─── Super type color system (matches pill colors in BuildPage) ──────────────
const SUPER_TYPE_CARD_COLORS: Record<number, {
  border: string; bg: string; accent: string; badge: string;
}> = {
  1:  { border: 'rgba(212,83,126,0.30)',  bg: 'rgba(212,83,126,0.06)',  accent: '#D4537E', badge: 'rgba(212,83,126,0.25)' },   // Amulet — pink
  2:  { border: 'rgba(216,90,48,0.30)',   bg: 'rgba(216,90,48,0.06)',   accent: '#D85A30', badge: 'rgba(216,90,48,0.25)' },    // Weapons — coral
  3:  { border: 'rgba(186,117,23,0.30)',  bg: 'rgba(186,117,23,0.06)',  accent: '#BA7517', badge: 'rgba(186,117,23,0.25)' },   // Ring — amber
  4:  { border: 'rgba(99,153,34,0.30)',   bg: 'rgba(99,153,34,0.06)',   accent: '#639922', badge: 'rgba(99,153,34,0.25)' },    // Belt — green
  5:  { border: 'rgba(127,119,221,0.30)', bg: 'rgba(127,119,221,0.06)', accent: '#7F77DD', badge: 'rgba(127,119,221,0.25)' },  // Boots — purple
  7:  { border: 'rgba(136,135,128,0.30)', bg: 'rgba(136,135,128,0.06)', accent: '#888780', badge: 'rgba(136,135,128,0.25)' },  // Shield — gray
  10: { border: 'rgba(226,75,74,0.30)',   bg: 'rgba(226,75,74,0.06)',   accent: '#E24B4A', badge: 'rgba(226,75,74,0.25)' },    // Hat — red
  11: { border: 'rgba(29,158,117,0.30)',  bg: 'rgba(29,158,117,0.06)',  accent: '#1D9E75', badge: 'rgba(29,158,117,0.25)' },   // Cloak — teal
  12: { border: 'rgba(239,159,39,0.30)',  bg: 'rgba(239,159,39,0.06)',  accent: '#EF9F27', badge: 'rgba(239,159,39,0.25)' },   // Mount/Pet — gold
  13: { border: 'rgba(83,74,183,0.30)',   bg: 'rgba(83,74,183,0.06)',   accent: '#534AB7', badge: 'rgba(83,74,183,0.25)' },    // Dofus/Trophy — deep purple
};

const DEFAULT_CARD_COLOR = {
  border: 'rgba(91,192,245,0.15)', bg: 'rgba(0,95,142,0.08)',
  accent: '#5BC0F5', badge: 'rgba(0,95,142,0.25)',
};


// ─── Component ───────────────────────────────────────────────────────────────

interface EquipmentCardProps {
  item:         EquipmentItem;
  superTypeId?: number;
  onClick?:     () => void;
}

export function EquipmentCard({ item, superTypeId, onClick }: EquipmentCardProps) {

  const { characteristicNames } = useBuildStore();
  const iconUrl = item.icon_id
    ? `${API_BASE_URL}/assets/items/${item.icon_id}-128.png`
    : null;
  const characteristicIconUrl = item.icon_id
  ? `${API_BASE_URL}/assets/items/${item.icon_id}-128.png`
  : null;



    function getEffectInfo(effectId: number): { name: string; iconUrl: string | null } {
        const entry = characteristicNames.get(effectId);
        if (!entry) return { name: `Effect ${effectId}`, iconUrl: null };
        return {
          name:    entry.name,
          iconUrl: `${API_BASE_URL}/assets/characteristic-icons/${entry.keyword}.png`,
        };
      }

  const effects = item.effects ?? [];
  const colors = SUPER_TYPE_CARD_COLORS[superTypeId ?? 0] ?? DEFAULT_CARD_COLOR;

  return (
    <div
      onClick={onClick}
      style={{
        background: colors.bg,
        borderColor: colors.border,
      }}
      className="
        liquid-glass-transparent gap-1 rounded-lg cursor-pointer
        border transition-all duration-150 hover:scale-[1.02]
        flex flex-col overflow-hidden
      "
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = colors.accent;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = colors.border;
      }}
    >
      {/* Header — icon + name + level */}
      <div className="flex items-center gap-2.5 p-2.5">
        <div className="flex-1 min-w-0">
          <span className="text-white font-mono text-xs font-bold leading-tight truncate block">
            {item.name || `Item #${item.item_id}`}
          </span>
          <span
            className="font-mono text-[10px] leading-tight truncate block"
            style={{ color: colors.accent }}
          >
            {item.type_name}
          </span>
       </div>

        {/* Level badge — tinted to match */}
        <div
          className="flex-shrink-0 px-1.5 py-0.5 rounded"
          style={{ background: colors.badge, border: `1px solid ${colors.border}` }}
        >
          <span
            className="font-mono text-[10px] font-bold"
            style={{ color: colors.accent }}
          >
            Lv.{item.level}
          </span>
        </div>
      </div>
      {/* Item img */}
      <div className = "flex flex-col">
        <div
          className="w-25 h-25 rounded-md flex-shrink-0 flex items-center justify-center overflow-hidden"
          style={{ background: 'rgba(0,0,0,0.25)' }}
        >
          {iconUrl ? (
            <img
              src={iconUrl}
              alt={item.name}
              className="w-20 h-20 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <span className="text-white/20 text-xs font-mono">{item.type_id}</span>
          )}
          </div>
        </div>

      {/* Stats — 2-column layout: Value (colored) | Label (white) */}

      {effects.length > 0 && (
        <div className="px-3 pb-3 flex flex-col gap-1">

          {effects.map((eff, i) => {

            const isRange    = eff.diceNum !== undefined && eff.diceSide !== undefined && eff.diceNum !== eff.diceSide;
            const isNegative = isRange ? eff.diceNum > eff.diceSide : (eff.diceNum ?? eff.value ?? 0) < 0;
            const val        = isRange
              ? isNegative
                ? `${eff.diceNum}–${eff.diceSide}`
                : `${eff.diceNum}–${eff.diceSide}`
              : String(eff.diceNum ?? eff.value ?? 0);
            const { name: label, iconUrl: charIconUrl } = getEffectInfo(eff.effectId);
            const isPositive = !isNegative;

            return (
              <div
                key={`${eff.effectId}-${i}`}
                className="grid grid-cols-[12px,auto,1fr] gap-x-2 items-center font-mono text-[10px]"
              >
                {/* Icon — img or same-size dot fallback */}
                {charIconUrl ? (
                  <img
                    src={charIconUrl}
                    className="w-4 h-4 object-contain flex-shrink-0"
                    onError={(e) => {
                      const el = e.target as HTMLImageElement;
                      el.style.display = 'none';
                      const dot = el.nextElementSibling as HTMLElement | null;
                      if (dot) dot.style.display = 'block';
                    }}
                  />
                ) : null}
                {/* Dot — shown when no img, or as img fallback */}
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{
                    background: colors.accent,
                    display: charIconUrl ? 'none' : 'block',
                  }}
                />

                {/* Value */}
                <span
                  className="font-bold tabular-nums text-right"
                  style={{ color: isPositive ? '#4ade80' : '#f87171' }}
                >
                  {val}
                </span>

                {/* Label */}
                <span className="text-white/80 text-left truncate">{label}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Set indicator */}
      {item.item_set_id && (
        <div className="px-3 pb-3 text-[9px] italic text-white/50 text-bottom">
          {item.set_name || 'a set'}
        </div>
      )}
    </div>
  );
}

export default EquipmentCard;