
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

    // Handle date fields
    if (aValue instanceof Date) aValue = aValue.getTime();
    if (bValue instanceof Date) bValue = bValue.getTime();
    
    // Handle string date fields
    if (typeof aValue === 'string' && (sortField.includes('date') || sortField.includes('Date') || sortField === 'createdAt' || sortField === 'lastContact')) {
      const aDate = new Date(aValue);
      const bDate = new Date(bValue);
      if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
        aValue = aDate.getTime();
        bValue = bDate.getTime();
      }
    }
    
    // Handle string fields (case-insensitive with natural sorting)
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      // Use natural sorting for better number handling in strings
      const comparison = aValue.localeCompare(bValue, undefined, {
        numeric: true,
        sensitivity: 'base'
      });
      return sortDirection === 'asc' ? comparison : -comparison;
    }

    // Handle numeric fields
    if (sortField === 'emailsSent' || sortField === 'companySize') {
      aValue = Number(aValue) || 0;
      bValue = Number(bValue) || 0;
    }

    // Handle custom sort orders for specific fields
    const customSortOrders = {
      status: ['New', 'Contacted', 'Qualified', 'Interested', 'Not Interested', 'Converted'],
      seniority: ['Junior', 'Mid-Level', 'Senior', 'Manager', 'Director', 'VP', 'C-Level'],
    };

    if (customSortOrders[sortField as keyof typeof customSortOrders]) {
      const order = customSortOrders[sortField as keyof typeof customSortOrders];
      const aIndex = order.indexOf(aValue);
      const bIndex = order.indexOf(bValue);
      aValue = aIndex === -1 ? 999 : aIndex;
      bValue = bIndex === -1 ? 999 : bIndex;
    }

    // Standard comparison
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
};
