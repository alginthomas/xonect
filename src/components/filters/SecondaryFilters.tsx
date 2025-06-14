
import React from 'react';
import { CountryFilter } from './CountryFilter';
import { DuplicatePhoneFilter } from './DuplicatePhoneFilter';
import type { Lead } from '@/types/lead';

interface SecondaryFiltersProps {
  countryFilter?: string;
  onCountryChange?: (value: string) => void;
  duplicatePhoneFilter?: string;
  onDuplicatePhoneChange?: (value: string) => void;
  leads: Lead[];
}

export const SecondaryFilters: React.FC<SecondaryFiltersProps> = ({
  countryFilter = 'all',
  onCountryChange,
  duplicatePhoneFilter = 'all',
  onDuplicatePhoneChange,
  leads
}) => {
  return (
    <div className="flex items-center gap-3">
      {onCountryChange && (
        <CountryFilter
          countryFilter={countryFilter}
          onCountryChange={onCountryChange}
          leads={leads}
        />
      )}
      
      {onDuplicatePhoneChange && (
        <DuplicatePhoneFilter
          duplicatePhoneFilter={duplicatePhoneFilter}
          onDuplicatePhoneChange={onDuplicatePhoneChange}
        />
      )}
    </div>
  );
};
