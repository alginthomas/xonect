
import React, { useState } from 'react';
import { Search, Filter, X, Download, MoreVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { FilterControls } from '@/components/filters/FilterControls';
import { SecondaryFilters } from '@/components/filters/SecondaryFilters';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { Category, ImportBatch } from '@/types/category';
import type { Lead } from '@/types/lead';

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
  batchFilter?: string;
  onBatchChange?: (value: string) => void;
  categories: Category[];
  leads: Lead[];
  importBatches?: ImportBatch[];
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
  countryFilter = 'all',
  onCountryChange,
  duplicatePhoneFilter = 'all',
  onDuplicatePhoneChange,
  remarksFilter = 'all',
  onRemarksChange,
  batchFilter = 'all',
  onBatchChange,
  categories,
  leads,
  importBatches = [],
  onExport,
  onClearFilters,
  activeFiltersCount
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Calculate total active filters including batch filter
  const totalActiveFilters = activeFiltersCount + 
    (countryFilter !== 'all' ? 1 : 0) + 
    (duplicatePhoneFilter !== 'all' ? 1 : 0) + 
    (remarksFilter !== 'all' ? 1 : 0) +
    (batchFilter !== 'all' ? 1 : 0);

  return (
    <div className="px-3 sm:px-4 py-2 sm:py-3 space-y-3">
      {/* Search Bar Row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 h-10 bg-white/80 border-border/40 focus:bg-white focus:border-primary/60 transition-all duration-200"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSearchChange('')}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted/50"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Filter Button */}
        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="relative h-10 px-3 border-border/40 bg-white/80">
              <Filter className="h-4 w-4" />
              {totalActiveFilters > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center">
                  {totalActiveFilters}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] flex flex-col">
            <SheetHeader className="border-b pb-4">
              <SheetTitle className="flex items-center justify-between">
                <span>Filters</span>
                {totalActiveFilters > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onClearFilters();
                      setIsFilterOpen(false);
                    }}
                    className="text-destructive border-destructive/30 hover:bg-destructive/10"
                  >
                    Clear All ({totalActiveFilters})
                  </Button>
                )}
              </SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-auto space-y-6 pt-4">
              {/* Primary Filters */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Primary Filters</h3>
                <div className="space-y-3">
                  <FilterControls
                    statusFilter={statusFilter}
                    onStatusChange={onStatusChange}
                    categoryFilter={categoryFilter}
                    onCategoryChange={onCategoryChange}
                    dataAvailabilityFilter={dataAvailabilityFilter}
                    onDataAvailabilityChange={onDataAvailabilityChange}
                    categories={categories}
                  />
                </div>
              </div>

              {/* Secondary Filters */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Additional Filters</h3>
                <div className="space-y-3">
                  <SecondaryFilters
                    countryFilter={countryFilter}
                    onCountryChange={onCountryChange}
                    duplicatePhoneFilter={duplicatePhoneFilter}
                    onDuplicatePhoneChange={onDuplicatePhoneChange}
                    remarksFilter={remarksFilter}
                    onRemarksChange={onRemarksChange}
                    batchFilter={batchFilter}
                    onBatchChange={onBatchChange}
                    leads={leads}
                    importBatches={importBatches}
                  />
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* More Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-10 px-3 border-border/40 bg-white/80">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={onExport} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
