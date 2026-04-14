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
  super_type_id number;
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

export interface CharacteristicName {
  characteristic_id: number;
  keyword:           string;
  name:              string;
  operator:          string;   // "+" or "-"
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

export async function fetchCharacteristics(lang = 'en'): Promise<CharacteristicName[]> {
  const response = await apiClient.get(`/api/characteristics/?lang=${lang}`);
  return response.data;
}