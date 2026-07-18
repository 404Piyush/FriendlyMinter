'use client';

import React, { ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
  className?: string;
  showSidebar?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  className,
  showSidebar = true,
}) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />
      
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar - Hidden on mobile, shown on desktop */}
        {showSidebar && (
          <aside className="hidden lg:block">
            <Sidebar />
          </aside>
        )}
        
        {/* Main Content */}
        <main className={cn(
          'flex-1 overflow-auto',
          className
        )}>
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;