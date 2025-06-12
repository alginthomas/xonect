
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp } from 'lucide-react';

interface MobilePaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading?: boolean;
}

export const MobilePagination: React.FC<MobilePaginationProps> = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onLoadMore,
  hasMore,
  isLoading = false
}) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div className="text-sm text-muted-foreground text-center">
        Showing {startIndex + 1} to {endIndex} of {totalItems} leads
      </div>
      
      {hasMore && (
        <Button
          variant="outline"
          onClick={onLoadMore}
          disabled={isLoading}
          className="w-full max-w-sm h-12"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Loading...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <ChevronUp className="h-4 w-4 rotate-180" />
              Load More Leads
            </div>
          )}
        </Button>
      )}
      
      {!hasMore && totalItems > itemsPerPage && (
        <div className="text-xs text-muted-foreground">
          All leads loaded
        </div>
      )}
    </div>
  );
};
