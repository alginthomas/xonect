
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

  // Enhanced country filter with better matching logic
  if (countryFilter !== 'all') {
    console.log(`Filtering by country: "${countryFilter}"`);
    filtered = filtered.filter(lead => {
      // First check if lead has country field directly
      if (lead.country && lead.country === countryFilter) {
        return true;
      }
      
      // Fallback: try to parse from phone if country field is empty/missing
      if ((!lead.country || lead.country === '') && lead.phone) {
        try {
          const parsedCountry = getCountryFromPhoneNumber(lead.phone);
          if (parsedCountry && parsedCountry.name === countryFilter) {
            return true;
          }
        } catch (e) {
          console.warn('Error parsing country from phone:', lead.phone, e);
        }
      }
      
      return false;
    });
    
    console.log(`After country filter (${countryFilter}):`, filtered.length);
    if (filtered.length === 0 && leads.length > 0) {
      // Debug logging to help identify the issue
      const sampleLead = leads[0];
      console.log('[DEBUG] Sample lead for country debugging:', {
        id: sampleLead.id,
        country: sampleLead.country,
        phone: sampleLead.phone,
        parsedCountry: sampleLead.phone ? getCountryFromPhoneNumber(sampleLead.phone) : null
      });
      console.log(`[DEBUG] Looking for country: "${countryFilter}"`);
    }
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
