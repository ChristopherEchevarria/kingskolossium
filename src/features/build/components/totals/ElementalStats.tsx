/***
Path: /kingskolossium/src/features/build/components/totals/ElementalStats.tsx
Created by: Christopher Echevarria
Date of creation: 06May2026
Purpose and Description: Elemental damage and resistance card — 5-column table
  (Icon · Element · Dmg · Res · Res%). One icon per element row (% res icon).
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
      className="font-mono text-[10px] font-bold tabular-nums text-right"
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

      {/* Column headers */}
      <div className="grid grid-cols-[16px,1fr,32px,32px,32px] gap-x-1.5 mb-0.5">
        <span /><span />
        <span className="font-mono text-[9px] text-white/30 text-right">Dmg</span>
        <span className="font-mono text-[9px] text-white/30 text-right">Res</span>
        <span className="font-mono text-[9px] text-white/30 text-right">Res%</span>
      </div>

      {ELEMENT_ROWS.map(({ label, icon, dmg, resFixed, resPct }) => (
        <div key={label} className="grid grid-cols-[16px,1fr,32px,32px,32px] gap-x-1.5 items-center">
          <img
            src={`${CHARACTERISTIC_ICON_BASE}/${icon}`}
            alt=""
            className="w-4 h-4 object-contain flex-shrink-0"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = CHARACTERISTIC_ICON_FALLBACK; }}
          />
          <span className="font-mono text-[10px] text-white/50">{label}</span>
          <ValueCell equipDelta={equipTotals[dmg.element_id]      ?? 0} />
          <ValueCell equipDelta={equipTotals[resFixed.element_id] ?? 0} />
          <ValueCell equipDelta={equipTotals[resPct.element_id]   ?? 0} />
        </div>
      ))}
    </div>
  );
}