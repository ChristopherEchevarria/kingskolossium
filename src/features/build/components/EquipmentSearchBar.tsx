/***
Path:/kingskolossium/src/features/build/components/EquipmentSearchBar.tsx
Created by: Christopher Echevarria
Date of creation: 09Apr2026
Purpose and Description: Compact search bar with Reset button to the left. Reset clears
                         type filters only, NOT the search query.
***/

import { useBuildStore } from '../stores/buildStore';

export function EquipmentSearchBar() {
  const { searchQuery, setSearchQuery, activeTypeFilters, resetTypeFilters } = useBuildStore();
  const hasActiveFilters = activeTypeFilters.size > 0;

  return (
    <div className="flex items-center gap-2">
      {/* Reset pills button — muted when no filters active */}
      <button
        onClick={resetTypeFilters}
        disabled={!hasActiveFilters}
        title="Reset type filters"
        className={`
          flex-shrink-0 h-9 px-3 rounded-lg font-mono text-xs font-bold
          transition-all duration-150 border
          ${hasActiveFilters
            ? 'bg-[rgba(226,75,74,0.15)] border-[#E24B4A]/30 text-[#E24B4A] hover:bg-[rgba(226,75,74,0.3)]'
            : 'bg-transparent border-white/10 text-white/20 cursor-default'}
        `}
      >
        Reset
      </button>

      {/* Search input — compact, same height as Combat/Build toggle buttons */}
      <div className="liquid-glass rounded-lg px-3 py-0 h-9 flex items-center gap-2 flex-1">
        <svg
          className="w-3.5 h-3.5 flex-shrink-0 text-white/50"
          fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search equipment..."
          className="
            bg-transparent outline-none flex-1
            text-app-white font-mono text-xs
            placeholder-white/30 caret-[#5BC0F5]
          "
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            title="Clear search"
            className="
              flex-shrink-0 w-4 h-4 rounded-full
              flex items-center justify-center
              text-[#5BC0F5]/70 hover:text-[#5BC0F5]
              bg-[rgba(0,95,142,0.3)] hover:bg-[rgba(0,95,142,0.55)]
              transition-all duration-150 text-[9px] font-bold
            "
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

export default EquipmentSearchBar;