
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AppleTableHead } from '@/components/ui/apple-table';
import { ChevronUp, ChevronDown, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ColumnConfig } from '@/hooks/useColumnConfiguration';

interface DraggableTableHeaderProps {
  column: ColumnConfig;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (field: string) => void;
  children: React.ReactNode;
}

export const DraggableTableHeader: React.FC<DraggableTableHeaderProps> = ({
  column,
  sortField,
  sortDirection,
  onSort,
  children
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
    disabled: column.fixed,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSort = () => {
    if (column.sortable && onSort) {
      onSort(column.id);
    }
  };

  return (
    <AppleTableHead
      ref={setNodeRef}
      style={style}
      className={cn(
        column.width,
        column.sortable && 'cursor-pointer hover:bg-muted/50',
        isDragging && 'opacity-50 z-50',
        'relative group'
      )}
      onClick={handleSort}
    >
      <div className="flex items-center gap-2">
        {!column.fixed && (
          <div
            {...attributes}
            {...listeners}
            className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-1 -ml-1"
          >
            <GripVertical className="h-3 w-3 text-muted-foreground" />
          </div>
        )}
        
        <div className="flex items-center gap-2 flex-1">
          {children}
          {column.sortable && sortField === column.id && (
            sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </div>
    </AppleTableHead>
  );
};
