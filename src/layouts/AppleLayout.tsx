
import React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import Header from '@/components/Header';

interface AppleLayoutProps {
  children: React.ReactNode;
}

const AppleLayout: React.FC<AppleLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <Header />
          <main className="flex-1 p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AppleLayout;
