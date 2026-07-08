"use client";

import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Button } from "@/components/ui/button";
import { LogOut, Wallet, ChevronDown } from "lucide-react";

interface WalletButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
  className?: string;
}

export const WalletButton: React.FC<WalletButtonProps> = ({
  variant = "default",
  size = "default",
  className = "",
}) => {
  const { connected, connecting, disconnect, publicKey } = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant={variant} size={size} className={className} disabled>
        Loading…
      </Button>
    );
  }

  if (connected && publicKey) {
    const pk = publicKey.toString();
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <div className="flex items-center gap-2 rounded-[3px] border border-border bg-secondary px-3 py-1.5 font-mono text-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-success live-dot" />
          {pk.slice(0, 4)}…{pk.slice(-4)}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={disconnect}
          aria-label="Disconnect"
          className="text-muted-foreground hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <WalletMultiButton
      className={`
        !bg-primary !text-primary-foreground hover:!bg-primary/85
        !border-0 !rounded-[3px] !font-medium !transition-colors
        !flex !items-center !gap-2 !px-3.5 !h-10 !text-sm
        ${size === "sm" ? "!text-xs !h-8" : ""}
        ${size === "lg" ? "!text-base !h-12 !px-5" : ""}
        ${className}
      `}
    >
      {connecting ? (
        <>
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
          Connecting
        </>
      ) : (
        <>
          <Wallet className="h-4 w-4" />
          Connect
        </>
      )}
    </WalletMultiButton>
  );
};

export default WalletButton;
