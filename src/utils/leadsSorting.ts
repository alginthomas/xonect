
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

    // Handle special field mappings for nested data
    if (sortField === 'category') {
      // For category sorting, we would need category names but since we don't have access to categories here,
      // we'll sort by categoryId for now
      aValue = a.categoryId || '';
      bValue = b.categoryId || '';
    }

    // Handle name sorting by combining first and last names
    if (sortField === 'name') {
      aValue = `${a.firstName || ''} ${a.lastName || ''}`.trim().toLowerCase();
      bValue = `${b.firstName || ''} ${b.lastName || ''}`.trim().toLowerCase();
    }

    // Handle date fields
    if (aValue instanceof Date) aValue = aValue.getTime();
    if (bValue instanceof Date) bValue = bValue.getTime();
    
    // Handle string fields (case-insensitive)
    if (typeof aValue === 'string') aValue = aValue.toLowerCase();
    if (typeof bValue === 'string') bValue = bValue.toLowerCase();

    // Handle numeric fields
    if (sortField === 'emailsSent' || sortField === 'companySize') {
      aValue = Number(aValue) || 0;
      bValue = Number(bValue) || 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
};
