import { useMemo, useRef, useEffect } from 'react';
import type { LeadsFilteringProps, FilteringResult } from '@/types/filtering';
import { filterLeads } from '@/utils/leadsFiltering';
import { sortLeads } from '@/utils/leadsSorting';

export const useLeadsFiltering = ({
  leads,
  importBatches,
  selectedBatchId,
  batchFilter,
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
  // Keep track of stable visual order
  const stableOrderRef = useRef<string[]>([]);
  const lastFilterHashRef = useRef<string>('');
  const lastSortHashRef = useRef<string>('');
  
  // Create hash for filters to detect changes
  const filterHash = useMemo(() => {
    return JSON.stringify({
      selectedBatchId,
      batchFilter,
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
    batchFilter,
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

  // Create hash for sorting to detect changes
  const sortHash = useMemo(() => {
    return JSON.stringify({ sortField, sortDirection });
  }, [sortField, sortDirection]);

  // Check if filters or sorting changed
  const filtersChanged = filterHash !== lastFilterHashRef.current;
  const sortingChanged = sortHash !== lastSortHashRef.current;

  // Memoized filtering
  const filteredLeads = useMemo(() => {
    return filterLeads({
      leads,
      importBatches,
      selectedBatchId,
      batchFilter,
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
    batchFilter,
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

  // Stable sorting with order preservation
  const sortedLeads = useMemo(() => {
    // If filters changed, we need to establish new order
    if (filtersChanged) {
      console.log('Filters changed, establishing new order');
      lastFilterHashRef.current = filterHash;
      
      // Apply sorting if any
      if (sortField && sortField.trim() !== '') {
        const sorted = sortLeads(filteredLeads, sortField, sortDirection);
        stableOrderRef.current = sorted.map(lead => lead.id);
        lastSortHashRef.current = sortHash;
        return sorted;
      } else {
        // No sorting - use database order
        stableOrderRef.current = filteredLeads.map(lead => lead.id);
        lastSortHashRef.current = sortHash;
        return filteredLeads;
      }
    }

    // If sorting changed explicitly by user
    if (sortingChanged) {
      console.log('Sorting changed by user');
      lastSortHashRef.current = sortHash;
      
      if (!sortField || sortField.trim() === '') {
        // User cleared sorting - use database order
        stableOrderRef.current = filteredLeads.map(lead => lead.id);
        return filteredLeads;
      } else {
        // Apply new sorting
        const sorted = sortLeads(filteredLeads, sortField, sortDirection);
        stableOrderRef.current = sorted.map(lead => lead.id);
        return sorted;
      }
    }

    // STABLE MODE: Preserve visual order during lead updates
    if (stableOrderRef.current.length > 0) {
      console.log('Preserving stable visual order during lead updates');
      
      // Get current filtered lead IDs
      const filteredIds = new Set(filteredLeads.map(lead => lead.id));
      
      // Preserve order of existing leads that are still in filtered results
      const preservedIds = stableOrderRef.current.filter(id => filteredIds.has(id));
      
      // Add any new leads that weren't in the previous order
      const newLeads = filteredLeads.filter(lead => !stableOrderRef.current.includes(lead.id));
      
      // Create final ordered list
      const orderedLeads = [
        ...preservedIds.map(id => filteredLeads.find(lead => lead.id === id)).filter(Boolean),
        ...newLeads
      ];
      
      // Update stable order to include new leads
      if (newLeads.length > 0) {
        stableOrderRef.current = [...preservedIds, ...newLeads.map(lead => lead.id)];
      }
      
      return orderedLeads;
    }

    // Fallback: First time or no stable order exists
    console.log('Establishing initial order');
    if (sortField && sortField.trim() !== '') {
      const sorted = sortLeads(filteredLeads, sortField, sortDirection);
      stableOrderRef.current = sorted.map(lead => lead.id);
      return sorted;
    } else {
      stableOrderRef.current = filteredLeads.map(lead => lead.id);
      return filteredLeads;
    }
  }, [filteredLeads, sortField, sortDirection, filtersChanged, sortingChanged, filterHash, sortHash]);

  // Reset stable order when leads data changes significantly
  useEffect(() => {
    if (leads.length === 0) {
      stableOrderRef.current = [];
      lastFilterHashRef.current = '';
      lastSortHashRef.current = '';
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
