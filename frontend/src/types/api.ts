import { Collection, CreateCollectionData } from './collection';
import { MintJob, MintRequest, NftMetadata } from './nft';

// Generic API Response
export interface ApiResponse<T = unknown> {
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
export type CreateCollectionRequest = CreateCollectionData;
export type CreateCollectionResponse = ApiResponse<Collection>;
export type GetCollectionsResponse = ApiResponse<PaginatedResponse<Collection>>;
export type GetCollectionResponse = ApiResponse<Collection>;
export type UpdateCollectionRequest = Partial<CreateCollectionData>;
export type UpdateCollectionResponse = ApiResponse<Collection>;

// Mint Job API Types
export type CreateMintJobRequest = MintRequest;
export type CreateMintJobResponse = ApiResponse<MintJob>;
export type GetMintJobResponse = ApiResponse<MintJob>;
export type GetMintJobsResponse = ApiResponse<PaginatedResponse<MintJob>>;

// File Upload API Types
export interface UploadFileRequest {
  file: File;
  collectionId?: string;
}

export type UploadFileResponse = ApiResponse<{
  url: string;
  cid: string;
  size: number;
  type: string;
}>;

export interface UploadMetadataRequest {
  metadata: NftMetadata[];
  collectionId: string;
}

export type UploadMetadataResponse = ApiResponse<{
  metadataUris: string[];
  totalUploaded: number;
}>;

// Cost Estimation API Types
export interface CostEstimationRequest {
  maxNfts: number;
  maxDepth?: number;
  maxBufferSize?: number;
  canopyDepth?: number;
}

export type CostEstimationResponse = ApiResponse<{
  merkleTreeCost: number;
  mintingCost: number;
  totalCost: number;
  breakdown: {
    accountRent: number;
    transactionFees: number;
    compressionFees: number;
  };
}>;

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
  details?: unknown;
  timestamp: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}