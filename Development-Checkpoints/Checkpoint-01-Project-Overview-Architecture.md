# Checkpoint 01: Project Overview & Architecture

## Project Vision
Build a Mailchimp-like platform for cNFTs (compressed NFTs) on Solana, enabling users to create and mint large collections of NFTs at extremely low costs using Solana's State Compression technology.

## Problem Statement
- Traditional NFTs on Ethereum cost $50-200+ per mint
- High costs prevent mass adoption and large-scale deployments
- Need for affordable, scalable NFT solutions

## Solution: cNFTs on Solana
- **Cost Reduction**: ~$0.0001-0.001 per cNFT vs $50-200+ for traditional NFTs
- **Scalability**: Support for millions of NFTs in single collections
- **State Compression**: Off-chain storage with on-chain verification via Merkle trees

## Use Cases
1. **Event Ticketing**: Mass ticket distribution with proof of attendance
2. **Gaming Assets**: In-game items, achievements, collectibles
3. **Loyalty Programs**: Reward points, membership tiers
4. **Educational Certificates**: Course completions, skill badges
5. **Corporate Rewards**: Employee recognition, milestone achievements

## High-Level Architecture

### Frontend Stack
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **UI Library**: Shadcn/UI components
- **State Management**: Zustand
- **Wallet Integration**: @solana/wallet-adapter

### Backend Stack
- **Runtime**: Node.js with Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Job Queue**: BullMQ with Redis
- **File Storage**: IPFS (Pinata/Web3.Storage)

### Blockchain Integration
- **Network**: Solana (Devnet for development)
- **RPC Provider**: Helius/Ankr
- **Core Libraries**:
  - @solana/web3.js
  - @solana/spl-account-compression
  - @metaplex-foundation/mpl-bubblegum
  - @metaplex-foundation/umi

## Component Interaction Flow

```
User Interface (Next.js)
    ↓
API Routes (Next.js)
    ↓
Job Queue (BullMQ + Redis)
    ↓
Worker Processes
    ↓
Solana Blockchain + IPFS
```

## Key Technical Concepts

### Merkle Trees
- **Purpose**: Compress large datasets into single on-chain proof
- **Parameters**:
  - `maxDepth`: Determines maximum NFTs (2^depth)
  - `maxBufferSize`: Concurrent operations per slot

### State Compression
- **On-chain**: Merkle tree root hash
- **Off-chain**: Full NFT metadata and images
- **Verification**: Cryptographic proofs validate off-chain data

## Development Approach
- **Stack**: MERN (MongoDB → PostgreSQL for better ACID compliance)
- **Solana Language**: TypeScript/JavaScript (recommended for web integration)
- **Alternative**: Rust for advanced Solana program development

## Success Metrics
- Sub-second collection creation
- <$1 cost for 10,000 NFT collection
- Intuitive user experience comparable to Web2 platforms
- Scalable to millions of NFTs

## Next Steps
- Checkpoint 02: Frontend Development Setup
- Checkpoint 03: Wallet Integration
- Checkpoint 04: Backend API Development

---
**Status**: ✅ Architecture Defined
**Dependencies**: None
**Estimated Time**: 1-2 days for setup and planning