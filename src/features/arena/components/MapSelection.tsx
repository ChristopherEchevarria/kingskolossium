 /***
Path:/kingskolossium/src/features/arena/components/MapSelection.tsx
Created by: Christopher Echevarria
Date of creation: 08Mar2026
Purpose and Description: 3-card carousel with ◀ ▶ arrows
***/

import { useEffect } from 'react';
import { useArenaStore, parseMapKey, MapInfo } from '../stores/arenaStore';
import { useMapLoader } from '../hooks/useMapLoader';
import { MapCard } from './MapCard';
import { fetchCombatMaps } from '../../../api/combatMaps';
import type { CombatMapInfo } from '../../../engine/types/Grid';


export function MapSelection() {
  const {
    maps, setMaps,
    selectedMapIndex,
  } = useArenaStore();

  const { loadMap } = useMapLoader();

  // Load all maps on mount
  useEffect(() => {
    fetchCombatMaps(0, 100)
      .then(data => {
          const items = (data.items || []).map((m: CombatMapInfo): MapInfo => ({
          combat_map_id:      m.combat_map_id,
          map_key:            m.map_key,
          cell_count:         m.cell_count,
          preview_image_path: m.preview_image_path ?? null,
          ...parseMapKey(m.map_key),
        }));
        setMaps(items);
        // Auto-load second map (index 1) to start centred if possible
        if (items.length >= 2) {
          loadMap(items[1], 1);
        } else if (items.length > 0) {
          loadMap(items[0], 0);
        }
      })
      .catch(err => console.error('[MapSelection] Failed to load maps:', err));
  // loadMap is stable (useCallback with store deps) — safe to include
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goLeft = () => {
    if (selectedMapIndex > 0) {
      loadMap(maps[selectedMapIndex - 1], selectedMapIndex - 1);
    }
  };

  const goRight = () => {
    if (selectedMapIndex < maps.length - 1) {
      loadMap(maps[selectedMapIndex + 1], selectedMapIndex + 1);
    }
  };

  // Early return if no maps
  if (maps.length === 0) {
    return <div className="text-app-white text-center">Loading maps…</div>;
  }

  return (
    <div className="flex items-center gap-2 px-2">
      {/* Left arrow */}
      <button
        onClick={goLeft}
        disabled={selectedMapIndex === 0}
        className="p-2 text-app-white disabled:opacity-25 hover:text-app-blue
                   transition-colors text-xl flex-shrink-0"
      >
        ◀
      </button>

      {/* Cards container */}
      <div className="flex gap-10 flex-1">
        {/* Left slot */}
        {selectedMapIndex > 0 ? (
          <div className="flex-1 min-w-0">
            <MapCard
              map={maps[selectedMapIndex - 1]}
              isSelected={false}
              onClick={() => loadMap(maps[selectedMapIndex - 1], selectedMapIndex - 1)}
            />
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {/* Center slot */}
        <div className="flex-1 min-w-0">
          <MapCard
            map={maps[selectedMapIndex]}
            isSelected={true}
            onClick={() => {/* Already selected — no-op */}}
          />
        </div>

        {/* Right slot */}
        {selectedMapIndex < maps.length - 1 ? (
          <div className="flex-1 min-w-0">
            <MapCard
              map={maps[selectedMapIndex + 1]}
              isSelected={false}
              onClick={() => loadMap(maps[selectedMapIndex + 1], selectedMapIndex + 1)}
            />
          </div>
        ) : (
          <div className="flex-1" />
        )}
      </div>

      {/* Right arrow */}
      <button
        onClick={goRight}
        disabled={selectedMapIndex === maps.length - 1}
        className="p-2 text-app-white disabled:opacity-25 hover:text-app-blue
                   transition-colors text-xl flex-shrink-0"
      >
        ▶
      </button>
    </div>
  );
}

export default MapSelection;
