
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Search, Filter, X, SlidersHorizontal, Calendar, Building2, MapPin, Users, Phone, Mail, Globe, MessageSquare, Database } from 'lucide-react';
import { getUniqueCountriesFromLeads } from '@/utils/phoneUtils';
import type { LeadStatus, Seniority, CompanySize, Lead } from '@/types/lead';
import type { Category } from '@/types/category';

interface MobileSearchToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  dataAvailabilityFilter: string;
  onDataAvailabilityChange: (value: string) => void;
  countryFilter?: string;
  onCountryChange?: (value: string) => void;
  duplicatePhoneFilter?: string;
  onDuplicatePhoneChange?: (value: string) => void;
  remarksFilter?: string;
  onRemarksChange?: (value: string) => void;
  categories: Category[];
  leads: Lead[];
  onExport: () => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
}

// All available lead statuses
const allLeadStatuses: LeadStatus[] = [
  'New', 'Contacted', 'Opened', 'Clicked', 'Replied', 
  'Qualified', 'Unqualified', 'Call Back', 'Unresponsive', 
  'Not Interested', 'Interested', 'Send Email'
];

export const MobileSearchToolbar: React.FC<MobileSearchToolbarProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  categoryFilter,
  onCategoryChange,
  dataAvailabilityFilter,
  onDataAvailabilityChange,
  countryFilter = 'all',
  onCountryChange,
  duplicatePhoneFilter = 'all',
  onDuplicatePhoneChange,
  remarksFilter = 'all',
  onRemarksChange,
  categories,
  leads,
  onExport,
  onClearFilters,
  activeFiltersCount
}) => {
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Get unique countries from leads
  const availableCountries = getUniqueCountriesFromLeads(leads);

  const handleClearAllFilters = () => {
    onClearFilters();
    setIsFilterSheetOpen(false);
  };

  const totalActiveFilters = activeFiltersCount + 
    (countryFilter !== 'all' ? 1 : 0) + 
    (duplicatePhoneFilter !== 'all' ? 1 : 0) +
    (remarksFilter !== 'all' ? 1 : 0);

  return (
    <div className="space-y-3 p-3 sm:p-4">
      {/* Search Bar and Filter Button Row - More compact */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 sm:pl-10 pr-8 sm:pr-10 h-9 sm:h-11 text-sm"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1.5 sm:right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 sm:h-7 sm:w-7 p-0"
              onClick={() => onSearchChange('')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Filter Button - More compact */}
        <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 sm:h-11 px-3 sm:px-4 text-xs sm:text-sm relative flex-shrink-0 whitespace-nowrap">
              <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              <span className="hidden xs:inline">Filters</span>
              {totalActiveFilters > 0 && (
                <Badge variant="secondary" className="ml-1 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5 p-0 text-xs flex items-center justify-center">
                  {totalActiveFilters}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[90vh] max-h-[90vh] flex flex-col p-0">
            <div className="flex-shrink-0 p-4 sm:p-6 border-b">
              <SheetHeader className="text-left">
                <SheetTitle className="text-lg sm:text-xl">Filter Leads</SheetTitle>
                <SheetDescription className="text-sm">
                  Refine your search with filters
                </SheetDescription>
              </SheetHeader>
            </div>
            
            <div className="flex-1 min-h-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 sm:p-6">
                  <div className="space-y-6 sm:space-y-8 pb-20 sm:pb-24">
                    {/* Export Action */}
                    <div className="space-y-3 sm:space-y-4">
                      <h4 className="font-medium text-sm">Actions</h4>
                      <Button onClick={onExport} className="w-full h-10 sm:h-11 text-sm">
                        Export Leads
                      </Button>
                    </div>

                    {/* Basic Filters */}
                    <div className="space-y-3 sm:space-y-4">
                      <h4 className="font-medium text-sm">Basic Filters</h4>
                      <div className="grid grid-cols-1 gap-3 sm:gap-4">
                        <div className="space-y-2">
                          <label className="text-xs text-muted-foreground">Status</label>
                          <Select value={statusFilter} onValueChange={onStatusChange}>
                            <SelectTrigger className="h-10 sm:h-11 w-full text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Status</SelectItem>
                              {allLeadStatuses.map((status) => (
                                <SelectItem key={status} value={status}>{status}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-xs text-muted-foreground">Category</label>
                          <Select value={categoryFilter} onValueChange={onCategoryChange}>
                            <SelectTrigger className="h-10 sm:h-11 w-full text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Categories</SelectItem>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                                    {category.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Data & Contact Filters */}
                    <div className="space-y-3 sm:space-y-4">
                      <h4 className="font-medium text-sm flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        Data & Contact Information
                      </h4>
                      <div className="grid grid-cols-1 gap-3 sm:gap-4">
                        <div className="space-y-2">
                          <label className="text-xs text-muted-foreground">Data Availability</label>
                          <Select value={dataAvailabilityFilter} onValueChange={onDataAvailabilityChange}>
                            <SelectTrigger className="h-10 sm:h-11 w-full text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Data</SelectItem>
                              <SelectItem value="has-phone">Has Phone</SelectItem>
                              <SelectItem value="has-email">Has Email</SelectItem>
                              <SelectItem value="has-both">Has Both</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {onDuplicatePhoneChange && (
                          <div className="space-y-2">
                            <label className="text-xs text-muted-foreground">Phone Duplicates</label>
                            <Select value={duplicatePhoneFilter} onValueChange={onDuplicatePhoneChange}>
                              <SelectTrigger className="h-10 sm:h-11 w-full text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Phone Numbers</SelectItem>
                                <SelectItem value="unique-only">Unique Phone Only</SelectItem>
                                <SelectItem value="duplicates-only">Duplicates Only</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {onRemarksChange && (
                          <div className="space-y-2">
                            <label className="text-xs text-muted-foreground">Remarks</label>
                            <Select value={remarksFilter} onValueChange={onRemarksChange}>
                              <SelectTrigger className="h-10 sm:h-11 w-full text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Remarks</SelectItem>
                                <SelectItem value="has-remarks">Has Remarks</SelectItem>
                                <SelectItem value="no-remarks">No Remarks</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Location Filters */}
                    {onCountryChange && availableCountries.length > 0 && (
                      <div className="space-y-3 sm:space-y-4">
                        <h4 className="font-medium text-sm flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Location & Geography
                        </h4>
                        <div className="space-y-2">
                          <label className="text-xs text-muted-foreground">Country</label>
                          <Select value={countryFilter} onValueChange={onCountryChange}>
                            <SelectTrigger className="h-10 sm:h-11 w-full text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Countries</SelectItem>
                              {availableCountries.map(country => (
                                <SelectItem key={country.code} value={country.name}>
                                  <div className="flex items-center gap-2">
                                    <span>{country.flag}</span>
                                    <span>{country.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </div>

            {/* Fixed Action Buttons */}
            <div className="flex-shrink-0 bg-background border-t p-4 sm:p-6">
              <div className="flex flex-col gap-2 sm:gap-3">
                {totalActiveFilters > 0 && (
                  <Button variant="outline" onClick={handleClearAllFilters} className="h-10 sm:h-11 text-sm">
                    Clear All Filters
                  </Button>
                )}
                <Button onClick={() => setIsFilterSheetOpen(false)} className="h-10 sm:h-11 text-sm">
                  Apply Filters
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters Display - More compact */}
      {totalActiveFilters > 0 && (
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-max">
            <span className="text-xs text-muted-foreground flex-shrink-0">Active:</span>
            {statusFilter !== 'all' && (
              <Badge variant="secondary" className="text-xs flex-shrink-0 px-1.5 sm:px-2 py-0.5 sm:py-1">
                {statusFilter}
              </Badge>
            )}
            {categoryFilter !== 'all' && (
              <Badge variant="secondary" className="text-xs flex-shrink-0 px-1.5 sm:px-2 py-0.5 sm:py-1 max-w-20 truncate">
                {categories.find((c) => c.id === categoryFilter)?.name}
              </Badge>
            )}
            {dataAvailabilityFilter !== 'all' && (
              <Badge variant="secondary" className="text-xs flex-shrink-0 px-1.5 sm:px-2 py-0.5 sm:py-1">
                {dataAvailabilityFilter.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </Badge>
            )}
            {countryFilter !== 'all' && (
              <Badge variant="secondary" className="text-xs flex-shrink-0 px-1.5 sm:px-2 py-0.5 sm:py-1 max-w-20 truncate">
                {countryFilter}
              </Badge>
            )}
            {duplicatePhoneFilter !== 'all' && (
              <Badge variant="secondary" className="text-xs flex-shrink-0 px-1.5 sm:px-2 py-0.5 sm:py-1">
                {duplicatePhoneFilter === 'unique-only' ? 'Unique' : 'Duplicates'}
              </Badge>
            )}
            {remarksFilter !== 'all' && (
              <Badge variant="secondary" className="text-xs flex-shrink-0 px-1.5 sm:px-2 py-0.5 sm:py-1">
                {remarksFilter === 'has-remarks' ? 'Has Notes' : 'No Notes'}
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
