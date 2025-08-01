// Enhanced mock data for comprehensive frontend testing
import { EnhancedCollection, NFTMetadata, MintJob, User, Transaction, Notification } from '../types';

// Mock users with different roles and states
export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'creator@example.com',
    name: 'NFT Creator',
    walletAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    role: 'creator',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    isActive: true,
    totalCollections: 5,
    totalNftsMinted: 1250,
    totalSpent: 45.67
  },
  {
    id: 'user-2',
    email: 'artist@example.com',
    name: 'Digital Artist',
    walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
    role: 'creator',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-10'),
    isActive: true,
    totalCollections: 2,
    totalNftsMinted: 500,
    totalSpent: 18.23
  }
];

// Enhanced mock collections with various states
export const mockCollectionsEnhanced: EnhancedCollection[] = [
  {
    id: 'collection-1',
    name: 'Pixel Warriors',
    description: 'A collection of 8-bit style warrior NFTs with unique abilities and rare traits.',
    symbol: 'PIXWAR',
    imageUrl: 'https://picsum.photos/400/400?random=1',
    image: 'https://picsum.photos/400/400?random=1',
    maxNfts: 1000,
    mintedCount: 750,
    status: 'MINTING' as const,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    userId: 'user-1',
    maxDepth: 14,
    maxBufferSize: 64,
    canopyDepth: 10,
    floorPrice: 0.5,
    volume24h: 12.5,
    isActive: true,
    royalty: 5.0,
    tags: ['pixel-art', 'gaming', 'warriors', 'collectible']
  },
  {
    id: 'collection-2',
    name: 'Cosmic Cats',
    description: 'Adorable space cats exploring the galaxy. Each cat has unique cosmic powers.',
    symbol: 'COSCAT',
    imageUrl: 'https://picsum.photos/400/400?random=2',
    image: 'https://picsum.photos/400/400?random=2',
    maxNfts: 500,
    mintedCount: 200,
    status: 'MINTING' as const,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-05'),
    userId: 'user-1',
    maxDepth: 14,
    maxBufferSize: 64,
    canopyDepth: 10,
    floorPrice: 0.8,
    volume24h: 8.2,
    isActive: true,
    royalty: 7.5,
    tags: ['cats', 'space', 'cute', 'cosmic']
  },
  {
    id: 'collection-3',
    name: 'Abstract Emotions',
    description: 'AI-generated abstract art representing human emotions in vibrant colors.',
    symbol: 'ABEMO',
    imageUrl: 'https://picsum.photos/400/400?random=3',
    image: 'https://picsum.photos/400/400?random=3',
    maxNfts: 2000,
    mintedCount: 0,
    status: 'DRAFT' as const,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-10'),
    userId: 'user-2',
    maxDepth: 14,
    maxBufferSize: 64,
    canopyDepth: 10,
    floorPrice: 0,
    volume24h: 0,
    isActive: false,
    royalty: 10.0,
    tags: ['abstract', 'emotions', 'ai-generated', 'colorful']
  }
];

// Enhanced mock NFT metadata with rich attributes
export const mockNftMetadataEnhanced: NFTMetadata[] = [
  {
    name: 'Warrior #001',
    description: 'A legendary pixel warrior with maximum strength and rare golden armor.',
    image: 'https://picsum.photos/300/300?random=101',
    attributes: {
      'Strength': 95,
      'Agility': 78,
      'Intelligence': 82,
      'Armor': 'Golden',
      'Weapon': 'Legendary Sword',
      'Rarity': 'Legendary',
      'Background': 'Volcanic',
      'Eyes': 'Glowing Red',
      'Helmet': 'Dragon Scale'
    },
    collectionId: 'collection-1',
    tokenId: 1,
    rarity: 'Legendary',
    rarityScore: 95.5
  },
  {
    name: 'Cosmic Cat #042',
    description: 'A mystical space cat with telepathic abilities and stardust fur.',
    image: 'https://picsum.photos/300/300?random=102',
    attributes: {
      'Cosmic Power': 88,
      'Cuteness': 100,
      'Fur Color': 'Stardust Silver',
      'Eyes': 'Galaxy Purple',
      'Accessory': 'Nebula Collar',
      'Special Ability': 'Telepathy',
      'Home Planet': 'Andromeda',
      'Rarity': 'Epic'
    },
    collectionId: 'collection-2',
    tokenId: 42,
    rarity: 'Epic',
    rarityScore: 78.3
  },
  {
    name: 'Joy #001',
    description: 'An explosion of yellow and orange representing pure happiness.',
    image: 'https://picsum.photos/300/300?random=103',
    attributes: {
      'Emotion': 'Joy',
      'Intensity': 92,
      'Primary Color': 'Sunshine Yellow',
      'Secondary Color': 'Warm Orange',
      'Pattern': 'Radiating Burst',
      'Mood Score': 98,
      'AI Model': 'EmotionGAN v2.1',
      'Rarity': 'Rare'
    },
    collectionId: 'collection-3',
    tokenId: 1,
    rarity: 'Rare',
    rarityScore: 65.7
  }
];

// Enhanced mock mint jobs with detailed progress tracking
export const mockMintJobsEnhanced: MintJob[] = [
  {
    id: 'job-1',
    userId: 'user-1',
    collectionId: 'collection-1',
    status: 'COMPLETED',
    progress: 100,
    totalNfts: 100,
    mintedCount: 100,
    failedCount: 0,
    errorMessage: undefined,
    estimatedCost: 2.5,
    actualCost: 2.47,
    transactionSignatures: [
      '5VfYmGBjvxKjKjFxrNrYReJMercv6BcXkCXwm9UjXAGPEkxvYjLm1BzAhzK2mNvFxRtGhBcXkCXwm9UjXAGPEkxv',
      '3NfYmGBjvxKjKjFxrNrYReJMercv6BcXkCXwm9UjXAGPEkxvYjLm1BzAhzK2mNvFxRtGhBcXkCXwm9UjXAGPEkxv'
    ],
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:45:00Z'),
    startedAt: new Date('2024-01-15T10:05:00Z'),
    completedAt: new Date('2024-01-15T10:45:00Z')
  },
  {
    id: 'job-2',
    userId: 'user-1',
    collectionId: 'collection-2',
    status: 'PROCESSING',
    progress: 65,
    totalNfts: 200,
    mintedCount: 130,
    failedCount: 0,
    errorMessage: undefined,
    estimatedCost: 5.2,
    actualCost: 3.38,
    transactionSignatures: [
      '7VfYmGBjvxKjKjFxrNrYReJMercv6BcXkCXwm9UjXAGPEkxvYjLm1BzAhzK2mNvFxRtGhBcXkCXwm9UjXAGPEkxv'
    ],
    createdAt: new Date('2024-02-01T14:30:00Z'),
    updatedAt: new Date('2024-02-01T15:15:00Z'),
    startedAt: new Date('2024-02-01T14:35:00Z'),
    completedAt: undefined
  },
  {
    id: 'job-3',
    userId: 'user-2',
    collectionId: 'collection-3',
    status: 'PENDING',
    progress: 0,
    totalNfts: 50,
    mintedCount: 0,
    failedCount: 0,
    errorMessage: undefined,
    estimatedCost: 1.3,
    actualCost: 0,
    transactionSignatures: [],
    createdAt: new Date('2024-02-10T09:00:00Z'),
    updatedAt: new Date('2024-02-10T09:00:00Z'),
    startedAt: undefined,
    completedAt: undefined
  },
  {
    id: 'job-4',
    userId: 'user-1',
    collectionId: 'collection-1',
    status: 'FAILED',
    progress: 25,
    totalNfts: 150,
    mintedCount: 37,
    failedCount: 113,
    errorMessage: 'Insufficient SOL balance for transaction fees',
    estimatedCost: 3.9,
    actualCost: 0.96,
    transactionSignatures: [
      '9VfYmGBjvxKjKjFxrNrYReJMercv6BcXkCXwm9UjXAGPEkxvYjLm1BzAhzK2mNvFxRtGhBcXkCXwm9UjXAGPEkxv'
    ],
    createdAt: new Date('2024-01-20T16:00:00Z'),
    updatedAt: new Date('2024-01-20T16:30:00Z'),
    startedAt: new Date('2024-01-20T16:05:00Z'),
    completedAt: undefined
  }
];

// Enhanced mock transactions
export const mockTransactionsEnhanced: Transaction[] = [
  {
    id: 'tx-1',
    signature: '5VfYmGBjvxKjKjFxrNrYReJMercv6BcXkCXwm9UjXAGPEkxvYjLm1BzAhzK2mNvFxRtGhBcXkCXwm9UjXAGPEkxv',
    type: 'MINT',
    status: 'CONFIRMED',
    amount: 2.47,
    fee: 0.000005,
    fromAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    toAddress: 'mint_authority_address',
    mintJobId: 'job-1',
    blockTime: new Date('2024-01-15T10:45:00Z'),
    confirmations: 32,
    slot: 245678901
  },
  {
    id: 'tx-2',
    signature: '7VfYmGBjvxKjKjFxrNrYReJMercv6BcXkCXwm9UjXAGPEkxvYjLm1BzAhzK2mNvFxRtGhBcXkCXwm9UjXAGPEkxv',
    type: 'MINT',
    status: 'PROCESSING',
    amount: 3.38,
    fee: 0.000005,
    fromAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    toAddress: 'mint_authority_address',
    mintJobId: 'job-2',
    blockTime: new Date('2024-02-01T15:15:00Z'),
    confirmations: 15,
    slot: 245789012
  }
];

// Mock analytics data
export const mockAnalytics = {
  totalUsers: 1247,
  totalCollections: 89,
  totalNftsMinted: 45623,
  totalVolume: 1234.56,
  averageMintCost: 0.025,
  successRate: 94.7,
  dailyStats: [
    { date: '2024-02-01', mints: 234, volume: 12.5, users: 45 },
    { date: '2024-02-02', mints: 189, volume: 9.8, users: 38 },
    { date: '2024-02-03', mints: 267, volume: 15.2, users: 52 },
    { date: '2024-02-04', mints: 198, volume: 11.1, users: 41 },
    { date: '2024-02-05', mints: 223, volume: 13.7, users: 47 },
    { date: '2024-02-06', mints: 245, volume: 14.9, users: 49 },
    { date: '2024-02-07', mints: 278, volume: 16.8, users: 56 }
  ],
  topCollections: [
    { name: 'Pixel Warriors', volume: 234.5, change: '+12.5%' },
    { name: 'Cosmic Cats', volume: 189.2, change: '+8.7%' },
    { name: 'Digital Dreams', volume: 156.8, change: '-2.1%' },
    { name: 'Neon Nights', volume: 134.9, change: '+15.3%' },
    { name: 'Retro Robots', volume: 98.7, change: '+5.9%' }
  ]
};

// Mock notification data
export const mockNotifications: Array<{
  id: string;
  type: 'success' | 'info' | 'error' | 'warning';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}> = [
  {
    id: 'notif-1',
    type: 'success',
    title: 'Minting Completed',
    message: 'Your collection "Pixel Warriors" has been successfully minted (100/100 NFTs)',
    timestamp: new Date('2024-01-15T10:45:00Z'),
    read: false,
    actionUrl: '/collections/collection-1'
  },
  {
    id: 'notif-2',
    type: 'info',
    title: 'Minting in Progress',
    message: 'Your collection "Cosmic Cats" is currently being minted (130/200 NFTs)',
    timestamp: new Date('2024-02-01T15:15:00Z'),
    read: false,
    actionUrl: '/jobs/job-2'
  },
  {
    id: 'notif-3',
    type: 'error',
    title: 'Minting Failed',
    message: 'Minting failed due to insufficient SOL balance. Please add funds and retry.',
    timestamp: new Date('2024-01-20T16:30:00Z'),
    read: true,
    actionUrl: '/jobs/job-4'
  },
  {
    id: 'notif-4',
    type: 'warning',
    title: 'Low Balance Warning',
    message: 'Your wallet balance is low. Consider adding more SOL for future minting.',
    timestamp: new Date('2024-02-10T08:30:00Z'),
    read: true
  }
];

// Export all enhanced mock data
export const enhancedMockData = {
  users: mockUsers,
  collections: mockCollectionsEnhanced,
  nftMetadata: mockNftMetadataEnhanced,
  mintJobs: mockMintJobsEnhanced,
  transactions: mockTransactionsEnhanced,
  analytics: mockAnalytics,
  notifications: mockNotifications
};

export default enhancedMockData;