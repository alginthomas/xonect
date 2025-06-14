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
  // Keep track of the original database order
  const originalOrderRef = useRef<string[]>([]);
  const lastSortCriteriaRef = useRef<{ field?: string; direction?: 'asc' | 'desc' }>({});
  
  // Establish original order from the first time leads are loaded
  useEffect(() => {
    if (leads.length > 0 && originalOrderRef.current.length === 0) {
      originalOrderRef.current = leads.map(lead => lead.id);
      console.log('Established original lead order:', originalOrderRef.current.length, 'leads');
    }
  }, [leads]);

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

  // Memoized sorting with original order preservation
  const sortedLeads = useMemo(() => {
    // If no sort field is specified, preserve original database order
    if (!sortField || sortField.trim() === '') {
      console.log('No sort field specified, preserving original order');
      
      // Preserve original order for filtered leads
      if (originalOrderRef.current.length > 0) {
        const filteredIds = new Set(filteredLeads.map(lead => lead.id));
        const orderedIds = originalOrderRef.current.filter(id => filteredIds.has(id));
        
        // Add any new leads that weren't in the original order (shouldn't happen but safety check)
        const newLeads = filteredLeads.filter(lead => !originalOrderRef.current.includes(lead.id));
        
        const preservedOrder = [
          ...orderedIds.map(id => filteredLeads.find(lead => lead.id === id)).filter(Boolean),
          ...newLeads
        ];
        
        return preservedOrder;
      }
      
      // Fallback to filtered leads in their current order
      return filteredLeads;
    }

    // If sort criteria changed, apply new sort
    if (sortCriteriaChanged) {
      console.log('Sort criteria changed, applying new sort order:', sortField, sortDirection);
      const newSorted = sortLeads(filteredLeads, sortField, sortDirection);
      
      // Update references
      lastSortCriteriaRef.current = { field: sortField, direction: sortDirection };
      
      return newSorted;
    }

    // If we have the same sort criteria, apply it consistently
    console.log('Applying consistent sort order:', sortField, sortDirection);
    const sorted = sortLeads(filteredLeads, sortField, sortDirection);
    return sorted;
  }, [filteredLeads, sortField, sortDirection, sortCriteriaChanged]);

  // Reset original order when leads change significantly (new data load)
  useEffect(() => {
    if (leads.length !== originalOrderRef.current.length) {
      originalOrderRef.current = leads.map(lead => lead.id);
      console.log('Updated original lead order due to data change:', leads.length, 'leads');
    }
  }, [leads.length]);

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
