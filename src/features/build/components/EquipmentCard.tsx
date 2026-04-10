/***
Path:/kingskolossium/src/features/build/components/EquipmentCard.tsx
Created by: Christopher Echevarria
Date of creation: 09Apr2026
Purpose and Description: Single equipment card — colored by super_type, name, level, stats
***/

import type { EquipmentItem } from '../../../api/equipment';
import { API_BASE_URL } from '../../../api/client';

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

// ─── Effect ID → readable stat name mapping (Dofus 3.x) ──────────────────────
const EFFECT_NAMES: Record<number, string> = {
  111: 'AP',        118: 'MP',          119: 'Vitality',
  112: 'Damage',    120: 'Range',       121: 'Strength',
  115: 'Dodge',     122: 'Chance',      123: 'Agility',
  116: 'Lock',      124: 'Intelligence', 125: 'Critical',
  117: 'AP Parry',  126: 'Wisdom',      128: 'MP Parry',
  138: 'Power',     160: 'Pods',        174: 'Initiative',
  176: 'Prospecting', 182: 'Summons',
  142: '% Earth Res',  143: '% Water Res',
  144: '% Air Res',    145: '% Fire Res',   146: '% Neutral Res',
};

function getEffectLabel(effectId: number): string {
  return EFFECT_NAMES[effectId] ?? `Effect ${effectId}`;
}

// ─── Component ───────────────────────────────────────────────────────────────

interface EquipmentCardProps {
  item:         EquipmentItem;
  superTypeId?: number;
  onClick?:     () => void;
}

export function EquipmentCard({ item, superTypeId, onClick }: EquipmentCardProps) {
  const iconUrl = item.icon_id
    ? `${API_BASE_URL}/assets/items/${item.icon_id}-128.png`
    : null;

  const effects = (item.effects ?? []).slice(0, 6);
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
        {/* Item icon */}
        {/* Name + type */}
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
      {}
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

         <span className="text-white/90 text-bottom">
                  {"label"}
         </span>
        </div>

      {/* Stats — 2-column layout: Value (colored) | Label (white) */}


      {effects.length > 0 && (
        <div className="px-3 pb-3 flex flex-col gap-1 text-sm ">
          {effects.map((eff, i) => {
            const val = eff.diceNum !== undefined && eff.diceSide !== undefined && eff.diceNum !== eff.diceSide
              ? `${eff.diceNum}–${eff.diceSide}`
              : String(eff.diceNum ?? eff.value ?? 0);

            const label = getEffectLabel(eff.effectId);
            const isPositive = (eff.diceNum ?? eff.value ?? 0) >= 0;

            return (
              <div
                key={`${eff.effectId}-${i}`}
                className="grid grid-cols-[auto,1fr] gap-x-2 items-baseline font-mono text-[10px]"
              >
                {/* Value Column - Green / Red */}
                <span
                  className="font-bold tabular-nums text-left w-12"
                  style={{
                    color: isPositive ? '#4ade80' : '#f87171',   // Green / Red
                  }}
                >
                  {val}
                </span>

                {/* Label Column - White */}
                <span className="text-white/90 text-left">
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Set indicator */}
      {item.item_set_id && (
        <div className="px-3 pb-3 text-[9px] italic text-white/50 text-bottom">
          Part of {item.set_name || 'a set'}
        </div>
      )}
    </div>
  );
}

export default EquipmentCard;