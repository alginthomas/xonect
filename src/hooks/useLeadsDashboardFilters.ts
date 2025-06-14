
import { useMemo } from 'react';

interface UseLeadsDashboardFiltersProps {
  statusFilter: string;
  categoryFilter: string;
  dataAvailabilityFilter: string;
  countryFilter: string;
  duplicatePhoneFilter: string;
  setStatusFilter: (value: string) => void;
  setCategoryFilter: (value: string) => void;
  setDataAvailabilityFilter: (value: string) => void;
  setCountryFilter: (value: string) => void;
  setDuplicatePhoneFilter: (value: 'all' | 'unique-only' | 'duplicates-only') => void;
  setSearchTerm: (value: string) => void;
  setNavigationFilter: (value: { status?: string; [key: string]: any } | undefined) => void;
}

export const useLeadsDashboardFilters = ({
  statusFilter,
  categoryFilter,
  dataAvailabilityFilter,
  countryFilter,
  duplicatePhoneFilter,
  setStatusFilter,
  setCategoryFilter,
  setDataAvailabilityFilter,
  setCountryFilter,
  setDuplicatePhoneFilter,
  setSearchTerm,
  setNavigationFilter
}: UseLeadsDashboardFiltersProps) => {
  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== 'all') count++;
    if (categoryFilter !== 'all') count++;
    if (dataAvailabilityFilter !== 'all') count++;
    if (countryFilter !== 'all') count++;
    if (duplicatePhoneFilter !== 'all') count++;
    return count;
  }, [statusFilter, categoryFilter, dataAvailabilityFilter, countryFilter, duplicatePhoneFilter]);

  const clearAllFilters = () => {
    setStatusFilter('all');
    setCategoryFilter('all');
    setDataAvailabilityFilter('all');
    setCountryFilter('all');
    setDuplicatePhoneFilter('all');
    setSearchTerm('');
    setNavigationFilter(undefined);
    
    const url = new URL(window.location.href);
    url.searchParams.delete('status');
    window.history.replaceState({}, '', url.toString());
  };

  return {
    activeFiltersCount,
    clearAllFilters
  };
};
