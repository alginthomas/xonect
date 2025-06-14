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

  // Memoized sorting with stability for remarks updates
  const sortedLeads = useMemo(() => {
    const newSorted = sortLeads(filteredLeads, sortField, sortDirection);
    const newSortedIds = newSorted.map(lead => lead.id);
    
    // If only remarks changed (same IDs, same order structure), maintain the previous order
    // but update the lead data
    if (previousSortedLeadsRef.current.length === newSortedIds.length) {
      const sameLeads = previousSortedLeadsRef.current.every(id => newSortedIds.includes(id));
      
      if (sameLeads) {
        // Check if this is likely just a remarks update by seeing if the general order is preserved
        // but data has been updated
        const preservedOrder = previousSortedLeadsRef.current.map(id => 
          newSorted.find(lead => lead.id === id)
        ).filter(Boolean);
        
        if (preservedOrder.length === newSorted.length) {
          previousSortedLeadsRef.current = newSortedIds;
          return preservedOrder;
        }
      }
    }
    
    // Update the reference for next comparison
    previousSortedLeadsRef.current = newSortedIds;
    return newSorted;
  }, [filteredLeads, sortField, sortDirection]);

  // Reset reference when sort criteria changes
  useEffect(() => {
    previousSortedLeadsRef.current = [];
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
