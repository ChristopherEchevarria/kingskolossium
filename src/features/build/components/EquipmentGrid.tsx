/***
Path:/kingskolossium/src/features/build/components/EquipmentGrid.tsx
Created by: Christopher Echevarria
Date of creation: 09Apr2026
Purpose and Description: Responsive grid container for EquipmentCards with pagination
***/

import { useEffect, useCallback, useMemo } from 'react';
import { useBuildStore, EQUIPMENT_SUPER_TYPE_IDS } from '../stores/buildStore';
import { useHeaderStore } from '../../header/stores/headerStore';
import { EquipmentCard } from './EquipmentCard';
import { fetchEquipment, searchEquipment } from '../../../api/equipment';

export function EquipmentGrid() {
  const {
    equipmentItems,equipmentTypes, totalItems, isLoading,
    searchQuery, activeTypeFilters, currentPage, pageSize,
    setEquipmentItems, setLoading, setCurrentPage,
  } = useBuildStore();

  const { language } = useHeaderStore();

  const allEquipmentTypeIds = useMemo(
    () => equipmentTypes
      .filter(t => EQUIPMENT_SUPER_TYPE_IDS.has(t.super_type_id))
      .map(t => t.type_id),
    [equipmentTypes],
  );


  // ── Load equipment based on current filters ─────────────────────────────
  const loadItems = useCallback(async () => {
    if (allEquipmentTypeIds.length === 0) return; // wait for types to load
    setLoading(true);
    try {
      const typeIds = activeTypeFilters.size > 0
        ? Array.from(activeTypeFilters)
        : allEquipmentTypeIds;           // "All" = equipment only, never undefined

      if (searchQuery.trim()) {
        const results = await searchEquipment(searchQuery, 40, language, typeIds);
        setEquipmentItems(results, results.length);
      } else {
        const data = await fetchEquipment(
          currentPage * pageSize,
          pageSize,
          typeIds,
          undefined,
          undefined,
          language,
        );
        setEquipmentItems(data.items, data.total);
      }
    } catch (err) {
      console.error('[EquipmentGrid] Failed to load:', err);
      setEquipmentItems([], 0);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeTypeFilters, allEquipmentTypeIds, currentPage, pageSize,
      language, setEquipmentItems, setLoading]);
  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // ── Pagination ──────────────────────────────────────────────────────────
  const totalPages = Math.ceil(totalItems / pageSize);

  const goPrev = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };
  const goNext = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-3">
      {/* Results count + pagination header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[#5BC0F5]/60 font-mono text-xs">
          {isLoading
            ? 'Loading...'
            : `${totalItems.toLocaleString()} items`
          }
          {activeTypeFilters.size > 0 && !isLoading && ' (filtered)'}
        </span>

        {totalPages > 1 && !searchQuery.trim() && (
          <div className="flex items-center gap-2">
            <button
              onClick={goPrev}
              disabled={currentPage === 0}
              className="text-white/60 disabled:text-white/20 font-mono text-xs
                         hover:text-[#5BC0F5] transition-colors"
            >
              Prev
            </button>
            <span className="text-[#5BC0F5]/60 font-mono text-[10px]">
              {currentPage + 1}/{totalPages}
            </span>
            <button
              onClick={goNext}
              disabled={currentPage >= totalPages - 1}
              className="text-white/60 disabled:text-white/20 font-mono text-xs
                         hover:text-[#5BC0F5] transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="liquid-glass-transparent rounded-xl p-8 text-center">
          <span className="text-white/40 font-mono text-sm">Loading equipment...</span>
        </div>
      ) : equipmentItems.length === 0 ? (
        <div className="liquid-glass-transparent rounded-xl p-8 text-center">
          <span className="text-white/40 font-mono text-sm">
            {searchQuery.trim()
              ? `No items match "${searchQuery}"`
              : 'No items found'
            }
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {equipmentItems.map((item) => (
            <EquipmentCard
              key={item.item_id}
              item={item}
              superTypeId={item.super_type_id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default EquipmentGrid;