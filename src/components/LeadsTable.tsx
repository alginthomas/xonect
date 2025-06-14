
import React, { useMemo } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { AppleTable, AppleTableHeader, AppleTableBody, AppleTableRow, AppleTableCell } from '@/components/ui/apple-table';
import { DraggableTableHeader } from '@/components/DraggableTableHeader';
import { LeadTableCell } from '@/components/LeadTableCell';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Lead, LeadStatus, RemarkEntry } from '@/types/lead';
import type { Category } from '@/types/category';
import type { ColumnConfig } from '@/hooks/useColumnConfiguration';

interface LeadsTableProps {
  leads: Lead[];
  categories: Category[];
  selectedLeads: Set<string>;
  columns: ColumnConfig[];
  visibleColumns: ColumnConfig[];
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  onSort: (field: string) => void;
  onSelectLead: (leadId: string) => void;
  onSelectAll: (selected: boolean) => void;
  onStatusChange: (leadId: string, status: LeadStatus) => void;
  onRemarksUpdate: (leadId: string, remarks: string, remarksHistory: RemarkEntry[]) => void;
  onEmailClick: (lead: Lead) => void;
  onViewDetails: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
  onDragEnd: (event: any) => void;
}

export const LeadsTable: React.FC<LeadsTableProps> = ({
  leads,
  categories,
  selectedLeads,
  columns,
  visibleColumns,
  sortField,
  sortDirection,
  onSort,
  onSelectLead,
  onSelectAll,
  onStatusChange,
  onRemarksUpdate,
  onEmailClick,
  onViewDetails,
  onDeleteLead,
  onDragEnd
}) => {
  const isMobile = useIsMobile();
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const columnIds = useMemo(() => visibleColumns.map(col => col.id), [visibleColumns]);
  
  const isAllSelected = leads.length > 0 && leads.every(lead => selectedLeads.has(lead.id));
  const isPartiallySelected = !isAllSelected && leads.some(lead => selectedLeads.has(lead.id));

  if (isMobile) {
    return null; // Mobile uses DateGroupedLeads component instead
  }

  // Create a stable handler for remarks updates to prevent unnecessary re-renders
  const handleRemarksUpdate = React.useCallback((leadId: string, remarks: string, remarksHistory: RemarkEntry[]) => {
    console.log('LeadsTable: handleRemarksUpdate called for lead:', leadId);
    onRemarksUpdate(leadId, remarks, remarksHistory);
  }, [onRemarksUpdate]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <AppleTable>
        <AppleTableHeader>
          <AppleTableRow>
            <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
              {visibleColumns.map((column) => (
                <DraggableTableHeader
                  key={column.id}
                  column={column}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={onSort}
                  isAllSelected={isAllSelected}
                  isPartiallySelected={isPartiallySelected}
                  onSelectAll={onSelectAll}
                />
              ))}
            </SortableContext>
          </AppleTableRow>
        </AppleTableHeader>
        <AppleTableBody>
          {leads.map((lead) => (
            <AppleTableRow key={lead.id}>
              {visibleColumns.map((column) => (
                <AppleTableCell key={`${lead.id}-${column.id}`} className={column.width || ''}>
                  <LeadTableCell
                    columnId={column.id}
                    lead={lead}
                    categories={categories}
                    selectedLeads={selectedLeads}
                    onSelectLead={(leadId, selected) => onSelectLead(leadId)}
                    onStatusChange={onStatusChange}
                    onRemarksUpdate={handleRemarksUpdate}
                    onEmailClick={() => onEmailClick(lead)}
                    onViewDetails={() => onViewDetails(lead)}
                    onDeleteLead={() => onDeleteLead(lead.id)}
                  />
                </AppleTableCell>
              ))}
            </AppleTableRow>
          ))}
        </AppleTableBody>
      </AppleTable>
    </DndContext>
  );
};
