/***
Path: /kingskolossium/src/features/build/components/totals/StatRow.tsx
Created by: Christopher Echevarria
Date of creation: 06May2026
Purpose and Description: Shared 3-cell row primitive (icon · label · value).
  Label left-aligns immediately after icon. Value right-aligns.
  Color driven by equipDelta — not displayValue — so base values render grey.
***/

import { statColor }               from '../../utils/combatBaseValues';
import { CHARACTERISTIC_ICON_BASE,
         CHARACTERISTIC_ICON_FALLBACK } from '../../utils/effectUtils';

export interface StatRowProps {
  icon:         string;
  label:        string;
  displayValue: number;
  equipDelta:   number;
}

export function StatRow({ icon, label, displayValue, equipDelta }: StatRowProps) {
  const color = statColor(equipDelta);
  const url   = `${CHARACTERISTIC_ICON_BASE}/${icon}`;

  return (
    <div className="flex items-center gap-1.5">
      <img
        src={url}
        alt=""
        className="w-4 h-4 object-contain flex-shrink-0"
        onError={(e) => { (e.currentTarget as HTMLImageElement).src = CHARACTERISTIC_ICON_FALLBACK; }}
      />
      <span className="font-mono text-[10px] text-white/50 flex-1 truncate">{label}</span>
      <span
        className="font-mono text-[10px] font-bold tabular-nums ml-2"
        style={{ color }}
      >
        {displayValue > 0 ? `+${displayValue}` : displayValue}
      </span>
    </div>
  );
}