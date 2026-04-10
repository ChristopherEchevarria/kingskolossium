/***
Path:/kingskolossium/src/api/equipment.ts
Created by: Christopher Echevarria
Date of creation: 09Apr2026
Purpose and Description: API methods for equipment search, filter, detail
***/

import { apiClient } from './client';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface EquipmentItem {
  item_id:     number;
  type_id:     number;
  item_set_id: number | null;
  level:       number;
  icon_id:     number;
  name:        string;
  description?: string;
  type_name:   string;
  set_name?:   string;
  effects:     EquipmentEffect[] | null;
  price:       number;
}

export interface EquipmentEffect {
  effectId:      number;
  baseEffectId:  number;
  effectElement: number;
  value:         number;
  diceNum:       number;
  diceSide:      number;
  order:         number;
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
): Promise<EquipmentItem[]> {
  const response = await apiClient.get(
    `/api/equipment/search?q=${encodeURIComponent(query)}&limit=${limit}&lang=${lang}`,
  );
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