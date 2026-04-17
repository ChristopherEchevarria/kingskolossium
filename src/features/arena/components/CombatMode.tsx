/***
Path:/kingskolossium/src/features/arena/components/CombatMode.tsx
Created by: Christopher Echevarria
Date of creation: 07Apr2026
Purpose and Description: Combat mode — wraps existing map/grid components
***/

import {useState, useMemo} from 'react' ;
import {MapSelection} from './MapSelection' ;
import { MapSearchBar } from './MapSearchBar' ;
import { MapIndexNav} from './MapIndexNav'  ;
import { IsometricGrid } from './IsometricGrid'  ;
import { useArenaStore} from '../stores/arenaStore' ;

export function CombatMode (){
    const { maps } = useArenaStore();
    const [searchQuery, setSearchQuery] = useState(' ');

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
            <>
                <MapSearchBar value={searchQuery} onChange={setSearchQuery} />
                <MapIndexNav filteredMaps = {filteredMaps}/>
                <MapSelection/>

                <div
                    className = "relative w-full"
                    style = {{aspectRatio: '610/475'}}
                >

                    <IsometricGrid />
                </div>
            </>
            );
    }

export default CombatMode;