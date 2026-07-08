"use client";

import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Button } from "@/components/ui/button";
import { LogOut, Wallet } from "lucide-react";

interface WalletButtonProps {
  className?: string;
}

export const WalletButton: React.FC<WalletButtonProps> = ({ className = "" }) => {
  const { connected, connecting, disconnect, publicKey } = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button className={className} disabled>
        Loading…
      </Button>
    );
  }

  if (connected && publicKey) {
    const pk = publicKey.toString();
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <div className="flex h-10 items-center gap-2 border border-border bg-secondary px-3 font-mono text-xs">
          <span className="size-1.5 rounded-full bg-success" />
          {pk.slice(0, 4)}…{pk.slice(-4)}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={disconnect}
          aria-label="Disconnect"
          className="text-muted-foreground hover:text-foreground"
        >
          <LogOut className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <WalletMultiButton
      className={`
        !bg-primary !text-primary-foreground hover:!bg-primary/85
        !border-0 !rounded-none !font-medium !transition-colors
        !flex !items-center !gap-2 !px-4 !h-10 !text-sm
        ${className}
      `}
    >
      {connecting ? (
        <>
          <div className="size-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
          Connecting
        </>
      ) : (
        <>
          <Wallet className="size-4" />
          Connect
        </>
      )}
    </WalletMultiButton>
  );
};

export default WalletButton;
