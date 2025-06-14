
import { useState, useEffect } from 'react';

export interface ColumnConfig {
  id: string;
  label: string;
  width?: string;
  sortable: boolean;
  visible: boolean;
  fixed?: boolean;
}

const defaultColumns: ColumnConfig[] = [
  { id: 'select', label: 'Select', width: 'w-12', sortable: false, visible: true, fixed: true },
  { id: 'status', label: 'Status', width: 'w-24', sortable: true, visible: true },
  { id: 'remarks', label: 'Quick Remarks', width: 'w-48', sortable: false, visible: true },
  { id: 'actions', label: 'Actions', width: 'w-32', sortable: false, visible: true, fixed: true },
  { id: 'name', label: 'Name', sortable: true, visible: true },
  { id: 'company', label: 'Company', sortable: true, visible: true },
  { id: 'phone', label: 'Phone', sortable: false, visible: true },
  { id: 'email', label: 'Email', sortable: false, visible: true },
  { id: 'category', label: 'Category', sortable: false, visible: true },
  { id: 'created', label: 'Created', sortable: true, visible: true },
];

export const useColumnConfiguration = () => {
  const [columns, setColumns] = useState<ColumnConfig[]>(() => {
    const saved = localStorage.getItem('leadsTableColumns');
    if (saved) {
      try {
        const parsedColumns = JSON.parse(saved);
        
        // Fix legacy 'contact' column mapping to 'phone'
        const updatedColumns = parsedColumns.map((col: ColumnConfig) => {
          if (col.id === 'contact') {
            return { ...col, id: 'phone', label: 'Phone' };
          }
          return col;
        });
        
        // Ensure all required columns exist
        const requiredColumns = ['select', 'status', 'remarks', 'actions', 'name', 'company', 'phone', 'email', 'category', 'created'];
        const missingColumns = requiredColumns.filter(id => !updatedColumns.some((col: ColumnConfig) => col.id === id));
        
        // Add missing columns from defaults
        missingColumns.forEach(id => {
          const defaultCol = defaultColumns.find(col => col.id === id);
          if (defaultCol) {
            updatedColumns.push(defaultCol);
          }
        });
        
        return updatedColumns;
      } catch (e) {
        console.warn('Failed to parse saved columns, using defaults');
        return defaultColumns;
      }
    }
    return defaultColumns;
  });

  useEffect(() => {
    localStorage.setItem('leadsTableColumns', JSON.stringify(columns));
  }, [columns]);

  const reorderColumns = (activeId: string, overId: string) => {
    setColumns(prev => {
      const oldIndex = prev.findIndex(col => col.id === activeId);
      const newIndex = prev.findIndex(col => col.id === overId);
      
      if (oldIndex === -1 || newIndex === -1) return prev;
      if (prev[oldIndex].fixed) return prev;
      
      const newColumns = [...prev];
      const [movedColumn] = newColumns.splice(oldIndex, 1);
      
      let insertIndex = newIndex;
      if (newColumns[newIndex]?.fixed && newIndex > oldIndex) {
        insertIndex = newIndex + 1;
      } else if (newColumns[newIndex]?.fixed && newIndex < oldIndex) {
        insertIndex = newIndex;
      }
      
      newColumns.splice(insertIndex, 0, movedColumn);
      return newColumns;
    });
  };

  const toggleColumnVisibility = (columnId: string) => {
    setColumns(prev =>
      prev.map(col =>
        col.id === columnId ? { ...col, visible: !col.visible } : col
      )
    );
  };

  const resetToDefault = () => {
    setColumns(defaultColumns);
  };

  const visibleColumns = columns.filter(col => col.visible);

  return {
    columns,
    visibleColumns,
    reorderColumns,
    toggleColumnVisibility,
    resetToDefault,
  };
};
