/***
Path:/kingskolossium/src/features/build/components/EquipmentCard.tsx
***/
import { useBuildStore } from '../stores/buildStore';
import { useState } from 'react';
import type { EquipmentItem, MappedEffect } from '../../../api/equipment';
import { SUPER_TYPE_CARD_COLORS, DEFAULT_CARD_COLOR} from './card/cardColors';
import type { CardMode } from './card/cardColors';
import { CardHeader }          from './card/CardHeader';
import { CardModeToggles }     from './card/CardModeToggles';
import { WeaponEffects }       from './card/WeaponEffects';
import { CharacteristicEffects } from './card/CharacteristicEffects';
import { SetInformation }      from './card/SetInformation';
import { ItemDescription }     from './card/ItemDescription';
import { usePopupStore } from '../../common/popups/popupStore';
import type { SwapPayload } from '../../common/popups/types';

interface EquipmentCardProps {
  item:         EquipmentItem;
  superTypeId?: number;
  onClick?:     () => void;
}

export function EquipmentCard({ item, superTypeId, onClick }: EquipmentCardProps) {
  const { equipItem, setPendingSwapRect } = useBuildStore();
  const [mode, setMode] = useState<CardMode>('max');

  const colors  = SUPER_TYPE_CARD_COLORS[superTypeId ?? 0] ?? DEFAULT_CARD_COLOR;

  const displayEffects: MappedEffect[] = (item.effects ?? []).filter(e => !e.is_meta);

  const weaponEffects = displayEffects.filter(e => e.active);
  const statEffects   = displayEffects.filter(e => !e.active);
  const isLegendary = (item.effects ?? []).some(e => e.is_meta);


  return (
    <div
      onClick={onClick}
      onDoubleClick={(e) => {
          const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
          equipItem(item);
          // Update triggerRect in the popup payload if swap was just opened
          const { stack, openPopup } = usePopupStore.getState();
          const existing = stack.find(p => p.id === 'swap');
          if (existing) {
            openPopup({
              id: 'swap',
              payload: {
                ...(existing.payload as SwapPayload),
                triggerRect: { top: rect.top, left: rect.left,
                               width: rect.width, height: rect.height },
              },
            });
          }
        }}
      style={{ background: colors.bg, borderColor: colors.border }}
      className="liquid-glass-transparent rounded-lg cursor-pointer border
                 transition-all duration-150 hover:scale-[1.02]
                 flex flex-col overflow-hidden min-h-0 relative"
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = colors.accent; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = colors.border; }}
      draggable
        onDragStart={(e) => {
          e.dataTransfer.setData(
            'application/json',
            JSON.stringify({ type: 'equipment', item })
          );
        }}



    >
      <CardHeader item={item} colors={colors} isLegendary={isLegendary} />
      <CardModeToggles mode={mode} setMode={setMode} colors={colors} />

      {weaponEffects.length > 0 && (
        <WeaponEffects effects={weaponEffects} colors={colors} mode={mode} />
      )}
      {statEffects.length > 0 && (
        <CharacteristicEffects effects={statEffects} colors={colors} mode={mode} />
      )}

      <ItemDescription item={item} mode={mode} />
      <SetInformation item={item} colors={colors} />
    </div>
  );


}

export default EquipmentCard;