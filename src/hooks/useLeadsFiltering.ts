
import { useMemo } from 'react';
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

  // Memoized sorting
  const sortedLeads = useMemo(() => {
    return sortLeads(filteredLeads, sortField, sortDirection);
  }, [filteredLeads, sortField, sortDirection]);

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
