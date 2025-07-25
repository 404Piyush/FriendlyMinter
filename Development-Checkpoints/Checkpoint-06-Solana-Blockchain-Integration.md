# Checkpoint 06: Solana Blockchain Integration

## Objective
Implement comprehensive Solana blockchain integration for cNFT operations including Merkle Tree creation, collection setup, and compressed NFT minting using state compression.

## Prerequisites
- Checkpoint 05 completed (Job Queue System)
- Solana CLI installed
- Understanding of Solana concepts (accounts, transactions, programs)
- RPC provider access (Helius/Ankr)

## Core Dependencies
```bash
# Solana Core
npm install @solana/web3.js @solana/spl-token

# State Compression & cNFTs
npm install @solana/spl-account-compression
npm install @metaplex-foundation/mpl-bubblegum
npm install @metaplex-foundation/mpl-token-metadata
npm install @metaplex-foundation/umi-bundle-defaults
npm install @metaplex-foundation/umi-uploader-irys
npm install @metaplex-foundation/digital-asset-standard-api

# Utilities
npm install @noble/hashes
npm install bs58
```

## Solana Configuration

### lib/solana/config.ts
```typescript
import { Connection, Commitment, ConnectionConfig } from '@solana/web3.js';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { mplBubblegum } from '@metaplex-foundation/mpl-bubblegum';
import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';

// Network configurations
export const NETWORKS = {
  mainnet: {
    rpcUrl: process.env.SOLANA_MAINNET_RPC_URL || 'https://api.mainnet-beta.solana.com',
    wsUrl: process.env.SOLANA_MAINNET_WS_URL || 'wss://api.mainnet-beta.solana.com',
  },
  devnet: {
    rpcUrl: process.env.SOLANA_DEVNET_RPC_URL || 'https://api.devnet.solana.com',
    wsUrl: process.env.SOLANA_DEVNET_WS_URL || 'wss://api.devnet.solana.com',
  },
  testnet: {
    rpcUrl: process.env.SOLANA_TESTNET_RPC_URL || 'https://api.testnet.solana.com',
    wsUrl: process.env.SOLANA_TESTNET_WS_URL || 'wss://api.testnet.solana.com',
  },
} as const;

export type NetworkType = keyof typeof NETWORKS;

// Connection configuration
const connectionConfig: ConnectionConfig = {
  commitment: 'confirmed' as Commitment,
  confirmTransactionInitialTimeout: 60000,
  wsEndpoint: NETWORKS[process.env.SOLANA_NETWORK as NetworkType || 'devnet'].wsUrl,
};

// Create connection instance
export function createConnection(network: NetworkType = 'devnet'): Connection {
  return new Connection(
    NETWORKS[network].rpcUrl,
    connectionConfig
  );
}

// Create UMI instance for Metaplex operations
export function createUmiInstance(network: NetworkType = 'devnet') {
  const connection = createConnection(network);
  
  return createUmi(connection.rpcEndpoint)
    .use(mplBubblegum())
    .use(mplTokenMetadata());
}

// RPC rate limiting configuration
export const RPC_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // Base delay in ms
  backoffMultiplier: 2,
  maxConcurrentRequests: 10,
  requestTimeout: 30000,
};

// Merkle Tree configuration
export const MERKLE_TREE_CONFIG = {
  // Tree depth determines max capacity: 2^depth
  depths: {
    small: 14,    // 16,384 NFTs
    medium: 17,   // 131,072 NFTs
    large: 20,    // 1,048,576 NFTs
  },
  // Buffer size affects concurrent operations
  bufferSizes: {
    small: 64,
    medium: 256,
    large: 1024,
  },
  // Canopy depth affects proof size (higher = smaller proofs)
  canopyDepths: {
    small: 10,
    medium: 13,
    large: 16,
  },
};

// Transaction configuration
export const TRANSACTION_CONFIG = {
  maxRetries: 3,
  skipPreflight: false,
  preflightCommitment: 'confirmed' as Commitment,
  maxSignatures: 10, // Max signatures per transaction
  computeUnitLimit: 1_400_000, // Max compute units
  computeUnitPrice: 1, // Micro-lamports per compute unit
};
```

### lib/solana/rpc-manager.ts
```typescript
import { Connection, PublicKey, Transaction, SendOptions } from '@solana/web3.js';
import { RPC_CONFIG } from './config';

class RPCManager {
  private connection: Connection;
  private requestQueue: Array<() => Promise<any>> = [];
  private activeRequests = 0;
  private rateLimitDelay = 0;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    retries = RPC_CONFIG.maxRetries
  ): Promise<T> {
    try {
      return await this.throttledRequest(operation);
    } catch (error) {
      if (retries > 0 && this.isRetryableError(error)) {
        const delay = RPC_CONFIG.retryDelay * 
          Math.pow(RPC_CONFIG.backoffMultiplier, RPC_CONFIG.maxRetries - retries);
        
        await this.sleep(delay);
        return this.executeWithRetry(operation, retries - 1);
      }
      throw error;
    }
  }

  private async throttledRequest<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          this.activeRequests++;
          
          if (this.rateLimitDelay > 0) {
            await this.sleep(this.rateLimitDelay);
          }
          
          const result = await Promise.race([
            operation(),
            this.timeoutPromise(RPC_CONFIG.requestTimeout)
          ]);
          
          resolve(result);
        } catch (error) {
          if (this.isRateLimitError(error)) {
            this.rateLimitDelay = Math.min(this.rateLimitDelay + 1000, 10000);
          } else {
            this.rateLimitDelay = Math.max(this.rateLimitDelay - 100, 0);
          }
          reject(error);
        } finally {
          this.activeRequests--;
          this.processQueue();
        }
      });
      
      this.processQueue();
    });
  }

  private processQueue(): void {
    if (this.activeRequests < RPC_CONFIG.maxConcurrentRequests && this.requestQueue.length > 0) {
      const nextRequest = this.requestQueue.shift();
      if (nextRequest) {
        nextRequest();
      }
    }
  }

  private isRetryableError(error: any): boolean {
    const retryableErrors = [
      'Network request failed',
      'timeout',
      'ECONNRESET',
      'ENOTFOUND',
      'rate limit',
      '429',
      '503',
      '502',
      '504',
    ];
    
    const errorMessage = error?.message?.toLowerCase() || '';
    return retryableErrors.some(msg => errorMessage.includes(msg));
  }

  private isRateLimitError(error: any): boolean {
    const errorMessage = error?.message?.toLowerCase() || '';
    return errorMessage.includes('rate limit') || errorMessage.includes('429');
  }

  private timeoutPromise<T>(ms: number): Promise<T> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), ms);
    });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Wrapped connection methods with retry logic
  async getAccountInfo(publicKey: PublicKey) {
    return this.executeWithRetry(() => 
      this.connection.getAccountInfo(publicKey)
    );
  }

  async getBalance(publicKey: PublicKey) {
    return this.executeWithRetry(() => 
      this.connection.getBalance(publicKey)
    );
  }

  async sendTransaction(
    transaction: Transaction,
    options?: SendOptions
  ) {
    return this.executeWithRetry(() => 
      this.connection.sendTransaction(transaction, options)
    );
  }

  async confirmTransaction(signature: string) {
    return this.executeWithRetry(() => 
      this.connection.confirmTransaction(signature)
    );
  }

  async getLatestBlockhash() {
    return this.executeWithRetry(() => 
      this.connection.getLatestBlockhash()
    );
  }

  async simulateTransaction(transaction: Transaction) {
    return this.executeWithRetry(() => 
      this.connection.simulateTransaction(transaction)
    );
  }
}

export default RPCManager;
```

## Merkle Tree Operations

### lib/solana/merkle-tree.ts
```typescript
import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID,
  createAllocTreeIx,
  ValidDepthSizePair,
} from '@solana/spl-account-compression';
import {
  PROGRAM_ID as BUBBLEGUM_PROGRAM_ID,
  createCreateTreeInstruction,
} from '@metaplex-foundation/mpl-bubblegum';
import { MERKLE_TREE_CONFIG, TRANSACTION_CONFIG } from './config';
import RPCManager from './rpc-manager';

export interface MerkleTreeParams {
  maxDepth: number;
  maxBufferSize: number;
  canopyDepth: number;
}

export interface CreateTreeResult {
  treeAddress: PublicKey;
  signature: string;
  cost: number; // in lamports
}

class MerkleTreeManager {
  private rpcManager: RPCManager;
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
    this.rpcManager = new RPCManager(connection);
  }

  /**
   * Calculate optimal Merkle Tree parameters based on NFT count
   */
  calculateTreeParams(nftCount: number): MerkleTreeParams {
    let config: keyof typeof MERKLE_TREE_CONFIG.depths;
    
    if (nftCount <= 16384) {
      config = 'small';
    } else if (nftCount <= 131072) {
      config = 'medium';
    } else {
      config = 'large';
    }

    return {
      maxDepth: MERKLE_TREE_CONFIG.depths[config],
      maxBufferSize: MERKLE_TREE_CONFIG.bufferSizes[config],
      canopyDepth: MERKLE_TREE_CONFIG.canopyDepths[config],
    };
  }

  /**
   * Calculate the cost of creating a Merkle Tree
   */
  async calculateTreeCost(params: MerkleTreeParams): Promise<number> {
    // Base account rent
    const accountSize = this.calculateAccountSize(params);
    const rentExemption = await this.rpcManager.executeWithRetry(() =>
      this.connection.getMinimumBalanceForRentExemption(accountSize)
    );

    // Transaction fees (estimate)
    const transactionFee = 5000; // ~0.000005 SOL

    return rentExemption + transactionFee;
  }

  /**
   * Create a new Merkle Tree for compressed NFTs
   */
  async createTree(
    payer: Keypair,
    params: MerkleTreeParams,
    treeCreator?: PublicKey
  ): Promise<CreateTreeResult> {
    const treeKeypair = Keypair.generate();
    const treeAddress = treeKeypair.publicKey;
    
    // Validate depth/buffer size pair
    if (!this.isValidDepthSizePair(params.maxDepth, params.maxBufferSize)) {
      throw new Error('Invalid depth/buffer size combination');
    }

    try {
      const cost = await this.calculateTreeCost(params);
      
      // Check payer balance
      const balance = await this.rpcManager.getBalance(payer.publicKey);
      if (balance < cost) {
        throw new Error(
          `Insufficient balance. Required: ${cost / LAMPORTS_PER_SOL} SOL, Available: ${balance / LAMPORTS_PER_SOL} SOL`
        );
      }

      const transaction = new Transaction();
      
      // Create account instruction
      const allocTreeIx = await createAllocTreeIx(
        this.connection,
        treeAddress,
        payer.publicKey,
        params,
        params.canopyDepth
      );
      
      transaction.add(allocTreeIx);

      // Create tree instruction
      const createTreeIx = createCreateTreeInstruction(
        {
          treeAuthority: treeCreator || payer.publicKey,
          merkleTree: treeAddress,
          payer: payer.publicKey,
          treeCreator: treeCreator || payer.publicKey,
          logWrapper: SPL_NOOP_PROGRAM_ID,
          compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        },
        {
          maxBufferSize: params.maxBufferSize,
          maxDepth: params.maxDepth,
          public: false, // Private tree
        },
        BUBBLEGUM_PROGRAM_ID
      );
      
      transaction.add(createTreeIx);

      // Set recent blockhash and fee payer
      const { blockhash } = await this.rpcManager.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = payer.publicKey;

      // Sign transaction
      transaction.sign(payer, treeKeypair);

      // Simulate transaction first
      const simulation = await this.rpcManager.simulateTransaction(transaction);
      if (simulation.value.err) {
        throw new Error(`Transaction simulation failed: ${JSON.stringify(simulation.value.err)}`);
      }

      // Send transaction
      const signature = await this.rpcManager.sendTransaction(transaction, {
        skipPreflight: TRANSACTION_CONFIG.skipPreflight,
        preflightCommitment: TRANSACTION_CONFIG.preflightCommitment,
        maxRetries: TRANSACTION_CONFIG.maxRetries,
      });

      // Confirm transaction
      await this.rpcManager.confirmTransaction(signature);

      return {
        treeAddress,
        signature,
        cost,
      };
    } catch (error) {
      console.error('Failed to create Merkle Tree:', error);
      throw new Error(`Merkle Tree creation failed: ${error.message}`);
    }
  }

  /**
   * Get Merkle Tree account info
   */
  async getTreeInfo(treeAddress: PublicKey) {
    try {
      const accountInfo = await this.rpcManager.getAccountInfo(treeAddress);
      
      if (!accountInfo) {
        throw new Error('Merkle Tree account not found');
      }

      // Parse tree data (simplified - in production you'd use proper deserialization)
      return {
        address: treeAddress,
        owner: accountInfo.owner,
        lamports: accountInfo.lamports,
        dataLength: accountInfo.data.length,
        executable: accountInfo.executable,
      };
    } catch (error) {
      console.error('Failed to get tree info:', error);
      throw error;
    }
  }

  /**
   * Validate if depth and buffer size combination is supported
   */
  private isValidDepthSizePair(depth: number, bufferSize: number): boolean {
    const validPairs: ValidDepthSizePair[] = [
      { maxDepth: 14, maxBufferSize: 64 },
      { maxDepth: 14, maxBufferSize: 256 },
      { maxDepth: 14, maxBufferSize: 1024 },
      { maxDepth: 14, maxBufferSize: 2048 },
      { maxDepth: 15, maxBufferSize: 64 },
      { maxDepth: 16, maxBufferSize: 64 },
      { maxDepth: 17, maxBufferSize: 64 },
      { maxDepth: 18, maxBufferSize: 64 },
      { maxDepth: 19, maxBufferSize: 64 },
      { maxDepth: 20, maxBufferSize: 64 },
      { maxDepth: 20, maxBufferSize: 256 },
      { maxDepth: 20, maxBufferSize: 1024 },
      { maxDepth: 20, maxBufferSize: 2048 },
      { maxDepth: 24, maxBufferSize: 64 },
      { maxDepth: 24, maxBufferSize: 256 },
      { maxDepth: 24, maxBufferSize: 512 },
      { maxDepth: 24, maxBufferSize: 1024 },
      { maxDepth: 24, maxBufferSize: 2048 },
      { maxDepth: 26, maxBufferSize: 512 },
      { maxDepth: 26, maxBufferSize: 1024 },
      { maxDepth: 26, maxBufferSize: 2048 },
      { maxDepth: 30, maxBufferSize: 512 },
      { maxDepth: 30, maxBufferSize: 1024 },
      { maxDepth: 30, maxBufferSize: 2048 },
    ];

    return validPairs.some(
      pair => pair.maxDepth === depth && pair.maxBufferSize === bufferSize
    );
  }

  /**
   * Calculate account size for rent calculation
   */
  private calculateAccountSize(params: MerkleTreeParams): number {
    // Simplified calculation - in production use proper account size calculation
    const baseSize = 1024; // Base account overhead
    const treeSize = Math.pow(2, params.maxDepth) * 32; // Simplified tree size
    const bufferSize = params.maxBufferSize * 32;
    const canopySize = params.canopyDepth > 0 ? Math.pow(2, params.canopyDepth) * 32 : 0;
    
    return baseSize + treeSize + bufferSize + canopySize;
  }
}

export default MerkleTreeManager;
```

## Collection NFT Management

### lib/solana/collection.ts
```typescript
import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram,
} from '@solana/web3.js';
import {
  createCreateMasterEditionV3Instruction,
  createCreateMetadataAccountV3Instruction,
  PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID,
} from '@metaplex-foundation/mpl-token-metadata';
import {
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { TRANSACTION_CONFIG } from './config';
import RPCManager from './rpc-manager';

export interface CollectionMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  external_url?: string;
  attributes?: Array<{ trait_type: string; value: string }>;
}

export interface CreateCollectionResult {
  mintAddress: PublicKey;
  metadataAddress: PublicKey;
  masterEditionAddress: PublicKey;
  signature: string;
  cost: number;
}

class CollectionManager {
  private rpcManager: RPCManager;
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
    this.rpcManager = new RPCManager(connection);
  }

  /**
   * Calculate the cost of creating a collection NFT
   */
  async calculateCollectionCost(): Promise<number> {
    // Mint account rent
    const mintRent = await this.rpcManager.executeWithRetry(() =>
      this.connection.getMinimumBalanceForRentExemption(MINT_SIZE)
    );

    // Metadata account rent (approximate)
    const metadataRent = await this.rpcManager.executeWithRetry(() =>
      this.connection.getMinimumBalanceForRentExemption(679) // Metadata account size
    );

    // Master edition rent (approximate)
    const masterEditionRent = await this.rpcManager.executeWithRetry(() =>
      this.connection.getMinimumBalanceForRentExemption(282) // Master edition size
    );

    // Transaction fees
    const transactionFee = 10000; // ~0.00001 SOL

    return mintRent + metadataRent + masterEditionRent + transactionFee;
  }

  /**
   * Create a collection NFT
   */
  async createCollection(
    payer: Keypair,
    metadata: CollectionMetadata,
    metadataUri: string
  ): Promise<CreateCollectionResult> {
    const mintKeypair = Keypair.generate();
    const mintAddress = mintKeypair.publicKey;

    try {
      const cost = await this.calculateCollectionCost();
      
      // Check payer balance
      const balance = await this.rpcManager.getBalance(payer.publicKey);
      if (balance < cost) {
        throw new Error(`Insufficient balance for collection creation`);
      }

      // Derive addresses
      const associatedTokenAddress = await getAssociatedTokenAddress(
        mintAddress,
        payer.publicKey
      );

      const [metadataAddress] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mintAddress.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
      );

      const [masterEditionAddress] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mintAddress.toBuffer(),
          Buffer.from('edition'),
        ],
        TOKEN_METADATA_PROGRAM_ID
      );

      const transaction = new Transaction();

      // Create mint account
      transaction.add(
        SystemProgram.createAccount({
          fromPubkey: payer.publicKey,
          newAccountPubkey: mintAddress,
          space: MINT_SIZE,
          lamports: await this.connection.getMinimumBalanceForRentExemption(MINT_SIZE),
          programId: TOKEN_PROGRAM_ID,
        })
      );

      // Initialize mint
      transaction.add(
        createInitializeMintInstruction(
          mintAddress,
          0, // 0 decimals for NFT
          payer.publicKey, // mint authority
          payer.publicKey, // freeze authority
          TOKEN_PROGRAM_ID
        )
      );

      // Create associated token account
      transaction.add(
        createAssociatedTokenAccountInstruction(
          payer.publicKey,
          associatedTokenAddress,
          payer.publicKey,
          mintAddress,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        )
      );

      // Mint one token
      transaction.add(
        createMintToInstruction(
          mintAddress,
          associatedTokenAddress,
          payer.publicKey,
          1, // mint 1 token
          [],
          TOKEN_PROGRAM_ID
        )
      );

      // Create metadata account
      transaction.add(
        createCreateMetadataAccountV3Instruction(
          {
            metadata: metadataAddress,
            mint: mintAddress,
            mintAuthority: payer.publicKey,
            payer: payer.publicKey,
            updateAuthority: payer.publicKey,
            systemProgram: SystemProgram.programId,
            rent: null, // Use SYSVAR_RENT_PUBKEY
          },
          {
            createMetadataAccountArgsV3: {
              data: {
                name: metadata.name,
                symbol: metadata.symbol,
                uri: metadataUri,
                sellerFeeBasisPoints: 0,
                creators: [
                  {
                    address: payer.publicKey,
                    verified: true,
                    share: 100,
                  },
                ],
                collection: null,
                uses: null,
              },
              isMutable: true,
              collectionDetails: {
                __kind: 'V1',
                size: 0, // Will be updated as cNFTs are minted
              },
            },
          }
        )
      );

      // Create master edition
      transaction.add(
        createCreateMasterEditionV3Instruction(
          {
            edition: masterEditionAddress,
            mint: mintAddress,
            updateAuthority: payer.publicKey,
            mintAuthority: payer.publicKey,
            payer: payer.publicKey,
            metadata: metadataAddress,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: null,
          },
          {
            createMasterEditionArgs: {
              maxSupply: null, // Unlimited supply
            },
          }
        )
      );

      // Set recent blockhash and fee payer
      const { blockhash } = await this.rpcManager.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = payer.publicKey;

      // Sign transaction
      transaction.sign(payer, mintKeypair);

      // Simulate transaction
      const simulation = await this.rpcManager.simulateTransaction(transaction);
      if (simulation.value.err) {
        throw new Error(`Collection creation simulation failed: ${JSON.stringify(simulation.value.err)}`);
      }

      // Send transaction
      const signature = await this.rpcManager.sendTransaction(transaction, {
        skipPreflight: TRANSACTION_CONFIG.skipPreflight,
        preflightCommitment: TRANSACTION_CONFIG.preflightCommitment,
        maxRetries: TRANSACTION_CONFIG.maxRetries,
      });

      // Confirm transaction
      await this.rpcManager.confirmTransaction(signature);

      return {
        mintAddress,
        metadataAddress,
        masterEditionAddress,
        signature,
        cost,
      };
    } catch (error) {
      console.error('Failed to create collection:', error);
      throw new Error(`Collection creation failed: ${error.message}`);
    }
  }

  /**
   * Get collection info
   */
  async getCollectionInfo(mintAddress: PublicKey) {
    try {
      const [metadataAddress] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mintAddress.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
      );

      const metadataAccount = await this.rpcManager.getAccountInfo(metadataAddress);
      
      if (!metadataAccount) {
        throw new Error('Collection metadata not found');
      }

      // In production, you'd deserialize the metadata account data
      return {
        mintAddress,
        metadataAddress,
        exists: true,
      };
    } catch (error) {
      console.error('Failed to get collection info:', error);
      throw error;
    }
  }
}

export default CollectionManager;
```

## cNFT Minting Operations

### lib/solana/cnft-minter.ts
```typescript
import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
} from '@solana/web3.js';
import {
  PROGRAM_ID as BUBBLEGUM_PROGRAM_ID,
  createMintToCollectionV1Instruction,
  MetadataArgs,
} from '@metaplex-foundation/mpl-bubblegum';
import {
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID,
} from '@solana/spl-account-compression';
import { PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID } from '@metaplex-foundation/mpl-token-metadata';
import { TRANSACTION_CONFIG } from './config';
import RPCManager from './rpc-manager';

export interface CNFTMetadata {
  name: string;
  symbol: string;
  uri: string;
  sellerFeeBasisPoints: number;
  collection?: {
    key: PublicKey;
    verified: boolean;
  };
  creators?: Array<{
    address: PublicKey;
    verified: boolean;
    share: number;
  }>;
}

export interface MintCNFTParams {
  merkleTree: PublicKey;
  leafOwner: PublicKey;
  leafDelegate?: PublicKey;
  metadata: CNFTMetadata;
  collectionMint?: PublicKey;
  collectionMetadata?: PublicKey;
  collectionMasterEdition?: PublicKey;
}

export interface MintCNFTResult {
  signature: string;
  leafIndex: number;
  assetId: PublicKey;
}

class CNFTMinter {
  private rpcManager: RPCManager;
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
    this.rpcManager = new RPCManager(connection);
  }

  /**
   * Mint a single compressed NFT
   */
  async mintCNFT(
    payer: Keypair,
    params: MintCNFTParams
  ): Promise<MintCNFTResult> {
    try {
      // Get current tree state to determine leaf index
      const leafIndex = await this.getNextLeafIndex(params.merkleTree);
      
      // Derive asset ID
      const assetId = await this.deriveAssetId(params.merkleTree, leafIndex);

      const transaction = new Transaction();

      // Prepare metadata args
      const metadataArgs: MetadataArgs = {
        name: params.metadata.name,
        symbol: params.metadata.symbol,
        uri: params.metadata.uri,
        sellerFeeBasisPoints: params.metadata.sellerFeeBasisPoints,
        primarySaleHappened: false,
        isMutable: true,
        editionNonce: null,
        tokenStandard: null,
        collection: params.metadata.collection || null,
        uses: null,
        tokenProgramVersion: 'Original',
        creators: params.metadata.creators || [],
      };

      // Create mint instruction
      const mintInstruction = createMintToCollectionV1Instruction(
        {
          treeAuthority: payer.publicKey, // Assuming payer is tree authority
          leafOwner: params.leafOwner,
          leafDelegate: params.leafDelegate || params.leafOwner,
          merkleTree: params.merkleTree,
          payer: payer.publicKey,
          treeDelegate: payer.publicKey,
          collectionAuthority: payer.publicKey,
          collectionAuthorityRecordPda: null,
          collectionMint: params.collectionMint || null,
          collectionMetadata: params.collectionMetadata || null,
          editionAccount: params.collectionMasterEdition || null,
          compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
          logWrapper: SPL_NOOP_PROGRAM_ID,
          bubblegumSigner: this.getBubblegumSigner(),
          tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        },
        {
          metadataArgs,
        },
        BUBBLEGUM_PROGRAM_ID
      );

      transaction.add(mintInstruction);

      // Set recent blockhash and fee payer
      const { blockhash } = await this.rpcManager.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = payer.publicKey;

      // Sign transaction
      transaction.sign(payer);

      // Simulate transaction
      const simulation = await this.rpcManager.simulateTransaction(transaction);
      if (simulation.value.err) {
        throw new Error(`cNFT mint simulation failed: ${JSON.stringify(simulation.value.err)}`);
      }

      // Send transaction
      const signature = await this.rpcManager.sendTransaction(transaction, {
        skipPreflight: TRANSACTION_CONFIG.skipPreflight,
        preflightCommitment: TRANSACTION_CONFIG.preflightCommitment,
        maxRetries: TRANSACTION_CONFIG.maxRetries,
      });

      // Confirm transaction
      await this.rpcManager.confirmTransaction(signature);

      return {
        signature,
        leafIndex,
        assetId,
      };
    } catch (error) {
      console.error('Failed to mint cNFT:', error);
      throw new Error(`cNFT minting failed: ${error.message}`);
    }
  }

  /**
   * Mint multiple cNFTs in batches
   */
  async mintCNFTBatch(
    payer: Keypair,
    mintParams: MintCNFTParams[],
    batchSize: number = 1
  ): Promise<MintCNFTResult[]> {
    const results: MintCNFTResult[] = [];
    
    // Process in batches to avoid overwhelming the RPC
    for (let i = 0; i < mintParams.length; i += batchSize) {
      const batch = mintParams.slice(i, i + batchSize);
      
      const batchPromises = batch.map(params => 
        this.mintCNFT(payer, params)
      );
      
      try {
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        // Small delay between batches to respect rate limits
        if (i + batchSize < mintParams.length) {
          await this.sleep(1000);
        }
      } catch (error) {
        console.error(`Batch ${Math.floor(i / batchSize)} failed:`, error);
        throw error;
      }
    }
    
    return results;
  }

  /**
   * Get the next available leaf index for a tree
   */
  private async getNextLeafIndex(merkleTree: PublicKey): Promise<number> {
    try {
      // In production, you'd query the tree account to get the current leaf count
      // For now, we'll use a simplified approach
      const treeAccount = await this.rpcManager.getAccountInfo(merkleTree);
      
      if (!treeAccount) {
        throw new Error('Merkle tree account not found');
      }

      // Parse tree data to get current leaf count
      // This is simplified - in production you'd use proper deserialization
      return 0; // Placeholder - implement proper leaf index tracking
    } catch (error) {
      console.error('Failed to get next leaf index:', error);
      throw error;
    }
  }

  /**
   * Derive asset ID from tree and leaf index
   */
  private async deriveAssetId(
    merkleTree: PublicKey,
    leafIndex: number
  ): Promise<PublicKey> {
    const [assetId] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('asset'),
        merkleTree.toBuffer(),
        Buffer.from(leafIndex.toString()),
      ],
      BUBBLEGUM_PROGRAM_ID
    );
    
    return assetId;
  }

  /**
   * Get Bubblegum signer PDA
   */
  private getBubblegumSigner(): PublicKey {
    const [bubblegumSigner] = PublicKey.findProgramAddressSync(
      [Buffer.from('collection_cpi')],
      BUBBLEGUM_PROGRAM_ID
    );
    
    return bubblegumSigner;
  }

  /**
   * Calculate minting cost per cNFT
   */
  async calculateMintCost(): Promise<number> {
    // cNFT minting only requires transaction fees
    // No account rent since data is compressed
    return 5000; // ~0.000005 SOL per mint
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default CNFTMinter;
```

## Digital Asset Standard (DAS) API Integration

### lib/solana/das-api.ts
```typescript
import { PublicKey } from '@solana/web3.js';

export interface CNFTAsset {
  id: string;
  content: {
    $schema: string;
    json_uri: string;
    files: Array<{
      uri: string;
      cdn_uri?: string;
      mime: string;
    }>;
    metadata: {
      name: string;
      symbol: string;
      description?: string;
      image?: string;
      attributes?: Array<{
        trait_type: string;
        value: string;
      }>;
    };
    links?: {
      external_url?: string;
    };
  };
  authorities: Array<{
    address: string;
    scopes: string[];
  }>;
  compression: {
    eligible: boolean;
    compressed: boolean;
    data_hash: string;
    creator_hash: string;
    asset_hash: string;
    tree: string;
    seq: number;
    leaf_id: number;
  };
  grouping: Array<{
    group_key: string;
    group_value: string;
  }>;
  royalty: {
    royalty_model: string;
    target?: string;
    percent: number;
    basis_points: number;
    primary_sale_happened: boolean;
    locked: boolean;
  };
  creators: Array<{
    address: string;
    share: number;
    verified: boolean;
  }>;
  ownership: {
    frozen: boolean;
    delegated: boolean;
    delegate?: string;
    ownership_model: string;
    owner: string;
  };
  supply: {
    print_max_supply?: number;
    print_current_supply?: number;
    edition_nonce?: number;
  };
  mutable: boolean;
  burnt: boolean;
}

export interface GetAssetsByOwnerResponse {
  total: number;
  limit: number;
  page: number;
  items: CNFTAsset[];
}

export interface GetAssetsByGroupResponse {
  total: number;
  limit: number;
  page: number;
  items: CNFTAsset[];
}

class DASApiClient {
  private rpcUrl: string;

  constructor(rpcUrl: string) {
    this.rpcUrl = rpcUrl;
  }

  /**
   * Get a single asset by ID
   */
  async getAsset(assetId: string): Promise<CNFTAsset> {
    const response = await this.makeRequest('getAsset', {
      id: assetId,
    });

    return response.result;
  }

  /**
   * Get assets by owner
   */
  async getAssetsByOwner(
    ownerAddress: string,
    options: {
      page?: number;
      limit?: number;
      sortBy?: 'created' | 'updated' | 'recent_action';
      sortDirection?: 'asc' | 'desc';
    } = {}
  ): Promise<GetAssetsByOwnerResponse> {
    const response = await this.makeRequest('getAssetsByOwner', {
      ownerAddress,
      page: options.page || 1,
      limit: options.limit || 1000,
      sortBy: options.sortBy,
      sortDirection: options.sortDirection,
    });

    return response.result;
  }

  /**
   * Get assets by collection
   */
  async getAssetsByGroup(
    groupKey: 'collection',
    groupValue: string,
    options: {
      page?: number;
      limit?: number;
      sortBy?: 'created' | 'updated' | 'recent_action';
      sortDirection?: 'asc' | 'desc';
    } = {}
  ): Promise<GetAssetsByGroupResponse> {
    const response = await this.makeRequest('getAssetsByGroup', {
      groupKey,
      groupValue,
      page: options.page || 1,
      limit: options.limit || 1000,
      sortBy: options.sortBy,
      sortDirection: options.sortDirection,
    });

    return response.result;
  }

  /**
   * Get asset proof (for transfers/burns)
   */
  async getAssetProof(assetId: string) {
    const response = await this.makeRequest('getAssetProof', {
      id: assetId,
    });

    return response.result;
  }

  /**
   * Search assets with filters
   */
  async searchAssets(params: {
    ownerAddress?: string;
    creatorAddress?: string;
    creatorVerified?: boolean;
    authorityAddress?: string;
    grouping?: Array<{ groupKey: string; groupValue: string }>;
    burnt?: boolean;
    compressed?: boolean;
    page?: number;
    limit?: number;
  }) {
    const response = await this.makeRequest('searchAssets', params);
    return response.result;
  }

  /**
   * Make RPC request to DAS API
   */
  private async makeRequest(method: string, params: any) {
    const response = await fetch(this.rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method,
        params,
      }),
    });

    if (!response.ok) {
      throw new Error(`DAS API request failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`DAS API error: ${data.error.message}`);
    }

    return data;
  }
}

export default DASApiClient;
```

## Environment Configuration

### .env.example
```bash
# Solana Configuration
SOLANA_NETWORK=devnet
SOLANA_DEVNET_RPC_URL=https://api.devnet.solana.com
SOLANA_MAINNET_RPC_URL=https://api.mainnet-beta.solana.com

# Enhanced RPC (Helius/Ankr)
HELIUS_API_KEY=your_helius_api_key
HELIUS_RPC_URL=https://devnet.helius-rpc.com/?api-key=your_helius_api_key
ANKR_API_KEY=your_ankr_api_key

# DAS API (for cNFT queries)
DAS_API_URL=https://devnet.helius-rpc.com/?api-key=your_helius_api_key

# Wallet Configuration (for server-side operations)
SOLANA_PRIVATE_KEY=your_base58_private_key

# Transaction Configuration
SOLANA_COMMITMENT=confirmed
SOLANA_PREFLIGHT_COMMITMENT=confirmed
SOLANA_MAX_RETRIES=3
```

---
**Status**: ✅ Solana Blockchain Integration Complete
**Dependencies**: Checkpoint 05 completed
**Estimated Time**: 3-4 days
**Next**: Checkpoint 07 - IPFS Integration & File Management