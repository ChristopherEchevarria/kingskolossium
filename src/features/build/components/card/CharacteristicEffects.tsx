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

  const positives = effects.filter(e => (characteristicNames.get(e.effectId)?.operator ?? '+') === '+');
  const negatives = effects.filter(e => (characteristicNames.get(e.effectId)?.operator ?? '+') === '-');

  function renderRow(eff: EquipmentEffect, i: number, prefix: string) {
    const entry = characteristicNames.get(eff.effectId);
    return (
      <EffectRow key={`${prefix}-${eff.effectId}-${i}`}
        eff={eff} index={i} mode={mode} colors={colors}
        label={entry?.name    ?? `Effect ${eff.effectId}`}
        keyword={entry?.keyword  ?? null}
        operator={entry?.operator ?? '+'} />
    );
  }

  return (
    <div className="px-3 pt-1 pb-2 flex flex-col gap-1">
      {positives.map((eff, i) => renderRow(eff, i, 'pos'))}
      {negatives.length > 0 && positives.length > 0 && (
        <div className="border-t my-0.5" style={{ borderColor: `${colors.accent}22` }} />
      )}
      {negatives.map((eff, i) => renderRow(eff, i, 'neg'))}
    </div>
  );
}
