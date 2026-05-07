/***
Path: /kingskolossium/src/features/build/components/totals/PrimaryStats.tsx
Created by: Christopher Echevarria
Date of creation: 06May2026
Purpose and Description: Primary stats card — 4-column table (Label · Base · Scroll · Total).
  Editable Base + Scroll inputs with pool validation. Wrapped in liquid-glass island.
***/

import { useBuildStore }             from '../../stores/buildStore';
import { useHeaderStore }            from '../../../header/stores/headerStore';
import { useEquipmentTotals }        from '../../hooks/useEquipmentTotals';
import { statColor, totalStatValue } from '../../utils/combatBaseValues';
import { STAT_GROUPS }               from '../../characteristicGroups';
import { PRIMARY_STAT_IDS,
         PRIMARY_STAT_CHAR_ID,
         totalPoolCost,
         maxAllocatable,
         TOTAL_STAT_POINTS }         from '../../primaryStats';
import type { PrimaryStatId }        from '../../primaryStats';
import { CHARACTERISTIC_ICON_BASE,
         CHARACTERISTIC_ICON_FALLBACK } from '../../utils/effectUtils';

interface EditableCellProps {
  value:    number;
  max:      number;
  onChange: (v: number) => void;
}

function EditableCell({ value, max, onChange }: EditableCellProps) {
  return (
    <input
      type="number"
      min={0}
      max={max}
      value={value}
      onChange={(e) => {
        const parsed = parseInt(e.target.value, 10);
        if (!isNaN(parsed)) onChange(Math.min(max, Math.max(0, parsed)));
      }}
      className="w-12 text-center font-mono text-[10px] bg-white/5 border border-white/10
                 rounded px-1 py-0.5 text-white focus:outline-none focus:border-white/30
                 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none
                 [&::-webkit-inner-spin-button]:appearance-none"
    />
  );
}

export function PrimaryStats() {
  const characteristics   = useBuildStore(s => s.characteristics);
  const characterLevel    = useBuildStore(s => s.characterLevel);
  const basePoints        = useBuildStore(s => s.basePoints);
  const scrollPoints      = useBuildStore(s => s.scrollPoints);
  const setBasePoints     = useBuildStore(s => s.setBasePoints);
  const setScrollPoints   = useBuildStore(s => s.setScrollPoints);
  const resetPrimaryStats = useBuildStore(s => s.resetPrimaryStats);
  const autoScrollAll     = useBuildStore(s => s.autoScrollAll);
  const language          = useHeaderStore(s => s.language);
  const equipTotals       = useEquipmentTotals();
  const lang              = language as 'en' | 'fr' | 'es';

  const spentPool     = PRIMARY_STAT_IDS.reduce((sum, s) => sum + totalPoolCost(s, basePoints[s]), 0);
  const availablePool = TOTAL_STAT_POINTS - spentPool;

  const elementIdByStatId: Record<PrimaryStatId, number> = (() => {
    const map = {} as Record<PrimaryStatId, number>;
    STAT_GROUPS.primary.stats.forEach(entry => {
      const match = PRIMARY_STAT_IDS.find(sid => PRIMARY_STAT_CHAR_ID[sid] === entry.characteristic_id);
      if (match) map[match] = entry.element_id;
    });
    return map;
  })();

  return (
    <div className="liquid-glass rounded-xl p-3 flex flex-col gap-1.5">
      <span className="font-mono text-[9px] text-white/25 uppercase tracking-widest mb-0.5">
        {STAT_GROUPS.primary.label}
      </span>

      {/* Column headers */}
      <div className="grid grid-cols-[1fr,48px,48px,48px] gap-x-1 mb-0.5">
        <span />
        <span className="font-mono text-[9px] text-white/30 text-center">Base</span>
        <span className="font-mono text-[9px] text-white/30 text-center">Scroll</span>
        <span className="font-mono text-[9px] text-white/30 text-center">Total</span>
      </div>

      {PRIMARY_STAT_IDS.map(statId => {
        const charId    = PRIMARY_STAT_CHAR_ID[statId];
        const char      = characteristics[charId];
        const label     = char ? (char[`name_${lang}`] || char.name_en) : `[${charId}]`;
        const entry     = STAT_GROUPS.primary.stats.find(s => s.characteristic_id === charId);
        const icon      = entry?.icon ?? '';
        const elementId = elementIdByStatId[statId] ?? 0;

        const base       = basePoints[statId];
        const scrolled   = scrollPoints[statId];
        const equipDelta = equipTotals[elementId] ?? 0;
        const total      = totalStatValue(elementId, equipDelta, characterLevel) + base + scrolled;
        const color      = statColor(equipDelta);
        const maxBase    = base + maxAllocatable(statId, availablePool);

        return (
          <div key={statId} className="grid grid-cols-[1fr,48px,48px,48px] gap-x-1 items-center">
            <div className="flex items-center gap-1.5 min-w-0">
              {icon && (
                <img
                  src={`${CHARACTERISTIC_ICON_BASE}/${icon}`}
                  alt=""
                  className="w-4 h-4 object-contain flex-shrink-0"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = CHARACTERISTIC_ICON_FALLBACK; }}
                />
              )}
              <span className="font-mono text-[10px] text-white/50 truncate">{label}</span>
            </div>
            <EditableCell value={base}     max={maxBase} onChange={(v) => setBasePoints(statId, v)} />
            <EditableCell value={scrolled} max={100}     onChange={(v) => setScrollPoints(statId, v)} />
            <span className="font-mono text-[10px] font-bold tabular-nums text-center" style={{ color }}>
              {total > 0 ? `+${total}` : total}
            </span>
          </div>
        );
      })}

      {/* Footer */}
      <div className="grid grid-cols-[1fr,48px,48px,48px] gap-x-1 items-center
                      border-t border-white/10 pt-1 mt-0.5">
        <button
          onClick={resetPrimaryStats}
          className="font-mono text-[9px] text-white/30 hover:text-white/60 transition-colors text-left flex items-center gap-1"
        >
          ↺ Reset
        </button>
        <span className="font-mono text-[10px] text-white/50 text-center tabular-nums">{availablePool}</span>
        <button
          onClick={autoScrollAll}
          className="font-mono text-[9px] text-white/30 hover:text-white/60 transition-colors text-center"
        >
          +100
        </button>
        <span />
      </div>
    </div>
  );
}