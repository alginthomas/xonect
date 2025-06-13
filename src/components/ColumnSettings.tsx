
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Settings, RotateCcw } from 'lucide-react';
import type { ColumnConfig } from '@/hooks/useColumnConfiguration';

interface ColumnSettingsProps {
  columns: ColumnConfig[];
  onToggleVisibility: (columnId: string) => void;
  onReset: () => void;
}

export const ColumnSettings: React.FC<ColumnSettingsProps> = ({
  columns,
  onToggleVisibility,
  onReset
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Column Visibility</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {columns.filter(col => !col.fixed).map((column) => (
          <DropdownMenuItem
            key={column.id}
            className="flex items-center gap-2 cursor-pointer"
            onSelect={(e) => e.preventDefault()}
          >
            <Checkbox
              checked={column.visible}
              onCheckedChange={() => onToggleVisibility(column.id)}
              onClick={(e) => e.stopPropagation()}
            />
            <span onClick={() => onToggleVisibility(column.id)} className="flex-1">
              {column.label}
            </span>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to Default
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
</DropdownMenuItem>

The checkbox click events now work correctly by stopping event propagation and making the label text clickable as well.
