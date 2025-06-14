
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

interface ImportHistoryEmptyStateProps {
  searchQuery: string;
  onClearSearch: () => void;
}

export const ImportHistoryEmptyState: React.FC<ImportHistoryEmptyStateProps> = ({
  searchQuery,
  onClearSearch
}) => {
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
        <FileText className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">No import batches found</h3>
      <p className="text-muted-foreground mb-4">
        {searchQuery ? 'No batches match your search criteria.' : 'Start by importing some leads to see your batch history here.'}
      </p>
      {searchQuery && (
        <Button variant="outline" onClick={onClearSearch}>
          Clear Search
        </Button>
      )}
    </div>
  );
};
