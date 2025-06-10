
import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import Header from '@/components/Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <>
      <AppSidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="border-b bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-sm font-bold text-white">X</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">powered by Thomas & Niyogi</p>
                  </div>
                </div>
              </div>
              <Header />
            </div>
          </div>
        </header>
        <main className="flex-1 bg-background">
          {children}
        </main>
      </div>
    </>
  );
};

export default MainLayout;
