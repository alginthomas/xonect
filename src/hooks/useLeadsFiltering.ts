
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
    
    // If only remarks or status changed (same IDs, same order structure), maintain the previous order
    // but update the lead data
    if (previousSortedLeadsRef.current.length === newSortedIds.length) {
      const sameLeads = previousSortedLeadsRef.current.every(id => newSortedIds.includes(id));
      
      if (sameLeads) {
        // Check if this is likely just a remarks/status update by seeing if only those fields changed
        const onlyRemarksOrStatusChanged = previousSortedLeadsRef.current.every(id => {
          const prevData = previousLeadsDataRef.current.get(id);
          const currentData = currentLeadsData.get(id);
          
          if (!prevData || !currentData) return false;
          
          // Check if only remarks or status changed
          const remarksChanged = prevData.remarks !== currentData.remarks;
          const statusChanged = prevData.status !== currentData.status;
          
          return remarksChanged || statusChanged;
        });
        
        if (onlyRemarksOrStatusChanged) {
          const preservedOrder = previousSortedLeadsRef.current.map(id => 
            newSorted.find(lead => lead.id === id)
          ).filter(Boolean);
          
          if (preservedOrder.length === newSorted.length) {
            previousSortedLeadsRef.current = newSortedIds;
            previousLeadsDataRef.current = currentLeadsData;
            return preservedOrder;
          }
        }
      }
    }
    
    // Update the references for next comparison
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
