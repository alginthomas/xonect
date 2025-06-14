
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { getUniqueCountriesFromLeads } from '@/utils/phoneUtils';
import type { LeadStatus, Seniority, CompanySize, Lead } from '@/types/lead';
import type { Category } from '@/types/category';
import { MobileSearchFilters } from './mobile-search-filters';

interface MobileLeadsListProps {
  leads: Lead[];
  categories: Category[];
  onLeadUpdate: (leadId: string, updates: Partial<Lead>) => Promise<void>;
  onLeadDelete: (leadId: string) => Promise<void>;
  onBulkStatusUpdate: (leadIds: string[], status: LeadStatus) => Promise<void>;
  onBulkCategoryUpdate: (leadIds: string[], categoryId: string) => Promise<void>;
  onBulkDelete: (leadIds: string[]) => Promise<void>;
  onClearSelection: () => void;
  selectedLeads: Set<string>;
  onLeadSelect: (leadId: string, isSelected: boolean) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalLeads: number;
  itemsPerPage: number;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onSort: (field: string) => void;
}

export const MobileLeadsList: React.FC<MobileLeadsListProps> = ({
  leads,
  categories,
  onLeadUpdate,
  onLeadDelete,
  onBulkStatusUpdate,
  onBulkCategoryUpdate,
  onBulkDelete,
  onClearSelection,
  selectedLeads,
  onLeadSelect,
  currentPage,
  totalPages,
  onPageChange,
  totalLeads,
  itemsPerPage,
  sortField,
  sortDirection,
  onSort
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

      {/* Lead List Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-4">
          {leads.map((lead) => (
            <div key={lead.id} className="bg-white border rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{lead.first_name} {lead.last_name}</h3>
                <Badge variant="outline">{lead.status}</Badge>
              </div>
              <p className="text-gray-600 text-sm mb-1">{lead.title} at {lead.company}</p>
              <p className="text-gray-500 text-sm">{lead.email}</p>
              {lead.phone && <p className="text-gray-500 text-sm">{lead.phone}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
