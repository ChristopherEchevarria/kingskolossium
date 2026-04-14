/***
Path:/kingskolossium/src/features/build/components/card/WeaponEffects.tsx
***/

import { useHeaderStore } from '../../../header/stores/headerStore';
import { EffectRow } from './EffectRow';
import type { EquipmentEffect } from '../../../../api/equipment';
import type { CardMode, CardColors } from './cardColors';

const WEAPON_LABELS: Record<number, Record<string, string>> = {
  89:  { en: 'Neutral dmg',   fr: 'Dégâts Neutre',  es: 'Daño Neutro'    },
  91:  { en: 'Earth dmg',     fr: 'Dégâts Terre',   es: 'Daño Tierra'    },
  92:  { en: 'Fire dmg',      fr: 'Dégâts Feu',     es: 'Daño Fuego'     },
  93:  { en: 'Water dmg',     fr: 'Dégâts Eau',     es: 'Daño Agua'      },
  94:  { en: 'Air dmg',       fr: 'Dégâts Air',     es: 'Daño Aire'      },
  96:  { en: 'Neutral steal', fr: 'Vol Neutre',      es: 'Robo Neutro'    },
  98:  { en: 'Earth steal',   fr: 'Vol Terre',       es: 'Robo Tierra'    },
  99:  { en: 'Fire steal',    fr: 'Vol Feu',         es: 'Robo Fuego'     },
  100: { en: 'Water steal',   fr: 'Vol Eau',         es: 'Robo Agua'      },
  101: { en: 'Air steal',     fr: 'Vol Air',         es: 'Robo Aire'      },
  102: { en: 'AP removal',    fr: 'Retrait PA',      es: 'Retirada de PA' },
  105: { en: 'MP removal',    fr: 'Retrait PM',      es: 'Retirada de PM' },
  108: { en: 'Heals',         fr: 'Soins',           es: 'Curaciones'     },
  5:   { en: 'Pushback dmg',  fr: 'Dégâts Poussée', es: 'Daño Empuje'    },
};

interface Props { effects: EquipmentEffect[]; mode: CardMode; colors: CardColors; }

export function WeaponEffects({ effects, mode, colors }: Props) {
  const { language } = useHeaderStore();
  return (
    <>
      <div className="px-3 pt-1 pb-2 flex flex-col gap-1">
        {effects.map((eff, i) => {
          const labels = WEAPON_LABELS[eff.effectId];
          const label  = labels?.[language] ?? labels?.['en'] ?? `Effect ${eff.effectId}`;
          return (
            <EffectRow key={`weapon-${eff.effectId}-${i}`}
              eff={eff} index={i} mode={mode} colors={colors}
              label={label} keyword={null} operator="+"/>
          );
        })}
      </div>
      <div className="mx-3 border-t" style={{ borderColor: `${colors.accent}33` }} />
    </>
  );
}