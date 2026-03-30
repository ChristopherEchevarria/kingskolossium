/***
Path:/kingskolossium/src/features/arena/components/MapIndexNav.tsx
Created by: Christopher Echevarria
Date of creation: 08Mar2026
Purpose and Description: Quick-jump pill buttons
***/

import { useArenaStore, MapInfo } from '../stores/arenaStore';
import { useMapLoader } from '../hooks/useMapLoader';

interface MapIndexNavProps {
  filteredMaps: MapInfo[];
}

export function MapIndexNav({ filteredMaps }: MapIndexNavProps) {
  const { maps, selectedMapIndex } = useArenaStore();
  const { loadMap } = useMapLoader();

  if (maps.length === 0) return null;

  return (
    <div
      className="
        liquid-glass rounded-xl px-4 py-2 my-2
        flex flex-wrap gap-1.5
      "
    >
      {filteredMaps.map((map) => {
        // Resolve back to the original index in the full maps array
        const originalIdx = maps.findIndex((m) => m.map_key === map.map_key);
        const isSelected = originalIdx === selectedMapIndex;

        return (
          <button
            key={map.map_key}
            onClick={() => loadMap(map, originalIdx)}
            title={`#${originalIdx} — ${map.displayName}${map.variant ? ' ' + map.variant : ''} (id ${map.combat_map_id})`}
            className={`
              liquid-glass-btn
              min-w-[2rem] h-7 px-1.5 rounded-lg
              text-[10px] font-mono font-bold
              transition-all duration-150
              flex items-center justify-center
              ${isSelected
                ? 'liquid-glass-btn--active'
                : 'liquid-glass-btn--idle'}
            `}
          >
            {originalIdx + 1}
          </button>
        );
      })}

      {filteredMaps.length === 0 && (
        <span className="text-[#5BC0F5]/50 font-mono text-xs italic px-1">
          No maps match
        </span>
      )}
    </div>
  );
}

export default MapIndexNav;
