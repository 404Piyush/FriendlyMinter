// Bubblegum program only accepts a fixed set of (maxDepth, maxBufferSize)
// combinations. The set below reflects what the current devnet program
// (BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY) accepts at the time of
// writing — verified by calling the program. Smaller trees (depth ≤ 10) are
// no longer supported on devnet as of 2026.
export const VALID_TREE_CONFIGS: Array<{ maxDepth: number; maxBufferSize: number }> = [
  { maxDepth: 14, maxBufferSize: 64 },
  { maxDepth: 14, maxBufferSize: 256 },
  { maxDepth: 14, maxBufferSize: 1024 },
  { maxDepth: 14, maxBufferSize: 2048 },
  { maxDepth: 15, maxBufferSize: 64 },
  { maxDepth: 16, maxBufferSize: 64 },
  { maxDepth: 16, maxBufferSize: 256 },
  { maxDepth: 16, maxBufferSize: 1024 },
  { maxDepth: 16, maxBufferSize: 2048 },
  { maxDepth: 17, maxBufferSize: 64 },
  { maxDepth: 17, maxBufferSize: 256 },
  { maxDepth: 17, maxBufferSize: 1024 },
  { maxDepth: 17, maxBufferSize: 2048 },
  { maxDepth: 20, maxBufferSize: 64 },
  { maxDepth: 20, maxBufferSize: 256 },
  { maxDepth: 20, maxBufferSize: 1024 },
  { maxDepth: 20, maxBufferSize: 2048 },
  { maxDepth: 24, maxBufferSize: 64 },
  { maxDepth: 24, maxBufferSize: 256 },
  { maxDepth: 24, maxBufferSize: 1024 },
  { maxDepth: 24, maxBufferSize: 2048 },
  { maxDepth: 26, maxBufferSize: 512 },
  { maxDepth: 30, maxBufferSize: 512 },
  { maxDepth: 30, maxBufferSize: 1024 },
  { maxDepth: 30, maxBufferSize: 2048 },
];

export function isValidTreeConfig(maxDepth: number, maxBufferSize: number): boolean {
  return VALID_TREE_CONFIGS.some(
    (c) => c.maxDepth === maxDepth && c.maxBufferSize === maxBufferSize
  );
}

export function nearestValidConfig(maxDepth: number, maxBufferSize: number): { maxDepth: number; maxBufferSize: number } {
  const exact = VALID_TREE_CONFIGS.find(
    (c) => c.maxDepth === maxDepth && c.maxBufferSize === maxBufferSize
  );
  if (exact) return exact;

  const sameDepth = VALID_TREE_CONFIGS.filter((c) => c.maxDepth === maxDepth);
  if (sameDepth.length > 0) {
    sameDepth.sort((a, b) => Math.abs(a.maxBufferSize - maxBufferSize) - Math.abs(b.maxBufferSize - maxBufferSize));
    return { maxDepth, maxBufferSize: sameDepth[0].maxBufferSize };
  }

  VALID_TREE_CONFIGS.sort((a, b) => Math.abs(a.maxDepth - maxDepth) - Math.abs(b.maxDepth - maxDepth));
  return { maxDepth: VALID_TREE_CONFIGS[0].maxDepth, maxBufferSize: VALID_TREE_CONFIGS[0].maxBufferSize };
}