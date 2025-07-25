import { Collection, CreateCollectionData } from './collection';
import { MintJob, MintRequest, NftMetadata } from './nft';

// Generic API Response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Collection API Types
export interface CreateCollectionRequest extends CreateCollectionData {}
export interface CreateCollectionResponse extends ApiResponse<Collection> {}
export interface GetCollectionsResponse extends ApiResponse<PaginatedResponse<Collection>> {}
export interface GetCollectionResponse extends ApiResponse<Collection> {}
export interface UpdateCollectionRequest extends Partial<CreateCollectionData> {}
export interface UpdateCollectionResponse extends ApiResponse<Collection> {}

// Mint Job API Types
export interface CreateMintJobRequest extends MintRequest {}
export interface CreateMintJobResponse extends ApiResponse<MintJob> {}
export interface GetMintJobResponse extends ApiResponse<MintJob> {}
export interface GetMintJobsResponse extends ApiResponse<PaginatedResponse<MintJob>> {}

// File Upload API Types
export interface UploadFileRequest {
  file: File;
  collectionId?: string;
}

export interface UploadFileResponse extends ApiResponse<{
  url: string;
  cid: string;
  size: number;
  type: string;
}> {}

export interface UploadMetadataRequest {
  metadata: NftMetadata[];
  collectionId: string;
}

export interface UploadMetadataResponse extends ApiResponse<{
  metadataUris: string[];
  totalUploaded: number;
}> {}

// Cost Estimation API Types
export interface CostEstimationRequest {
  maxNfts: number;
  maxDepth?: number;
  maxBufferSize?: number;
  canopyDepth?: number;
}

export interface CostEstimationResponse extends ApiResponse<{
  merkleTreeCost: number;
  mintingCost: number;
  totalCost: number;
  breakdown: {
    accountRent: number;
    transactionFees: number;
    compressionFees: number;
  };
}> {}

// Solana Network Types
export type SolanaNetwork = 'devnet' | 'testnet' | 'mainnet-beta';

export interface SolanaConfig {
  network: SolanaNetwork;
  rpcUrl: string;
  commitment: 'processed' | 'confirmed' | 'finalized';
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}