/***
Path:/kingskolossium/src/features/build/components/EquipmentCard.tsx
***/

import { useState } from 'react';
import type { EquipmentItem } from '../../../api/equipment';
import { useBuildStore } from '../stores/buildStore';
import { SUPER_TYPE_CARD_COLORS, DEFAULT_CARD_COLOR, WEAPON_EFFECT_IDS } from './card/cardColors';
import type { CardMode } from './card/cardColors';
import { CardHeader }          from './card/CardHeader';
import { CardModeToggles }     from './card/CardModeToggles';
import { WeaponEffects }       from './card/WeaponEffects';
import { CharacteristicEffects } from './card/CharacteristicEffects';
import { ShowInSetEffects }    from './card/ShowInSetEffects';
import { SetInformation }      from './card/SetInformation';

interface EquipmentCardProps {
  item:         EquipmentItem;
  superTypeId?: number;
  onClick?:     () => void;
}

export function EquipmentCard({ item, superTypeId, onClick }: EquipmentCardProps) {
  const { characteristicNames } = useBuildStore();
  const [mode, setMode] = useState<CardMode>('max');

  const colors  = SUPER_TYPE_CARD_COLORS[superTypeId ?? 0] ?? DEFAULT_CARD_COLOR;
  const effects = item.effects ?? [];

  const weaponEffects  = effects.filter(e => WEAPON_EFFECT_IDS.has(e.effectId));
  const charEffects    = effects.filter(e =>
    !WEAPON_EFFECT_IDS.has(e.effectId) && characteristicNames.has(e.effectId)
  );
  // Everything else — rendered in ShowInSetEffects until description lookup is wired
  const remainingEffects = effects.filter(e =>
    !WEAPON_EFFECT_IDS.has(e.effectId) && !characteristicNames.has(e.effectId)
  );

  return (
    <div
      onClick={onClick}
      style={{ background: colors.bg, borderColor: colors.border }}
      className="liquid-glass-transparent rounded-lg cursor-pointer border
                 transition-all duration-150 hover:scale-[1.02]
                 flex flex-col overflow-hidden min-h-0"
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = colors.accent; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = colors.border; }}
    >
      <CardHeader item={item} colors={colors} />
      <CardModeToggles mode={mode} setMode={setMode} colors={colors} />

      {weaponEffects.length > 0 && (
        <WeaponEffects effects={weaponEffects} mode={mode} colors={colors} />
      )}
      {charEffects.length > 0 && (
        <CharacteristicEffects effects={charEffects} mode={mode} colors={colors} />
      )}
      {remainingEffects.length > 0 && (
        <ShowInSetEffects effects={remainingEffects} mode={mode} colors={colors} />
      )}

      <SetInformation item={item} colors={colors} />
    </div>
  );
}

export default EquipmentCard;