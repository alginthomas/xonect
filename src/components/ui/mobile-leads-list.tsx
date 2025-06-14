
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { getUniqueCountriesFromLeads } from '@/utils/phoneUtils';
import type { LeadStatus, Seniority, CompanySize, Lead } from '@/types/lead';
import type { Category } from '@/types/category';
import { MobileSearchFilters } from './mobile-search-filters';
import { DateGroupedLeads } from './date-grouped-leads';
import { MobilePagination } from './mobile-pagination';
import { useLeadsFiltering } from '@/hooks/useLeadsFiltering';
import { useLeadsSelection } from '@/hooks/useLeadsSelection';

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkAction: (action: 'delete' | 'status', value?: string) => void;
}

const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  onClearSelection,
  onBulkAction
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="sticky top-20 z-20 bg-primary/5 backdrop-blur-sm border border-primary/20 rounded-lg p-3 mx-1">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-primary">
          {selectedCount} selected
        </span>
        <button
          onClick={onClearSelection}
          className="h-6 w-6 p-0 text-primary hover:bg-primary/10 rounded"
        >
          ×
        </button>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => onBulkAction('status', 'Contacted')}
          className="flex-1 h-8 text-xs px-3 border rounded"
        >
          Mark Contacted
        </button>
        <button
          onClick={() => onBulkAction('delete')}
          className="text-red-600 hover:text-red-700 h-8 text-xs px-3 border rounded"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

interface MobilePaginationComponentProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

const MobilePaginationComponent: React.FC<MobilePaginationComponentProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage
}) => {
  return (
    <div className="flex items-center justify-between p-4">
      <span className="text-sm text-muted-foreground">
        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm border rounded disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

interface MobileLeadsListProps {
  leads: Lead[];
  categories: Category[];
  onLeadUpdate: (leadId: string, updates: Partial<Lead>) => Promise<void>;
  onLeadDelete: (leadId: string) => Promise<void>;
  onBulkStatusUpdate: (leadIds: string[], status: LeadStatus) => Promise<void>;
  onBulkCategoryUpdate: (leadIds: string[], categoryId: string) => Promise<void>;
  onBulkDelete: (leadIds: string[]) => Promise<void>;
}

export const MobileLeadsList: React.FC<MobileLeadsListProps> = ({
  leads,
  categories,
  onLeadUpdate,
  onLeadDelete,
  onBulkStatusUpdate,
  onBulkCategoryUpdate,
  onBulkDelete
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSeniority, setSelectedSeniority] = useState<Seniority | 'all'>('all');
  const [selectedCompanySize, setSelectedCompanySize] = useState<CompanySize | 'all'>('all');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedDataFilter, setSelectedDataFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [duplicatePhoneFilter, setDuplicatePhoneFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const {
    selectedLeads,
    selectLead,
    selectAllLeads,
    clearSelection,
    isAllSelected
  } = useLeadsSelection();

  const {
    filteredLeads,
    totalPages,
    totalLeads
  } = useLeadsFiltering({
    leads,
    searchQuery: searchQuery || '',
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
    sortField: 'createdAt',
    sortDirection: 'desc'
  });

  const availableLocations = [...new Set(leads.map(lead => lead.location).filter(Boolean) as string[])];
  const availableIndustries = [...new Set(leads.map(lead => lead.industry).filter(Boolean) as string[])];

  const handleClearFilters = () => {
    setSelectedStatus('all');
    setSelectedCategory('all');
    setSelectedSeniority('all');
    setSelectedCompanySize('all');
    setSelectedLocation('');
    setSelectedIndustry('');
    setSelectedDataFilter('all');
    setCountryFilter('all');
    setDuplicatePhoneFilter('all');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedStatus !== 'all') count++;
    if (selectedCategory !== 'all') count++;
    if (selectedSeniority !== 'all') count++;
    if (selectedCompanySize !== 'all') count++;
    if (selectedLocation) count++;
    if (selectedIndustry) count++;
    if (selectedDataFilter !== 'all') count++;
    if (countryFilter !== 'all') count++;
    if (duplicatePhoneFilter !== 'all') count++;
    return count;
  };

  const handleStatusChange = async (leadId: string, status: LeadStatus) => {
    await onLeadUpdate(leadId, { status });
  };

  const handleRemarksUpdate = async (leadId: string, remarks: string) => {
    await onLeadUpdate(leadId, { remarks });
  };

  const handleEmailClick = (lead: Lead) => {
    navigator.clipboard.writeText(lead.email);
  };

  const handleViewDetails = (lead: Lead) => {
    window.location.href = `/lead/${lead.id}`;
  };

  const handleBulkAction = async (action: 'delete' | 'status', value?: string) => {
    const selectedIds = Array.from(selectedLeads);
    if (action === 'delete') {
      await onBulkDelete(selectedIds);
    } else if (action === 'status' && value) {
      await onBulkStatusUpdate(selectedIds, value as LeadStatus);
    }
    clearSelection();
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <MobileSearchFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
        leads={leads}
        activeFiltersCount={getActiveFiltersCount()}
        onClearFilters={handleClearFilters}
        selectedSeniority={selectedSeniority}
        onSeniorityChange={setSelectedSeniority}
        selectedCompanySize={selectedCompanySize}
        onCompanySizeChange={setSelectedCompanySize}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        selectedIndustry={selectedIndustry}
        onIndustryChange={setSelectedIndustry}
        availableLocations={availableLocations}
        availableIndustries={availableIndustries}
        selectedDataFilter={selectedDataFilter}
        onDataFilterChange={setSelectedDataFilter}
        countryFilter={countryFilter}
        onCountryChange={setCountryFilter}
        duplicatePhoneFilter={duplicatePhoneFilter}
        onDuplicatePhoneChange={setDuplicatePhoneFilter}
      />

      {/* Bulk Actions Bar */}
      {selectedLeads.size > 0 && (
        <BulkActionsBar
          selectedCount={selectedLeads.size}
          onClearSelection={clearSelection}
          onBulkAction={handleBulkAction}
        />
      )}

      {/* Lead List Content with Date Grouping */}
      <div className="flex-1 overflow-auto px-4">
        <DateGroupedLeads
          leads={filteredLeads}
          categories={categories}
          selectedLeads={selectedLeads}
          onSelectLead={selectLead}
          onStatusChange={handleStatusChange}
          onRemarksUpdate={handleRemarksUpdate}
          onEmailClick={handleEmailClick}
          onViewDetails={handleViewDetails}
          onDeleteLead={onLeadDelete}
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t bg-background">
          <MobilePaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalLeads}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}
    </div>
  );
};
