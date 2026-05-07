/***
Path: /kingskolossium/src/features/build/components/totals/ElementalStats.tsx
Created by: Christopher Echevarria
Date of creation: 06May2026
Purpose and Description: Elemental damage and resistance card — rows of
  (Icon · Label ··· Dmg · Res · Res%). Icon and label are a tight left unit.
  The three value columns are fixed-width and right-aligned.
  Each value cell colored independently. Wrapped in liquid-glass island.
***/

import { useEquipmentTotals }  from '../../hooks/useEquipmentTotals';
import { statColor }           from '../../utils/combatBaseValues';
import { STAT_GROUPS }         from '../../characteristicGroups';
import type { StatEntry }      from '../../characteristicGroups';
import { CHARACTERISTIC_ICON_BASE,
         CHARACTERISTIC_ICON_FALLBACK } from '../../utils/effectUtils';

interface ElementRow {
  label:    string;
  icon:     string;
  dmg:      StatEntry;
  resFixed: StatEntry;
  resPct:   StatEntry;
}

function buildElementRows(): ElementRow[] {
  const s = STAT_GROUPS.damage.stats;
  return [
    { label: 'Neutral', icon: s[1].icon,  dmg: s[0],  resPct: s[1],  resFixed: s[2]  },
    { label: 'Earth',   icon: s[4].icon,  dmg: s[3],  resPct: s[4],  resFixed: s[5]  },
    { label: 'Fire',    icon: s[7].icon,  dmg: s[6],  resPct: s[7],  resFixed: s[8]  },
    { label: 'Water',   icon: s[10].icon, dmg: s[9],  resPct: s[10], resFixed: s[11] },
    { label: 'Air',     icon: s[13].icon, dmg: s[12], resPct: s[13], resFixed: s[14] },
  ];
}

const ELEMENT_ROWS = buildElementRows();

function ValueCell({ equipDelta }: { equipDelta: number }) {
  return (
    <span
      className="font-mono text-[10px] font-bold tabular-nums text-right w-8 flex-shrink-0"
      style={{ color: statColor(equipDelta) }}
    >
      {equipDelta > 0 ? `+${equipDelta}` : equipDelta}
    </span>
  );
}

export function ElementalStats() {
  const equipTotals = useEquipmentTotals();

  return (
    <div className="liquid-glass rounded-xl p-3 flex flex-col gap-1.5">
      <span className="font-mono text-[9px] text-white/25 uppercase tracking-widest mb-0.5">
        {STAT_GROUPS.damage.label}
      </span>

      {/* Column headers — aligns with value cells */}
      <div className="flex items-center">
        <span className="flex-1" />
        <span className="font-mono text-[9px] text-white/30 text-right w-8 flex-shrink-0">Dmg</span>
        <span className="font-mono text-[9px] text-white/30 text-right w-8 flex-shrink-0 ml-1">Res</span>
        <span className="font-mono text-[9px] text-white/30 text-right w-8 flex-shrink-0 ml-1">Res%</span>
      </div>

      {ELEMENT_ROWS.map(({ label, icon, dmg, resFixed, resPct }) => (
        <div key={label} className="flex items-center gap-2">

          {/* Left unit — icon + label tight together */}
          <div className="flex items-center gap-1.5 min-w-0">
            <img
              src={`${CHARACTERISTIC_ICON_BASE}/${icon}`}
              alt=""
              className="w-4 h-4 object-contain flex-shrink-0"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = CHARACTERISTIC_ICON_FALLBACK; }}
            />
            <span className="font-mono text-[10px] text-white/50 truncate">{label}</span>
          </div>

          {/* Spacer */}
          <span className="flex-1" />

          {/* Value cells */}
          <ValueCell equipDelta={equipTotals[dmg.element_id]      ?? 0} />
          <span className="w-1" />
          <ValueCell equipDelta={equipTotals[resFixed.element_id] ?? 0} />
          <span className="w-1" />
          <ValueCell equipDelta={equipTotals[resPct.element_id]   ?? 0} />
        </div>
      ))}
    </div>
  );
}