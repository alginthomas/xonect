
import type { Lead } from '@/types/lead';
import type { ImportBatch } from '@/types/category';
import type { DuplicatePhoneFilter } from '@/types/filtering';
import { findAdvancedDuplicates } from '@/utils/advancedDuplicateDetection';
import { getCountryFromPhoneNumber } from '@/utils/phoneUtils';

interface FilterLeadsParams {
  leads: Lead[];
  importBatches: ImportBatch[];
  selectedBatchId?: string | null;
  batchFilter?: string;
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
  remarksFilter: string;
  navigationFilter?: { status?: string; [key: string]: any };
}

export const filterLeads = ({
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
}: FilterLeadsParams): Lead[] => {
  // Use batchFilter as the primary batch filtering mechanism, fall back to selectedBatchId
  const activeBatchId = batchFilter && batchFilter !== 'all' ? batchFilter : selectedBatchId;
  
  console.log('Filtering leads with params:', {
    totalLeads: leads.length,
    selectedBatchId,
    batchFilter,
    activeBatchId,
    searchQuery: searchQuery || searchTerm || '',
    selectedStatus,
    selectedCategory,
    countryFilter,
    duplicatePhoneFilter,
    remarksFilter,
    navigationFilter: navigationFilter?.status
  });
  
  let filtered = [...leads];

  // Filter by import batch FIRST if selected (highest priority)
  if (activeBatchId && activeBatchId.trim() !== '') {
    console.log('Filtering by batch ID:', activeBatchId);
    filtered = filtered.filter(lead => {
      const matches = lead.importBatchId === activeBatchId;
      if (matches) {
        console.log('Lead matches batch:', lead.id, lead.firstName, lead.lastName, 'batch:', lead.importBatchId);
      }
      return matches;
    });
    console.log('After batch filter:', filtered.length, 'leads found');
    
    // If we're filtering by batch, find the batch details for category info
    if (filtered.length > 0) {
      const batch = importBatches.find(b => b.id === activeBatchId);
      if (batch) {
        console.log('Batch details:', batch.name, 'category:', batch.categoryId);
      }
    }
  }

  // Apply navigation filter ONLY when it exists and no manual status filter is set
  if (navigationFilter?.status && selectedStatus === 'all') {
    console.log('Applying navigation filter:', navigationFilter.status);
    filtered = filtered.filter(lead => lead.status === navigationFilter.status);
    console.log('After navigation filter:', filtered.length);
  }

  // Filter by search term
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

  // Filter by status (only if not using navigation filter and not filtering by batch)
  if (!navigationFilter?.status && !activeBatchId && selectedStatus !== 'all') {
    console.log('Applying manual status filter:', selectedStatus);
    filtered = filtered.filter(lead => lead.status === selectedStatus);
    console.log('After status filter:', filtered.length);
  }

  // Filter by category (ONLY if not filtering by batch - batch takes precedence)
  if (!activeBatchId && selectedCategory !== 'all') {
    console.log('Applying category filter:', selectedCategory);
    filtered = filtered.filter(lead => lead.categoryId === selectedCategory);
    console.log('After category filter:', filtered.length);
  } else if (activeBatchId) {
    console.log('Skipping category filter because batch filter is active');
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

  // Filter by remarks
  if (remarksFilter === 'has-remarks') {
    filtered = filtered.filter(lead => lead.remarks && lead.remarks.trim() !== '');
    console.log('After remarks filter (has-remarks):', filtered.length);
  } else if (remarksFilter === 'no-remarks') {
    filtered = filtered.filter(lead => !lead.remarks || lead.remarks.trim() === '');
    console.log('After remarks filter (no-remarks):', filtered.length);
  }

  // Enhanced country filter with proper fallback
  if (countryFilter !== 'all') {
    console.log(`Filtering by country: "${countryFilter}"`);
    filtered = filtered.filter(lead => {
      // Direct country match
      if (lead.country === countryFilter) {
        return true;
      }
      
      // Parse from phone number if no direct country
      if ((!lead.country || lead.country === '') && lead.phone) {
        try {
          const parsedCountry = getCountryFromPhoneNumber(lead.phone);
          return parsedCountry?.name === countryFilter;
        } catch (e) {
          console.warn('Error parsing country from phone:', lead.phone, e);
          return false;
        }
      }
      
      return false;
    });
    
    console.log(`After country filter (${countryFilter}):`, filtered.length);
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

  // Enhanced duplicate filtering
  if (duplicatePhoneFilter === 'unique-only') {
    const duplicateIds = new Set<string>();
    
    filtered.forEach(lead => {
      const matches = findAdvancedDuplicates(lead, filtered.filter(l => l.id !== lead.id));
      if (matches.length > 0) {
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
    console.log('After unique filter:', filtered.length);
  } else if (duplicatePhoneFilter === 'duplicates-only') {
    const duplicateIds = new Set<string>();
    
    filtered.forEach(lead => {
      const matches = findAdvancedDuplicates(lead, filtered.filter(l => l.id !== lead.id));
      if (matches.length > 0) {
        duplicateIds.add(lead.id);
        matches.forEach(m => duplicateIds.add(m.existingLead.id));
      }
    });
    
    filtered = filtered.filter(lead => duplicateIds.has(lead.id));
    console.log('After duplicates filter:', filtered.length);
  }

  console.log('Final filtered count:', filtered.length);
  return filtered;
};
