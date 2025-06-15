
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  X, 
  Download,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { getUniqueCountriesFromLeads } from '@/utils/phoneUtils';
import type { LeadStatus, Lead } from '@/types/lead';
import type { Category } from '@/types/category';
import { cn } from '@/lib/utils';

interface MobileSearchToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: LeadStatus | 'all';
  onStatusChange: (status: LeadStatus | 'all') => void;
  categoryFilter: string;
  onCategoryChange: (categoryId: string) => void;
  dataAvailabilityFilter: string;
  onDataAvailabilityChange: (filter: string) => void;
  countryFilter: string;
  onCountryChange: (country: string) => void;
  duplicatePhoneFilter: string;
  onDuplicatePhoneChange: (filter: string) => void;
  remarksFilter: string;
  onRemarksChange: (filter: string) => void;
  categories: Category[];
  leads: Lead[];
  onExport: () => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
}

export const MobileSearchToolbar: React.FC<MobileSearchToolbarProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  categoryFilter,
  onCategoryChange,
  dataAvailabilityFilter,
  onDataAvailabilityChange,
  countryFilter,
  onCountryChange,
  duplicatePhoneFilter,
  onDuplicatePhoneChange,
  remarksFilter,
  onRemarksChange,
  categories,
  leads,
  onExport,
  onClearFilters,
  activeFiltersCount
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const uniqueCountries = getUniqueCountriesFromLeads(leads);

  return (
    <div className="bg-background/95 backdrop-blur-sm border-b border-border/40">
      {/* Search Bar - Optimized for small screens */}
      <div className="px-3 sm:px-4 py-2 sm:py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-16 h-9 sm:h-10 text-sm border-border/50 focus:border-primary/50 bg-background/80"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Filter Toggle Row - More compact */}
      <div className="px-3 sm:px-4 pb-2 sm:pb-3 flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "h-8 sm:h-9 text-xs sm:text-sm border-border/50 hover:bg-muted/50",
            showFilters && "bg-muted"
          )}
        >
          <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1 sm:ml-2 h-4 w-4 p-0 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
          {showFilters ? (
            <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
          ) : (
            <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
          )}
        </Button>

        <div className="flex gap-1 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="h-8 sm:h-9 text-xs sm:text-sm border-border/50 hover:bg-muted/50"
          >
            <Download className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline ml-2">Export</span>
          </Button>

          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="h-8 sm:h-9 text-xs sm:text-sm border-border/50 hover:bg-muted/50 text-destructive"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline ml-2">Clear</span>
            </Button>
          )}
        </div>
      </div>

      {/* Expandable Filters Section - Better spacing for small screens */}
      {showFilters && (
        <div className="px-3 sm:px-4 pb-3 border-t border-border/30 bg-muted/20">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 pt-3">
            {/* Status Filter */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
              <Select value={statusFilter} onValueChange={onStatusChange}>
                <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Contacted">Contacted</SelectItem>
                  <SelectItem value="Qualified">Qualified</SelectItem>
                  <SelectItem value="Proposal">Proposal</SelectItem>
                  <SelectItem value="Negotiation">Negotiation</SelectItem>
                  <SelectItem value="Closed Won">Closed Won</SelectItem>
                  <SelectItem value="Closed Lost">Closed Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
              <Select value={categoryFilter} onValueChange={onCategoryChange}>
                <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Data Availability Filter */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Data</label>
              <Select value={dataAvailabilityFilter} onValueChange={onDataAvailabilityChange}>
                <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                  <SelectValue placeholder="All Data" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Data</SelectItem>
                  <SelectItem value="complete">Complete Data</SelectItem>
                  <SelectItem value="missing-phone">Missing Phone</SelectItem>
                  <SelectItem value="missing-email">Missing Email</SelectItem>
                  <SelectItem value="missing-linkedin">Missing LinkedIn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Country Filter */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Country</label>
              <Select value={countryFilter} onValueChange={onCountryChange}>
                <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                  <SelectValue placeholder="All Countries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {uniqueCountries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Duplicate Phone Filter */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone</label>
              <Select value={duplicatePhoneFilter} onValueChange={onDuplicatePhoneChange}>
                <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                  <SelectValue placeholder="All Phones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unique-only">Unique Only</SelectItem>
                  <SelectItem value="duplicates-only">Duplicates Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Remarks Filter */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Remarks</label>
              <Select value={remarksFilter} onValueChange={onRemarksChange}>
                <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                  <SelectValue placeholder="All Remarks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="has-remarks">Has Remarks</SelectItem>
                  <SelectItem value="no-remarks">No Remarks</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
