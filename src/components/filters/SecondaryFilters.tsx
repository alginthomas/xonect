
import React from 'react';
import { CountryFilter } from './CountryFilter';
import { DuplicatePhoneFilter } from './DuplicatePhoneFilter';
import { RemarksFilter } from './RemarksFilter';
import type { Lead } from '@/types/lead';

interface SecondaryFiltersProps {
  countryFilter?: string;
  onCountryChange?: (value: string) => void;
  duplicatePhoneFilter?: string;
  onDuplicatePhoneChange?: (value: string) => void;
  remarksFilter?: string;
  onRemarksChange?: (value: string) => void;
  leads: Lead[];
}

export const SecondaryFilters: React.FC<SecondaryFiltersProps> = ({
  countryFilter = 'all',
  onCountryChange,
  duplicatePhoneFilter = 'all',
  onDuplicatePhoneChange,
  remarksFilter = 'all',
  onRemarksChange,
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

      {onRemarksChange && (
        <RemarksFilter
          remarksFilter={remarksFilter}
          onRemarksChange={onRemarksChange}
        />
      )}
    </div>
  );
};
