'use client';

import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut } from 'lucide-react';

interface WalletButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export const WalletButton: React.FC<WalletButtonProps> = ({
  variant = 'default',
  size = 'default',
  className = '',
}) => {
  const { connected, connecting, disconnect, publicKey } = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant={variant} size={size} className={className} disabled>
        <Wallet className="h-4 w-4" />
        Loading...
      </Button>
    );
  }

  if (connected && publicKey) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-sm text-muted-foreground">
          {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
        </span>
        <Button
          variant="outline"
          size={size}
          onClick={disconnect}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <WalletMultiButton
      className={`
        !bg-primary !text-primary-foreground hover:!bg-primary/90
        !border-0 !rounded-md !font-medium !transition-colors
        !flex !items-center !gap-2 !px-4 !py-2
        ${size === 'sm' ? '!text-sm !px-3 !py-1.5' : ''}
        ${size === 'lg' ? '!text-lg !px-6 !py-3' : ''}
        ${className}
      `}
    >
      {connecting ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          Connecting...
        </>
      ) : (
        <>
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </>
      )}
    </WalletMultiButton>
  );
};

export default WalletButton;