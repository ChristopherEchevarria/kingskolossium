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
import { EquipmentActiveSlots }  from './components/EquipmentActiveSlots';
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
      <>
        <div className="grid grid-cols-12 gap-3">

          {/* Left column — slots + (characteristics + actions later) */}
          <section className="col-span-12 lg:col-span-4 flex flex-col gap-3">
            <EquipmentActiveSlots />
            {/* TotalCharacteristics and BuildActions mount here in later steps */}
          </section>

          {/* Right column — browser */}
          <section className="col-span-12 lg:col-span-8 flex flex-col gap-3">
            <EquipmentSearchBar />
            <EquipmentFilter />
            <EquipmentGrid />
          </section>

        </div>
    </>
  );
}

export default BuildPage;