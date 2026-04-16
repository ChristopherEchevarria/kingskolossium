/***
Path:/kingskolossium/src/features/build/components/card/WeaponEffects.tsx
***/

import { useHeaderStore } from '../../../header/stores/headerStore';
import { EffectRow } from './EffectRow';
import type { MappedEffect } from '../../../../api/equipment';
import type { CardMode, CardColors } from './cardColors';

interface Props { effects: MappedEffect[]; colors: CardColors; mode: CardMode;}

export function WeaponEffects({ effects, colors, mode }: Props) {
  const { language } = useHeaderStore();
  return (
    <>
      <div className="px-3 pt-1 pb-2 flex flex-col gap-1">
        {effects.map((eff, i) => (
          <EffectRow key={`weapon-${eff.element_id}-${i}`}
            eff={eff} index={i} lang={language} colors={colors} mode={mode} />
        ))}
      </div>
      <div className="mx-3 border-t" style={{ borderColor: `${colors.accent}33` }} />
    </>
  );
}