
import React from 'react';
import Header from '@/components/Header';

interface AppleLayoutProps {
  children: React.ReactNode;
}

const AppleLayout: React.FC<AppleLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <Header />
      <main className="flex-1 p-4 lg:p-6 xl:p-8">
        <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppleLayout;
