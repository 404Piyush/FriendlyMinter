"use client";

import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { getCurrentNetwork } from "@/lib/solana";
import { LogOut, Wallet } from "lucide-react";

export function WalletButton() {
  const { connected, connecting, disconnect, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const network = getCurrentNetwork();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-[-3px_-3px_6px_rgba(255,255,255,0.7),3px_3px_6px_rgba(20,241,149,0.3)] transition-shadow active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2),inset_-2px_-2px_4px_rgba(255,255,255,0.5)]"
        disabled
      >
        Loading…
      </button>
    );
  }

  if (connected && publicKey) {
    const pk = publicKey.toString();
    return (
      <div className="flex items-center gap-1">
        <div className="hidden items-center gap-2 border border-border bg-secondary px-3 font-mono text-xs sm:flex h-10">
          <span className="size-1.5 rounded-full bg-success live-dot" />
          {pk.slice(0, 4)}…{pk.slice(-4)}
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{network}</span>
        </div>
        <button
          onClick={() => setVisible(true)}
          className="flex h-10 items-center gap-2 border border-border bg-secondary px-3 text-sm transition-colors hover:bg-foreground hover:text-background sm:hidden"
        >
          <span className="size-1.5 rounded-full bg-success live-dot" />
          {pk.slice(0, 4)}…{pk.slice(-4)}
        </button>
        <button
          onClick={disconnect}
          aria-label="Disconnect"
          className="flex size-10 items-center justify-center text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setVisible(true)}
      className="group inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-[-3px_-3px_6px_rgba(255,255,255,0.7),3px_3px_6px_rgba(20,241,149,0.3)] transition-shadow active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2),inset_-2px_-2px_4px_rgba(255,255,255,0.5)]"
    >
      {connecting ? (
        <>
          <span className="size-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
          <span>Connecting</span>
        </>
      ) : (
        <>
          <Wallet className="size-4 transition-transform duration-200 group-hover:-rotate-12" />
          <span>Connect</span>
        </>
      )}
    </button>
  );
}
