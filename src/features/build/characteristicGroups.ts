//kingskolossium/src/features/build/characteristicGroups.ts

export interface StatEntry {
    characteristic_id: number;
    element_id: number;
    icon: string;
    }

export interface StatGroup {
    label: string;
    stats: StatEntry[]
    }

export const STAT_GROUPS: Record<string, StatGroup> = {
  combat: {
    label: 'Combat',
    stats: [
      { characteristic_id: 1, element_id: 12,  icon: 'ap.png'       }, // AP
      { characteristic_id: 23, element_id: 8, icon: 'mp.png'       }, // MP
      { characteristic_id: 19, element_id: 31, icon: 'range.png'    }, // Range
      { characteristic_id: 18, element_id: 29, icon: '%_critical.png' }, // Critical %
      { characteristic_id: 25, element_id: 32, icon: 'power.png'    }, // Power
      { characteristic_id: 26, element_id: 28, icon: 'summons.png'  }, // Summons
    ],
  },

  primary: {
    label: 'Primary',
    stats: [
      { characteristic_id: 11, element_id: 9, icon: 'vitality.png'     }, // Vitality
      { characteristic_id: 10, element_id: 45, icon: 'strength.png'     }, // Strength  → Earth in 3.7
      { characteristic_id: 15, element_id: 13, icon: 'intelligence.png' }, // Intelligence → Fire in 3.7
      { characteristic_id: 13, element_id: 22, icon: 'chance.png'       }, // Chance → Water in 3.7
      { characteristic_id: 14, element_id: 36, icon: 'agility.png'      }, // Agility → Air in 3.7
      { characteristic_id: 12, element_id: 10, icon: 'wisdom.png'       }, // Wisdom
    ],
  },

  secondary: {
    label: 'Secondary',
    stats: [
      { characteristic_id: 79, element_id: 26, icon: 'lock.png'          }, // Lock
      { characteristic_id: 78, element_id: 59, icon: 'dodge.png'         }, // Dodge
      { characteristic_id: 82, element_id: 64, icon: 'ap_reduction.png'  }, // AP Reduction
      { characteristic_id: 27, element_id: 75, icon: 'ap_parry.png'      }, // AP Parry
      { characteristic_id: 83, element_id: 50, icon: 'mp_reduction.png'  }, // MP Reduction
      { characteristic_id: 28, element_id: 39, icon: 'mp_parry.png'      }, // MP Parry
      { characteristic_id: 44, element_id: 24, icon: 'initiative.png'    }, // Initiative
      { characteristic_id: 49, element_id: 121, icon: 'heal.png'          }, // Heals
      { characteristic_id: 50, element_id: 1, icon: 'reflected_damage.png' }, // Reflect
      { characteristic_id: 40, element_id: 220, icon: 'pod.png'           }, // Pods
      { characteristic_id: 48, element_id: 25, icon: 'prospecting.png'   }, // Prospecting
    ],
  },

  damage: {
    label: 'Elemental Damage and Resistance',
    stats: [
      { characteristic_id: 92, element_id: 49, icon: 'neutral_damage.png'      }, // Neutral dmg ⚠️ REMOVED in 3.7
      { characteristic_id: 37, element_id: 34, icon: '%_neutral_resistance.png'}, // Neutral res % ⚠️ REMOVED in 3.7
      { characteristic_id: 58, element_id: 33, icon: 'neutral_resistance.png'  }, // Neutral res fixed ⚠️ REMOVED in 3.7

      { characteristic_id: 88, element_id: 48, icon: 'earth_damage.png'        }, // Earth dmg
      { characteristic_id: 33, element_id: 63, icon: '%_earth_resistance.png'  }, // Earth res %
      { characteristic_id: 54, element_id: 15, icon: 'earth_resistance.png'    }, // Earth res fixed

      { characteristic_id: 89, element_id: 61, icon: 'fire_damage.png'         }, // Fire dmg
      { characteristic_id: 34, element_id: 37, icon: '%_fire_resistance.png'   }, // Fire res %
      { characteristic_id: 55, element_id: 14, icon: 'fire_resistance.png'     }, // Fire res fixed

      { characteristic_id: 90, element_id: 27, icon: 'water_damage.png'        }, // Water dmg
      { characteristic_id: 35, element_id: 17, icon: '%_water_resistance.png'  }, // Water res %
      { characteristic_id: 56, element_id: 82, icon: 'water_resistance.png'    }, // Water res fixed

      { characteristic_id: 91, element_id: 47, icon: 'air_damage.png'          }, // Air dmg
      { characteristic_id: 36, element_id: 16, icon: '%_air_resistance.png'    }, // Air res %
      { characteristic_id: 57, element_id: 60, icon: 'air_resistance.png'      }, // Air res fixed
    ],
  },

  resistance: {
    label: 'Secondary Damage and Resistance',
    stats: [
      { characteristic_id: 16, element_id: 30, icon: 'damage.png'              }, // All Damage
      { characteristic_id: 86, element_id: 38, icon: 'critical_damage.png'     }, // Critical Damage ⚠️ → Critical Power in 3.7
      { characteristic_id: 87, element_id: 46, icon: 'critical_resistance.png' }, // Critical res fixed
      { characteristic_id: 85, element_id: 70, icon: 'pushback_resistance.png' }, // Pushback res fixed
      { characteristic_id: 84, element_id: 62, icon: 'pushback_damage.png'     }, // Pushback dmg
      { characteristic_id: 69, element_id: 1, icon: 'power_(traps).png'       }, // Trap Power ⚠️ → Deferred Power in 3.7
      { characteristic_id: 70, element_id: 1, icon: 'trap_damage.png'         }, // Trap Damage ⚠️ → Deferred Power in 3.7
    ],
  },
};

// ── STAT_BY_ELEMENT_ID ────────────────────────────────────────────────────────
// O(1) reverse lookup: element_id → StatEntry (includes characteristic_id + icon).
// Used by TotalCharacteristics aggregator to resolve labels from eff.element_id.
// NOTE: element_id === 1 is a placeholder — those entries will collide until verified.
export const STAT_BY_ELEMENT_ID: Record<number, StatEntry> =
  Object.values(STAT_GROUPS)
    .flatMap(g => g.stats)
    .reduce<Record<number, StatEntry>>(
      (acc, s) => { acc[s.element_id] = s; return acc; },
      {}
    );

// ── STAT_LOOKUP ───────────────────────────────────────────────────────────────
// characteristic_id → groupKey. Used for tooltip / category routing.
export const STAT_LOOKUP: Record<number, string> =
  Object.entries(STAT_GROUPS).reduce<Record<number, string>>(
    (acc, [groupKey, group]) => {
      group.stats.forEach(s => { acc[s.characteristic_id] = groupKey; });
      return acc;
    },
    {}
  );

// ── STAT_LOOKUP_BY_ELEMENT_ID ─────────────────────────────────────────────────
// element_id → groupKey. Parallel to STAT_LOOKUP for callers that only have an effect.
export const STAT_LOOKUP_BY_ELEMENT_ID: Record<number, string> =
  Object.entries(STAT_GROUPS).reduce<Record<number, string>>(
    (acc, [groupKey, group]) => {
      group.stats.forEach(s => { acc[s.element_id] = groupKey; });
      return acc;
    },
    {}
  );