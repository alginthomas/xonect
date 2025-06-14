
import type { Lead } from '@/types/lead';

export interface SortCriteria {
  field: string;
  direction: 'asc' | 'desc';
  priority: number; // 1 = primary, 2 = secondary, etc.
}

export interface SortingState {
  criteria: SortCriteria[];
  maxSortLevels: number;
}

// Natural sorting for strings with numbers
const naturalSort = (a: string, b: string): number => {
  return a.localeCompare(b, undefined, {
    numeric: true,
    sensitivity: 'base'
  });
};

// Custom sort orders for specific fields
const customSortOrders = {
  status: ['New', 'Contacted', 'Qualified', 'Interested', 'Not Interested', 'Converted'],
  seniority: ['Junior', 'Mid-Level', 'Senior', 'Manager', 'Director', 'VP', 'C-Level'],
  companySize: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
};

const getCustomSortValue = (field: string, value: any): number => {
  const order = customSortOrders[field as keyof typeof customSortOrders];
  if (order && typeof value === 'string') {
    const index = order.indexOf(value);
    return index === -1 ? 999 : index;
  }
  return 0;
};

const getSortValue = (lead: Lead, field: string): any => {
  let value: any = lead[field as keyof Lead];

  // Handle special field mappings for nested data
  if (field === 'category') {
    value = lead.categoryId || '';
  }

  // Handle null/undefined values
  if (value == null) return '';

  // Handle dates
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'string' && field.includes('date') || field.includes('Date')) {
    const date = new Date(value);
    return isNaN(date.getTime()) ? 0 : date.getTime();
  }

  // Handle custom sort orders
  if (customSortOrders[field as keyof typeof customSortOrders]) {
    return getCustomSortValue(field, value);
  }

  // Handle numeric fields
  if (field === 'emailsSent' || field === 'companySize') {
    return Number(value) || 0;
  }

  // Handle strings (case-insensitive)
  if (typeof value === 'string') {
    return value.toLowerCase();
  }

  return value;
};

export const enhancedSortLeads = (
  leads: Lead[], 
  sortingState: SortingState
): Lead[] => {
  // If no sorting criteria, return leads in their current order
  if (sortingState.criteria.length === 0) {
    return [...leads];
  }

  return [...leads].sort((a, b) => {
    // Sort by each criteria in priority order
    for (const criteria of sortingState.criteria.sort((x, y) => x.priority - y.priority)) {
      const aValue = getSortValue(a, criteria.field);
      const bValue = getSortValue(b, criteria.field);

      let comparison = 0;

      // Handle null/undefined values
      if (aValue == null && bValue == null) {
        comparison = 0;
      } else if (aValue == null) {
        comparison = 1; // null values go to end
      } else if (bValue == null) {
        comparison = -1; // null values go to end
      } else {
        // Use natural sorting for strings, regular comparison for others
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = naturalSort(aValue, bValue);
        } else {
          if (aValue < bValue) comparison = -1;
          else if (aValue > bValue) comparison = 1;
          else comparison = 0;
        }
      }

      // Apply sort direction
      if (criteria.direction === 'desc') {
        comparison = -comparison;
      }

      // If this criteria produces a definitive result, return it
      if (comparison !== 0) {
        return comparison;
      }
    }

    // If all criteria are equal, maintain stable sort
    return 0;
  });
};

export const addSortCriteria = (
  sortingState: SortingState,
  field: string,
  multiSelect: boolean = false
): SortingState => {
  const existingIndex = sortingState.criteria.findIndex(c => c.field === field);
  
  if (!multiSelect) {
    // Single sort mode - replace all criteria
    if (existingIndex >= 0) {
      // Toggle direction for existing field
      const existingCriteria = sortingState.criteria[existingIndex];
      return {
        ...sortingState,
        criteria: [{
          ...existingCriteria,
          direction: existingCriteria.direction === 'asc' ? 'desc' : 'asc',
          priority: 1
        }]
      };
    } else {
      // New field
      return {
        ...sortingState,
        criteria: [{
          field,
          direction: 'asc',
          priority: 1
        }]
      };
    }
  } else {
    // Multi-sort mode
    if (existingIndex >= 0) {
      // Toggle direction for existing field
      const updatedCriteria = [...sortingState.criteria];
      updatedCriteria[existingIndex] = {
        ...updatedCriteria[existingIndex],
        direction: updatedCriteria[existingIndex].direction === 'asc' ? 'desc' : 'asc'
      };
      return {
        ...sortingState,
        criteria: updatedCriteria
      };
    } else {
      // Add new criteria if under limit
      if (sortingState.criteria.length < sortingState.maxSortLevels) {
        const newCriteria: SortCriteria = {
          field,
          direction: 'asc',
          priority: sortingState.criteria.length + 1
        };
        return {
          ...sortingState,
          criteria: [...sortingState.criteria, newCriteria]
        };
      }
    }
  }
  
  return sortingState;
};

export const removeSortCriteria = (
  sortingState: SortingState,
  field: string
): SortingState => {
  const filteredCriteria = sortingState.criteria
    .filter(c => c.field !== field)
    .map((c, index) => ({ ...c, priority: index + 1 })); // Reorder priorities

  return {
    ...sortingState,
    criteria: filteredCriteria
  };
};

export const clearAllSorting = (sortingState: SortingState): SortingState => {
  return {
    ...sortingState,
    criteria: []
  };
};

export const getSortIndicator = (
  sortingState: SortingState,
  field: string
): { direction?: 'asc' | 'desc'; priority?: number } => {
  const criteria = sortingState.criteria.find(c => c.field === field);
  if (!criteria) return {};
  
  return {
    direction: criteria.direction,
    priority: criteria.priority
  };
};
