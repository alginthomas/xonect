
import type { Lead } from '@/types/lead';

export const sortLeads = (leads: Lead[], sortField: string, sortDirection: 'asc' | 'desc'): Lead[] => {
  // If no sort field is provided, return leads in their current order
  if (!sortField || sortField.trim() === '') {
    return [...leads];
  }

  return [...leads].sort((a, b) => {
    let aValue: any = a[sortField as keyof Lead];
    let bValue: any = b[sortField as keyof Lead];

    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return sortDirection === 'asc' ? 1 : -1;
    if (bValue == null) return sortDirection === 'asc' ? -1 : 1;

    if (aValue instanceof Date) aValue = aValue.getTime();
    if (bValue instanceof Date) bValue = bValue.getTime();
    if (typeof aValue === 'string') aValue = aValue.toLowerCase();
    if (typeof bValue === 'string') bValue = bValue.toLowerCase();

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
};
