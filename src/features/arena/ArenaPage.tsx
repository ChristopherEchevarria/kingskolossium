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
      <div className="min-h-screen flex flex-col items-center py-6 px-4">

        {/* Single centred column — everything constrained to 70% max-width */}
        < div className="w-full flex flex-col gap-3 overflow-hidden" style={{ maxWidth: '60%' }}>

          <h2 className="text-center text-app-blue font-mono text-2xl font-bold">
            Arena
          </h2>

          <MapSearchBar value={searchQuery} onChange={setSearchQuery} />
          <MapIndexNav filteredMaps={filteredMaps} />
          <MapSelection />

          {/* Grid — same column width, aspect-ratio keeps proportions */}
          <div
            className="relative w-full"
            style={{ aspectRatio: '610 / 475' }}
          >
            <IsometricGrid />
          </div>

        </div>
      </div>
    );
}

export default ArenaPage;
