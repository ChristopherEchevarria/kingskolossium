/***
Path:/kingskolossium/src/api/combatMaps.ts
Created by: Christopher Echevarria
Date of creation: 08Mar2026
Purpose and Description: method definition for api call related to combat maps.
***/

import { apiClient } from './client';
import type { CombatMapDetail, CombatMapListResponse } from '../engine/types/Grid';

export async function fetchCombatMaps( skip = 0, limit = 100
): Promise<CombatMapListResponse> {
  const params = new URLSearchParams({
    skip: String(skip),
    limit: String(limit),
    status: 'deployed',
  });
  const response = await apiClient.get(`/api/combat-maps/?${params}`);
  return response.data;
}

/** Full detail for a single map by key */
export async function fetchCombatMap(
  mapKey: string,
): Promise<CombatMapDetail> {
  const response = await apiClient.get(`/api/combat-maps/${mapKey}/`);
  return response.data;
}
