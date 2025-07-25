# cNFT Mailchimp Platform - Project Context & Memory

## Project Overview

**Project Name**: cNFT Mailchimp Platform (FriendlyMinter)
**Technology Stack**: MERN + Solana (MongoDB replaced with PostgreSQL)
**Primary Language**: TypeScript/JavaScript
**Blockchain**: Solana (for cNFT minting using Compressed NFTs)
**Architecture**: Full-stack web application with job queue processing

## Problem Statement
Traditional NFT minting on Solana is expensive due to individual account creation costs. This platform leverages Solana's Compressed NFTs (cNFTs) technology to enable bulk minting at a fraction of the cost, making NFT creation accessible for marketing campaigns, community rewards, and large-scale distributions.

## Core Technology Stack

### Frontend
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **UI Library**: Shadcn/UI + Tailwind CSS
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **Data Fetching**: TanStack Query (React Query)
- **Wallet Integration**: @solana/wallet-adapter

### Backend
- **Runtime**: Node.js
- **Framework**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Job Queue**: BullMQ with Redis
- **Authentication**: NextAuth.js with Solana wallet signatures
- **File Storage**: IPFS (Pinata)
- **Validation**: Zod schemas

### Blockchain
- **Network**: Solana (Devnet for development, Mainnet for production)
- **Technology**: Compressed NFTs (cNFTs) using Merkle Trees
- **Libraries**: 
  - `@solana/web3.js` - Core Solana interactions
  - `@solana/spl-account-compression` - Merkle Tree operations
  - `@metaplex-foundation/mpl-bubblegum` - cNFT minting
  - `@metaplex-foundation/umi` - Unified interface
  - `@metaplex-foundation/digital-asset-standard-api` - Asset queries

### Infrastructure
- **Process Management**: PM2
- **Containerization**: Docker
- **Monitoring**: Winston logging + Sentry
- **Caching**: Redis
- **Security**: Rate limiting, CSRF protection, security headers

## Project Structure

```
FriendlyMinter/
├── Development-Checkpoints/           # Development guidance files
│   ├── Checkpoint-01-Project-Overview-Architecture.md
│   ├── Checkpoint-02-Frontend-Setup-NextJS.md
│   ├── Checkpoint-03-Wallet-Integration.md
│   ├── Checkpoint-04-Backend-API-Development.md
│   ├── Checkpoint-05-Job-Queue-Background-Processing.md
│   ├── Checkpoint-06-Solana-Blockchain-Integration.md
│   ├── Checkpoint-07-IPFS-Integration-File-Management.md
│   ├── Checkpoint-08-Frontend-Components-UI.md
│   ├── Checkpoint-09-Deployment-Production.md
│   └── PROJECT-CONTEXT-MEMORY.md      # This file
├── app/                               # Next.js App Router
│   ├── (auth)/                       # Authentication pages
│   ├── (dashboard)/                  # Main application pages
│   ├── api/                          # API routes
│   ├── globals.css                   # Global styles
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Home page
├── components/                        # React components
│   ├── ui/                           # Shadcn/UI components
│   ├── wallet/                       # Wallet integration
│   ├── collections/                  # Collection management
│   ├── upload/                       # File upload components
│   └── layout/                       # Layout components
├── lib/                              # Utility libraries
│   ├── prisma.ts                     # Database client
│   ├── redis.ts                      # Redis client
│   ├── solana.ts                     # Solana configuration
│   ├── ipfs.ts                       # IPFS integration
│   ├── auth.ts                       # Authentication config
│   ├── logger.ts                     # Logging configuration
│   └── utils.ts                      # General utilities
├── workers/                          # Background job workers
│   ├── mint-worker.ts                # cNFT minting jobs
│   ├── upload-worker.ts              # File upload jobs
│   ├── metadata-worker.ts            # Metadata processing
│   └── start-workers.ts              # Worker initialization
├── prisma/                           # Database schema and migrations
│   ├── schema.prisma                 # Database schema
│   └── migrations/                   # Database migrations
├── types/                            # TypeScript type definitions
├── hooks/                            # Custom React hooks
├── stores/                           # Zustand stores
└── public/                           # Static assets
```

## Core Data Models

### User
```typescript
interface User {
  id: string;
  walletAddress: string;
  email?: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Collection
```typescript
interface Collection {
  id: string;
  userId: string;
  name: string;
  symbol: string;
  description?: string;
  imageUrl?: string;
  merkleTree?: string;        // Solana address
  collectionNft?: string;     // Solana address
  maxDepth: number;
  maxBufferSize: number;
  canopyDepth: number;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED';
  createdAt: Date;
  updatedAt: Date;
}
```

### NftMetadata
```typescript
interface NftMetadata {
  id: string;
  collectionId: string;
  name: string;
  description?: string;
  imageUrl: string;
  attributes?: any[];         // JSON attributes
  externalUrl?: string;
  animationUrl?: string;
  metadataUri?: string;       // IPFS URI
  mintAddress?: string;       // Solana address after minting
  status: 'PENDING' | 'UPLOADED' | 'MINTED' | 'FAILED';
  createdAt: Date;
  updatedAt: Date;
}
```

### MintJob
```typescript
interface MintJob {
  id: string;
  userId: string;
  collectionId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'PAUSED';
  totalNfts: number;
  processedNfts: number;
  failedNfts?: any[];
  transactionSignatures?: string[];
  estimatedCost?: number;
  actualCost?: number;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## Key Workflows

### 1. Collection Creation
1. User connects Solana wallet
2. User fills collection form (name, symbol, description, image)
3. System uploads collection image to IPFS
4. System calculates Merkle Tree parameters based on expected NFT count
5. System creates Bubblegum Merkle Tree on Solana
6. Optional: Create Metaplex Collection NFT
7. Save collection data to database

### 2. NFT Metadata Upload
1. User uploads CSV file with NFT metadata
2. System validates CSV structure and data
3. User uploads corresponding images (optional batch upload)
4. System processes and validates images
5. System uploads images to IPFS
6. System generates Metaplex-compliant JSON metadata
7. System uploads metadata to IPFS
8. Save metadata records to database

### 3. Cost Estimation & Minting
1. System calculates minting costs based on:
   - Merkle Tree creation cost
   - Collection NFT creation cost (if applicable)
   - Transaction fees per cNFT
2. User reviews and approves costs
3. User initiates minting process
4. System queues minting job in BullMQ
5. Background worker processes minting in batches
6. System updates progress and handles errors
7. Completed NFTs are queryable via DAS API

## Critical Technical Concepts

### Compressed NFTs (cNFTs)
- Use Merkle Trees for state compression
- Dramatically reduce storage costs (from ~0.012 SOL to ~0.00001 SOL per NFT)
- Require special indexing services (DAS API) for querying
- Support all standard NFT features (transfers, burns, updates)

### Merkle Tree Configuration
- **maxDepth**: Determines maximum NFTs (2^maxDepth)
- **maxBufferSize**: Concurrent modification buffer
- **canopyDepth**: On-chain proof storage for faster operations

### Job Queue Architecture
- **mint-queue**: Handles cNFT minting operations
- **upload-queue**: Processes file uploads to IPFS
- **metadata-queue**: Generates and validates metadata
- **cleanup-queue**: Handles cleanup and maintenance tasks

## Environment Variables

### Development
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/cnft_platform

# Redis
REDIS_URL=redis://localhost:6379

# Solana
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_PRIVATE_KEY=your-base58-private-key

# IPFS (Pinata)
PINATA_API_KEY=your-api-key
PINATA_SECRET_API_KEY=your-secret
PINATA_JWT=your-jwt-token

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret
```

### Production
```bash
# All development variables plus:
NODE_ENV=production
SOLANA_NETWORK=mainnet-beta
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SENTRY_DSN=your-sentry-dsn
NEW_RELIC_LICENSE_KEY=your-newrelic-key
```

## Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Use functional components with hooks
- Implement proper error boundaries
- Add comprehensive error handling

### Security Best Practices
- Validate all user inputs with Zod schemas
- Implement rate limiting on API endpoints
- Use CSRF protection
- Sanitize file uploads
- Never expose private keys in client-side code
- Implement proper authentication checks

### Performance Optimization
- Use React.memo for expensive components
- Implement proper loading states
- Use TanStack Query for data caching
- Optimize images with Next.js Image component
- Implement code splitting
- Use Redis for caching frequently accessed data

### Testing Strategy
- Unit tests for utility functions
- Integration tests for API endpoints
- Component tests for React components
- End-to-end tests for critical workflows
- Load testing for job queue processing

## Common Pitfalls & Solutions

### Solana RPC Rate Limiting
**Problem**: Solana RPC endpoints have rate limits
**Solution**: Implement retry logic with exponential backoff, use multiple RPC endpoints, cache responses

### Large File Uploads
**Problem**: Browser timeouts on large file uploads
**Solution**: Implement chunked uploads, progress tracking, resume capability

### Job Queue Failures
**Problem**: Jobs failing due to network issues or RPC errors
**Solution**: Implement retry logic, dead letter queues, comprehensive error logging

### Merkle Tree Sizing
**Problem**: Incorrect tree sizing leading to insufficient capacity
**Solution**: Calculate based on expected NFT count + buffer, provide clear guidance to users

### IPFS Pinning Failures
**Problem**: Files not properly pinned to IPFS
**Solution**: Verify pinning status, implement retry logic, use multiple pinning services

## Monitoring & Debugging

### Key Metrics to Monitor
- API response times
- Job queue processing rates
- Database connection pool usage
- Solana RPC success rates
- IPFS upload success rates
- Memory and CPU usage
- Error rates by endpoint

### Logging Strategy
- Structured logging with Winston
- Log levels: error, warn, info, debug
- Include correlation IDs for request tracing
- Log all Solana transactions
- Log job queue events
- Implement log rotation

### Health Checks
- Database connectivity
- Redis connectivity
- Solana RPC availability
- IPFS service availability
- Job queue status

## Deployment Checklist

### Pre-deployment
- [ ] Run all tests
- [ ] Update environment variables
- [ ] Run database migrations
- [ ] Build and test Docker images
- [ ] Verify SSL certificates
- [ ] Check monitoring setup

### Post-deployment
- [ ] Verify health checks pass
- [ ] Test critical workflows
- [ ] Monitor error rates
- [ ] Check job queue processing
- [ ] Verify database performance
- [ ] Test wallet integration

## Support & Maintenance

### Regular Tasks
- Monitor and rotate logs
- Update dependencies
- Review and optimize database queries
- Clean up old job queue data
- Monitor IPFS pinning status
- Review and update security configurations

### Emergency Procedures
- Database backup and restore
- Job queue recovery
- RPC endpoint failover
- IPFS service migration
- Security incident response

## Resources & Documentation

### Solana Documentation
- [Solana Cookbook](https://solanacookbook.com/)
- [Compressed NFTs Guide](https://docs.solana.com/developing/guides/compressed-nfts)
- [Metaplex Documentation](https://docs.metaplex.com/)

### Development Tools
- [Solana Explorer](https://explorer.solana.com/)
- [Phantom Wallet](https://phantom.app/) (for testing)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)

### APIs & Services
- [Helius DAS API](https://docs.helius.xyz/compression-and-das-api/digital-asset-standard-das-api)
- [Pinata IPFS](https://docs.pinata.cloud/)
- [Ankr RPC](https://www.ankr.com/rpc/solana/)

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Maintainer**: Development Team

This document serves as the single source of truth for the cNFT Mailchimp Platform project. All developers should refer to this document when working on the project and update it as the project evolves.