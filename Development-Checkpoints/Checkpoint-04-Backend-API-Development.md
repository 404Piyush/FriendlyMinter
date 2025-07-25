# Checkpoint 04: Backend API Development

## Objective
Implement robust backend APIs using Next.js API Routes with PostgreSQL database, authentication, validation, and security best practices.

## Prerequisites
- Checkpoint 03 completed (Wallet integration)
- PostgreSQL database setup
- Redis instance for caching and job queue

## Core Dependencies
```bash
# Database & ORM
npm install prisma @prisma/client
npm install -D prisma

# Authentication
npm install next-auth
npm install @next-auth/prisma-adapter

# Validation
npm install zod

# Rate Limiting
npm install rate-limiter-flexible

# File Upload
npm install multer
npm install -D @types/multer

# IPFS Integration
npm install pinata-sdk

# Job Queue
npm install bullmq ioredis

# Utilities
npm install nanoid
npm install bcryptjs
npm install -D @types/bcryptjs
```

## Database Schema Setup

### prisma/schema.prisma
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  walletAddress String @unique
  email     String?  @unique
  name      String?
  avatar    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  collections Collection[]
  mintJobs    MintJob[]
  
  @@map("users")
}

model Collection {
  id          String   @id @default(cuid())
  name        String
  symbol      String
  description String?
  imageUrl    String?
  imageCid    String?
  maxNfts     Int
  mintedCount Int      @default(0)
  
  // Blockchain addresses
  merkleTreeAddress     String?
  collectionMintAddress String?
  
  // Status tracking
  status    CollectionStatus @default(DRAFT)
  createdAt DateTime         @default(now())
  updatedAt DateTime         @updatedAt
  
  // Relations
  userId     String
  user       User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  nftMetadata NftMetadata[]
  mintJobs   MintJob[]
  
  @@map("collections")
}

enum CollectionStatus {
  DRAFT
  INITIALIZED
  MINTING
  COMPLETED
  FAILED
}

model NftMetadata {
  id           String @id @default(cuid())
  name         String
  description  String?
  imageCid     String
  metadataCid  String?
  attributes   Json   @default("[]")
  leafIndex    Int?
  recipientWallet String?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  collectionId String
  collection   Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)
  
  @@map("nft_metadata")
}

model MintJob {
  id          String    @id @default(cuid())
  status      JobStatus @default(PENDING)
  progress    Float     @default(0)
  totalNfts   Int
  mintedCount Int       @default(0)
  errorMessage String?
  
  // Job metadata
  metadataCid String?
  batchSize   Int       @default(1)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  startedAt DateTime?
  completedAt DateTime?
  
  // Relations
  userId       String
  user         User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  collectionId String
  collection   Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)
  
  @@map("mint_jobs")
}

enum JobStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  CANCELLED
}

// NextAuth tables
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}
```

### Database Migration
```bash
# Initialize Prisma
npx prisma init

# Generate and run migration
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

## API Route Structure

### lib/db.ts
```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### lib/auth.ts
```typescript
import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './db';
import { verifySignature } from './solana';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Solana',
      credentials: {
        message: { label: 'Message', type: 'text' },
        signature: { label: 'Signature', type: 'text' },
        publicKey: { label: 'Public Key', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.message || !credentials?.signature || !credentials?.publicKey) {
          return null;
        }

        const isValid = await verifySignature(
          credentials.message,
          credentials.signature,
          credentials.publicKey
        );

        if (!isValid) {
          return null;
        }

        // Find or create user
        let user = await prisma.user.findUnique({
          where: { walletAddress: credentials.publicKey },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              walletAddress: credentials.publicKey,
            },
          });
        }

        return {
          id: user.id,
          walletAddress: user.walletAddress,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.walletAddress = user.walletAddress;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.sub!;
      session.user.walletAddress = token.walletAddress as string;
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
};
```

### lib/solana.ts
```typescript
import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

export async function verifySignature(
  message: string,
  signature: string,
  publicKey: string
): Promise<boolean> {
  try {
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = bs58.decode(signature);
    const publicKeyBytes = new PublicKey(publicKey).toBytes();

    return nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes
    );
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

export function generateAuthMessage(publicKey: string): string {
  const timestamp = Date.now();
  return `Sign this message to authenticate with cNFT Platform.\n\nWallet: ${publicKey}\nTimestamp: ${timestamp}`;
}
```

## API Routes Implementation

### app/api/auth/[...nextauth]/route.ts
```typescript
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

### app/api/collections/route.ts
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';

const createCollectionSchema = z.object({
  name: z.string().min(1).max(100),
  symbol: z.string().min(1).max(10).toUpperCase(),
  description: z.string().max(500).optional(),
  maxNfts: z.number().min(1).max(1000000),
  imageCid: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Apply rate limiting
    const rateLimitResult = await rateLimit(request, session.user.id);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const collections = await prisma.collection.findMany({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: { nftMetadata: true, mintJobs: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ collections });
  } catch (error) {
    console.error('Collections fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Apply rate limiting
    const rateLimitResult = await rateLimit(request, session.user.id);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validatedData = createCollectionSchema.parse(body);

    const collection = await prisma.collection.create({
      data: {
        ...validatedData,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ collection }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Collection creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### app/api/collections/[id]/route.ts
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

const updateCollectionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  imageCid: z.string().optional(),
  merkleTreeAddress: z.string().optional(),
  collectionMintAddress: z.string().optional(),
  status: z.enum(['DRAFT', 'INITIALIZED', 'MINTING', 'COMPLETED', 'FAILED']).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const collection = await prisma.collection.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        nftMetadata: true,
        mintJobs: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: {
          select: { nftMetadata: true },
        },
      },
    });

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ collection });
  } catch (error) {
    console.error('Collection fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateCollectionSchema.parse(body);

    const collection = await prisma.collection.updateMany({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: validatedData,
    });

    if (collection.count === 0) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    const updatedCollection = await prisma.collection.findUnique({
      where: { id: params.id },
    });

    return NextResponse.json({ collection: updatedCollection });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Collection update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const deletedCollection = await prisma.collection.deleteMany({
      where: {
        id: params.id,
        userId: session.user.id,
        status: 'DRAFT', // Only allow deletion of draft collections
      },
    });

    if (deletedCollection.count === 0) {
      return NextResponse.json(
        { error: 'Collection not found or cannot be deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Collection deleted successfully' });
  } catch (error) {
    console.error('Collection deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### app/api/upload/route.ts
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadToPinata } from '@/lib/ipfs';
import { rateLimit } from '@/lib/rate-limit';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Apply rate limiting
    const rateLimitResult = await rateLimit(request, session.user.id);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to IPFS
    const result = await uploadToPinata(buffer, file.name);

    return NextResponse.json({
      cid: result.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
      filename: file.name,
      size: file.size,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
```

## Rate Limiting

### lib/rate-limit.ts
```typescript
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { Redis } from 'ioredis';
import { NextRequest } from 'next/server';

const redis = new Redis(process.env.REDIS_URL!);

const rateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'api_rate_limit',
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
  blockDuration: 60, // Block for 60 seconds if limit exceeded
});

const strictRateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'api_strict_rate_limit',
  points: 10, // Number of requests
  duration: 60, // Per 60 seconds
  blockDuration: 300, // Block for 5 minutes if limit exceeded
});

export async function rateLimit(
  request: NextRequest,
  userId?: string,
  strict = false
): Promise<{ success: boolean; remainingPoints?: number }> {
  try {
    const identifier = userId || getClientIP(request);
    const limiter = strict ? strictRateLimiter : rateLimiter;
    
    const result = await limiter.consume(identifier);
    
    return {
      success: true,
      remainingPoints: result.remainingPoints,
    };
  } catch (rejRes: any) {
    return {
      success: false,
      remainingPoints: rejRes.remainingPoints || 0,
    };
  }
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}
```

## IPFS Integration

### lib/ipfs.ts
```typescript
import pinataSDK from 'pinata-sdk';

const pinata = new pinataSDK(
  process.env.PINATA_API_KEY!,
  process.env.PINATA_SECRET_KEY!
);

export async function uploadToPinata(
  buffer: Buffer,
  filename: string
): Promise<any> {
  try {
    const options = {
      pinataMetadata: {
        name: filename,
        keyvalues: {
          uploadedAt: new Date().toISOString(),
        },
      },
      pinataOptions: {
        cidVersion: 0,
      },
    };

    const result = await pinata.pinFileToIPFS(
      buffer,
      options
    );

    return result;
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw new Error('Failed to upload to IPFS');
  }
}

export async function uploadJsonToPinata(
  jsonData: any,
  filename: string
): Promise<any> {
  try {
    const options = {
      pinataMetadata: {
        name: filename,
      },
    };

    const result = await pinata.pinJSONToIPFS(jsonData, options);
    return result;
  } catch (error) {
    console.error('JSON upload error:', error);
    throw new Error('Failed to upload JSON to IPFS');
  }
}

export async function unpinFromPinata(cid: string): Promise<void> {
  try {
    await pinata.unpin(cid);
  } catch (error) {
    console.error('IPFS unpin error:', error);
    // Don't throw error for unpin failures
  }
}
```

## Error Handling Middleware

### lib/error-handler.ts
```typescript
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export class APIError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function handleAPIError(error: unknown): NextResponse {
  console.error('API Error:', error);

  if (error instanceof APIError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation error',
        details: error.errors,
      },
      { status: 400 }
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Resource already exists' },
        { status: 409 }
      );
    }
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }
  }

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

## Environment Configuration

### .env.local
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/cnft_platform"

# Redis
REDIS_URL="redis://localhost:6379"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# IPFS (Pinata)
PINATA_API_KEY="your-pinata-api-key"
PINATA_SECRET_KEY="your-pinata-secret-key"

# Solana
NEXT_PUBLIC_SOLANA_NETWORK="devnet"
NEXT_PUBLIC_SOLANA_RPC_URL="https://api.devnet.solana.com"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---
**Status**: ✅ Backend API Foundation Complete
**Dependencies**: Checkpoint 03 completed
**Estimated Time**: 2-3 days
**Next**: Checkpoint 05 - Job Queue & Background Processing