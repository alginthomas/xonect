
import React from 'react';
import { BarChart3 } from 'lucide-react';

export const ImportHistoryHeader: React.FC = () => {
  return (
    <div className="text-center space-y-2">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
        <BarChart3 className="h-8 w-8 text-blue-600" />
      </div>
      <h1 className="text-2xl font-semibold">Import History</h1>
      <p className="text-muted-foreground max-w-md mx-auto">
        Track and manage all your CSV import batches
      </p>
    </div>
  );
};
