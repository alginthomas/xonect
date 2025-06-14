import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Search, Filter, X, SlidersHorizontal, Calendar, Building2, MapPin, Users, Phone, Mail, Globe } from 'lucide-react';
import { getUniqueCountriesFromLeads } from '@/utils/phoneUtils';
import type { LeadStatus, Seniority, CompanySize, Lead } from '@/types/lead';
import type { Category } from '@/types/category';
import { MobileSearchFilters } from './mobile-search-filters';
import { LeadTable } from './lead-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { api } from '@/convex/_generated/api';
import { useMutation } from 'convex/react';
import { ConfirmDialog } from './confirm-dialog';
import { useConfirm } from './use-confirm';
import { BulkEditCategories } from './bulk-edit-categories';
import { BulkEditStatuses } from './bulk-edit-statuses';
import { Pagination } from './pagination';

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

  const { toast } = useToast();
  const { confirm } = useConfirm();

  const updateLeadStatus = useMutation(api.leads.updateLeadStatus);
  const updateLeadCategory = useMutation(api.leads.updateLeadCategory);
  const deleteLead = useMutation(api.leads.deleteLead);

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
    return count;
  };

  const handleStatusUpdate = async (leadId: string, status: LeadStatus) => {
    try {
      await updateLeadStatus({ leadId, status });
      toast({
        title: "Status updated.",
        description: "Lead status has been updated successfully.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error.message,
      })
    }
  };

  const handleCategoryUpdate = async (leadId: string, categoryId: string) => {
    try {
      await updateLeadCategory({ leadId, categoryId });
      toast({
        title: "Category updated.",
        description: "Lead category has been updated successfully.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error.message,
      })
    }
  };

  const handleDelete = async (leadId: string) => {
    confirm({
      title: 'Are you sure?',
      description: 'This action cannot be undone. Are you sure you want to delete this lead?',
      onConfirm: async () => {
        try {
          await deleteLead({ leadId });
          toast({
            title: "Lead deleted.",
            description: "Lead has been deleted successfully.",
          })
        } catch (error: any) {
          toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: error.message,
          })
        }
      },
    });
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

      <LeadTable
        leads={leads}
        categories={categories}
        onLeadUpdate={onLeadUpdate}
        onLeadDelete={onLeadDelete}
        onBulkStatusUpdate={onBulkStatusUpdate}
        onBulkCategoryUpdate={onBulkCategoryUpdate}
        onBulkDelete={onBulkDelete}
        onClearSelection={onClearSelection}
        selectedLeads={selectedLeads}
        onLeadSelect={onLeadSelect}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        totalLeads={totalLeads}
        itemsPerPage={itemsPerPage}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={onSort}
        handleStatusUpdate={handleStatusUpdate}
        handleCategoryUpdate={handleCategoryUpdate}
        handleDelete={handleDelete}
      />
    </div>
  );
};
