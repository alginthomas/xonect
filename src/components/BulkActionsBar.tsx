
import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { X, Trash2 } from 'lucide-react';
import type { LeadStatus } from '@/types/lead';

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkAction: (action: 'delete' | 'status', value?: string) => void;
}

const allStatuses: LeadStatus[] = [
  'New', 'Contacted', 'Opened', 'Clicked', 'Replied', 
  'Qualified', 'Unqualified', 'Call Back', 'Unresponsive', 
  'Not Interested', 'Interested'
];

export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  onClearSelection,
  onBulkAction
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="sticky top-20 z-20 bg-primary/5 backdrop-blur-sm border border-primary/20 rounded-lg p-3 mx-1">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-primary">
          {selectedCount} selected
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="h-6 w-6 p-0 text-primary hover:bg-primary/10"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">
              Update Status
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {allStatuses.map(status => (
              <DropdownMenuItem
                key={status}
                onClick={() => onBulkAction('status', status)}
              >
                Mark as {status}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onBulkAction('delete')}
          className="text-red-600 hover:text-red-700 h-8 text-xs px-3"
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Delete
        </Button>
      </div>
    </div>
  );
};
