export interface Collection {
  id: string;
  name: string;
  symbol: string;
  description: string;
  imageUrl?: string;
  imageCid?: string;
  maxNfts: number;
  mintedCount: number;
  merkleTreeAddress?: string;
  collectionMintAddress?: string;
  status: 'DRAFT' | 'INITIALIZED' | 'MINTING' | 'COMPLETED' | 'FAILED';
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  // Merkle tree configuration
  maxDepth: number;
  maxBufferSize: number;
  canopyDepth: number;
}

export interface CreateCollectionData {
  name: string;
  symbol: string;
  description: string;
  maxNfts: number;
  image?: File;
  maxDepth?: number;
  maxBufferSize?: number;
  canopyDepth?: number;
}

export interface CollectionStats {
  totalCollections: number;
  totalMinted: number;
  totalCost: number;
  successRate: number;
}