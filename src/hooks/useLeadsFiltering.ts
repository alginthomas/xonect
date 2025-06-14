
import { useMemo } from 'react';
import type { LeadsFilteringProps, FilteringResult } from '@/types/filtering';
import { filterLeads } from '@/utils/leadsFiltering';
import { sortLeads } from '@/utils/leadsSorting';
import { paginateLeads } from '@/utils/leadsPagination';

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
  // Filter leads based on various criteria
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
  }, [leads, importBatches, selectedBatchId, searchQuery, searchTerm, selectedStatus, selectedCategory, selectedSeniority, selectedCompanySize, selectedLocation, selectedIndustry, selectedDataFilter, countryFilter, duplicatePhoneFilter, navigationFilter]);

  // Sort leads
  const sortedLeads = useMemo(() => {
    return sortLeads(filteredLeads, sortField, sortDirection);
  }, [filteredLeads, sortField, sortDirection]);

  // Calculate pagination
  const { paginatedLeads, totalPages, totalLeads } = useMemo(() => {
    return paginateLeads(sortedLeads, currentPage, itemsPerPage);
  }, [sortedLeads, currentPage, itemsPerPage]);

  return {
    filteredLeads: paginatedLeads,
    sortedLeads,
    totalPages,
    totalLeads
  };
};
