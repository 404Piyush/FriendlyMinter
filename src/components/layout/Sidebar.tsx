'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Coins,
  LayoutDashboard,
  FolderOpen,
  Plus,
  Settings,
  FileText,
  Activity,
  HelpCircle,
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    description: 'Overview and statistics',
  },
  {
    name: 'Collections',
    href: '/collections',
    icon: FolderOpen,
    description: 'Manage your NFT collections',
  },
  {
    name: 'Create Collection',
    href: '/collections/create',
    icon: Plus,
    description: 'Create a new collection',
  },
  {
    name: 'Mint Jobs',
    href: '/jobs',
    icon: Activity,
    description: 'Track minting progress',
  },
  {
    name: 'Documentation',
    href: '/docs',
    icon: FileText,
    description: 'API and usage guides',
  },
];

const secondaryNavigation = [
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
  {
    name: 'Help & Support',
    href: '/help',
    icon: HelpCircle,
  },
];

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const pathname = usePathname();

  return (
    <div className={cn('flex h-full w-64 flex-col bg-background border-r', className)}>
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2">
          <Coins className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">cNFT Platform</span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
                title={item.description}
              >
                <Icon className="mr-3 h-4 w-4 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Divider */}
        <div className="border-t my-4" />

        {/* Secondary Navigation */}
        <div className="space-y-1">
          {secondaryNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="mr-3 h-4 w-4 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="text-xs text-muted-foreground">
          <p className="font-medium">Solana Devnet</p>
          <p>Using Ankr RPC</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;