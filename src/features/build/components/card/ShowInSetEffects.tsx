/***
Path:/kingskolossium/src/features/build/components/card/ShowInSetEffects.tsx
Special effects with show_in_set=true — set bonuses and legendary passives.
***/

import { EffectRow } from './EffectRow';
import type { EquipmentEffect } from '../../../../api/equipment';
import type { CardMode, CardColors } from './cardColors';
import { useBuildStore } from '../../stores/buildStore';

interface Props { effects: EquipmentEffect[]; mode: CardMode; colors: CardColors; }

export function ShowInSetEffects({ effects, mode, colors }: Props) {
  const { characteristicNames } = useBuildStore();
  if (effects.length === 0) return null;

  return (
    <>
      <div className="mx-3 border-t" style={{ borderColor: `${colors.accent}22` }} />
      <div className="px-3 pt-1 pb-2 flex flex-col gap-1">
        {effects.map((eff, i) => {
          const entry = characteristicNames.get(eff.effectId);
          return (
            <EffectRow key={`special-${eff.effectId}-${i}`}
              eff={eff} index={i} mode={mode} colors={colors}
              label={entry?.name ?? `Effect ${eff.effectId}`}
              keyword={entry?.keyword ?? null}
              operator={entry?.operator ?? '+'}/>
          );
        })}
      </div>
    </>
  );
}