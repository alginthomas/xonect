
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
    (duplicatePhoneFilter !== 'all' ? 1 : 0);

  return (
    <div className="space-y-4 p-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search leads..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10 h-11"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
            onClick={() => onSearchChange('')}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Quick Filters Row - Horizontal Scrolling Container */}
      <div className="relative">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-3 pb-2 min-w-max py-[6px] px-[6px]">
            <Select value={statusFilter} onValueChange={onStatusChange}>
              <SelectTrigger className="w-32 h-10 text-sm flex-shrink-0">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {allLeadStatuses.map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={onCategoryChange}>
              <SelectTrigger className="w-32 h-10 text-sm flex-shrink-0">
                <SelectValue placeholder="Category" />
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

            {/* Data Availability Filter */}
            <Select value={dataAvailabilityFilter} onValueChange={onDataAvailabilityChange}>
              <SelectTrigger className="w-36 h-10 text-sm flex-shrink-0">
                <Database className="h-3 w-3 mr-2" />
                <SelectValue placeholder="Data" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Data</SelectItem>
                <SelectItem value="has-email">Has Email</SelectItem>
                <SelectItem value="has-phone">Has Phone</SelectItem>
                <SelectItem value="has-both">Has Both</SelectItem>
              </SelectContent>
            </Select>

            {/* Country Filter */}
            {onCountryChange && availableCountries.length > 0 && (
              <Select value={countryFilter} onValueChange={onCountryChange}>
                <SelectTrigger className="w-36 h-10 text-sm flex-shrink-0">
                  <Globe className="h-3 w-3 mr-2" />
                  <SelectValue placeholder="Country" />
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
            )}

            {/* Duplicate Phone Filter */}
            {onDuplicatePhoneChange && (
              <Select value={duplicatePhoneFilter} onValueChange={onDuplicatePhoneChange}>
                <SelectTrigger className="w-40 h-10 text-sm flex-shrink-0">
                  <Phone className="h-3 w-3 mr-2" />
                  <SelectValue placeholder="Phone Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Phone Numbers</SelectItem>
                  <SelectItem value="unique-only">Unique Phone Only</SelectItem>
                  <SelectItem value="duplicates-only">Duplicates Only</SelectItem>
                </SelectContent>
              </Select>
            )}

            {/* Advanced Filters Sheet */}
            <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-10 px-4 text-sm relative flex-shrink-0 whitespace-nowrap">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  More
                  {totalActiveFilters > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs flex items-center justify-center">
                      {totalActiveFilters}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[90vh] max-h-[90vh] flex flex-col p-0">
                <div className="flex-shrink-0 p-6 border-b">
                  <SheetHeader className="text-left">
                    <SheetTitle>Advanced Filters</SheetTitle>
                    <SheetDescription>
                      Refine your search with additional filters
                    </SheetDescription>
                  </SheetHeader>
                </div>
                
                <div className="flex-1 min-h-0 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="p-6">
                      <div className="space-y-8 pb-24">
                        {/* Export Action */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-sm">Actions</h4>
                          <Button onClick={onExport} className="w-full">
                            Export Leads
                          </Button>
                        </div>

                        {/* Basic Filters */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-sm">Basic Filters</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-xs text-muted-foreground">Status</label>
                              <Select value={statusFilter} onValueChange={onStatusChange}>
                                <SelectTrigger className="h-11 w-full">
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
                                <SelectTrigger className="h-11 w-full">
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
                        <div className="space-y-4">
                          <h4 className="font-medium text-sm flex items-center gap-2">
                            <Database className="h-4 w-4" />
                            Data & Contact Information
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-xs text-muted-foreground">Data Availability</label>
                              <Select value={dataAvailabilityFilter} onValueChange={onDataAvailabilityChange}>
                                <SelectTrigger className="h-11 w-full">
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
                                  <SelectTrigger className="h-11 w-full">
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
                          </div>
                        </div>

                        {/* Location Filters */}
                        {onCountryChange && availableCountries.length > 0 && (
                          <div className="space-y-4">
                            <h4 className="font-medium text-sm flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              Location & Geography
                            </h4>
                            <div className="space-y-2">
                              <label className="text-xs text-muted-foreground">Country</label>
                              <Select value={countryFilter} onValueChange={onCountryChange}>
                                <SelectTrigger className="h-11 w-full">
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
                <div className="flex-shrink-0 bg-background border-t p-6">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" onClick={handleClearAllFilters} className="flex-1 h-11">
                      Clear All
                    </Button>
                    <Button onClick={() => setIsFilterSheetOpen(false)} className="flex-1 h-11">
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Clear Filters Button */}
            {totalActiveFilters > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAllFilters}
                className="h-10 px-3 text-sm flex-shrink-0 whitespace-nowrap"
              >
                <X className="h-3 w-3 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </div>
        
        {/* Fade effect to indicate scrollable content */}
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>

      {/* Active Filters Display */}
      {totalActiveFilters > 0 && (
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2 min-w-max">
            <span className="text-xs text-muted-foreground flex-shrink-0">Active filters:</span>
            {statusFilter !== 'all' && (
              <Badge variant="secondary" className="text-xs flex-shrink-0 px-2 py-1">
                Status: {statusFilter}
              </Badge>
            )}
            {categoryFilter !== 'all' && (
              <Badge variant="secondary" className="text-xs flex-shrink-0 px-2 py-1">
                Category: {categories.find((c) => c.id === categoryFilter)?.name}
              </Badge>
            )}
            {dataAvailabilityFilter !== 'all' && (
              <Badge variant="secondary" className="text-xs flex-shrink-0 px-2 py-1">
                Data: {dataAvailabilityFilter.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </Badge>
            )}
            {countryFilter !== 'all' && (
              <Badge variant="secondary" className="text-xs flex-shrink-0 px-2 py-1">
                Country: {countryFilter}
              </Badge>
            )}
            {duplicatePhoneFilter !== 'all' && (
              <Badge variant="secondary" className="text-xs flex-shrink-0 px-2 py-1">
                Phone: {duplicatePhoneFilter === 'unique-only' ? 'Unique Only' : 'Duplicates Only'}
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
