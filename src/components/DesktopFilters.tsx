
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColumnSettings } from '@/components/ColumnSettings';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, ArrowUp, X, Filter, Settings, MoreHorizontal, Phone, Globe } from 'lucide-react';
import { getUniqueCountriesFromLeads } from '@/utils/phoneUtils';
import type { Category } from '@/types/category';
import type { LeadStatus, Lead } from '@/types/lead';
import type { ColumnConfig } from '@/hooks/useColumnConfiguration';

interface DesktopFiltersProps {
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
  columns: ColumnConfig[];
  onToggleColumnVisibility: (columnId: string) => void;
  onResetColumns: () => void;
}

// All available lead statuses
const allLeadStatuses: LeadStatus[] = ['New', 'Contacted', 'Opened', 'Clicked', 'Replied', 'Qualified', 'Unqualified', 'Call Back', 'Unresponsive', 'Not Interested', 'Interested', 'Send Email'];

export const DesktopFilters: React.FC<DesktopFiltersProps> = ({
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
  activeFiltersCount,
  columns,
  onToggleColumnVisibility,
  onResetColumns
}) => {
  // Get unique countries from leads
  const availableCountries = getUniqueCountriesFromLeads(leads);

  const getActiveFilterChips = () => {
    const chips = [];
    if (statusFilter !== 'all') {
      chips.push({
        type: 'status',
        label: `Status: ${statusFilter}`,
        onRemove: () => onStatusChange('all')
      });
    }
    if (categoryFilter !== 'all') {
      const category = categories.find(c => c.id === categoryFilter);
      chips.push({
        type: 'category',
        label: `Category: ${category?.name || 'Unknown'}`,
        onRemove: () => onCategoryChange('all')
      });
    }
    if (dataAvailabilityFilter !== 'all') {
      const dataLabel = dataAvailabilityFilter.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
      chips.push({
        type: 'data',
        label: `Data: ${dataLabel}`,
        onRemove: () => onDataAvailabilityChange('all')
      });
    }
    if (countryFilter !== 'all' && onCountryChange) {
      chips.push({
        type: 'country',
        label: `Country: ${countryFilter}`,
        onRemove: () => onCountryChange('all')
      });
    }
    if (duplicatePhoneFilter !== 'all' && onDuplicatePhoneChange) {
      const phoneLabel = duplicatePhoneFilter === 'unique-only' ? 'Unique Phone Only' : 'Duplicates Only';
      chips.push({
        type: 'phone',
        label: `Phone: ${phoneLabel}`,
        onRemove: () => onDuplicatePhoneChange('all')
      });
    }
    return chips;
  };

  const activeFilterChips = getActiveFilterChips();

  // Calculate total active filters including country and duplicate phone filter
  const totalActiveFilters = activeFiltersCount + (countryFilter !== 'all' ? 1 : 0) + (duplicatePhoneFilter !== 'all' ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Enhanced Search Bar */}
      <div className="relative group">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
          <Search className="text-muted-foreground h-5 w-5 group-focus-within:text-primary transition-colors duration-200" />
        </div>
        <Input 
          placeholder="Search leads by name, company, email, or phone..." 
          value={searchTerm} 
          onChange={(e) => onSearchChange(e.target.value)} 
          className="pl-12 pr-4 h-12 text-base bg-white/80 border border-border/40 rounded-xl shadow-sm backdrop-blur-sm focus:bg-white focus:border-primary/50 focus:shadow-md focus:shadow-primary/5 transition-all duration-300 ease-out placeholder:text-muted-foreground/70 hover:border-border/60 hover:shadow-sm font-medium" 
        />
        {searchTerm && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onSearchChange('')} 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 rounded-full hover:bg-muted/80 opacity-70 hover:opacity-100 transition-all duration-200"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
      </div>

      {/* Filters Card */}
      <Card className="border border-border/40 shadow-sm bg-white/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="space-y-5">
            {/* Filter Controls Row */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Primary Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <Select value={statusFilter} onValueChange={onStatusChange}>
                  <SelectTrigger className="w-[150px] h-10 border-border/40 bg-white/80 hover:bg-white hover:border-border/60 transition-all duration-200 font-medium">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-border/40 shadow-lg">
                    <SelectItem value="all" className="font-medium">All Statuses</SelectItem>
                    {allLeadStatuses.map((status) => (
                      <SelectItem key={status} value={status} className="font-medium">{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={onCategoryChange}>
                  <SelectTrigger className="w-[170px] h-10 border-border/40 bg-white/80 hover:bg-white hover:border-border/60 transition-all duration-200 font-medium">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-border/40 shadow-lg">
                    <SelectItem value="all" className="font-medium">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id} className="font-medium">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={dataAvailabilityFilter} onValueChange={onDataAvailabilityChange}>
                  <SelectTrigger className="w-[140px] h-10 border-border/40 bg-white/80 hover:bg-white hover:border-border/60 transition-all duration-200 font-medium">
                    <SelectValue placeholder="All Data" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-border/40 shadow-lg">
                    <SelectItem value="all" className="font-medium">All Data</SelectItem>
                    <SelectItem value="has-email" className="font-medium">Has Email</SelectItem>
                    <SelectItem value="has-phone" className="font-medium">Has Phone</SelectItem>
                    <SelectItem value="has-both" className="font-medium">Has Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Secondary Filters */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Country Filter */}
                {onCountryChange && availableCountries.length > 0 && (
                  <Select value={countryFilter} onValueChange={onCountryChange}>
                    <SelectTrigger className="w-[160px] h-10 border-border/40 bg-white/80 hover:bg-white hover:border-border/60 transition-all duration-200 font-medium">
                      <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                      <SelectValue placeholder="All Countries" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-border/40 shadow-lg">
                      <SelectItem value="all" className="font-medium">All Countries</SelectItem>
                      {availableCountries.map(country => (
                        <SelectItem key={country.code} value={country.name} className="font-medium">
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
                    <SelectTrigger className="w-[180px] h-10 border-border/40 bg-white/80 hover:bg-white hover:border-border/60 transition-all duration-200 font-medium">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <SelectValue placeholder="All Phone Numbers" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-border/40 shadow-lg">
                      <SelectItem value="all" className="font-medium">All Phone Numbers</SelectItem>
                      <SelectItem value="unique-only" className="font-medium">Unique Phone Only</SelectItem>
                      <SelectItem value="duplicates-only" className="font-medium">Duplicates Only</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Filter Summary and Actions */}
              <div className="flex items-center gap-3 ml-auto">
                {totalActiveFilters > 0 && (
                  <>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-medium px-3 py-1">
                      <Filter className="h-3 w-3 mr-1.5" />
                      {totalActiveFilters} filter{totalActiveFilters > 1 ? 's' : ''} active
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={onClearFilters} 
                      className="h-8 px-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors duration-200"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear all
                    </Button>
                  </>
                )}

                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-10 gap-2 border-border/40 hover:border-border/60 hover:bg-white transition-all duration-200 font-medium">
                        <MoreHorizontal className="h-4 w-4" />
                        Actions
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-white border border-border/40 shadow-lg">
                      <DropdownMenuItem onClick={onExport} className="gap-2 font-medium">
                        <ArrowUp className="h-4 w-4" />
                        Export to CSV
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <ColumnSettings 
                    columns={columns} 
                    onToggleVisibility={onToggleColumnVisibility} 
                    onReset={onResetColumns} 
                  />
                </div>
              </div>
            </div>

            {/* Active Filter Chips */}
            {activeFilterChips.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-4 border-t border-border/30">
                <span className="text-sm font-medium text-muted-foreground self-center mr-2">Active filters:</span>
                {activeFilterChips.map((chip, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="bg-primary/5 border-primary/20 text-primary text-sm px-3 py-1.5 gap-2 hover:bg-primary/10 transition-colors duration-200 font-medium"
                  >
                    {chip.label}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-4 w-4 p-0 hover:bg-primary/20 rounded-full transition-colors duration-200" 
                      onClick={chip.onRemove}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
