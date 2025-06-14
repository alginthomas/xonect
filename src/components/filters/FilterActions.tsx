
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowUp, X, Filter, MoreHorizontal } from 'lucide-react';
import { ColumnSettings } from '@/components/ColumnSettings';
import type { ColumnConfig } from '@/hooks/useColumnConfiguration';

interface FilterActionsProps {
  totalActiveFilters: number;
  onClearFilters: () => void;
  onExport: () => void;
  columns: ColumnConfig[];
  onToggleColumnVisibility: (columnId: string) => void;
  onResetColumns: () => void;
}

export const FilterActions: React.FC<FilterActionsProps> = ({
  totalActiveFilters,
  onClearFilters,
  onExport,
  columns,
  onToggleColumnVisibility,
  onResetColumns
}) => {
  return (
    <div className="flex items-center gap-3 ml-auto">
      {totalActiveFilters > 0 && (
        <>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-medium px-3 py-1">
            <Filter className="h-3 w-3 mr-1.5" />
            {totalActiveFilters} filter{totalActiveFilters > 1 ? 's' : ''} active
          </Badge>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearFilters} 
            className="h-8 px-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors duration-200"
          >
            <X className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        </>
      )}

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-10 gap-2 border-border/40 hover:border-border/60 hover:bg-white transition-all duration-200 font-medium">
              <MoreHorizontal className="h-4 w-4" />
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-white border border-border/40 shadow-lg">
            <DropdownMenuItem onClick={onExport} className="gap-2 font-medium">
              <ArrowUp className="h-4 w-4" />
              Export to CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ColumnSettings 
          columns={columns} 
          onToggleVisibility={onToggleColumnVisibility} 
          onReset={onResetColumns} 
        />
      </div>
    </div>
  );
};
