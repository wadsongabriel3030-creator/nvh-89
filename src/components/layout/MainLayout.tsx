import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useSidebarContext } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: ReactNode;
  hideSidebar?: boolean;
}

export function MainLayout({ children, hideSidebar = false }: MainLayoutProps) {
  const { isMobile } = useSidebarContext();

  if (hideSidebar) {
    return (
      <div className="min-h-screen bg-background">
        <main className="p-4 md:p-6 animate-fade-in">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div
        className={cn(
          'transition-all duration-300 ease-in-out',
          isMobile ? 'ml-0' : 'ml-64'
        )}
      >
        <Header />
        <main className="p-4 md:p-6 animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
