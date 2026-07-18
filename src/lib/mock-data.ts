// Mock data for development and testing

export const mockUsers = [
  {
    id: '1',
    walletAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    email: 'demo@example.com',
    name: 'Demo User',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

export const mockCollections = [
  {
    id: '1',
    userId: '1',
    name: 'Demo NFT Collection',
    description: 'A sample collection for testing purposes',
    symbol: 'DEMO',
    imageUrl: 'https://via.placeholder.com/400x400/6366f1/ffffff?text=Demo+Collection',
    merkleTreeAddress: '8xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    maxDepth: 14,
    maxBufferSize: 64,
    canopyDepth: 0,
    maxNfts: 1000,
    mintedCount: 0,
    status: 'DRAFT' as const,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    userId: '1',
    name: 'Art Collection',
    description: 'Digital art pieces collection',
    symbol: 'ART',
    imageUrl: 'https://via.placeholder.com/400x400/f59e0b/ffffff?text=Art+Collection',
    merkleTreeAddress: '9xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    maxDepth: 14,
    maxBufferSize: 64,
    canopyDepth: 0,
    maxNfts: 150,
    mintedCount: 75,
    status: 'MINTING' as const,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02')
  }
];

export const mockNftMetadata = [
  {
    id: '1',
    collectionId: '1',
    name: 'Demo NFT #1',
    description: 'First demo NFT in the collection',
    image: 'https://via.placeholder.com/512x512/8b5cf6/ffffff?text=NFT+%231',
    externalUrl: 'https://example.com/nft/1',
    animationUrl: null,
    attributes: [
      { trait_type: 'Background', value: 'Blue' },
      { trait_type: 'Rarity', value: 'Common' }
    ],
    metadataUri: 'https://ipfs.io/ipfs/QmExample1',
    isMinted: false,
    mintAddress: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    collectionId: '1',
    name: 'Demo NFT #2',
    description: 'Second demo NFT in the collection',
    image: 'https://via.placeholder.com/512x512/10b981/ffffff?text=NFT+%232',
    externalUrl: 'https://example.com/nft/2',
    animationUrl: null,
    attributes: [
      { trait_type: 'Background', value: 'Green' },
      { trait_type: 'Rarity', value: 'Rare' }
    ],
    metadataUri: 'https://ipfs.io/ipfs/QmExample2',
    isMinted: true,
    mintAddress: 'AaKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

import { MintJob } from '../types/nft';

export const mockMintJobs: MintJob[] = [
  {
    id: '1',
    userId: '1',
    collectionId: '1',
    status: 'PROCESSING',
    progress: 45,
    totalNfts: 100,
    mintedCount: 45,
    failedCount: 0,
    transactionSignatures: [
      '5xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU1',
      '5xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU2'
    ],
    estimatedCost: 0.05,
    actualCost: 0.023,
    errorMessage: undefined,
    startedAt: new Date('2024-01-01T10:00:00Z'),
    completedAt: undefined,
    createdAt: new Date('2024-01-01T09:00:00Z'),
    updatedAt: new Date('2024-01-01T10:30:00Z')
  },
  {
    id: '2',
    userId: '1',
    collectionId: '2',
    status: 'COMPLETED',
    progress: 100,
    totalNfts: 50,
    mintedCount: 50,
    failedCount: 0,
    transactionSignatures: [
      '6xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU1',
      '6xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU2'
    ],
    estimatedCost: 0.025,
    actualCost: 0.025,
    errorMessage: undefined,
    startedAt: new Date('2024-01-01T08:00:00Z'),
    completedAt: new Date('2024-01-01T08:45:00Z'),
    createdAt: new Date('2024-01-01T07:00:00Z'),
    updatedAt: new Date('2024-01-01T08:45:00Z')
  }
];

// Mock transaction data
export const mockTransactions = [
  {
    signature: '5xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU1',
    slot: 123456789,
    blockTime: Date.now() / 1000 - 3600, // 1 hour ago
    confirmationStatus: 'confirmed' as const,
    err: null
  },
  {
    signature: '5xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU2',
    slot: 123456790,
    blockTime: Date.now() / 1000 - 1800, // 30 minutes ago
    confirmationStatus: 'confirmed' as const,
    err: null
  }
];

// Mock CSV data for testing uploads
export const mockCsvData = `name,description,image,external_url,attributes
"Cool NFT #1","A very cool NFT","https://via.placeholder.com/512x512/8b5cf6/ffffff?text=Cool+NFT+1","https://example.com/nft/1","[{\"trait_type\": \"Background\", \"value\": \"Blue\"}, {\"trait_type\": \"Rarity\", \"value\": \"Common\"}]"
"Cool NFT #2","Another cool NFT","https://via.placeholder.com/512x512/10b981/ffffff?text=Cool+NFT+2","https://example.com/nft/2","[{\"trait_type\": \"Background\", \"value\": \"Green\"}, {\"trait_type\": \"Rarity\", \"value\": \"Rare\"}]"
"Cool NFT #3","The coolest NFT","https://via.placeholder.com/512x512/f59e0b/ffffff?text=Cool+NFT+3","https://example.com/nft/3","[{\"trait_type\": \"Background\", \"value\": \"Gold\"}, {\"trait_type\": \"Rarity\", \"value\": \"Legendary\"}]"`;

// Helper function to simulate API delays
export const simulateDelay = (ms: number = 1000) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Mock error responses
export const mockErrors = {
  networkError: new Error('Network connection failed'),
  validationError: new Error('Invalid input data'),
  authError: new Error('Authentication required'),
  insufficientFunds: new Error('Insufficient SOL balance'),
  rpcError: new Error('Solana RPC endpoint unavailable')
};