/***
Path:/kingskolossium/src/features/arena/ArenaPage.tsx
Created by: Christopher Echevarria
Date of creation: 08Mar2026
Purpose and Description: Where sub components are call to display on page.
***/


import { useState, useMemo } from 'react';
import { MapSelection } from './components/MapSelection';
import { MapSearchBar } from './components/MapSearchBar';
import { MapIndexNav } from './components/MapIndexNav';
import { IsometricGrid } from './components/IsometricGrid';
import { useArenaStore } from './stores/arenaStore';

export function ArenaPage() {
  const { maps } = useArenaStore();

  // Controlled search query — lives here so both MapSearchBar and
  // MapIndexNav see the same value without touching the store.
  const [searchQuery, setSearchQuery] = useState('');

  // Derive filtered map list for MapIndexNav
  const filteredMaps = useMemo(() => {
    if (!searchQuery.trim()) return maps;
    const q = searchQuery.trim().toLowerCase();
    return maps.filter(
      (m) =>
        m.displayName.toLowerCase().includes(q) ||
        m.map_key.toLowerCase().includes(q) ||
        String(m.combat_map_id).includes(q) ||
        String(m.numericId).includes(q)
    );
  }, [maps, searchQuery]);

  return (
    <div className="h-full flex flex-col px-40">
      <h2 className="text-center text-app-blue font-mono text-2xl font-bold mb-4">
        Arena
      </h2>
      <div className="h-full flex flex-col px-20 ">
          <MapSearchBar value={searchQuery} onChange={setSearchQuery} />
          <MapIndexNav filteredMaps={filteredMaps} />
          <MapSelection />
      </div>
      {/* 4. Battle Grid */}
      <div className="flex-1 flex gap-4 min-h-0">
        <div className="flex-1 min-h-0 px-5 py-5">
          <IsometricGrid />
        </div>
      </div>
    </div>
  );
}

export default ArenaPage;
