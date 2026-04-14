/***
Path:/kingskolossium/src/features/build/components/card/CharacteristicEffects.tsx
***/

import { useBuildStore } from '../../stores/buildStore';
import { EffectRow } from './EffectRow';
import type { EquipmentEffect } from '../../../../api/equipment';
import type { CardMode, CardColors } from './cardColors';

interface Props { effects: EquipmentEffect[]; mode: CardMode; colors: CardColors; }

export function CharacteristicEffects({ effects, mode, colors }: Props) {
  const { characteristicNames } = useBuildStore();
  return (
    <div className="px-3 pt-1 pb-2 flex flex-col gap-1">
      {effects.map((eff, i) => {
        const entry = characteristicNames.get(eff.effectId);
        return (
          <EffectRow key={`char-${eff.effectId}-${i}`}
            eff={eff} index={i} mode={mode} colors={colors}
            label={entry?.name ?? `Effect ${eff.effectId}`}
            keyword={entry?.keyword ?? null}
            operator={entry?.operator ?? '+'} />
        );
      })}
    </div>
  );
}