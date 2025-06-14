
import type { Lead, LeadStatus, Seniority, CompanySize } from '@/types/lead';
import type { ImportBatch } from '@/types/category';

export type DuplicatePhoneFilter = 'all' | 'unique-only' | 'duplicates-only';

export interface LeadsFilteringProps {
  leads: Lead[];
  importBatches: ImportBatch[];
  selectedBatchId?: string | null;
  searchQuery?: string;
  searchTerm?: string;
  selectedStatus: LeadStatus | 'all';
  selectedCategory: string;
  selectedSeniority: Seniority | 'all';
  selectedCompanySize: CompanySize | 'all';
  selectedLocation: string;
  selectedIndustry: string;
  selectedDataFilter: string;
  countryFilter: string;
  duplicatePhoneFilter: DuplicatePhoneFilter;
  remarksFilter: string;
  currentPage: number;
  itemsPerPage: number;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  setCurrentPage?: (page: number) => void;
  navigationFilter?: { status?: string; [key: string]: any };
}

export interface FilteringResult {
  filteredLeads: Lead[];
  sortedLeads: Lead[];
  totalPages: number;
  totalLeads: number;
}
