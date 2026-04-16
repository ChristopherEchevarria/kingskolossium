/***
Path:/kingskolossium/src/features/build/components/card/CharacteristicEffects.tsx
***/

import { useHeaderStore } from '../../../header/stores/headerStore';
import { EffectRow } from './EffectRow';
import type { MappedEffect } from '../../../../api/equipment';
import type { CardMode, CardColors } from './cardColors';

interface Props { effects: MappedEffect[]; colors: CardColors;  mode: CardMode;}

export function CharacteristicEffects({ effects, colors,mode }: Props) {
  const { language } = useHeaderStore();

  const positives = effects.filter(e => e.min >= 0);
  const negatives = effects.filter(e => e.min < 0);

  return (
    <div className="px-3 pt-1 pb-2 flex flex-col gap-1">
      {positives.map((eff, i) => (
        <EffectRow key={`pos-${eff.element_id}-${i}`}
          eff={eff} index={i} lang={language} colors={colors} mode={mode} />
      ))}
      {negatives.length > 0 && positives.length > 0 && (
        <div className="border-t my-0.5" style={{ borderColor: `${colors.accent}22` }} />
      )}
      {negatives.map((eff, i) => (
        <EffectRow key={`neg-${eff.element_id}-${i}`}
          eff={eff} index={i} lang={language} colors={colors} mode={mode} />
      ))}
    </div>
  );
}