
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AppleTableHead } from '@/components/ui/apple-table';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronUp, ChevronDown, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ColumnConfig } from '@/hooks/useColumnConfiguration';

interface DraggableTableHeaderProps {
  column: ColumnConfig;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (field: string) => void;
  isAllSelected?: boolean;
  isPartiallySelected?: boolean;
  onSelectAll?: (checked: boolean) => void;
}

export const DraggableTableHeader: React.FC<DraggableTableHeaderProps> = ({
  column,
  sortField,
  sortDirection,
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

  const renderColumnContent = () => {
    if (column.id === 'select' && onSelectAll) {
      return (
        <Checkbox
          checked={isAllSelected}
          ref={(el: any) => {
            if (el) {
              const buttonElement = el.querySelector('button');
              if (buttonElement) {
                (buttonElement as any).indeterminate = isPartiallySelected || false;
              }
            }
          }}
          onCheckedChange={(checked) => onSelectAll(checked as boolean)}
          className="h-4 w-4"
        />
      );
    }
    return column.label;
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
      onClick={column.sortable ? handleSort : undefined}
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
          {renderColumnContent()}
          {column.sortable && sortField === column.id && (
            sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </div>
    </AppleTableHead>
  );
};
