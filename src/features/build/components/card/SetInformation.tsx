/***
Path:/kingskolossium/src/features/build/components/card/SetInformation.tsx
***/

import type { EquipmentItem } from '../../../../api/equipment';
import { useHeaderStore } from '../../../header/stores/headerStore';
import type { CardColors } from './cardColors';

const SET_PREFIX: Record<string, string> = {
  en: 'Part of',
  fr: 'Fait partie du set',
  es: 'Parte del set',
};

interface Props { item: EquipmentItem; colors: CardColors; }

export function SetInformation({ item, colors }: Props) {
  const { language } = useHeaderStore();
  if (!item.item_set_id) return null;

  const prefix  = SET_PREFIX[language] ?? SET_PREFIX.en;
  const setName = item.set_name || '';

  return (
    <div
      className="mx-3 px-2 py-1 rounded text-[9px] font-mono italic
                 border cursor-pointer hover:brightness-125 transition-all"
      style={{
        marginTop:   'auto',       // pushes to bottom
        marginBottom: '10px',
        borderColor: `${colors.accent}44`,
        color:        `${colors.accent}99`,
        background:   colors.badge,
      }}
      onClick={(e) => { e.stopPropagation(); }}
    >
      {prefix} {setName}
    </div>
  );
}