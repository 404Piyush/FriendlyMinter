// Mock API utilities for development
import { 
  mockUsers, 
  mockCollections, 
  mockNftMetadata, 
  mockMintJobs, 
  mockTransactions,
  simulateDelay,
  mockErrors
} from './mock-data';

// Environment check
const USE_MOCK_API = process.env.USE_MOCK_API === 'true';
const MOCK_DELAY = parseInt(process.env.MOCK_DELAY || '1000');

// Mock API responses
export class MockAPI {
  // User endpoints
  static async getUser(walletAddress: string) {
    if (!USE_MOCK_API) throw new Error('Mock API is disabled');
    
    await simulateDelay(MOCK_DELAY);
    const user = mockUsers.find(u => u.walletAddress === walletAddress);
    
    if (!user) {
      throw mockErrors.authError;
    }
    
    return { success: true, data: user };
  }

  static async createUser(userData: any) {
    if (!USE_MOCK_API) throw new Error('Mock API is disabled');
    
    await simulateDelay(MOCK_DELAY);
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    mockUsers.push(newUser);
    return { success: true, data: newUser };
  }

  // Collection endpoints
  static async getCollections(userId: string) {
    if (!USE_MOCK_API) throw new Error('Mock API is disabled');
    
    await simulateDelay(MOCK_DELAY);
    const collections = mockCollections.filter(c => c.userId === userId);
    
    return { 
      success: true, 
      data: collections,
      pagination: {
        total: collections.length,
        page: 1,
        limit: 10,
        totalPages: Math.ceil(collections.length / 10)
      }
    };
  }

  static async getCollection(id: string) {
    if (!USE_MOCK_API) throw new Error('Mock API is disabled');
    
    await simulateDelay(MOCK_DELAY);
    const collection = mockCollections.find(c => c.id === id);
    
    if (!collection) {
      throw new Error('Collection not found');
    }
    
    return { success: true, data: collection };
  }

  static async createCollection(collectionData: any) {
    if (!USE_MOCK_API) throw new Error('Mock API is disabled');
    
    await simulateDelay(MOCK_DELAY * 2); // Longer delay for creation
    
    // Simulate potential errors
    if (Math.random() < 0.1) { // 10% chance of error
      throw mockErrors.rpcError;
    }
    
    const newCollection = {
      id: Date.now().toString(),
      ...collectionData,
      merkleTree: `${Date.now()}xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU`,
      totalNfts: 0,
      mintedNfts: 0,
      status: 'ACTIVE' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    mockCollections.push(newCollection);
    return { success: true, data: newCollection };
  }

  static async updateCollection(id: string, updateData: any) {
    if (!USE_MOCK_API) throw new Error('Mock API is disabled');
    
    await simulateDelay(MOCK_DELAY);
    const collectionIndex = mockCollections.findIndex(c => c.id === id);
    
    if (collectionIndex === -1) {
      throw new Error('Collection not found');
    }
    
    mockCollections[collectionIndex] = {
      ...mockCollections[collectionIndex],
      ...updateData,
      updatedAt: new Date()
    };
    
    return { success: true, data: mockCollections[collectionIndex] };
  }

  // NFT Metadata endpoints
  static async getNftMetadata(collectionId: string) {
    if (!USE_MOCK_API) throw new Error('Mock API is disabled');
    
    await simulateDelay(MOCK_DELAY);
    const metadata = mockNftMetadata.filter(m => m.collectionId === collectionId);
    
    return { 
      success: true, 
      data: metadata,
      pagination: {
        total: metadata.length,
        page: 1,
        limit: 50,
        totalPages: Math.ceil(metadata.length / 50)
      }
    };
  }

  static async uploadMetadata(collectionId: string, csvData: any[]) {
    if (!USE_MOCK_API) throw new Error('Mock API is disabled');
    
    await simulateDelay(MOCK_DELAY * 3); // Longer delay for upload
    
    // Simulate validation errors
    if (Math.random() < 0.15) { // 15% chance of validation error
      throw mockErrors.validationError;
    }
    
    const newMetadata = csvData.map((item, index) => ({
      id: `${Date.now()}_${index}`,
      collectionId,
      ...item,
      metadataUri: `https://ipfs.io/ipfs/QmMock${Date.now()}${index}`,
      isMinted: false,
      mintAddress: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    mockNftMetadata.push(...newMetadata);
    
    return { 
      success: true, 
      data: {
        uploaded: newMetadata.length,
        metadata: newMetadata
      }
    };
  }

  // Mint Job endpoints
  static async getMintJobs(userId: string) {
    if (!USE_MOCK_API) throw new Error('Mock API is disabled');
    
    await simulateDelay(MOCK_DELAY);
    const jobs = mockMintJobs.filter(j => j.userId === userId);
    
    return { 
      success: true, 
      data: jobs,
      pagination: {
        total: jobs.length,
        page: 1,
        limit: 20,
        totalPages: Math.ceil(jobs.length / 20)
      }
    };
  }

  static async getMintJob(id: string) {
    if (!USE_MOCK_API) throw new Error('Mock API is disabled');
    
    await simulateDelay(MOCK_DELAY);
    const job = mockMintJobs.find(j => j.id === id);
    
    if (!job) {
      throw new Error('Mint job not found');
    }
    
    return { success: true, data: job };
  }

  static async createMintJob(jobData: any) {
    if (!USE_MOCK_API) throw new Error('Mock API is disabled');
    
    await simulateDelay(MOCK_DELAY);
    
    // Simulate insufficient funds error
    if (Math.random() < 0.2) { // 20% chance
      throw mockErrors.insufficientFunds;
    }
    
    const newJob = {
      id: Date.now().toString(),
      ...jobData,
      status: 'PENDING' as const,
      progress: 0,
      mintedCount: 0,
      failedCount: 0,
      transactionSignatures: [],
      actualCost: 0,
      errorMessage: undefined,
      startedAt: undefined,
        completedAt: undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    mockMintJobs.push(newJob);
    return { success: true, data: newJob };
  }

  static async pauseMintJob(id: string) {
    if (!USE_MOCK_API) throw new Error('Mock API is disabled');
    
    await simulateDelay(MOCK_DELAY);
    const jobIndex = mockMintJobs.findIndex(j => j.id === id);
    
    if (jobIndex === -1) {
      throw new Error('Mint job not found');
    }
    
    mockMintJobs[jobIndex].status = 'PENDING';
    mockMintJobs[jobIndex].updatedAt = new Date();
    
    return { success: true, data: mockMintJobs[jobIndex] };
  }

  static async resumeMintJob(id: string) {
    if (!USE_MOCK_API) throw new Error('Mock API is disabled');
    
    await simulateDelay(MOCK_DELAY);
    const jobIndex = mockMintJobs.findIndex(j => j.id === id);
    
    if (jobIndex === -1) {
      throw new Error('Mint job not found');
    }
    
    mockMintJobs[jobIndex].status = 'PROCESSING';
    mockMintJobs[jobIndex].updatedAt = new Date();
    
    return { success: true, data: mockMintJobs[jobIndex] };
  }

  // Solana blockchain simulation
  static async getWalletBalance(walletAddress: string) {
    if (!USE_MOCK_API) throw new Error('Mock API is disabled');
    
    await simulateDelay(MOCK_DELAY / 2);
    
    // Simulate network errors occasionally
    if (Math.random() < 0.05) { // 5% chance
      throw mockErrors.networkError;
    }
    
    return { 
      success: true, 
      data: {
        balance: Math.random() * 10, // Random balance between 0-10 SOL
        lamports: Math.floor(Math.random() * 10000000000)
      }
    };
  }

  static async getTransaction(signature: string) {
    if (!USE_MOCK_API) throw new Error('Mock API is disabled');
    
    await simulateDelay(MOCK_DELAY / 2);
    const transaction = mockTransactions.find(t => t.signature === signature);
    
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    
    return { success: true, data: transaction };
  }

  // IPFS simulation
  static async uploadToIPFS(file: File) {
    if (!USE_MOCK_API) throw new Error('Mock API is disabled');
    
    await simulateDelay(MOCK_DELAY * 2);
    
    // Simulate upload errors
    if (Math.random() < 0.1) { // 10% chance
      throw new Error('IPFS upload failed');
    }
    
    return {
      success: true,
      data: {
        hash: `QmMock${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
        url: `https://ipfs.io/ipfs/QmMock${Date.now()}`,
        size: file.size
      }
    };
  }
}

// Helper function to check if mock API should be used
export const shouldUseMockAPI = () => USE_MOCK_API;

// Export mock delay for components that need it
export const getMockDelay = () => MOCK_DELAY;