import React, { useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getUniqueCountriesFromLeads } from '@/utils/phoneUtils';
import type { Lead } from '@/types/lead';

interface CountryFilterProps {
  countryFilter: string;
  onCountryChange: (value: string) => void;
  leads: Lead[];
}

// NOTE: Phone numbers must be in international format (e.g., +91...) for country extraction to work.
export const CountryFilter: React.FC<CountryFilterProps> = ({
  countryFilter,
  onCountryChange,
  leads
}) => {
  const availableCountries = useMemo(() => {
    return getUniqueCountriesFromLeads(leads);
  }, [leads]);

  const hasCountries = availableCountries.length > 0;

  return (
    <Select value={countryFilter} onValueChange={onCountryChange}>
      <SelectTrigger className="w-[140px] h-10 border-border/40 bg-white/80 hover:bg-white hover:border-border/60 transition-all duration-200 font-medium">
        <SelectValue placeholder="All Countries" />
      </SelectTrigger>
      <SelectContent className="bg-white border border-border/40 shadow-lg max-h-60 overflow-y-auto">
        <SelectItem value="all" className="font-medium">All Countries</SelectItem>
        {hasCountries ? (
          availableCountries.map(country => (
            <SelectItem key={country.name} value={country.name} className="font-medium">
              {country.flag} {country.name}
            </SelectItem>
          ))
        ) : (
          <div className="px-4 py-2 text-gray-400 text-sm">No valid countries found in phone numbers</div>
        )}
      </SelectContent>
    </Select>
  );
};
