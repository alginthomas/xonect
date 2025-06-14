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
  // Keep track of the stable order when no explicit sorting is applied
  const stableOrderRef = useRef<string[]>([]);
  const lastSortCriteriaRef = useRef<{ field?: string; direction?: 'asc' | 'desc' }>({});
  
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

  // Check if sort criteria has changed
  const sortCriteriaChanged = useMemo(() => {
    const current = { field: sortField, direction: sortDirection };
    const previous = lastSortCriteriaRef.current;
    return current.field !== previous.field || current.direction !== previous.direction;
  }, [sortField, sortDirection]);

  // Memoized sorting with complete stability preservation
  const sortedLeads = useMemo(() => {
    // If sort criteria changed, apply new sort and update stable order
    if (sortCriteriaChanged) {
      console.log('Sort criteria changed, applying new sort order');
      const newSorted = sortLeads(filteredLeads, sortField, sortDirection);
      const newOrder = newSorted.map(lead => lead.id);
      
      // Update references
      stableOrderRef.current = newOrder;
      lastSortCriteriaRef.current = { field: sortField, direction: sortDirection };
      
      return newSorted;
    }

    // If we have a stable order and same leads, preserve it completely
    if (stableOrderRef.current.length > 0) {
      const currentIds = new Set(filteredLeads.map(lead => lead.id));
      const stableIds = stableOrderRef.current.filter(id => currentIds.has(id));
      
      // Check if we have the same set of leads
      if (stableIds.length === filteredLeads.length && 
          filteredLeads.every(lead => stableIds.includes(lead.id))) {
        
        console.log('Preserving stable order for status/remarks updates');
        
        // Preserve the exact order from stable reference
        const preservedOrder = stableIds.map(id => 
          filteredLeads.find(lead => lead.id === id)
        ).filter(Boolean);
        
        return preservedOrder;
      }
    }

    // Fallback: apply sort and establish new stable order
    console.log('Establishing new stable order');
    const newSorted = sortLeads(filteredLeads, sortField, sortDirection);
    stableOrderRef.current = newSorted.map(lead => lead.id);
    lastSortCriteriaRef.current = { field: sortField, direction: sortDirection };
    
    return newSorted;
  }, [filteredLeads, sortField, sortDirection, sortCriteriaChanged]);

  // Reset stable order when filters change (not just sort)
  useEffect(() => {
    // Only reset if filters actually changed, not just status/remarks updates
    const hasFilterChanges = selectedBatchId || searchQuery || searchTerm || 
      selectedStatus !== 'all' || selectedCategory !== 'all' || 
      countryFilter !== 'all' || duplicatePhoneFilter !== 'all' || 
      selectedDataFilter !== 'all' || navigationFilter;
    
    if (hasFilterChanges) {
      stableOrderRef.current = [];
    }
  }, [selectedBatchId, searchQuery, searchTerm, selectedCategory, 
      countryFilter, duplicatePhoneFilter, selectedDataFilter, navigationFilter]);

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
