"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { WalletButton } from "@/components/wallet/WalletButton";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Coins, Plus, FileText, Settings, TestTube, ArrowUpRight, Activity, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutGrid, code: "00" },
  { name: "Collections", href: "/collections", icon: FileText, code: "01" },
  { name: "Create", href: "/collections/create", icon: Plus, code: "02" },
  { name: "Jobs", href: "/jobs", icon: Activity, code: "03" },
  { name: "Demo", href: "/demo", icon: TestTube, code: "04" },
  { name: "Docs", href: "/docs", icon: ArrowUpRight, code: "05" },
];

export const Header: React.FC = () => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-[3px] bg-primary text-primary-foreground">
            <Coins className="h-4 w-4" strokeWidth={2.5} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-lg font-medium leading-none tracking-tight">
              FriendlyMinter
            </span>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:inline">
              v0.3 · devnet
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center gap-2 rounded-[3px] px-3 py-1.5 text-sm transition-colors",
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
              >
                <span className="font-mono text-[10px] text-muted-foreground/60 group-hover:text-primary">
                  {item.code}
                </span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right side: wallet + mobile menu */}
        <div className="flex items-center gap-2">
          <Link
            href="/settings"
            className="hidden h-9 w-9 items-center justify-center rounded-[3px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:flex"
            aria-label="Settings"
          >
            <Settings className="h-4 w-4" />
          </Link>
          <WalletButton />

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[320px] border-l border-border bg-background p-0"
            >
              <div className="border-b border-border p-5">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-[3px] bg-primary text-primary-foreground">
                    <Coins className="h-4 w-4" strokeWidth={2.5} />
                  </div>
                  <span className="font-serif text-lg font-medium">FriendlyMinter</span>
                </div>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Compressed NFT platform · devnet
                </p>
              </div>
              <nav className="flex flex-col p-3">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between gap-2 rounded-[3px] px-3 py-2.5 text-sm transition-colors",
                        isActive
                          ? "bg-secondary text-foreground"
                          : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                      )}
                    >
                      <span>{item.name}</span>
                      <span className="font-mono text-[10px] text-muted-foreground/60">
                        {item.code}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
