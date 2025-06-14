
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
  remarksFilter,
  currentPage,
  itemsPerPage,
  sortField,
  sortDirection,
  setCurrentPage,
  navigationFilter
}: LeadsFilteringProps): FilteringResult => {
  // Keep track of the original database order
  const originalOrderRef = useRef<string[]>([]);
  const currentVisualOrderRef = useRef<string[]>([]);
  const lastSortCriteriaRef = useRef<{ field?: string; direction?: 'asc' | 'desc' }>({});
  const lastFilterCriteriaRef = useRef<string>('');
  
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
      remarksFilter,
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
    remarksFilter,
    navigationFilter
  ]);

  // Create a filter criteria string to detect when filters change
  const currentFilterCriteria = useMemo(() => {
    return JSON.stringify({
      selectedBatchId,
      searchQuery: searchQuery || searchTerm,
      selectedStatus,
      selectedCategory,
      selectedSeniority,
      selectedCompanySize,
      selectedLocation,
      selectedIndustry,
      selectedDataFilter,
      countryFilter,
      duplicatePhoneFilter,
      remarksFilter,
      navigationFilter
    });
  }, [
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
    remarksFilter,
    navigationFilter
  ]);

  // Check if sort criteria has changed
  const sortCriteriaChanged = useMemo(() => {
    const current = { field: sortField, direction: sortDirection };
    const previous = lastSortCriteriaRef.current;
    return current.field !== previous.field || current.direction !== previous.direction;
  }, [sortField, sortDirection]);

  // Check if filter criteria has changed
  const filterCriteriaChanged = useMemo(() => {
    return currentFilterCriteria !== lastFilterCriteriaRef.current;
  }, [currentFilterCriteria]);

  // Memoized sorting with stable visual order preservation
  const sortedLeads = useMemo(() => {
    // If filters changed, we need to re-establish visual order
    if (filterCriteriaChanged) {
      console.log('Filter criteria changed, establishing new visual order');
      lastFilterCriteriaRef.current = currentFilterCriteria;
      
      // Apply sorting to newly filtered results
      if (sortField && sortField.trim() !== '') {
        const newSorted = sortLeads(filteredLeads, sortField, sortDirection);
        currentVisualOrderRef.current = newSorted.map(lead => lead.id);
        return newSorted;
      } else {
        // Preserve original order for filtered leads
        const filteredIds = new Set(filteredLeads.map(lead => lead.id));
        const orderedIds = originalOrderRef.current.filter(id => filteredIds.has(id));
        const newLeads = filteredLeads.filter(lead => !originalOrderRef.current.includes(lead.id));
        
        const preservedOrder = [
          ...orderedIds.map(id => filteredLeads.find(lead => lead.id === id)).filter(Boolean),
          ...newLeads
        ];
        
        currentVisualOrderRef.current = preservedOrder.map(lead => lead.id);
        return preservedOrder;
      }
    }

    // If sort criteria changed explicitly by user, apply new sort
    if (sortCriteriaChanged) {
      console.log('Sort criteria changed by user, applying new sort order:', sortField, sortDirection);
      
      if (!sortField || sortField.trim() === '') {
        // User cleared sorting - restore original order
        const filteredIds = new Set(filteredLeads.map(lead => lead.id));
        const orderedIds = originalOrderRef.current.filter(id => filteredIds.has(id));
        const newLeads = filteredLeads.filter(lead => !originalOrderRef.current.includes(lead.id));
        
        const preservedOrder = [
          ...orderedIds.map(id => filteredLeads.find(lead => lead.id === id)).filter(Boolean),
          ...newLeads
        ];
        
        currentVisualOrderRef.current = preservedOrder.map(lead => lead.id);
        lastSortCriteriaRef.current = { field: sortField, direction: sortDirection };
        return preservedOrder;
      } else {
        // Apply new sorting
        const newSorted = sortLeads(filteredLeads, sortField, sortDirection);
        currentVisualOrderRef.current = newSorted.map(lead => lead.id);
        lastSortCriteriaRef.current = { field: sortField, direction: sortDirection };
        return newSorted;
      }
    }

    // Preserve current visual order for lead updates
    if (currentVisualOrderRef.current.length > 0) {
      console.log('Preserving visual order during lead updates');
      const filteredIds = new Set(filteredLeads.map(lead => lead.id));
      const orderedIds = currentVisualOrderRef.current.filter(id => filteredIds.has(id));
      const newLeads = filteredLeads.filter(lead => !currentVisualOrderRef.current.includes(lead.id));
      
      const preservedOrder = [
        ...orderedIds.map(id => filteredLeads.find(lead => lead.id === id)).filter(Boolean),
        ...newLeads
      ];
      
      // Update current visual order to include any new leads
      if (newLeads.length > 0) {
        currentVisualOrderRef.current = [...orderedIds, ...newLeads.map(lead => lead.id)];
      }
      
      return preservedOrder;
    }

    // Fallback: apply current sorting if any
    if (sortField && sortField.trim() !== '') {
      console.log('Applying fallback sort order:', sortField, sortDirection);
      const sorted = sortLeads(filteredLeads, sortField, sortDirection);
      currentVisualOrderRef.current = sorted.map(lead => lead.id);
      return sorted;
    }

    // Final fallback: preserve original database order
    console.log('Using original database order as fallback');
    const filteredIds = new Set(filteredLeads.map(lead => lead.id));
    const orderedIds = originalOrderRef.current.filter(id => filteredIds.has(id));
    const newLeads = filteredLeads.filter(lead => !originalOrderRef.current.includes(lead.id));
    
    const preservedOrder = [
      ...orderedIds.map(id => filteredLeads.find(lead => lead.id === id)).filter(Boolean),
      ...newLeads
    ];
    
    currentVisualOrderRef.current = preservedOrder.map(lead => lead.id);
    return preservedOrder;
  }, [filteredLeads, sortField, sortDirection, sortCriteriaChanged, filterCriteriaChanged, currentFilterCriteria]);

  // Reset visual order when leads change significantly (new data load)
  useEffect(() => {
    if (leads.length !== originalOrderRef.current.length) {
      originalOrderRef.current = leads.map(lead => lead.id);
      currentVisualOrderRef.current = [];
      console.log('Reset visual order due to data change:', leads.length, 'leads');
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
