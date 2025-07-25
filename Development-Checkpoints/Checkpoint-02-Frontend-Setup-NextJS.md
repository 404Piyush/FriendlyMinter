# Checkpoint 02: Frontend Setup & Next.js Development

## Objective
Set up Next.js 14+ frontend with TypeScript, Shadcn/UI, and essential development tools.

## Prerequisites
- Node.js 18+ installed
- Git repository initialized
- Basic understanding of React and TypeScript

## Project Initialization

### 1. Create Next.js Project
```bash
npx create-next-app@latest cnft-platform --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd cnft-platform
```

### 2. Install Core Dependencies
```bash
# UI Components
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input label textarea select
npx shadcn-ui@latest add dialog sheet toast progress
npx shadcn-ui@latest add table dropdown-menu

# State Management
npm install zustand

# Form Handling
npm install react-hook-form @hookform/resolvers zod

# Data Fetching
npm install @tanstack/react-query

# File Upload
npm install react-dropzone

# CSV Processing
npm install papaparse
npm install -D @types/papaparse
```

## Project Structure
```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── dashboard/
│   │   ├── page.tsx
│   │   └── collections/
│   │       ├── page.tsx
│   │       ├── create/
│   │       │   └── page.tsx
│   │       └── [id]/
│   │           ├── page.tsx
│   │           └── mint/
│   │               └── page.tsx
│   └── api/
│       ├── collections/
│       ├── upload/
│       └── mint-jobs/
├── components/
│   ├── ui/           # Shadcn components
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   ├── forms/
│   │   ├── CollectionForm.tsx
│   │   ├── FileUpload.tsx
│   │   └── CsvUpload.tsx
│   ├── dashboard/
│   │   ├── CollectionCard.tsx
│   │   ├── MintProgress.tsx
│   │   └── StatsOverview.tsx
│   └── wallet/
│       ├── WalletButton.tsx
│       └── WalletProvider.tsx
├── lib/
│   ├── utils.ts
│   ├── validations.ts
│   ├── api.ts
│   └── stores/
│       ├── authStore.ts
│       ├── collectionStore.ts
│       └── mintStore.ts
├── types/
│   ├── collection.ts
│   ├── nft.ts
│   └── api.ts
└── hooks/
    ├── useCollections.ts
    ├── useMintJob.ts
    └── useFileUpload.ts
```

## Key Configuration Files

### tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['gateway.pinata.cloud', 'ipfs.io'],
  },
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

module.exports = nextConfig;
```

## Core Type Definitions

### types/collection.ts
```typescript
export interface Collection {
  id: string;
  name: string;
  symbol: string;
  description: string;
  imageUrl?: string;
  imageCid?: string;
  maxNfts: number;
  mintedCount: number;
  merkleTreeAddress?: string;
  collectionMintAddress?: string;
  status: 'DRAFT' | 'INITIALIZED' | 'MINTING' | 'COMPLETED' | 'FAILED';
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface CreateCollectionData {
  name: string;
  symbol: string;
  description: string;
  maxNfts: number;
  image?: File;
}
```

### types/nft.ts
```typescript
export interface NftMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  properties: {
    files: Array<{
      uri: string;
      type: string;
    }>;
  };
}

export interface MintJob {
  id: string;
  collectionId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress: number;
  totalNfts: number;
  mintedCount: number;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Performance Optimizations

### 1. Code Splitting
```typescript
// Dynamic imports for heavy components
const CsvUpload = dynamic(() => import('@/components/forms/CsvUpload'), {
  loading: () => <div>Loading...</div>,
});
```

### 2. Image Optimization
```typescript
import Image from 'next/image';

// Use Next.js Image component for automatic optimization
<Image
  src={collection.imageUrl}
  alt={collection.name}
  width={300}
  height={300}
  className="rounded-lg"
  priority={index < 4} // Prioritize above-fold images
/>
```

### 3. Caching Strategy
```typescript
// lib/api.ts
export const fetchCollections = async (): Promise<Collection[]> => {
  const response = await fetch('/api/collections', {
    next: { revalidate: 60 }, // Cache for 60 seconds
  });
  return response.json();
};
```

## Development Scripts

### package.json scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

## Quality Assurance

### ESLint Configuration
```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

### Prettier Configuration
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

## Testing Setup
```bash
npm install -D jest @testing-library/react @testing-library/jest-dom
npm install -D jest-environment-jsdom
```

## Environment Variables
```env
# .env.local
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
DATABASE_URL=postgresql://...
REDIS_URL=redis://localhost:6379
PINATA_API_KEY=your_pinata_key
PINATA_SECRET_KEY=your_pinata_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

---
**Status**: ✅ Frontend Foundation Ready
**Dependencies**: Checkpoint 01 completed
**Estimated Time**: 1-2 days
**Next**: Checkpoint 03 - Wallet Integration