/***
 * Path: /kingskolossium/src/api/breeds.ts
 * Created by: Christopher Echevarria
 * Date of creation: 07May2026
 * Purpose and Description: API type and fetch function for the breeds reference
 *   data endpoint. Returns all breed rows including breed_id 19 — filtering
 *   of "All Classes" is left to the consumer.
 ***/

import { apiClient } from './client';

export interface BreedInfo {
  breed_id:          number;
  name_en:           string;
  name_fr:           string;
  name_es:           string;
  male_look:         string | null;
  female_look:       string | null;
  creature_bones_id: number | null;
  breed_spells_ids:  number[] | null;
  complexity:        number | null;
  sort_index:        number | null;
}

export async function fetchBreeds(): Promise<BreedInfo[]> {
  const response = await apiClient.get('/api/breeds');
  return response.data.breeds;
}