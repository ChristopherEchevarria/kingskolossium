//kingskolossium/src/features/build/characteristicGroups.ts

export interface StatEntry {
    id: number;
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
      { id: 1,  icon: 'ap.png'       }, // AP
      { id: 23, icon: 'mp.png'       }, // MP
      { id: 19, icon: 'range.png'    }, // Range
      { id: 18, icon: '%_critical.png' }, // Critical %
      { id: 25, icon: 'power.png'    }, // Power
      { id: 26, icon: 'summons.png'  }, // Summons
    ],
  },

  primary: {
    label: 'Primary',
    stats: [
      { id: 11, icon: 'vitality.png'     }, // Vitality
      { id: 10, icon: 'strength.png'     }, // Strength  → Earth in 3.7
      { id: 15, icon: 'intelligence.png' }, // Intelligence → Fire in 3.7
      { id: 13, icon: 'chance.png'       }, // Chance → Water in 3.7
      { id: 14, icon: 'agility.png'      }, // Agility → Air in 3.7
      { id: 12, icon: 'wisdom.png'       }, // Wisdom
    ],
  },

  secondary: {
    label: 'Secondary',
    stats: [
      { id: 79, icon: 'lock.png'          }, // Lock
      { id: 78, icon: 'dodge.png'         }, // Dodge
      { id: 82, icon: 'ap_reduction.png'  }, // AP Reduction
      { id: 27, icon: 'ap_parry.png'      }, // AP Parry
      { id: 83, icon: 'mp_reduction.png'  }, // MP Reduction
      { id: 28, icon: 'mp_parry.png'      }, // MP Parry
      { id: 44, icon: 'initiative.png'    }, // Initiative
      { id: 49, icon: 'heal.png'          }, // Heals
      { id: 50, icon: 'reflected_damage.png' }, // Reflect
      { id: 40, icon: 'pod.png'           }, // Pods
      { id: 48, icon: 'prospecting.png'   }, // Prospecting
    ],
  },

  damage: {
    label: 'Elemental Damage and Resistance',
    stats: [
      { id: 92, icon: 'neutral_damage.png'      }, // Neutral dmg ⚠️ REMOVED in 3.7
      { id: 58, icon: 'neutral_resistance.png'  }, // Neutral res fixed ⚠️ REMOVED in 3.7
      { id: 37, icon: '%_neutral_resistance.png'}, // Neutral res % ⚠️ REMOVED in 3.7

      { id: 88, icon: 'earth_damage.png'        }, // Earth dmg
      { id: 33, icon: '%_earth_resistance.png'  }, // Earth res %
      { id: 54, icon: 'earth_resistance.png'    }, // Earth res fixed

      { id: 89, icon: 'fire_damage.png'         }, // Fire dmg
      { id: 34, icon: '%_fire_resistance.png'   }, // Fire res %
      { id: 55, icon: 'fire_resistance.png'     }, // Fire res fixed

      { id: 90, icon: 'water_damage.png'        }, // Water dmg
      { id: 35, icon: '%_water_resistance.png'  }, // Water res %
      { id: 56, icon: 'water_resistance.png'    }, // Water res fixed

      { id: 91, icon: 'air_damage.png'          }, // Air dmg
      { id: 36, icon: '%_air_resistance.png'    }, // Air res %
      { id: 57, icon: 'air_resistance.png'      }, // Air res fixed
    ],
  },

  resistance: {
    label: 'Secondary Damage and Resistance',
    stats: [
      { id: 16, icon: 'damage.png'              }, // All Damage
      { id: 86, icon: 'critical_damage.png'     }, // Critical Damage ⚠️ → Critical Power in 3.7
      { id: 87, icon: 'critical_resistance.png' }, // Critical res fixed
      { id: 85, icon: 'pushback_resistance.png' }, // Pushback res fixed
      { id: 84, icon: 'pushback_damage.png'     }, // Pushback dmg
      { id: 69, icon: 'power_(traps).png'       }, // Trap Power ⚠️ → Deferred Power in 3.7
      { id: 70, icon: 'trap_damage.png'         }, // Trap Damage ⚠️ → Deferred Power in 3.7
    ],
  },
};

// Flat lookup: element_id → groupKey
// Used by TotalCharacteristics to place a stat into the right section.
export const STAT_LOOKUP: Record<number, string> =
  Object.entries(STAT_GROUPS).reduce<Record<number, string>>(
    (acc, [groupKey, group]) => {
      group.stats.forEach(s => { acc[s.id] = groupKey; });
      return acc;
    },
    {}
  );