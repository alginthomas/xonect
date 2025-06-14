
import React from 'react';
import { Button } from '@/components/ui/button';

interface NavigationFilterIndicatorProps {
  navigationFilter?: { status?: string; [key: string]: any };
  onClearFilter: () => void;
}

export const NavigationFilterIndicator: React.FC<NavigationFilterIndicatorProps> = ({
  navigationFilter,
  onClearFilter
}) => {
  if (!navigationFilter?.status) return null;

  return (
    <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <span className="text-sm text-blue-700">
        Showing leads with status: <strong>{navigationFilter.status}</strong>
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearFilter}
        className="text-blue-700 hover:text-blue-900 h-6 px-2"
      >
        Clear filter
      </Button>
    </div>
  );
};
