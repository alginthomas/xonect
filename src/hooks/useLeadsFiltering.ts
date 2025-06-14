
import { useMemo, useEffect } from 'react';
import type { Lead, LeadStatus, Seniority, CompanySize } from '@/types/lead';
import type { ImportBatch } from '@/types/category';
import { filterDuplicatePhoneNumbers, getLeadsWithDuplicatePhones } from '@/utils/phoneDeduplication';

interface UseLeadsFilteringProps {
  leads: Lead[];
  importBatches: ImportBatch[];
  selectedBatchId?: string | null;
  searchQuery: string;
  selectedStatus: LeadStatus | 'all';
  selectedCategory: string;
  selectedSeniority: Seniority | 'all';
  selectedCompanySize: CompanySize | 'all';
  selectedLocation: string;
  selectedIndustry: string;
  selectedDataFilter: string;
  countryFilter: string;
  duplicatePhoneFilter: string;
  currentPage: number;
  itemsPerPage: number;
  sortField: string;
  sortDirection: 'asc' | 'desc';
}

export const useLeadsFiltering = ({
  leads,
  importBatches,
  selectedBatchId,
  searchQuery,
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
  sortDirection
}: UseLeadsFilteringProps) => {
  // Filter leads based on various criteria
  const filteredLeads = useMemo(() => {
    console.log('Filtering leads:', {
      totalLeads: leads.length,
      searchQuery,
      selectedStatus,
      selectedCategory,
      selectedDataFilter: selectedDataFilter,
      countryFilter,
      duplicatePhoneFilter
    });
    
    let filtered = leads;

    // Filter by import batch if selected
    if (selectedBatchId) {
      filtered = filtered.filter(lead => lead.importBatchId === selectedBatchId);
      console.log('After batch filter:', filtered.length);
    }

    // Filter by search term - add null check
    if (searchQuery && searchQuery.trim()) {
      const term = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(lead =>
        lead.firstName?.toLowerCase().includes(term) ||
        lead.lastName?.toLowerCase().includes(term) ||
        lead.email?.toLowerCase().includes(term) ||
        lead.company?.toLowerCase().includes(term) ||
        lead.title?.toLowerCase().includes(term)
      );
      console.log('After search filter:', filtered.length);
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(lead => lead.status === selectedStatus);
      console.log('After status filter:', filtered.length);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(lead => lead.categoryId === selectedCategory);
      console.log('After category filter:', filtered.length);
    }

    // Filter by seniority
    if (selectedSeniority !== 'all') {
      filtered = filtered.filter(lead => lead.seniority === selectedSeniority);
    }

    // Filter by company size
    if (selectedCompanySize !== 'all') {
      filtered = filtered.filter(lead => lead.companySize === selectedCompanySize);
    }

    // Filter by location
    if (selectedLocation && selectedLocation.trim()) {
      filtered = filtered.filter(lead => lead.location === selectedLocation);
    }

    // Filter by industry
    if (selectedIndustry && selectedIndustry.trim()) {
      filtered = filtered.filter(lead => lead.industry === selectedIndustry);
    }

    // Filter by country
    if (countryFilter !== 'all') {
      filtered = filtered.filter(lead => lead.country === countryFilter);
      console.log('After country filter:', filtered.length);
    }

    // Filter by data availability
    if (selectedDataFilter === 'has-phone') {
      filtered = filtered.filter(lead => lead.phone && lead.phone.trim() !== '');
    } else if (selectedDataFilter === 'has-email') {
      filtered = filtered.filter(lead => lead.email && lead.email.trim() !== '');
    } else if (selectedDataFilter === 'has-both') {
      filtered = filtered.filter(lead => 
        lead.phone && lead.phone.trim() !== '' && 
        lead.email && lead.email.trim() !== ''
      );
    }

    // Filter by duplicate phone numbers
    if (duplicatePhoneFilter === 'unique-only') {
      filtered = filterDuplicatePhoneNumbers(filtered);
      console.log('After duplicate phone filter (unique only):', filtered.length);
    } else if (duplicatePhoneFilter === 'duplicates-only') {
      filtered = getLeadsWithDuplicatePhones(filtered);
      console.log('After duplicate phone filter (duplicates only):', filtered.length);
    }

    console.log('Final filtered count:', filtered.length);
    return filtered;
  }, [leads, importBatches, selectedBatchId, searchQuery, selectedStatus, selectedCategory, selectedSeniority, selectedCompanySize, selectedLocation, selectedIndustry, selectedDataFilter, countryFilter, duplicatePhoneFilter]);

  // Sort leads
  const sortedLeads = useMemo(() => {
    return [...filteredLeads].sort((a, b) => {
      let aValue: any = a[sortField as keyof Lead];
      let bValue: any = b[sortField as keyof Lead];

      if (aValue instanceof Date) aValue = aValue.getTime();
      if (bValue instanceof Date) bValue = bValue.getTime();
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredLeads, sortField, sortDirection]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const totalLeads = filteredLeads.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLeads = sortedLeads.slice(startIndex, startIndex + itemsPerPage);

  return {
    filteredLeads: paginatedLeads,
    sortedLeads,
    totalPages,
    totalLeads
  };
};
