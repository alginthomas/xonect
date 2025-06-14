import type { Lead } from '@/types/lead';
import type { ImportBatch } from '@/types/category';
import type { DuplicatePhoneFilter } from '@/types/filtering';
import { findAdvancedDuplicates } from '@/utils/advancedDuplicateDetection';
import { getCountryFromPhoneNumber } from '@/utils/phoneUtils'; // import country utility

interface FilterLeadsParams {
  leads: Lead[];
  importBatches: ImportBatch[];
  selectedBatchId?: string | null;
  searchQuery?: string;
  searchTerm?: string;
  selectedStatus: string;
  selectedCategory: string;
  selectedSeniority: string;
  selectedCompanySize: string;
  selectedLocation: string;
  selectedIndustry: string;
  selectedDataFilter: string;
  countryFilter: string;
  duplicatePhoneFilter: DuplicatePhoneFilter;
  navigationFilter?: { status?: string; [key: string]: any };
}

export const filterLeads = ({
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
}: FilterLeadsParams): Lead[] => {
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

  // Filter by country (with fallback: try to parse from phone if not set)
  if (countryFilter !== 'all') {
    filtered = filtered.filter(lead => {
      let countryName = lead.country;
      if ((!countryName || countryName === '') && lead.phone) {
        try {
          const parsed = getCountryFromPhoneNumber(lead.phone);
          countryName = parsed?.name ?? '';
        } catch (e) {
          // fallback continues to no match
        }
      }
      return countryName === countryFilter;
    });
    if (filtered.length === 0 && leads.length > 0) {
      // log one lead to help debugging what exists
      console.log('[LeadsFiltering] Example lead:', leads[0]);
      console.log(`[LeadsFiltering] Searched for country: "${countryFilter}"`);
    }
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
};
