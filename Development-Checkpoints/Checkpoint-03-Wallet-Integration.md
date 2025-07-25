# Checkpoint 03: Solana Wallet Integration

## Objective
Implement comprehensive Solana wallet integration using @solana/wallet-adapter with support for multiple wallets, connection states, and security best practices.

## Prerequisites
- Checkpoint 02 completed (Next.js setup)
- Understanding of Solana wallet concepts
- Basic knowledge of React Context API

## Core Dependencies
```bash
npm install @solana/wallet-adapter-base \
            @solana/wallet-adapter-react \
            @solana/wallet-adapter-react-ui \
            @solana/wallet-adapter-wallets \
            @solana/web3.js
```

## Supported Wallets
```bash
npm install @solana/wallet-adapter-phantom \
            @solana/wallet-adapter-solflare \
            @solana/wallet-adapter-backpack \
            @solana/wallet-adapter-glow \
            @solana/wallet-adapter-slope \
            @solana/wallet-adapter-sollet \
            @solana/wallet-adapter-torus
```

## Wallet Provider Setup

### components/wallet/WalletProvider.tsx
```typescript
'use client';

import React, { FC, ReactNode, useMemo } from 'react';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  BackpackWalletAdapter,
  GlowWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import {
  WalletModalProvider,
} from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

interface Props {
  children: ReactNode;
}

export const WalletContextProvider: FC<Props> = ({ children }) => {
  // Network configuration
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => {
    if (process.env.NEXT_PUBLIC_SOLANA_RPC_URL) {
      return process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
    }
    return clusterApiUrl(network);
  }, [network]);

  // Wallet configuration
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new BackpackWalletAdapter(),
      new GlowWalletAdapter(),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
```

### app/layout.tsx Integration
```typescript
import { WalletContextProvider } from '@/components/wallet/WalletProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletContextProvider>
          {children}
        </WalletContextProvider>
      </body>
    </html>
  );
}
```

## Custom Wallet Components

### components/wallet/WalletButton.tsx
```typescript
'use client';

import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Copy, LogOut, Wallet } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export const WalletButton: React.FC = () => {
  const { publicKey, wallet, disconnect, connecting, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { toast } = useToast();

  const handleConnect = () => {
    setVisible(true);
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      toast({
        title: 'Wallet Disconnected',
        description: 'Your wallet has been disconnected successfully.',
      });
    } catch (error) {
      console.error('Disconnect error:', error);
      toast({
        title: 'Disconnect Error',
        description: 'Failed to disconnect wallet. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const copyAddress = async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey.toBase58());
      toast({
        title: 'Address Copied',
        description: 'Wallet address copied to clipboard.',
      });
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  if (!connected) {
    return (
      <Button
        onClick={handleConnect}
        disabled={connecting}
        className="flex items-center gap-2"
      >
        <Wallet className="h-4 w-4" />
        {connecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          {wallet?.adapter.icon && (
            <img
              src={wallet.adapter.icon}
              alt={wallet.adapter.name}
              className="h-4 w-4"
            />
          )}
          {publicKey && formatAddress(publicKey.toBase58())}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={copyAddress} className="cursor-pointer">
          <Copy className="mr-2 h-4 w-4" />
          Copy Address
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleDisconnect}
          className="cursor-pointer text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
```

### components/wallet/WalletStatus.tsx
```typescript
'use client';

import React from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, Zap, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export const WalletStatus: React.FC = () => {
  const { publicKey, connected, wallet } = useWallet();
  const { connection } = useConnection();

  const { data: balance, isLoading: balanceLoading } = useQuery({
    queryKey: ['wallet-balance', publicKey?.toBase58()],
    queryFn: async () => {
      if (!publicKey || !connection) return 0;
      const balance = await connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    },
    enabled: !!publicKey && !!connection,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: networkStatus } = useQuery({
    queryKey: ['network-status'],
    queryFn: async () => {
      if (!connection) return null;
      const health = await connection.getHealth();
      const slot = await connection.getSlot();
      return { health, slot };
    },
    enabled: !!connection,
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  if (!connected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <span className="text-sm text-muted-foreground">
              No wallet connected
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Wallet Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Wallet:</span>
          <Badge variant="secondary">{wallet?.adapter.name}</Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Balance:</span>
          <span className="text-sm">
            {balanceLoading ? (
              'Loading...'
            ) : (
              `${balance?.toFixed(4) || '0'} SOL`
            )}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Network:</span>
          <div className="flex items-center gap-2">
            <Zap className="h-3 w-3 text-green-500" />
            <span className="text-sm">
              {process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet'}
            </span>
          </div>
        </div>

        {networkStatus && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Slot:</span>
            <span className="text-sm font-mono">
              {networkStatus.slot.toLocaleString()}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
```

## Connection State Management

### hooks/useWalletConnection.ts
```typescript
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

export const useWalletConnection = () => {
  const { connected, connecting, publicKey, wallet } = useWallet();
  const { connection } = useConnection();
  const { toast } = useToast();
  const [isReady, setIsReady] = useState(false);

  // Check if wallet is ready for transactions
  useEffect(() => {
    setIsReady(connected && !!publicKey && !!connection);
  }, [connected, publicKey, connection]);

  // Handle connection errors
  const handleConnectionError = useCallback((error: Error) => {
    console.error('Wallet connection error:', error);
    toast({
      title: 'Connection Error',
      description: error.message || 'Failed to connect to wallet',
      variant: 'destructive',
    });
  }, [toast]);

  // Validate sufficient balance for transaction
  const checkBalance = useCallback(async (requiredAmount: number = 0.001) => {
    if (!publicKey || !connection) return false;
    
    try {
      const balance = await connection.getBalance(publicKey);
      const solBalance = balance / 1e9; // Convert lamports to SOL
      
      if (solBalance < requiredAmount) {
        toast({
          title: 'Insufficient Balance',
          description: `You need at least ${requiredAmount} SOL for this transaction.`,
          variant: 'destructive',
        });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Balance check error:', error);
      return false;
    }
  }, [publicKey, connection, toast]);

  return {
    connected,
    connecting,
    publicKey,
    wallet,
    connection,
    isReady,
    handleConnectionError,
    checkBalance,
  };
};
```

## Security Best Practices

### 1. Transaction Verification Component
```typescript
// components/wallet/TransactionPreview.tsx
'use client';

import React from 'react';
import { Transaction } from '@solana/web3.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Info } from 'lucide-react';

interface TransactionPreviewProps {
  transaction: Transaction;
  estimatedFee?: number;
}

export const TransactionPreview: React.FC<TransactionPreviewProps> = ({
  transaction,
  estimatedFee,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Transaction Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <span className="text-sm text-yellow-800">
            Please review this transaction carefully before signing.
          </span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Instructions:</span>
            <Badge variant="secondary">
              {transaction.instructions.length}
            </Badge>
          </div>
          
          {estimatedFee && (
            <div className="flex justify-between">
              <span className="text-sm font-medium">Estimated Fee:</span>
              <span className="text-sm">{estimatedFee} SOL</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-sm font-medium">Recent Blockhash:</span>
            <span className="text-xs font-mono">
              {transaction.recentBlockhash?.slice(0, 8)}...
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
```

### 2. Network Validation
```typescript
// lib/networkValidation.ts
import { Connection, clusterApiUrl } from '@solana/web3.js';

export const validateNetwork = async (connection: Connection): Promise<boolean> => {
  try {
    const genesisHash = await connection.getGenesisHash();
    const expectedHash = process.env.NEXT_PUBLIC_EXPECTED_GENESIS_HASH;
    
    if (expectedHash && genesisHash !== expectedHash) {
      console.warn('Network mismatch detected');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Network validation error:', error);
    return false;
  }
};
```

### 3. Input Sanitization
```typescript
// lib/validation.ts
import { z } from 'zod';
import { PublicKey } from '@solana/web3.js';

export const walletAddressSchema = z.string().refine(
  (address) => {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  },
  { message: 'Invalid Solana wallet address' }
);

export const validateWalletAddress = (address: string): boolean => {
  return walletAddressSchema.safeParse(address).success;
};
```

## Error Handling

### components/wallet/WalletErrorBoundary.tsx
```typescript
'use client';

import React, { Component, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class WalletErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Wallet error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Wallet Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {this.state.error?.message || 'An unexpected wallet error occurred.'}
            </p>
            <Button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
```

## Testing

### __tests__/wallet/WalletButton.test.tsx
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { WalletButton } from '@/components/wallet/WalletButton';
import { useWallet } from '@solana/wallet-adapter-react';

// Mock the wallet adapter
jest.mock('@solana/wallet-adapter-react');
const mockUseWallet = useWallet as jest.MockedFunction<typeof useWallet>;

describe('WalletButton', () => {
  it('shows connect button when not connected', () => {
    mockUseWallet.mockReturnValue({
      connected: false,
      connecting: false,
      publicKey: null,
      wallet: null,
      disconnect: jest.fn(),
    } as any);

    render(<WalletButton />);
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
  });

  it('shows wallet address when connected', () => {
    const mockPublicKey = {
      toBase58: () => 'ABC123...XYZ789',
    };

    mockUseWallet.mockReturnValue({
      connected: true,
      connecting: false,
      publicKey: mockPublicKey,
      wallet: { adapter: { name: 'Phantom', icon: 'icon.png' } },
      disconnect: jest.fn(),
    } as any);

    render(<WalletButton />);
    expect(screen.getByText(/ABC1...Z789/)).toBeInTheDocument();
  });
});
```

---
**Status**: ✅ Wallet Integration Complete
**Dependencies**: Checkpoint 02 completed
**Estimated Time**: 1-2 days
**Next**: Checkpoint 04 - Backend API Development