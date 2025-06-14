import { useState, useEffect } from 'react';

export interface ColumnConfig {
  id: string;
  label: string;
  width?: string;
  sortable: boolean;
  visible: boolean;
  fixed?: boolean; // For checkbox and actions columns
}

const defaultColumns: ColumnConfig[] = [
  { id: 'select', label: 'Select', width: 'w-12', sortable: false, visible: true, fixed: true },
  { id: 'status', label: 'Status', width: 'w-24', sortable: true, visible: true },
  { id: 'remarks', label: 'Quick Remarks', width: 'w-48', sortable: false, visible: true },
  { id: 'actions', label: 'Actions', width: 'w-32', sortable: false, visible: true, fixed: true },
  { id: 'name', label: 'Name', sortable: true, visible: true },
  { id: 'company', label: 'Company', sortable: true, visible: true },
  { id: 'phone', label: 'Phone', sortable: false, visible: true },
  { id: 'category', label: 'Category', sortable: false, visible: true },
  { id: 'created', label: 'Created', sortable: true, visible: true },
];

export const useColumnConfiguration = () => {
  const [columns, setColumns] = useState<ColumnConfig[]>(() => {
    const saved = localStorage.getItem('leadsTableColumns');
    return saved ? JSON.parse(saved) : defaultColumns;
  });

  useEffect(() => {
    localStorage.setItem('leadsTableColumns', JSON.stringify(columns));
  }, [columns]);

  const reorderColumns = (activeId: string, overId: string) => {
    setColumns(prev => {
      const oldIndex = prev.findIndex(col => col.id === activeId);
      const newIndex = prev.findIndex(col => col.id === overId);
      
      if (oldIndex === -1 || newIndex === -1) return prev;
      
      // Don't allow moving fixed columns
      if (prev[oldIndex].fixed) return prev;
      
      const newColumns = [...prev];
      const [movedColumn] = newColumns.splice(oldIndex, 1);
      
      // Insert at the correct position, avoiding fixed columns
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
