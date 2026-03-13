/***
Path:/kingskolossium/src/features/arena/hooks/useMapLoader.ts
Created by: Christopher Echevarria
Date of creation: 08Mar2026
Purpose and Description: Shared async map-load logic
***/

import { useCallback } from 'react';
import { fetchCombatMap } from '../../../api/combatMaps';
import { useArenaStore, parseMapKey, type MapInfo, type MapDetail } from '../stores/arenaStore';

export function useMapLoader() {
  const { setSelectedMapIndex, loadMapDetail } = useArenaStore();

  const loadMap = useCallback(async (map: MapInfo, index: number) => {
    setSelectedMapIndex(index);

    try {
      const d = await fetchCombatMap(map.map_key);

      loadMapDetail({
        combat_map_id:      d.combat_map_id,
        map_key:            d.map_key,
        preview_image_path: d.preview_image_path ?? null,
        available_cells:    d.available_cells   ?? null,
        ally_spawn_cells:   d.ally_spawn_cells  ?? null,
        enemy_spawn_cells:  d.enemy_spawn_cells ?? null,
        obstacle_cells:     d.obstacle_cells    ?? null,
        hole_cells:         d.hole_cells        ?? null,
        ...parseMapKey(d.map_key),
      } as MapDetail);
    } catch (err) {
      console.error('[useMapLoader] Failed to load map detail:', err);
    }
  }, [setSelectedMapIndex, loadMapDetail]);

  return { loadMap };
}

export default useMapLoader;
