
import React, { useMemo } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { AppleTable, AppleTableHeader, AppleTableBody, AppleTableHead, AppleTableRow, AppleTableCell } from '@/components/ui/apple-table';
import { DraggableTableHeader } from '@/components/DraggableTableHeader';
import { LeadTableCell } from '@/components/LeadTableCell';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Lead } from '@/types/lead';
import type { Category } from '@/types/category';

interface LeadsTableProps {
  leads: Lead[];
  categories: Category[];
  selectedLeads: Set<string>;
  columns: any[];
  visibleColumns: any[];
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onSort: (field: string) => void;
  onSelectLead: (leadId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onStatusChange: (leadId: string, status: any) => void;
  onRemarksUpdate: (leadId: string, remarks: string) => void;
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
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  // Mobile-optimized column visibility
  const activeColumns = useMemo(() => {
    if (!isMobile) return visibleColumns;
    return visibleColumns.filter(col => ['select', 'name', 'status', 'actions'].includes(col.id));
  }, [visibleColumns, isMobile]);

  // Calculate checkbox state for select all
  const currentPageLeadIds = leads.map(lead => lead.id);
  const selectedCurrentPageCount = currentPageLeadIds.filter(id => selectedLeads.has(id)).length;
  const isAllCurrentPageSelected = currentPageLeadIds.length > 0 && selectedCurrentPageCount === currentPageLeadIds.length;
  const isPartialSelection = selectedCurrentPageCount > 0 && selectedCurrentPageCount < currentPageLeadIds.length;

  const handleSelectAllCurrentPage = (checked: boolean) => {
    if (checked) {
      currentPageLeadIds.forEach(id => {
        if (!selectedLeads.has(id)) {
          onSelectLead(id, true);
        }
      });
    } else {
      currentPageLeadIds.forEach(id => {
        if (selectedLeads.has(id)) {
          onSelectLead(id, false);
        }
      });
    }
  };

  if (isMobile) {
    return null; // Mobile uses DateGroupedLeads component instead
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <AppleTable>
        <AppleTableHeader>
          <AppleTableRow>
            <SortableContext
              items={activeColumns.map(col => col.id)}
              strategy={horizontalListSortingStrategy}
            >
              {activeColumns.map((column) => (
                <DraggableTableHeader
                  key={column.id}
                  column={column}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={onSort}
                  isAllSelected={isAllCurrentPageSelected}
                  isPartiallySelected={isPartialSelection}
                  onSelectAll={handleSelectAllCurrentPage}
                />
              ))}
            </SortableContext>
          </AppleTableRow>
        </AppleTableHeader>
        <AppleTableBody>
          {leads.map((lead) => (
            <AppleTableRow
              key={lead.id}
              className={`cursor-pointer transition-colors ${
                selectedLeads.has(lead.id) ? 'bg-muted/50' : 'hover:bg-muted/30'
              }`}
              onClick={() => onViewDetails(lead)}
            >
              {activeColumns.map((column) => (
                <AppleTableCell 
                  key={column.id} 
                  className="py-3"
                  onClick={(e) => {
                    if (column.id === 'select' || column.id === 'status' || column.id === 'remarks' || column.id === 'actions') {
                      e.stopPropagation();
                    }
                  }}
                >
                  <LeadTableCell
                    columnId={column.id}
                    lead={lead}
                    categories={categories}
                    selectedLeads={selectedLeads}
                    onSelectLead={onSelectLead}
                    onStatusChange={onStatusChange}
                    onRemarksUpdate={onRemarksUpdate}
                    onEmailClick={onEmailClick}
                    onViewDetails={onViewDetails}
                    onDeleteLead={onDeleteLead}
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
