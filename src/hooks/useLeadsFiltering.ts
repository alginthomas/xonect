
import { useMemo, useEffect } from 'react';
import type { Lead, LeadStatus, Seniority, CompanySize } from '@/types/lead';
import type { ImportBatch } from '@/types/category';
import { filterDuplicatePhoneNumbers, getLeadsWithDuplicatePhones } from '@/utils/phoneDeduplication';
import { findAdvancedDuplicates } from '@/utils/advancedDuplicateDetection';

type DuplicatePhoneFilter = 'all' | 'unique-only' | 'duplicates-only';

interface UseLeadsFilteringProps {
  leads: Lead[];
  importBatches: ImportBatch[];
  selectedBatchId?: string | null;
  searchQuery?: string;
  searchTerm?: string; // Add searchTerm as an alternative
  selectedStatus: LeadStatus | 'all';
  selectedCategory: string;
  selectedSeniority: Seniority | 'all';
  selectedCompanySize: CompanySize | 'all';
  selectedLocation: string;
  selectedIndustry: string;
  selectedDataFilter: string;
  countryFilter: string;
  duplicatePhoneFilter: DuplicatePhoneFilter;
  currentPage: number;
  itemsPerPage: number;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  setCurrentPage?: (page: number) => void;
  navigationFilter?: { status?: string; [key: string]: any }; // Add navigation filter
}

export const useLeadsFiltering = ({
  leads,
  importBatches,
  selectedBatchId,
  searchQuery,
  searchTerm, // Accept searchTerm
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
}: UseLeadsFilteringProps) => {
  // Filter leads based on various criteria
  const filteredLeads = useMemo(() => {
    console.log('Filtering leads:', {
      totalLeads: leads.length,
      searchQuery: searchQuery || searchTerm || '',
      selectedStatus,
      selectedCategory,
      selectedDataFilter: selectedDataFilter,
      countryFilter,
      duplicatePhoneFilter,
      navigationFilter
    });
    
    let filtered = leads;

    // Apply navigation filter first (from dashboard clicks)
    if (navigationFilter?.status) {
      filtered = filtered.filter(lead => lead.status === navigationFilter.status);
      console.log('After navigation filter:', filtered.length);
    }

    // Filter by import batch if selected
    if (selectedBatchId) {
      filtered = filtered.filter(lead => lead.importBatchId === selectedBatchId);
      console.log('After batch filter:', filtered.length);
    }

    // Filter by search term - add null check and use either searchQuery or searchTerm
    const searchText = searchQuery || searchTerm || '';
    if (searchText && searchText.trim()) {
      const term = searchText.toLowerCase().trim();
      filtered = filtered.filter(lead =>
        lead.firstName?.toLowerCase().includes(term) ||
        lead.lastName?.toLowerCase().includes(term) ||
        lead.email?.toLowerCase().includes(term) ||
        lead.company?.toLowerCase().includes(term) ||
        lead.title?.toLowerCase().includes(term) ||
        lead.phone?.includes(term)
      );
      console.log('After search filter:', filtered.length);
    }

    // Filter by status (only if no navigation filter is applied)
    if (!navigationFilter?.status && selectedStatus !== 'all') {
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

    // Enhanced duplicate filtering using advanced detection
    if (duplicatePhoneFilter === 'unique-only') {
      // Remove leads that have any kind of duplicate (not just phone)
      const duplicateIds = new Set<string>();
      
      filtered.forEach(lead => {
        const matches = findAdvancedDuplicates(lead, filtered.filter(l => l.id !== lead.id));
        if (matches.length > 0) {
          // Keep the lead with highest completeness score
          const allLeadsInGroup = [lead, ...matches.map(m => m.existingLead)];
          const bestLead = allLeadsInGroup.sort((a, b) => b.completenessScore - a.completenessScore)[0];
          
          allLeadsInGroup.forEach(l => {
            if (l.id !== bestLead.id) {
              duplicateIds.add(l.id);
            }
          });
        }
      });
      
      filtered = filtered.filter(lead => !duplicateIds.has(lead.id));
      console.log('After enhanced unique filter:', filtered.length);
    } else if (duplicatePhoneFilter === 'duplicates-only') {
      // Show only leads that have duplicates
      const duplicateIds = new Set<string>();
      
      filtered.forEach(lead => {
        const matches = findAdvancedDuplicates(lead, filtered.filter(l => l.id !== lead.id));
        if (matches.length > 0) {
          duplicateIds.add(lead.id);
          matches.forEach(m => duplicateIds.add(m.existingLead.id));
        }
      });
      
      filtered = filtered.filter(lead => duplicateIds.has(lead.id));
      console.log('After enhanced duplicates filter:', filtered.length);
    }

    console.log('Final filtered count:', filtered.length);
    return filtered;
  }, [leads, importBatches, selectedBatchId, searchQuery, searchTerm, selectedStatus, selectedCategory, selectedSeniority, selectedCompanySize, selectedLocation, selectedIndustry, selectedDataFilter, countryFilter, duplicatePhoneFilter, navigationFilter]);

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
