
import { useMemo, useRef, useEffect } from 'react';
import type { LeadsFilteringProps, FilteringResult } from '@/types/filtering';
import { filterLeads } from '@/utils/leadsFiltering';
import { sortLeads } from '@/utils/leadsSorting';

export const useLeadsFiltering = ({
  leads,
  importBatches,
  selectedBatchId,
  searchQuery,
  searchTerm,
  selectedStatus,
  selectedCategory,
  selectedSeniority,
  selectedCompanySize,
  selectedLocation,
  selectedIndustry,
  selectedDataFilter,
  countryFilter,
  duplicatePhoneFilter,
  currentPage,
  itemsPerPage,
  sortField,
  sortDirection,
  setCurrentPage,
  navigationFilter
}: LeadsFilteringProps): FilteringResult => {
  // Keep track of the previous sorted order to maintain stability
  const previousSortedLeadsRef = useRef<string[]>([]);
  const previousLeadsDataRef = useRef<Map<string, { remarks: string; status: string }>>(new Map());
  
  // Memoized filtering to improve performance
  const filteredLeads = useMemo(() => {
    return filterLeads({
      leads,
      importBatches,
      selectedBatchId,
      searchQuery,
      searchTerm,
      selectedStatus,
      selectedCategory,
      selectedSeniority,
      selectedCompanySize,
      selectedLocation,
      selectedIndustry,
      selectedDataFilter,
      countryFilter,
      duplicatePhoneFilter,
      navigationFilter
    });
  }, [
    leads,
    importBatches,
    selectedBatchId,
    searchQuery,
    searchTerm,
    selectedStatus,
    selectedCategory,
    selectedSeniority,
    selectedCompanySize,
    selectedLocation,
    selectedIndustry,
    selectedDataFilter,
    countryFilter,
    duplicatePhoneFilter,
    navigationFilter
  ]);

  // Memoized sorting with stability for remarks and status updates
  const sortedLeads = useMemo(() => {
    const newSorted = sortLeads(filteredLeads, sortField, sortDirection);
    const newSortedIds = newSorted.map(lead => lead.id);
    
    // Create current data map for comparison
    const currentLeadsData = new Map(
      newSorted.map(lead => [
        lead.id, 
        { remarks: lead.remarks || '', status: lead.status }
      ])
    );
    
    // If we have the same leads as before, try to preserve order for minor updates
    if (previousSortedLeadsRef.current.length === newSortedIds.length) {
      const sameLeads = previousSortedLeadsRef.current.every(id => newSortedIds.includes(id));
      
      if (sameLeads) {
        // Check if only remarks or status changed (not other sortable fields)
        let onlyMinorChanges = true;
        
        for (const id of previousSortedLeadsRef.current) {
          const prevData = previousLeadsDataRef.current.get(id);
          const currentData = currentLeadsData.get(id);
          
          if (!prevData || !currentData) {
            onlyMinorChanges = false;
            break;
          }
          
          // Only preserve order if ONLY remarks or status changed
          const remarksChanged = prevData.remarks !== currentData.remarks;
          const statusChanged = prevData.status !== currentData.status;
          
          // If neither remarks nor status changed, but lead is in different position,
          // it means other fields changed that affect sorting
          if (!remarksChanged && !statusChanged) {
            const prevIndex = previousSortedLeadsRef.current.indexOf(id);
            const newIndex = newSortedIds.indexOf(id);
            if (prevIndex !== newIndex) {
              onlyMinorChanges = false;
              break;
            }
          }
        }
        
        if (onlyMinorChanges) {
          const preservedOrder = previousSortedLeadsRef.current.map(id => 
            newSorted.find(lead => lead.id === id)
          ).filter(Boolean);
          
          if (preservedOrder.length === newSorted.length) {
            console.log('Preserving lead order for minor updates');
            previousSortedLeadsRef.current = newSortedIds;
            previousLeadsDataRef.current = currentLeadsData;
            return preservedOrder;
          }
        }
      }
    }
    
    // Update the references for next comparison
    console.log('Applying new sort order');
    previousSortedLeadsRef.current = newSortedIds;
    previousLeadsDataRef.current = currentLeadsData;
    return newSorted;
  }, [filteredLeads, sortField, sortDirection]);

  // Reset references when sort criteria changes
  useEffect(() => {
    previousSortedLeadsRef.current = [];
    previousLeadsDataRef.current = new Map();
  }, [sortField, sortDirection]);

  // Pagination calculations
  const totalPages = Math.ceil(sortedLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLeads = sortedLeads.slice(startIndex, startIndex + itemsPerPage);

  // Reset to first page if current page is out of bounds
  if (currentPage > totalPages && totalPages > 0 && setCurrentPage) {
    setCurrentPage(1);
  }

  return {
    filteredLeads: paginatedLeads,
    sortedLeads,
    totalPages,
    totalLeads: sortedLeads.length
  };
};
