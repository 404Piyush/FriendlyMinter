# Checkpoint 05: Job Queue & Background Processing

## Objective
Implement robust background job processing using BullMQ and Redis for handling cNFT minting operations, file processing, and other asynchronous tasks.

## Prerequisites
- Checkpoint 04 completed (Backend API)
- Redis server running
- Understanding of job queue concepts

## Core Dependencies
```bash
# Job Queue
npm install bullmq ioredis

# Process Management
npm install pm2 -g

# Utilities
npm install cron
npm install node-cron
```

## Job Queue Architecture

```
API Request → Job Creation → Queue → Worker → Blockchain/IPFS
     ↓            ↓           ↓        ↓           ↓
  Frontend    Database    Redis   Processing   Results
     ↑            ↑           ↑        ↑           ↑
  Updates ← Progress ← Events ← Status ← Completion
```

## Queue Configuration

### lib/queue/config.ts
```typescript
import { ConnectionOptions } from 'bullmq';

export const redisConnection: ConnectionOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
};

export const defaultJobOptions = {
  removeOnComplete: 100, // Keep last 100 completed jobs
  removeOnFail: 50,      // Keep last 50 failed jobs
  attempts: 3,           // Retry failed jobs 3 times
  backoff: {
    type: 'exponential' as const,
    delay: 2000,         // Start with 2 second delay
  },
};

export const queueNames = {
  MINT: 'mint-queue',
  UPLOAD: 'upload-queue',
  METADATA: 'metadata-queue',
  CLEANUP: 'cleanup-queue',
} as const;
```

### lib/queue/queues.ts
```typescript
import { Queue } from 'bullmq';
import { redisConnection, defaultJobOptions, queueNames } from './config';

// Mint Queue - Handles cNFT minting operations
export const mintQueue = new Queue(queueNames.MINT, {
  connection: redisConnection,
  defaultJobOptions: {
    ...defaultJobOptions,
    attempts: 5, // More retries for critical minting operations
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  },
});

// Upload Queue - Handles file uploads to IPFS
export const uploadQueue = new Queue(queueNames.UPLOAD, {
  connection: redisConnection,
  defaultJobOptions,
});

// Metadata Queue - Handles metadata generation and processing
export const metadataQueue = new Queue(queueNames.METADATA, {
  connection: redisConnection,
  defaultJobOptions,
});

// Cleanup Queue - Handles cleanup operations
export const cleanupQueue = new Queue(queueNames.CLEANUP, {
  connection: redisConnection,
  defaultJobOptions: {
    ...defaultJobOptions,
    delay: 60000, // Delay cleanup jobs by 1 minute
  },
});

// Export all queues for easy access
export const queues = {
  mint: mintQueue,
  upload: uploadQueue,
  metadata: metadataQueue,
  cleanup: cleanupQueue,
};
```

## Job Types and Interfaces

### types/jobs.ts
```typescript
export interface MintJobData {
  jobId: string;
  collectionId: string;
  userId: string;
  metadataCid: string;
  totalNfts: number;
  batchSize: number;
  merkleTreeAddress: string;
  collectionMintAddress?: string;
  recipientOverrides?: Record<number, string>; // leafIndex -> walletAddress
}

export interface UploadJobData {
  jobId: string;
  userId: string;
  files: Array<{
    filename: string;
    buffer: Buffer;
    contentType: string;
  }>;
  collectionId?: string;
}

export interface MetadataJobData {
  jobId: string;
  collectionId: string;
  userId: string;
  csvData: Array<{
    name: string;
    description: string;
    image_filename: string;
    recipient_wallet?: string;
    [key: string]: any;
  }>;
  imageCids: Record<string, string>;
  collectionSymbol: string;
}

export interface CleanupJobData {
  jobId: string;
  type: 'failed_mint' | 'orphaned_files' | 'expired_jobs';
  targetId: string;
  metadata?: Record<string, any>;
}

export interface JobProgress {
  percentage: number;
  message: string;
  currentStep?: string;
  totalSteps?: number;
  completedSteps?: number;
  errors?: string[];
}
```

## Worker Implementation

### lib/queue/workers/mintWorker.ts
```typescript
import { Worker, Job } from 'bullmq';
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { mplBubblegum } from '@metaplex-foundation/mpl-bubblegum';
import { mintToCollectionV1 } from '@metaplex-foundation/mpl-bubblegum';
import { redisConnection, queueNames } from '../config';
import { MintJobData, JobProgress } from '@/types/jobs';
import { prisma } from '@/lib/db';
import { updateJobProgress, markJobCompleted, markJobFailed } from '../utils';

class MintWorker {
  private worker: Worker;
  private connection: Connection;
  private umi: any;

  constructor() {
    this.connection = new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com'
    );
    
    this.umi = createUmi(this.connection.rpcEndpoint)
      .use(mplBubblegum());

    this.worker = new Worker(
      queueNames.MINT,
      this.processJob.bind(this),
      {
        connection: redisConnection,
        concurrency: 2, // Process 2 mint jobs concurrently
      }
    );

    this.setupEventListeners();
  }

  private async processJob(job: Job<MintJobData>): Promise<void> {
    const { data } = job;
    
    try {
      await this.updateProgress(job, {
        percentage: 0,
        message: 'Starting mint process...',
        currentStep: 'initialization',
      });

      // Validate job data
      await this.validateJobData(data);
      
      await this.updateProgress(job, {
        percentage: 10,
        message: 'Fetching collection metadata...',
        currentStep: 'metadata_fetch',
      });

      // Fetch collection and metadata
      const collection = await this.getCollection(data.collectionId);
      const nftMetadata = await this.getNftMetadata(data.collectionId);
      
      await this.updateProgress(job, {
        percentage: 20,
        message: 'Preparing mint transactions...',
        currentStep: 'transaction_prep',
      });

      // Process minting in batches
      const batches = this.createBatches(nftMetadata, data.batchSize);
      const totalBatches = batches.length;
      
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        const batchProgress = 20 + (60 * (i / totalBatches));
        
        await this.updateProgress(job, {
          percentage: batchProgress,
          message: `Minting batch ${i + 1} of ${totalBatches}...`,
          currentStep: 'minting',
          totalSteps: totalBatches,
          completedSteps: i,
        });

        await this.processBatch(batch, data, collection);
        
        // Update database with minted count
        await this.updateMintedCount(data.collectionId, batch.length);
      }

      await this.updateProgress(job, {
        percentage: 90,
        message: 'Finalizing mint process...',
        currentStep: 'finalization',
      });

      // Mark collection as completed
      await this.markCollectionCompleted(data.collectionId);
      
      await this.updateProgress(job, {
        percentage: 100,
        message: 'Mint process completed successfully!',
        currentStep: 'completed',
      });

      await markJobCompleted(data.jobId);
      
    } catch (error) {
      console.error('Mint job failed:', error);
      
      await this.updateProgress(job, {
        percentage: 0,
        message: `Mint failed: ${error.message}`,
        currentStep: 'failed',
        errors: [error.message],
      });

      await markJobFailed(data.jobId, error.message);
      throw error;
    }
  }

  private async validateJobData(data: MintJobData): Promise<void> {
    if (!data.collectionId || !data.metadataCid || !data.merkleTreeAddress) {
      throw new Error('Missing required job data');
    }

    // Validate Solana addresses
    try {
      new PublicKey(data.merkleTreeAddress);
      if (data.collectionMintAddress) {
        new PublicKey(data.collectionMintAddress);
      }
    } catch {
      throw new Error('Invalid Solana address in job data');
    }
  }

  private async getCollection(collectionId: string) {
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new Error('Collection not found');
    }

    return collection;
  }

  private async getNftMetadata(collectionId: string) {
    return await prisma.nftMetadata.findMany({
      where: { collectionId },
      orderBy: { leafIndex: 'asc' },
    });
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  private async processBatch(
    batch: any[],
    jobData: MintJobData,
    collection: any
  ): Promise<void> {
    const mintPromises = batch.map(async (nft) => {
      try {
        const recipient = jobData.recipientOverrides?.[nft.leafIndex] || 
                         nft.recipientWallet || 
                         jobData.userId; // Default to job creator

        const metadataUri = `ipfs://${jobData.metadataCid}/${nft.leafIndex}.json`;
        
        // Create mint instruction using Bubblegum
        const mintIx = mintToCollectionV1(this.umi, {
          leafOwner: new PublicKey(recipient),
          merkleTree: new PublicKey(jobData.merkleTreeAddress),
          collectionMint: jobData.collectionMintAddress ? 
            new PublicKey(jobData.collectionMintAddress) : undefined,
          metadata: {
            name: nft.name,
            symbol: collection.symbol,
            uri: metadataUri,
            sellerFeeBasisPoints: 0,
            collection: jobData.collectionMintAddress ? {
              key: new PublicKey(jobData.collectionMintAddress),
              verified: true,
            } : undefined,
            creators: [],
          },
        });

        // Send transaction
        const signature = await this.umi.rpc.sendTransaction(mintIx);
        
        // Update NFT metadata with transaction signature
        await prisma.nftMetadata.update({
          where: { id: nft.id },
          data: { 
            metadataCid: `${jobData.metadataCid}/${nft.leafIndex}.json`,
            // Store transaction signature if needed
          },
        });

        return signature;
      } catch (error) {
        console.error(`Failed to mint NFT ${nft.leafIndex}:`, error);
        throw error;
      }
    });

    // Wait for all mints in batch to complete
    await Promise.all(mintPromises);
  }

  private async updateMintedCount(collectionId: string, count: number): Promise<void> {
    await prisma.collection.update({
      where: { id: collectionId },
      data: {
        mintedCount: {
          increment: count,
        },
      },
    });
  }

  private async markCollectionCompleted(collectionId: string): Promise<void> {
    await prisma.collection.update({
      where: { id: collectionId },
      data: {
        status: 'COMPLETED',
      },
    });
  }

  private async updateProgress(job: Job, progress: JobProgress): Promise<void> {
    await job.updateProgress(progress);
    await updateJobProgress(job.data.jobId, progress);
  }

  private setupEventListeners(): void {
    this.worker.on('completed', (job) => {
      console.log(`Mint job ${job.id} completed successfully`);
    });

    this.worker.on('failed', (job, err) => {
      console.error(`Mint job ${job?.id} failed:`, err);
    });

    this.worker.on('error', (err) => {
      console.error('Mint worker error:', err);
    });
  }

  public async close(): Promise<void> {
    await this.worker.close();
  }
}

export default MintWorker;
```

### lib/queue/workers/metadataWorker.ts
```typescript
import { Worker, Job } from 'bullmq';
import { redisConnection, queueNames } from '../config';
import { MetadataJobData, JobProgress } from '@/types/jobs';
import { uploadJsonToPinata } from '@/lib/ipfs';
import { prisma } from '@/lib/db';
import { updateJobProgress, markJobCompleted, markJobFailed } from '../utils';

class MetadataWorker {
  private worker: Worker;

  constructor() {
    this.worker = new Worker(
      queueNames.METADATA,
      this.processJob.bind(this),
      {
        connection: redisConnection,
        concurrency: 3, // Process 3 metadata jobs concurrently
      }
    );

    this.setupEventListeners();
  }

  private async processJob(job: Job<MetadataJobData>): Promise<void> {
    const { data } = job;
    
    try {
      await this.updateProgress(job, {
        percentage: 0,
        message: 'Starting metadata generation...',
        currentStep: 'initialization',
      });

      // Validate CSV data and image CIDs
      await this.validateData(data);
      
      await this.updateProgress(job, {
        percentage: 20,
        message: 'Generating metadata files...',
        currentStep: 'generation',
      });

      // Generate metadata for each NFT
      const metadataFiles = await this.generateMetadataFiles(data);
      
      await this.updateProgress(job, {
        percentage: 60,
        message: 'Uploading metadata to IPFS...',
        currentStep: 'upload',
      });

      // Upload metadata folder to IPFS
      const metadataCid = await this.uploadMetadataFolder(metadataFiles);
      
      await this.updateProgress(job, {
        percentage: 80,
        message: 'Saving metadata records...',
        currentStep: 'database',
      });

      // Save NFT metadata records to database
      await this.saveMetadataRecords(data, metadataCid);
      
      await this.updateProgress(job, {
        percentage: 100,
        message: 'Metadata generation completed!',
        currentStep: 'completed',
      });

      await markJobCompleted(data.jobId);
      
    } catch (error) {
      console.error('Metadata job failed:', error);
      
      await this.updateProgress(job, {
        percentage: 0,
        message: `Metadata generation failed: ${error.message}`,
        currentStep: 'failed',
        errors: [error.message],
      });

      await markJobFailed(data.jobId, error.message);
      throw error;
    }
  }

  private async validateData(data: MetadataJobData): Promise<void> {
    if (!data.csvData || data.csvData.length === 0) {
      throw new Error('No CSV data provided');
    }

    // Check that all referenced images have CIDs
    for (const row of data.csvData) {
      if (!data.imageCids[row.image_filename]) {
        throw new Error(`Missing image CID for ${row.image_filename}`);
      }
    }
  }

  private async generateMetadataFiles(data: MetadataJobData): Promise<Array<{ filename: string; content: any }>> {
    const metadataFiles = [];

    for (let i = 0; i < data.csvData.length; i++) {
      const row = data.csvData[i];
      const imageCid = data.imageCids[row.image_filename];
      
      // Extract dynamic attributes from CSV row
      const attributes = Object.keys(row)
        .filter(key => !['name', 'description', 'image_filename', 'recipient_wallet'].includes(key))
        .map(key => ({ trait_type: key, value: row[key] }));

      const metadata = {
        name: row.name,
        symbol: data.collectionSymbol,
        description: row.description,
        image: `ipfs://${imageCid}/${row.image_filename}`,
        properties: {
          files: [{
            uri: `ipfs://${imageCid}/${row.image_filename}`,
            type: this.getImageType(row.image_filename),
          }],
        },
        attributes,
        seller_fee_basis_points: 0,
        creators: [],
      };

      metadataFiles.push({
        filename: `${i}.json`,
        content: metadata,
      });
    }

    return metadataFiles;
  }

  private getImageType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'png': return 'image/png';
      case 'jpg': case 'jpeg': return 'image/jpeg';
      case 'gif': return 'image/gif';
      case 'webp': return 'image/webp';
      default: return 'image/png';
    }
  }

  private async uploadMetadataFolder(metadataFiles: Array<{ filename: string; content: any }>): Promise<string> {
    // For simplicity, upload as a single JSON file containing all metadata
    // In production, you might want to upload as individual files or use a folder upload API
    const combinedMetadata = metadataFiles.reduce((acc, file) => {
      const index = file.filename.replace('.json', '');
      acc[index] = file.content;
      return acc;
    }, {} as Record<string, any>);

    const result = await uploadJsonToPinata(
      combinedMetadata,
      `collection_metadata_${Date.now()}.json`
    );

    return result.IpfsHash;
  }

  private async saveMetadataRecords(data: MetadataJobData, metadataCid: string): Promise<void> {
    const records = data.csvData.map((row, index) => ({
      name: row.name,
      description: row.description,
      imageCid: data.imageCids[row.image_filename],
      metadataCid: `${metadataCid}/${index}.json`,
      attributes: Object.keys(row)
        .filter(key => !['name', 'description', 'image_filename', 'recipient_wallet'].includes(key))
        .map(key => ({ trait_type: key, value: row[key] })),
      leafIndex: index,
      recipientWallet: row.recipient_wallet || null,
      collectionId: data.collectionId,
    }));

    await prisma.nftMetadata.createMany({
      data: records,
    });
  }

  private async updateProgress(job: Job, progress: JobProgress): Promise<void> {
    await job.updateProgress(progress);
    await updateJobProgress(job.data.jobId, progress);
  }

  private setupEventListeners(): void {
    this.worker.on('completed', (job) => {
      console.log(`Metadata job ${job.id} completed successfully`);
    });

    this.worker.on('failed', (job, err) => {
      console.error(`Metadata job ${job?.id} failed:`, err);
    });

    this.worker.on('error', (err) => {
      console.error('Metadata worker error:', err);
    }
  }

  public async close(): Promise<void> {
    await this.worker.close();
  }
}

export default MetadataWorker;
```

## Job Management Utilities

### lib/queue/utils.ts
```typescript
import { prisma } from '@/lib/db';
import { JobProgress } from '@/types/jobs';

export async function updateJobProgress(
  jobId: string,
  progress: JobProgress
): Promise<void> {
  await prisma.mintJob.update({
    where: { id: jobId },
    data: {
      progress: progress.percentage,
      status: progress.currentStep === 'completed' ? 'COMPLETED' : 
              progress.currentStep === 'failed' ? 'FAILED' : 'PROCESSING',
      updatedAt: new Date(),
    },
  });
}

export async function markJobCompleted(jobId: string): Promise<void> {
  await prisma.mintJob.update({
    where: { id: jobId },
    data: {
      status: 'COMPLETED',
      progress: 100,
      completedAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

export async function markJobFailed(
  jobId: string,
  errorMessage: string
): Promise<void> {
  await prisma.mintJob.update({
    where: { id: jobId },
    data: {
      status: 'FAILED',
      errorMessage,
      updatedAt: new Date(),
    },
  });
}

export async function createMintJob(
  collectionId: string,
  userId: string,
  totalNfts: number,
  metadataCid: string
): Promise<string> {
  const job = await prisma.mintJob.create({
    data: {
      collectionId,
      userId,
      totalNfts,
      metadataCid,
      status: 'PENDING',
    },
  });

  return job.id;
}
```

## API Integration

### app/api/mint-jobs/route.ts
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { mintQueue } from '@/lib/queue/queues';
import { createMintJob } from '@/lib/queue/utils';
import { MintJobData } from '@/types/jobs';

const createMintJobSchema = z.object({
  collectionId: z.string(),
  batchSize: z.number().min(1).max(10).default(1),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { collectionId, batchSize } = createMintJobSchema.parse(body);

    // Validate collection ownership and readiness
    const collection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId: session.user.id,
        status: 'INITIALIZED',
      },
      include: {
        nftMetadata: true,
      },
    });

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found or not ready for minting' },
        { status: 404 }
      );
    }

    if (collection.nftMetadata.length === 0) {
      return NextResponse.json(
        { error: 'No metadata found for collection' },
        { status: 400 }
      );
    }

    // Create job record
    const jobId = await createMintJob(
      collectionId,
      session.user.id,
      collection.nftMetadata.length,
      collection.nftMetadata[0].metadataCid?.split('/')[0] || ''
    );

    // Add job to queue
    const jobData: MintJobData = {
      jobId,
      collectionId,
      userId: session.user.id,
      metadataCid: collection.nftMetadata[0].metadataCid?.split('/')[0] || '',
      totalNfts: collection.nftMetadata.length,
      batchSize,
      merkleTreeAddress: collection.merkleTreeAddress!,
      collectionMintAddress: collection.collectionMintAddress || undefined,
    };

    await mintQueue.add('mint-collection', jobData, {
      jobId,
      delay: 1000, // Small delay to ensure database consistency
    });

    // Update collection status
    await prisma.collection.update({
      where: { id: collectionId },
      data: { status: 'MINTING' },
    });

    return NextResponse.json({ jobId }, { status: 202 });
  } catch (error) {
    console.error('Mint job creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create mint job' },
      { status: 500 }
    );
  }
}
```

### app/api/jobs/[id]/status/route.ts
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { mintQueue } from '@/lib/queue/queues';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get job from database
    const job = await prisma.mintJob.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        collection: true,
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Get job progress from queue
    const queueJob = await mintQueue.getJob(params.id);
    const progress = queueJob?.progress || { percentage: job.progress };

    return NextResponse.json({
      id: job.id,
      status: job.status,
      progress: progress,
      totalNfts: job.totalNfts,
      mintedCount: job.mintedCount,
      errorMessage: job.errorMessage,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      collection: {
        id: job.collection.id,
        name: job.collection.name,
        symbol: job.collection.symbol,
      },
    });
  } catch (error) {
    console.error('Job status fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job status' },
      { status: 500 }
    );
  }
}
```

## Worker Process Management

### scripts/start-workers.ts
```typescript
#!/usr/bin/env node

import MintWorker from '../lib/queue/workers/mintWorker';
import MetadataWorker from '../lib/queue/workers/metadataWorker';

const workers: Array<{ close: () => Promise<void> }> = [];

async function startWorkers() {
  console.log('Starting workers...');
  
  // Start mint worker
  const mintWorker = new MintWorker();
  workers.push(mintWorker);
  console.log('Mint worker started');
  
  // Start metadata worker
  const metadataWorker = new MetadataWorker();
  workers.push(metadataWorker);
  console.log('Metadata worker started');
  
  console.log('All workers started successfully');
}

async function gracefulShutdown() {
  console.log('Shutting down workers...');
  
  await Promise.all(workers.map(worker => worker.close()));
  
  console.log('All workers shut down');
  process.exit(0);
}

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start workers
startWorkers().catch((error) => {
  console.error('Failed to start workers:', error);
  process.exit(1);
});
```

### package.json scripts
```json
{
  "scripts": {
    "workers": "tsx scripts/start-workers.ts",
    "workers:dev": "tsx watch scripts/start-workers.ts",
    "workers:pm2": "pm2 start ecosystem.config.js"
  }
}
```

### ecosystem.config.js (PM2 Configuration)
```javascript
module.exports = {
  apps: [
    {
      name: 'cnft-workers',
      script: 'scripts/start-workers.ts',
      interpreter: 'tsx',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
      error_file: './logs/workers-error.log',
      out_file: './logs/workers-out.log',
      log_file: './logs/workers-combined.log',
    },
  ],
};
```

---
**Status**: ✅ Job Queue System Complete
**Dependencies**: Checkpoint 04 completed
**Estimated Time**: 2-3 days
**Next**: Checkpoint 06 - Solana Blockchain Integration