
import { useState, useCallback } from 'react';

export const useBatchSelection = () => {
  const [selectedBatchIds, setSelectedBatchIds] = useState<Set<string>>(new Set());

  const toggleBatch = useCallback((batchId: string) => {
    setSelectedBatchIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(batchId)) {
        newSet.delete(batchId);
      } else {
        newSet.add(batchId);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback((batchIds: string[]) => {
    setSelectedBatchIds(new Set(batchIds));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedBatchIds(new Set());
  }, []);

  const isSelected = useCallback((batchId: string) => {
    return selectedBatchIds.has(batchId);
  }, [selectedBatchIds]);

  return {
    selectedBatchIds: Array.from(selectedBatchIds),
    toggleBatch,
    selectAll,
    clearSelection,
    isSelected,
    selectedCount: selectedBatchIds.size
  };
};
