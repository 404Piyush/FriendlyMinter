export interface NftMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  external_url?: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
    display_type?: string;
  }>;
  properties: {
    files: Array<{
      uri: string;
      type: string;
      cdn?: boolean;
    }>;
    category: string;
    creators?: Array<{
      address: string;
      share: number;
      verified?: boolean;
    }>;
  };
  collection?: {
    name: string;
    family: string;
  };
}

export interface MintJob {
  id: string;
  userId: string;
  collectionId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  progress: number;
  totalNfts: number;
  mintedCount: number;
  failedCount: number;
  errorMessage?: string;
  estimatedCost: number;
  actualCost?: number;
  transactionSignatures: string[];
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface CsvNftData {
  name: string;
  description: string;
  image: string;
  attributes?: Record<string, string | number>;
  external_url?: string;
  animation_url?: string;
}

export interface MintRequest {
  collectionId: string;
  nftData: CsvNftData[];
  batchSize?: number;
}

export interface MintProgress {
  jobId: string;
  status: MintJob['status'];
  progress: number;
  currentBatch: number;
  totalBatches: number;
  mintedCount: number;
  failedCount: number;
  estimatedTimeRemaining?: number;
}