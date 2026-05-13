/***
 * Path: /kingskolossium/src/api/sets.ts
 * Created by: Christopher Echevarria
 * Date of creation: 08May2026
 * Purpose and Description: API fetch function and TypeScript types for mapped_sets.
 ***/

import { apiClient } from './client';
import type { EquipmentItem } from './equipment';

export interface SetEffect {
  min:                number;
  max:                number;
  type:               SetLocalizedString;
  templated:          SetLocalizedString;
  element_id:         number;
  active:             boolean;
  is_meta:            boolean;
  min_max_irrelevant: number;
}

// Tier key is always a string digit ("1"–"8")
export type SetEffectsByTier = Partial<Record<string, SetEffect[]>>;

export interface MappedSet {
  set_id:   number;
  name_en:  string;
  name_fr:  string;
  name_es:  string;
  item_ids: number[];
  effects:  SetEffectsByTier;
}

// ── Derived type — computed client-side from equipped state ───────────────────

export interface ActiveSet {
  set:             MappedSet;
  equippedItemIds: number[];   // subset of set.item_ids that are currently equipped
  tier:            number;     // equippedItemIds.length, always >= 2
}

// ── API call ──────────────────────────────────────────────────────────────────

export async function fetchAllSets(): Promise<MappedSet[]> {
  const response = await apiClient.get<MappedSet[]>('/api/equipment/sets');
  return response.data;
}

/**
 * Fetches all EquipmentItem objects belonging to a set.
 * Uses the existing list_equipment endpoint filtered by set_id.
 * Limit=10 — no set has more than 10 items.
 */
export async function fetchSetItems(
  setId: number,
  lang:  string,
): Promise<EquipmentItem[]> {
  const response = await apiClient.get<{ items: EquipmentItem[]; total: number }>(
    '/api/equipment/',
    { params: { set_id: setId, lang, limit: 10, skip: 0 } },
  );
  return response.data.items;
}