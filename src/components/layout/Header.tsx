"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { WalletButton } from "@/components/wallet/WalletButton";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

function SolMark({ size = 18 }: { size?: number }) {
  // A stylised Solana "S" mark. Sharp, symmetric, three horizontal bars with
  // a centre disc — clearly inspired by the Solana logotype without being a
  // pixel-for-pixel copy.
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <rect x="2" y="5" width="20" height="2.5" fill="currentColor" />
      <rect x="2" y="10.75" width="20" height="2.5" fill="currentColor" opacity="0.7" />
      <rect x="2" y="16.5" width="20" height="2.5" fill="currentColor" />
    </svg>
  );
}

function NavLink({ href, name, isActive }: { href: string; name: string; isActive: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative cursor-pointer px-3 py-1.5 text-sm transition-colors duration-150",
        isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      )}
    >
      <span>{name}</span>
      <span
        className={cn(
          "pointer-events-none absolute inset-x-2 -bottom-px h-px origin-left scale-x-0 bg-foreground transition-transform duration-200 ease-out",
          isActive && "scale-x-100"
        )}
      />
    </Link>
  );
}

const navItems = [
  { name: "Dashboard", href: "/" },
  { name: "Collections", href: "/collections" },
  { name: "Demo", href: "/demo" },
  { name: "Docs", href: "/docs" },
];

export const Header: React.FC = () => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between gap-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center text-foreground transition-opacity group-hover:opacity-70">
            <SolMark size={20} />
          </div>
          <span className="font-serif text-lg leading-none tracking-tight text-foreground">
            Friendly<span className="text-foreground">Minter</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <NavLink
                key={item.name}
                href={item.href}
                name={item.name}
                isActive={isActive}
              />
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <Link
            href="/settings"
            className="hidden size-10 items-center justify-center text-muted-foreground hover:text-foreground sm:flex"
            aria-label="Settings"
          >
            <Settings className="size-4" />
          </Link>
          <WalletButton />

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] border-l border-border bg-background p-0">
              <div className="border-b border-border p-5">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center text-sol-green">
                    <SolMark size={18} />
                  </div>
                  <span className="text-sm font-semibold tracking-tight text-foreground">
                    FriendlyMinter
                  </span>
                </div>
              </div>
              <nav className="flex flex-col p-3">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "px-3 py-2.5 text-sm transition-colors",
                        isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                      )}
                    >
                      {item.name}
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
