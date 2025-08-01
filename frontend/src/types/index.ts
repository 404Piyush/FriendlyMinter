// Export all types from individual files
export * from './api';
export * from './collection';
export * from './nft';

// Import Collection for extending
import { Collection } from './collection';

// Additional types for demo and enhanced functionality
export interface User {
  id: string;
  name: string;
  email: string;
  walletAddress?: string;
  role?: string;
  isActive: boolean;
  totalCollections: number;
  totalNftsMinted: number;
  totalSpent: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface NFTMetadata {
  collectionId: string;
  tokenId: number;
  name: string;
  description: string;
  image: string;
  attributes: Record<string, string | number>;
  rarity?: string;
  rarityScore?: number;
  external_url?: string;
  animation_url?: string;
}

// Enhanced Collection type for demo
export interface Transaction {
  id: string;
  signature: string;
  type: 'mint' | 'transfer' | 'burn' | 'update';
  status: 'pending' | 'confirmed' | 'failed';
  amount?: number;
  fee: number;
  fromAddress?: string;
  toAddress?: string;
  mintJobId?: string;
  blockTime: number;
  confirmations: number;
  slot: number;
}

export interface Analytics {
  totalUsers: number;
  totalCollections: number;
  totalNftsMinted: number;
  totalVolume: number;
  averageMintCost: number;
  successRate: number;
  dailyStats: Array<{
    date: string;
    mints: number;
    volume: number;
    users: number;
  }>;
  topCollections: Array<{
    name: string;
    volume: number;
    change?: string;
  }>;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

export interface EnhancedCollection extends Collection {
  image: string;
  isActive: boolean;
  floorPrice: number;
  volume24h: number;
  royalty: number;
  tags: string[];
}