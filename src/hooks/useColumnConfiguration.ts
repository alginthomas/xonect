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
  { id: 'name', label: 'Name', width: 'w-64', sortable: true, visible: true },
  { id: 'status', label: 'Status', width: 'w-32', sortable: true, visible: true },
  { id: 'company', label: 'Company', width: 'w-48', sortable: true, visible: true },
  { id: 'phone', label: 'Phone', width: 'w-36', sortable: false, visible: true },
  { id: 'email', label: 'Email', width: 'w-48', sortable: false, visible: true },
  { id: 'category', label: 'Category', width: 'w-32', sortable: true, visible: true },
  { id: 'remarks', label: 'Quick Remarks', width: 'w-48', sortable: true, visible: true },
  { id: 'actions', label: 'Actions', width: 'w-32', sortable: false, visible: true, fixed: true },
  { id: 'linkedin', label: 'LinkedIn', width: 'w-32', sortable: false, visible: false },
  { id: 'location', label: 'Location', width: 'w-36', sortable: true, visible: false },
  { id: 'industry', label: 'Industry', width: 'w-36', sortable: true, visible: false },
  { id: 'companySize', label: 'Company Size', width: 'w-32', sortable: true, visible: false },
  { id: 'seniority', label: 'Seniority', width: 'w-32', sortable: true, visible: false },
  { id: 'emailsSent', label: 'Emails Sent', width: 'w-28', sortable: true, visible: false },
  { id: 'lastContact', label: 'Last Contact', width: 'w-32', sortable: true, visible: false },
  { id: 'createdAt', label: 'Created', width: 'w-32', sortable: true, visible: false },
  { id: 'website', label: 'Website', width: 'w-32', sortable: false, visible: false },
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
          // Fix legacy 'created' column mapping to 'createdAt'
          if (col.id === 'created') {
            return { ...col, id: 'createdAt', label: 'Created' };
          }
          return col;
        });
        
        // Ensure all required columns exist
        const requiredColumns = defaultColumns.map(col => col.id);
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
