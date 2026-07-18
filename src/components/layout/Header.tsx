"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { WalletButton } from "@/components/wallet/WalletButton";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Coins, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

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
  { name: "New collection", href: "/collections/create" },
  { name: "Jobs", href: "/jobs" },
  { name: "Demo", href: "/demo" },
  { name: "Docs", href: "/docs" },
];

export const Header: React.FC = () => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center bg-primary text-primary-foreground">
            <Coins className="size-4" strokeWidth={2.5} />
          </div>
          <span className="text-base font-semibold tracking-tight">FriendlyMinter</span>
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
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center bg-primary text-primary-foreground">
                    <Coins className="size-4" strokeWidth={2.5} />
                  </div>
                  <span className="text-base font-semibold tracking-tight">FriendlyMinter</span>
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
