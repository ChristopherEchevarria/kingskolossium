/***
Path:/kingskolossium/src/features/build/components/card/ItemDescription.tsx
Purpose: Displays special passive text, legendary bonuses, and other non-stat effects.
         Rendered below CharacteristicEffects, above SetInformation.
***/

import type { EquipmentItem, MappedEffect } from '../../../../api/equipment';
import { useHeaderStore } from '../../../header/stores/headerStore';
import type { CardMode } from './cardColors';
import { BorderBeam } from 'border-beam';

interface Props {
  item:   EquipmentItem;
  mode:   CardMode;
}

const LEGENDARY_COLORS = {
  border:  'rgba(255,255,255,0.10)',
  bg:      'rgba(255,255,255,0.04)',
  text:    'rgba(255,255,255,0.55)',
  textDim: 'rgba(255,255,255,0.25)',
};

export function ItemDescription({ item, mode }: Props) {

  const { language } = useHeaderStore();

  // is_meta effects = legendary passives, dofus bonuses, special conditions
  const metaEffects: MappedEffect[] = (item.effects ?? []).filter(e => e.is_meta);

  // Only render in max / range modes — recipe is handled by EffectRow
  if (mode === 'recipe' || metaEffects.length === 0) return null;

    return (
    <div className="mx-3 mb-2 relative rounded overflow-hidden">
      <BorderBeam size="sm" colorVariant="colorful" duration={6} strength={1}>
          <div
            className="px-2 py-1.5 flex flex-col gap-1 rounded border"
            style={{ borderColor: LEGENDARY_COLORS.border, background: LEGENDARY_COLORS.bg }}
          >
            <span
              className="font-mono text-[8px] font-bold uppercase tracking-widest"
              style={{ color: LEGENDARY_COLORS.textDim }}
            >
              ✦ Passive
            </span>

            {metaEffects.map((eff, i) => {
              const text = eff.templated[language as keyof typeof eff.templated]
                        || eff.templated.en;
              return (
                <p
                  key={`meta-${eff.element_id}-${i}`}
                  className="font-mono text-[9px] italic leading-tight"
                  style={{ color: LEGENDARY_COLORS.text }}
                >
                  {text}
                </p>
              );
            })}
          </div>
      </BorderBeam>
    </div>
  );
}

export default ItemDescription;