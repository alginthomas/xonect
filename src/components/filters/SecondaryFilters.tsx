
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BatchCombobox } from '@/components/BatchCombobox';
import type { Lead } from '@/types/lead';
import type { ImportBatch } from '@/types/category';

interface SecondaryFiltersProps {
  countryFilter?: string;
  onCountryChange?: (value: string) => void;
  duplicatePhoneFilter?: string;
  onDuplicatePhoneChange?: (value: string) => void;
  remarksFilter?: string;
  onRemarksChange?: (value: string) => void;
  batchFilter?: string;
  onBatchChange?: (value: string) => void;
  leads: Lead[];
  importBatches?: ImportBatch[];
}

export const SecondaryFilters: React.FC<SecondaryFiltersProps> = ({
  countryFilter = 'all',
  onCountryChange,
  duplicatePhoneFilter = 'all',
  onDuplicatePhoneChange,
  remarksFilter = 'all',
  onRemarksChange,
  batchFilter = 'all',
  onBatchChange,
  leads,
  importBatches = []
}) => {
  // Extract unique countries from leads for country filter
  const countries = React.useMemo(() => {
    const countrySet = new Set<string>();
    leads.forEach(lead => {
      if (lead.location) {
        // Simple extraction - you might want to improve this logic
        const parts = lead.location.split(',').map(part => part.trim());
        if (parts.length > 0) {
          const lastPart = parts[parts.length - 1];
          if (lastPart && lastPart.length > 1) {
            countrySet.add(lastPart);
          }
        }
      }
    });
    return Array.from(countrySet).sort();
  }, [leads]);

  // Calculate lead counts per batch
  const batchLeadCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach(lead => {
      if (lead.importBatchId) {
        counts[lead.importBatchId] = (counts[lead.importBatchId] || 0) + 1;
      }
    });
    return counts;
  }, [leads]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Country Filter */}
      {onCountryChange && countries.length > 0 && (
        <Select value={countryFilter} onValueChange={onCountryChange}>
          <SelectTrigger className="w-[140px] h-10 border-border/40 bg-white/80 hover:bg-white hover:border-border/60 transition-all duration-200 font-medium">
            <SelectValue placeholder="All Countries" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-border/40 shadow-lg">
            <SelectItem value="all" className="font-medium">All Countries</SelectItem>
            {countries.map(country => (
              <SelectItem key={country} value={country} className="font-medium">
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Duplicate Phone Filter */}
      {onDuplicatePhoneChange && (
        <Select value={duplicatePhoneFilter} onValueChange={onDuplicatePhoneChange}>
          <SelectTrigger className="w-[160px] h-10 border-border/40 bg-white/80 hover:bg-white hover:border-border/60 transition-all duration-200 font-medium">
            <SelectValue placeholder="Phone Filter" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-border/40 shadow-lg">
            <SelectItem value="all" className="font-medium">All Phones</SelectItem>
            <SelectItem value="unique-only" className="font-medium">Unique Only</SelectItem>
            <SelectItem value="duplicates-only" className="font-medium">Duplicates Only</SelectItem>
          </SelectContent>
        </Select>
      )}

      {/* Remarks Filter */}
      {onRemarksChange && (
        <Select value={remarksFilter} onValueChange={onRemarksChange}>
          <SelectTrigger className="w-[140px] h-10 border-border/40 bg-white/80 hover:bg-white hover:border-border/60 transition-all duration-200 font-medium">
            <SelectValue placeholder="Remarks" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-border/40 shadow-lg">
            <SelectItem value="all" className="font-medium">All Remarks</SelectItem>
            <SelectItem value="has-remarks" className="font-medium">Has Remarks</SelectItem>
            <SelectItem value="no-remarks" className="font-medium">No Remarks</SelectItem>
          </SelectContent>
        </Select>
      )}

      {/* Batch Filter */}
      {onBatchChange && importBatches.length > 0 && (
        <BatchCombobox
          batches={importBatches}
          value={batchFilter}
          onChange={onBatchChange}
          placeholder="All Batches"
          className="w-[200px] h-10"
          leadCounts={batchLeadCounts}
        />
      )}
    </div>
  );
};
