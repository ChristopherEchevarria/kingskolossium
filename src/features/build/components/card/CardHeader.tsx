/***
Path:/kingskolossium/src/features/build/components/card/CardHeader.tsx
***/

import type { EquipmentItem } from '../../../../api/equipment';
import { API_BASE_URL } from '../../../../api/client';
import type { CardColors } from './cardColors';
import { BorderBeam } from 'border-beam';

interface Props {
  item:   EquipmentItem;
  colors: CardColors;
  isLegendary: boolean;
}

export function CardHeader({ item, colors,isLegendary }: Props) {
  const iconUrl = item.icon_id
    ? `${API_BASE_URL}/assets/items/${item.icon_id}-128.png`
    : null;

  return (
    <>
      {/* Name · type · level */}
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
        <div
          className="flex-shrink-0 px-1.5 py-0.5 rounded"
          style={{ background: colors.badge, border: `1px solid ${colors.border}` }}
        >
          <span className="font-mono text-[10px] font-bold" style={{ color: colors.accent }}>
            Lv.{item.level}
          </span>
        </div>
      </div>

      {/* Item image */}
      {isLegendary ? (
        <BorderBeam size="md" colorVariant="colorful" duration={6} strength={1}>
          <div
            className="mx-auto relative rounded-lg overflow-hidden"
            style={{ width: 80, height: 80 }}
          >
            <div className="w-full h-full flex items-center justify-center">
              {iconUrl ? (
                <img
                  src={iconUrl}
                  alt={item.name}
                  className="w-full h-full object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <span className="text-white/20 text-xs font-mono">{item.type_id}</span>
              )}
            </div>
          </div>
        </BorderBeam>
      ) : (
        <div
          className="mx-auto relative rounded-lg overflow-hidden"
          style={{ width: 80, height: 80 }}
        >
          <div className="w-full h-full flex items-center justify-center">
            {iconUrl ? (
              <img
                src={iconUrl}
                alt={item.name}
                className="w-full h-full object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <span className="text-white/20 text-xs font-mono">{item.type_id}</span>
            )}
          </div>
        </div>
      )}
    </>
  );
}