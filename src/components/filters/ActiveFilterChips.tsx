
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { Category } from '@/types/category';

interface FilterChip {
  type: string;
  label: string;
  onRemove: () => void;
}

interface ActiveFilterChipsProps {
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
}

export const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({
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
  categories
}) => {
  const getActiveFilterChips = (): FilterChip[] => {
    const chips = [];
    
    // Check if batch filter is active
    const isBatchFilterActive = batchFilter !== 'all';
    
    if (statusFilter !== 'all') {
      chips.push({
        type: 'status',
        label: `Status: ${statusFilter}`,
        onRemove: () => onStatusChange('all')
      });
    }
    
    // Only show category filter if batch filter is NOT active
    if (!isBatchFilterActive && categoryFilter !== 'all') {
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
    
    if (remarksFilter !== 'all' && onRemarksChange) {
      const remarksLabel = remarksFilter === 'has-remarks' ? 'Has Remarks' : 'No Remarks';
      chips.push({
        type: 'remarks',
        label: `Remarks: ${remarksLabel}`,
        onRemove: () => onRemarksChange('all')
      });
    }
    
    // Show batch filter chip if active
    if (isBatchFilterActive && onBatchChange) {
      chips.push({
        type: 'batch',
        label: `Batch: ${batchFilter}`,
        onRemove: () => onBatchChange('all')
      });
    }
    
    return chips;
  };

  const activeFilterChips = getActiveFilterChips();

  if (activeFilterChips.length === 0) {
    return null;
  }

  return (
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
  );
};
