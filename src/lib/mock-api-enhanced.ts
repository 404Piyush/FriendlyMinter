// Enhanced Mock API with realistic delays and error simulation
import { enhancedMockData } from './mock-enhanced';
import { EnhancedCollection, NFTMetadata, MintJob, User, Transaction } from '../types';

// Configuration
const MOCK_DELAY = parseInt(process.env.NEXT_PUBLIC_MOCK_DELAY || '1000');
const ERROR_SIMULATION_RATE = 0.1; // 10% chance of simulated errors

// Utility functions
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const simulateError = (operation: string) => {
  if (Math.random() < ERROR_SIMULATION_RATE) {
    throw new Error(`Simulated ${operation} error - please try again`);
  }
};

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Enhanced Mock API Class
export class MockAPIEnhanced {
  private static instance: MockAPIEnhanced;
  private data = { ...enhancedMockData };

  static getInstance(): MockAPIEnhanced {
    if (!MockAPIEnhanced.instance) {
      MockAPIEnhanced.instance = new MockAPIEnhanced();
    }
    return MockAPIEnhanced.instance;
  }

  // User Management
  async getUsers(): Promise<User[]> {
    await delay(MOCK_DELAY * 0.5);
    simulateError('fetch users');
    return [...this.data.users];
  }

  async getUserById(id: string): Promise<User | null> {
    await delay(MOCK_DELAY * 0.3);
    simulateError('fetch user');
    return this.data.users.find(user => user.id === id) || null;
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    await delay(MOCK_DELAY);
    simulateError('create user');
    
    const newUser: User = {
      ...userData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      totalCollections: 0,
      totalNftsMinted: 0,
      totalSpent: 0
    };
    
    this.data.users.push(newUser);
    return newUser;
  }

  // Collection Management
  async getCollections(userId?: string): Promise<EnhancedCollection[]> {
    await delay(MOCK_DELAY * 0.7);
    simulateError('fetch collections');
    
    if (userId) {
      return this.data.collections.filter(collection => collection.userId === userId);
    }
    return [...this.data.collections];
  }

  async getCollectionById(id: string): Promise<EnhancedCollection | null> {
    await delay(MOCK_DELAY * 0.4);
    simulateError('fetch collection');
    return this.data.collections.find(collection => collection.id === id) || null;
  }

  async createCollection(collectionData: Omit<EnhancedCollection, 'id' | 'createdAt' | 'updatedAt' | 'mintedCount' | 'floorPrice' | 'volume24h'>): Promise<EnhancedCollection> {
    await delay(MOCK_DELAY * 1.5);
    simulateError('create collection');
    
    const newCollection: EnhancedCollection = {
      ...collectionData,
      id: generateId(),
      mintedCount: 0,
      floorPrice: 0,
      volume24h: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.data.collections.push(newCollection);
    return newCollection;
  }

  async updateCollection(id: string, updates: Partial<EnhancedCollection>): Promise<EnhancedCollection> {
    await delay(MOCK_DELAY);
    simulateError('update collection');
    
    const collectionIndex = this.data.collections.findIndex(c => c.id === id);
    if (collectionIndex === -1) {
      throw new Error('Collection not found');
    }
    
    this.data.collections[collectionIndex] = {
      ...this.data.collections[collectionIndex],
      ...updates,
      updatedAt: new Date()
    };
    
    return this.data.collections[collectionIndex];
  }

  // NFT Metadata Management
  async getNftMetadata(collectionId?: string): Promise<NFTMetadata[]> {
    await delay(MOCK_DELAY * 0.6);
    simulateError('fetch NFT metadata');
    
    if (collectionId) {
      return this.data.nftMetadata.filter(nft => nft.collectionId === collectionId);
    }
    return [...this.data.nftMetadata];
  }

  async createNftMetadata(nftData: Omit<NFTMetadata, 'tokenId'>): Promise<NFTMetadata> {
    await delay(MOCK_DELAY * 0.8);
    simulateError('create NFT metadata');
    
    const existingNfts = this.data.nftMetadata.filter(nft => nft.collectionId === nftData.collectionId);
    const nextTokenId = Math.max(0, ...existingNfts.map(nft => nft.tokenId || 0)) + 1;
    
    const newNft: NFTMetadata = {
      ...nftData,
      tokenId: nextTokenId
    };
    
    this.data.nftMetadata.push(newNft);
    return newNft;
  }

  async bulkCreateNftMetadata(nftDataArray: Omit<NFTMetadata, 'tokenId'>[]): Promise<NFTMetadata[]> {
    await delay(MOCK_DELAY * 2);
    simulateError('bulk create NFT metadata');
    
    const results: NFTMetadata[] = [];
    
    for (const nftData of nftDataArray) {
      const existingNfts = this.data.nftMetadata.filter(nft => nft.collectionId === nftData.collectionId);
      const nextTokenId = Math.max(0, ...existingNfts.map(nft => nft.tokenId || 0)) + 1;
      
      const newNft: NFTMetadata = {
        ...nftData,
        tokenId: nextTokenId
      };
      
      this.data.nftMetadata.push(newNft);
      results.push(newNft);
    }
    
    return results;
  }

  // Mint Job Management
  async getMintJobs(userId?: string): Promise<MintJob[]> {
    await delay(MOCK_DELAY * 0.5);
    simulateError('fetch mint jobs');
    
    if (userId) {
      return this.data.mintJobs.filter(job => job.userId === userId);
    }
    return [...this.data.mintJobs];
  }

  async getMintJobById(id: string): Promise<MintJob | null> {
    await delay(MOCK_DELAY * 0.3);
    simulateError('fetch mint job');
    return this.data.mintJobs.find(job => job.id === id) || null;
  }

  async createMintJob(jobData: Omit<MintJob, 'id' | 'createdAt' | 'updatedAt' | 'progress' | 'mintedCount' | 'failedCount' | 'actualCost' | 'transactionSignatures'>): Promise<MintJob> {
    await delay(MOCK_DELAY * 1.2);
    simulateError('create mint job');
    
    const newJob: MintJob = {
      ...jobData,
      id: generateId(),
      progress: 0,
      mintedCount: 0,
      failedCount: 0,
      actualCost: 0,
      transactionSignatures: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.data.mintJobs.push(newJob);
    return newJob;
  }

  async startMintJob(id: string): Promise<MintJob> {
    await delay(MOCK_DELAY);
    simulateError('start mint job');
    
    const jobIndex = this.data.mintJobs.findIndex(job => job.id === id);
    if (jobIndex === -1) {
      throw new Error('Mint job not found');
    }
    
    this.data.mintJobs[jobIndex] = {
      ...this.data.mintJobs[jobIndex],
      status: 'PROCESSING',
      startedAt: new Date(),
      updatedAt: new Date()
    };
    
    // Simulate progressive minting
    this.simulateMintingProgress(id);
    
    return this.data.mintJobs[jobIndex];
  }

  async pauseMintJob(id: string): Promise<MintJob> {
    await delay(MOCK_DELAY * 0.5);
    simulateError('pause mint job');
    
    const jobIndex = this.data.mintJobs.findIndex(job => job.id === id);
    if (jobIndex === -1) {
      throw new Error('Mint job not found');
    }
    
    this.data.mintJobs[jobIndex] = {
      ...this.data.mintJobs[jobIndex],
      status: 'PENDING',
      updatedAt: new Date()
    };
    
    return this.data.mintJobs[jobIndex];
  }

  async resumeMintJob(id: string): Promise<MintJob> {
    await delay(MOCK_DELAY * 0.5);
    simulateError('resume mint job');
    
    const jobIndex = this.data.mintJobs.findIndex(job => job.id === id);
    if (jobIndex === -1) {
      throw new Error('Mint job not found');
    }
    
    this.data.mintJobs[jobIndex] = {
      ...this.data.mintJobs[jobIndex],
      status: 'PROCESSING',
      updatedAt: new Date()
    };
    
    // Continue simulating minting progress
    this.simulateMintingProgress(id);
    
    return this.data.mintJobs[jobIndex];
  }

  // Transaction Management
  async getTransactions(mintJobId?: string): Promise<Transaction[]> {
    await delay(MOCK_DELAY * 0.4);
    simulateError('fetch transactions');
    
    if (mintJobId) {
      return this.data.transactions.filter(tx => tx.mintJobId === mintJobId);
    }
    return [...this.data.transactions];
  }

  // Analytics
  async getAnalytics(): Promise<typeof enhancedMockData.analytics> {
    await delay(MOCK_DELAY * 0.8);
    simulateError('fetch analytics');
    return { ...this.data.analytics };
  }

  // Notifications
  async getNotifications(userId: string): Promise<typeof enhancedMockData.notifications> {
    await delay(MOCK_DELAY * 0.3);
    simulateError('fetch notifications');
    return [...this.data.notifications];
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await delay(MOCK_DELAY * 0.2);
    simulateError('mark notification as read');
    
    const notification = this.data.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  // Private helper methods
  private async simulateMintingProgress(jobId: string): Promise<void> {
    const job = this.data.mintJobs.find(j => j.id === jobId);
    if (!job || job.status !== 'PROCESSING') return;
    
    const progressInterval = setInterval(() => {
      const currentJob = this.data.mintJobs.find(j => j.id === jobId);
      if (!currentJob || currentJob.status !== 'PROCESSING') {
        clearInterval(progressInterval);
        return;
      }
      
      // Simulate random progress increments
      const increment = Math.floor(Math.random() * 10) + 1;
      const newMintedCount = Math.min(currentJob.mintedCount + increment, currentJob.totalNfts);
      const newProgress = Math.floor((newMintedCount / currentJob.totalNfts) * 100);
      
      // Update job progress
      const jobIndex = this.data.mintJobs.findIndex(j => j.id === jobId);
      this.data.mintJobs[jobIndex] = {
        ...currentJob,
        progress: newProgress,
        mintedCount: newMintedCount,
        actualCost: (newMintedCount / currentJob.totalNfts) * currentJob.estimatedCost,
        updatedAt: new Date()
      };
      
      // Complete the job if all NFTs are minted
      if (newMintedCount >= currentJob.totalNfts) {
        this.data.mintJobs[jobIndex] = {
          ...this.data.mintJobs[jobIndex],
          status: 'COMPLETED',
          progress: 100,
          completedAt: new Date()
        };
        clearInterval(progressInterval);
      }
    }, 2000); // Update every 2 seconds
  }

  // Utility methods for testing
  resetData(): void {
    this.data = { ...enhancedMockData };
  }

  addTestData(type: keyof typeof enhancedMockData, data: unknown): void {
    (this.data[type] as unknown[]).push(data);
  }

  clearTestData(type: keyof typeof enhancedMockData): void {
    (this.data[type] as unknown[]).length = 0;
  }
}

// Export singleton instance
export const mockAPI = MockAPIEnhanced.getInstance();
export default mockAPI;