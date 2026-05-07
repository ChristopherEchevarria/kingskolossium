/***
 * Path: /kingskolossium/src/features/build/hooks/useReferenceData.ts
 * Created by: Christopher Echevarria
 * Date of creation: 07May2026
 * Purpose and Description: Loads all reference data into buildStore on mount.
 *   Fires once — guards against re-fetch if data is already present.
 *   Covers: equipment types, characteristics, breeds.
 ***/

import { useEffect } from 'react';
import { useBuildStore }          from '../stores/buildStore';
import { fetchCharacteristics }   from '../../../api/characteristics';
import { fetchBreeds }            from '../../../api/breeds';
import { fetchEquipmentTypes }    from '../../../api/equipment';

export function useReferenceData(): void {
  const {
    characteristics, setCharacteristics,
    breeds,          setBreeds,
    equipmentTypes,  setEquipmentTypes,
  } = useBuildStore();

  useEffect(() => {
    if (Object.keys(characteristics).length === 0) {
      fetchCharacteristics()
        .then(setCharacteristics)
        .catch(err => console.error('[useReferenceData] characteristics:', err));
    }

    if (breeds.length === 0) {
      fetchBreeds()
        .then(setBreeds)
        .catch(err => console.error('[useReferenceData] breeds:', err));
    }

    if (equipmentTypes.length === 0) {
      fetchEquipmentTypes()
        .then(setEquipmentTypes)
        .catch(err => console.error('[useReferenceData] equipmentTypes:', err));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount-only — guards prevent redundant fetches
}