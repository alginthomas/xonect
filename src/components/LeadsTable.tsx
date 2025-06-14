
import React, { useMemo, useEffect, useRef } from 'react';
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
  allSortedLeads: Lead[]; // New prop to check if updated lead is on current page
  categories: Category[];
  selectedLeads: Set<string>;
  columns: ColumnConfig[];
  visibleColumns: ColumnConfig[];
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  currentPage: number;
  itemsPerPage: number;
  onSort: (field: string) => void;
  onSelectLead: (leadId: string) => void;
  onSelectAll: (selected: boolean) => void;
  onStatusChange: (leadId: string, status: LeadStatus) => void;
  onRemarksUpdate: (leadId: string, remarks: string, remarksHistory: RemarkEntry[]) => void;
  onEmailClick: (lead: Lead) => void;
  onViewDetails: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
  onDragEnd: (event: any) => void;
  lastUpdatedLeadId?: string | null;
  onPageChange: (page: number) => void; // New prop to handle page changes
}

export const LeadsTable: React.FC<LeadsTableProps> = ({
  leads,
  allSortedLeads,
  categories,
  selectedLeads,
  columns,
  visibleColumns,
  sortField,
  sortDirection,
  currentPage,
  itemsPerPage,
  onSort,
  onSelectLead,
  onSelectAll,
  onStatusChange,
  onRemarksUpdate,
  onEmailClick,
  onViewDetails,
  onDeleteLead,
  onDragEnd,
  lastUpdatedLeadId,
  onPageChange
}) => {
  // KEEP HOOKS CALLED UNCONDITIONALLY TO AVOID HOOK RULE ERRORS
  const isMobile = useIsMobile();
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const columnIds = useMemo(() => visibleColumns.map(col => col.id), [visibleColumns]);
  
  const isAllSelected = leads.length > 0 && leads.every(lead => selectedLeads.has(lead.id));
  const isPartiallySelected = !isAllSelected && leads.some(lead => selectedLeads.has(lead.id));

  // Refs for each lead row
  const leadRowRefs = useRef<{ [id: string]: HTMLTableRowElement | null }>({});

  // Check if the last updated lead is on the current page, if not, navigate to its page
  useEffect(() => {
    if (lastUpdatedLeadId && allSortedLeads.length > 0) {
      const updatedLeadIndex = allSortedLeads.findIndex(lead => lead.id === lastUpdatedLeadId);
      
      if (updatedLeadIndex !== -1) {
        // Calculate which page the updated lead should be on
        const updatedLeadPage = Math.floor(updatedLeadIndex / itemsPerPage) + 1;
        
        // If the updated lead is not on the current page, navigate to its page
        if (updatedLeadPage !== currentPage) {
          console.log(`Updated lead ${lastUpdatedLeadId} is on page ${updatedLeadPage}, navigating from page ${currentPage}`);
          onPageChange(updatedLeadPage);
          return; // Don't scroll yet, wait for page change
        }
      }
    }
  }, [lastUpdatedLeadId, allSortedLeads, currentPage, itemsPerPage, onPageChange]);

  // Effect: After table renders and lead is on correct page, scroll & highlight
  useEffect(() => {
    if (lastUpdatedLeadId && leadRowRefs.current[lastUpdatedLeadId]) {
      const leadRow = leadRowRefs.current[lastUpdatedLeadId];
      if (leadRow) {
        // Small delay to ensure the page transition is complete
        setTimeout(() => {
          leadRow.scrollIntoView({
            block: 'center', 
            behavior: 'smooth'
          });
          console.log(`Scrolled to updated lead: ${lastUpdatedLeadId}`);
        }, 100);
      }
    }
  }, [lastUpdatedLeadId, leads, currentPage]);

  // --- Only short-circuit JSX after all hooks above have run ---
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
            <AppleTableRow
              key={lead.id}
              ref={el => { leadRowRefs.current[lead.id] = el; }}
              className={lastUpdatedLeadId === lead.id 
                ? 'animate-pulse bg-green-50/80 border-green-200/50 transition-all duration-1000 shadow-sm' 
                : 'transition-all duration-200'
              }
            >
              {visibleColumns.map((column) => (
                <AppleTableCell key={`${lead.id}-${column.id}`} className={column.width || ''}>
                  <LeadTableCell
                    columnId={column.id}
                    lead={lead}
                    categories={categories}
                    selectedLeads={selectedLeads}
                    onSelectLead={(leadId, selected) => onSelectLead(leadId)}
                    onStatusChange={onStatusChange}
                    onRemarksUpdate={onRemarksUpdate}
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
