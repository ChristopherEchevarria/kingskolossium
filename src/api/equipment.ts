/***
Path:/kingskolossium/src/api/equipment.ts
Created by: Christopher Echevarria
Date of creation: 09Apr2026
Purpose and Description: API methods for equipment search, filter, detail
***/

import { apiClient } from './client';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MappedEffectType {
  en: string;
  fr: string;
  es: string;
  de: string;
  pt: string;
}

export interface MappedEffect {
  min:                number;
  max:                number;
  type:               MappedEffectType;
  templated:          MappedEffectType;
  element_id:         number;
  keyword:            string ;   // camelCase Dofus identifier e.g. "vitality", "actionPoints"
  is_meta:            boolean;
  active:             boolean;
  min_max_irrelevant: number;
}

export interface EquipmentItem {
  item_id:           number;
  type_id:           number | null;
  super_type_id:     number | null;
  level:             number;
  icon_id:           number | null;
  name:              string;
  description:       string;
  type_name:         string;
  parent_set_id:     number | null;
  parent_set_name:   string | null;
  has_parent_set:    boolean;
  effects:           MappedEffect[] | null;
  ap_cost:           number;
  range:             number;
  min_range:         number;
  crit_hit_bonus:    number;
  crit_hit_prob:     number;
  max_cast_per_turn: number;
}


export interface EquipmentType {
  type_id:       number;
  name:          string;
  super_type_id: number;
  item_count:    number;
}

export interface EquipmentListResponse {
  items: EquipmentItem[];
  total: number;
  skip:  number;
  limit: number;
}

// ─── API Methods ─────────────────────────────────────────────────────────────

export async function fetchEquipment(
  skip = 0,
  limit = 40,
  typeIds?: number[],       // multi-select: array of type_ids
  minLevel?: number,
  maxLevel?: number,
  lang = 'en',
): Promise<EquipmentListResponse> {
  const params = new URLSearchParams({
    skip: String(skip),
    limit: String(limit),
    lang,
  });
  if (typeIds && typeIds.length > 0) {
    params.set('type_ids', typeIds.join(','));
  }
  if (minLevel !== undefined) params.set('min_level', String(minLevel));
  if (maxLevel !== undefined) params.set('max_level', String(maxLevel));

  const response = await apiClient.get(`/api/equipment/?${params}`);
  return response.data;
}

export async function searchEquipment(
  query: string,
  limit = 20,
  lang = 'en',
  typeIds?: number[],
): Promise<EquipmentItem[]> {
  const params = new URLSearchParams({
    q:     encodeURIComponent(query),
    limit: String(limit),
    lang,
  });
  if (typeIds && typeIds.length > 0 ) {
    params.set('type_ids', typeIds.join(','));
  }
  const response = await apiClient.get(`/api/equipment/search?${params}`);
  return response.data;
}

export async function fetchEquipmentTypes(
  lang = 'en',
): Promise<EquipmentType[]> {
  const response = await apiClient.get(`/api/equipment/types?lang=${lang}`);
  return response.data;
}

export async function fetchEquipmentDetail(
  itemId: number,
  lang = 'en',
): Promise<EquipmentItem> {
  const response = await apiClient.get(`/api/equipment/${itemId}?lang=${lang}`);
  return response.data;
}
