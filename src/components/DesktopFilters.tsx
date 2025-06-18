
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { SearchBar } from '@/components/filters/SearchBar';
import { FilterControls } from '@/components/filters/FilterControls';
import { SecondaryFilters } from '@/components/filters/SecondaryFilters';
import { ActiveFilterChips } from '@/components/filters/ActiveFilterChips';
import { FilterActions } from '@/components/filters/FilterActions';
import type { Category, ImportBatch } from '@/types/category';
import type { Lead } from '@/types/lead';
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
  columns: ColumnConfig[];
  onToggleColumnVisibility: (columnId: string) => void;
  onResetColumns: () => void;
}

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
  remarksFilter = 'all',
  onRemarksChange,
  batchFilter = 'all',
  onBatchChange,
  categories,
  leads,
  importBatches = [],
  onExport,
  onClearFilters,
  activeFiltersCount,
  columns,
  onToggleColumnVisibility,
  onResetColumns
}) => {
  // Calculate total active filters including batch filter
  const totalActiveFilters = activeFiltersCount + 
    (countryFilter !== 'all' ? 1 : 0) + 
    (duplicatePhoneFilter !== 'all' ? 1 : 0) + 
    (remarksFilter !== 'all' ? 1 : 0) +
    (batchFilter !== 'all' ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Enhanced Search Bar */}
      <SearchBar 
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
      />

      {/* Filters Card */}
      <Card className="border border-border/40 shadow-sm bg-white/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="space-y-5">
            {/* Filter Controls Row */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Primary Filters */}
              <FilterControls
                statusFilter={statusFilter}
                onStatusChange={onStatusChange}
                categoryFilter={categoryFilter}
                onCategoryChange={onCategoryChange}
                dataAvailabilityFilter={dataAvailabilityFilter}
                onDataAvailabilityChange={onDataAvailabilityChange}
                categories={categories}
              />

              {/* Secondary Filters */}
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

              {/* Filter Summary and Actions */}
              <FilterActions
                totalActiveFilters={totalActiveFilters}
                onClearFilters={onClearFilters}
                onExport={onExport}
                columns={columns}
                onToggleColumnVisibility={onToggleColumnVisibility}
                onResetColumns={onResetColumns}
              />
            </div>

            {/* Active Filter Chips */}
            <ActiveFilterChips
              statusFilter={statusFilter}
              onStatusChange={onStatusChange}
              categoryFilter={categoryFilter}
              onCategoryChange={onCategoryChange}
              dataAvailabilityFilter={dataAvailabilityFilter}
              onDataAvailabilityChange={onDataAvailabilityChange}
              countryFilter={countryFilter}
              onCountryChange={onCountryChange}
              duplicatePhoneFilter={duplicatePhoneFilter}
              onDuplicatePhoneChange={onDuplicatePhoneChange}
              remarksFilter={remarksFilter}
              onRemarksChange={onRemarksChange}
              batchFilter={batchFilter}
              onBatchChange={onBatchChange}
              categories={categories}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
