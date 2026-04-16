/***
Path:/kingskolossium/src/features/build/BuildPage.tsx
Created by: Christopher Echevarria
Date of creation: 09Apr2026
Purpose and Description: Build mode root layout — search, filter, equipment grid
***/

import { useEffect } from 'react';
import { useBuildStore } from './stores/buildStore';
import { useHeaderStore } from '../header/stores/headerStore';
import { EquipmentSearchBar } from './components/EquipmentSearchBar';
import { EquipmentFilter } from './components/EquipmentFilter';
import { EquipmentGrid } from './components/EquipmentGrid';
import { fetchEquipmentTypes } from '../../api/equipment';

export function BuildPage() {
  const { setEquipmentTypes } = useBuildStore();
  const { language } = useHeaderStore();

  // Load equipment types on mount (for filter pills)
  useEffect(() => {
    fetchEquipmentTypes(language)
      .then(setEquipmentTypes)
      .catch(err => console.error('[BuildPage] Failed to load types:', err));
  }, [language, setEquipmentTypes]);

  return (
    <div className="flex flex-col gap-3">
      <EquipmentSearchBar />
      <EquipmentFilter />
      <EquipmentGrid />
    </div>
  );
}

export default BuildPage;