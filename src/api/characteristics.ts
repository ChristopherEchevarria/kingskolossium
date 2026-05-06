/***
Path: /kingskolossium/src/api/characteristics.ts
Created by: Christopher Echevarria
Date of creation: 30Apr2026
Purpose and Description: API type and fetch function for the characteristics
  reference data endpoint. Returns all visible characteristics with display
  names in all three languages in a single call. No language parameter —
  the frontend stores all names and selects the correct one at render time.
***/

import { apiClient } from './client';

// ── Type ─────────────────────────────────────────────────────────────────────

export interface Characteristic {
  characteristic_id: number;  // characteristics.characteristic_id — real PK
  keyword:           string;  // snake_case — drives icon filename derivation
  name_en:           string;
  name_fr:           string;
  name_es:           string;
}

// ── API Method ────────────────────────────────────────────────────────────────

export async function fetchCharacteristics(): Promise<Characteristic[]> {
  const response = await apiClient.get('/api/characteristics/');
  return response.data;
}