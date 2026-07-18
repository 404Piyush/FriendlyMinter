'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CollectionStatus =
  | 'INITIALIZED'
  | 'MINTING'
  | 'PAUSED'
  | 'COMPLETED'
  | 'FAILED';

export interface Collection {
  id: string;
  name: string;
  symbol: string;
  description?: string;
  imageUrl?: string;
  merkleTree: string;
  collectionMint?: string;
  owner: string;
  maxDepth: number;
  maxBufferSize: number;
  canopyDepth: number;
  capacity: number;
  status: CollectionStatus;
  createdAt: number;
  treeSignature?: string;
  collectionSignature?: string;
}

export interface MintRecord {
  index: number;
  signature: string;
  assetId: string;
  name: string;
  owner: string;
  mintedAt: number;
}

export interface Job {
  id: string;
  collectionId: string;
  status: 'PENDING' | 'PROCESSING' | 'PAUSED' | 'COMPLETED' | 'FAILED';
  total: number;
  minted: number;
  failed: number;
  startedAt?: number;
  completedAt?: number;
  mints: MintRecord[];
}

interface State {
  collections: Collection[];
  jobs: Job[];
  addCollection: (c: Collection) => void;
  updateCollection: (id: string, patch: Partial<Collection>) => void;
  getCollection: (id: string) => Collection | undefined;
  addJob: (j: Job) => void;
  updateJob: (id: string, patch: Partial<Job>) => void;
  appendMint: (jobId: string, m: MintRecord) => void;
  getJob: (id: string) => Job | undefined;
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      collections: [],
      jobs: [],
      addCollection: (c) => set((s) => ({ collections: [c, ...s.collections] })),
      updateCollection: (id, patch) =>
        set((s) => ({
          collections: s.collections.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      getCollection: (id) => get().collections.find((c) => c.id === id),
      addJob: (j) => set((s) => ({ jobs: [j, ...s.jobs] })),
      updateJob: (id, patch) =>
        set((s) => ({
          jobs: s.jobs.map((j) => (j.id === id ? { ...j, ...patch } : j)),
        })),
      appendMint: (jobId, m) =>
        set((s) => ({
          jobs: s.jobs.map((j) =>
            j.id === jobId
              ? { ...j, mints: [m, ...j.mints], minted: j.minted + 1, status: 'PROCESSING' }
              : j,
          ),
        })),
      getJob: (id) => get().jobs.find((j) => j.id === id),
    }),
    { name: 'friendlyminter-v1' },
  ),
);

export function newId(prefix = 'col'): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
