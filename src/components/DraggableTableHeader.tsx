
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AppleTableHead } from '@/components/ui/apple-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, ChevronsUpDown, GripVertical } from 'lucide-react';
import type { ColumnConfig } from '@/hooks/useColumnConfiguration';

interface DraggableTableHeaderProps {
  column: ColumnConfig;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  sortPriority?: number;
  onSort: (field: string, multiSelect?: boolean) => void;
  isAllSelected?: boolean;
  isPartiallySelected?: boolean;
  onSelectAll?: (selected: boolean) => void;
}

export const DraggableTableHeader: React.FC<DraggableTableHeaderProps> = ({
  column,
  sortField,
  sortDirection,
  sortPriority,
  onSort,
  isAllSelected,
  isPartiallySelected,
  onSelectAll
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: column.id,
    disabled: column.fixed
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isSorted = sortField === column.id;
  const showSortPriority = sortPriority && sortPriority > 1;

  const handleSort = (e: React.MouseEvent) => {
    e.preventDefault();
    if (column.sortable) {
      const multiSelect = e.ctrlKey || e.metaKey; // Ctrl/Cmd + click for multi-sort
      onSort(column.id, multiSelect);
    }
  };

  const getSortIcon = () => {
    if (!column.sortable) return null;
    
    if (!isSorted) {
      return <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />;
    }
    
    const IconComponent = sortDirection === 'asc' ? ChevronUp : ChevronDown;
    return (
      <div className="flex items-center gap-1">
        <IconComponent className="h-4 w-4" />
        {showSortPriority && (
          <span className="text-xs bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center">
            {sortPriority}
          </span>
        )}
      </div>
    );
  };

  if (column.id === 'select') {
    return (
      <AppleTableHead ref={setNodeRef} style={style} className={column.width}>
        <Checkbox
          checked={isAllSelected}
          ref={isPartiallySelected ? (el) => {
            if (el && el instanceof HTMLInputElement) {
              el.indeterminate = true;
            }
          } : undefined}
          onCheckedChange={onSelectAll}
        />
      </AppleTableHead>
    );
  }

  return (
    <AppleTableHead 
      ref={setNodeRef} 
      style={style} 
      className={`${column.width} ${column.sortable ? 'cursor-pointer' : ''} ${isSorted ? 'bg-muted/50' : ''}`}
    >
      <div className="flex items-center gap-2">
        {!column.fixed && (
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-3 w-3" />
          </Button>
        )}
        
        <div 
          className="flex items-center gap-2 flex-1"
          onClick={handleSort}
          title={column.sortable ? (
            `Click to sort by ${column.label}${column.sortable ? '. Ctrl+click for multi-sort.' : ''}`
          ) : undefined}
        >
          <span className="font-semibold">{column.label}</span>
          {getSortIcon()}
        </div>
      </div>
    </AppleTableHead>
  );
};
