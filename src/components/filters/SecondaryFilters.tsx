
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, Phone } from 'lucide-react';
import { getUniqueCountriesFromLeads } from '@/utils/phoneUtils';
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
  const availableCountries = getUniqueCountriesFromLeads(leads);

  return (
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
  );
};
