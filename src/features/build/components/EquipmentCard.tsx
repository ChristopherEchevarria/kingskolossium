/***
Path:/kingskolossium/src/features/build/components/EquipmentCard.tsx
***/

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


interface EquipmentCardProps {
  item:         EquipmentItem;
  superTypeId?: number;
  onClick?:     () => void;
}

export function EquipmentCard({ item, superTypeId, onClick }: EquipmentCardProps) {
  const [mode, setMode] = useState<CardMode>('max');

  const colors  = SUPER_TYPE_CARD_COLORS[superTypeId ?? 0] ?? DEFAULT_CARD_COLOR;

  const displayEffects: MappedEffect[] = (item.effects ?? []).filter(e => !e.is_meta);

  const weaponEffects = displayEffects.filter(e => e.active);
  const statEffects   = displayEffects.filter(e => !e.active);
  const isLegendary = (item.effects ?? []).some(e => e.is_meta);


  return (
    <div
      onClick={onClick}
      style={{ background: colors.bg, borderColor: colors.border }}
      className="liquid-glass-transparent rounded-lg cursor-pointer border
                 transition-all duration-150 hover:scale-[1.02]
                 flex flex-col overflow-hidden min-h-0 relative"
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = colors.accent; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = colors.border; }}
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