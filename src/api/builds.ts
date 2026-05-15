// Path: kingskolossium/src/api/builds.ts
// Created by: Christopher Echevarria
// Date of creation: 14May2026
// Purpose and Description: Typed API wrappers for the /api/builds CRUD layer.
//   Covers create, list (mine), fetch by id, update, and delete.

import client from './client';

export type Visibility = 'private' | 'shareable';

export interface BuildSlots {
  breed:  number | null;
  helmet: number | null;
  cape:   number | null;
  amulet: number | null;
  ring1:  number | null;
  ring2:  number | null;
  belt:   number | null;
  boots:  number | null;
  shield: number | null;
  weapon: number | null;
  dofus1: number | null;
  dofus2: number | null;
  dofus3: number | null;
  dofus4: number | null;
  dofus5: number | null;
  dofus6: number | null;
}

export interface Build {
  build_id:   string;
  user_id:    string;
  nickname:   string;
  name:       string;
  comment:    string | null;
  breed_id:   number | null;
  level:      number;
  visibility: Visibility;
  slots:      BuildSlots;
  created_at: string;
  updated_at: string;
}

export interface BuildCreateBody {
  name:       string;
  comment?:   string | null;
  breed_id?:  number | null;
  level?:     number;
  visibility: Visibility;
  slots:      BuildSlots;
}

export interface BuildUpdateBody {
  name?:       string;
  comment?:    string | null;
  breed_id?:   number | null;
  level?:      number;
  visibility?: Visibility;
  slots?:      BuildSlots;
}

export async function createBuild(body: BuildCreateBody): Promise<Build> {
  const res = await client.post<Build>('/api/builds/', body);
  return res.data;
}

export async function listMyBuilds(): Promise<Build[]> {
  const res = await client.get<{ items: Build[]; total: number; skip: number; limit: number }>('/api/builds/mine');
  return res.data.items;
}

export async function fetchBuild(id: string): Promise<Build> {
  const res = await client.get<Build>(`/api/builds/${id}`);
  return res.data;
}

export async function updateBuild(id: string, patch: BuildUpdateBody): Promise<Build> {
  const res = await client.patch<Build>(`/api/builds/${id}`, patch);
  return res.data;
}

export async function deleteBuild(id: string): Promise<void> {
  await client.delete(`/api/builds/${id}`);
}