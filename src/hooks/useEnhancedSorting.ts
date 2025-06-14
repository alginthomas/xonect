
import { useState, useCallback, useMemo } from 'react';
import type { Lead } from '@/types/lead';
import { 
  enhancedSortLeads, 
  addSortCriteria, 
  removeSortCriteria, 
  clearAllSorting,
  getSortIndicator,
  type SortingState 
} from '@/utils/enhancedSorting';

interface UseEnhancedSortingProps {
  leads: Lead[];
  maxSortLevels?: number;
}

export const useEnhancedSorting = ({ 
  leads, 
  maxSortLevels = 3 
}: UseEnhancedSortingProps) => {
  const [sortingState, setSortingState] = useState<SortingState>({
    criteria: [],
    maxSortLevels
  });

  const sortedLeads = useMemo(() => {
    return enhancedSortLeads(leads, sortingState);
  }, [leads, sortingState]);

  const handleSort = useCallback((field: string, multiSelect: boolean = false) => {
    setSortingState(prevState => addSortCriteria(prevState, field, multiSelect));
  }, []);

  const handleRemoveSort = useCallback((field: string) => {
    setSortingState(prevState => removeSortCriteria(prevState, field));
  }, []);

  const handleClearAllSorts = useCallback(() => {
    setSortingState(prevState => clearAllSorting(prevState));
  }, []);

  const getSortInfo = useCallback((field: string) => {
    return getSortIndicator(sortingState, field);
  }, [sortingState]);

  const hasSorting = sortingState.criteria.length > 0;
  const sortingDescription = useMemo(() => {
    if (sortingState.criteria.length === 0) return 'No sorting applied';
    
    const descriptions = sortingState.criteria
      .sort((a, b) => a.priority - b.priority)
      .map((criteria, index) => {
        const order = criteria.direction === 'asc' ? 'A-Z' : 'Z-A';
        const prefix = index === 0 ? '' : `then by `;
        return `${prefix}${criteria.field} (${order})`;
      });
    
    return `Sorted by ${descriptions.join(', ')}`;
  }, [sortingState.criteria]);

  return {
    sortedLeads,
    sortingState,
    handleSort,
    handleRemoveSort,
    handleClearAllSorts,
    getSortInfo,
    hasSorting,
    sortingDescription
  };
};
