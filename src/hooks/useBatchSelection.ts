
import { useState } from "react";
import type { ImportBatch } from "@/types/category";

export function useBatchSelection(importBatches: ImportBatch[]) {
  const [selectedBatchIds, setSelectedBatchIds] = useState<Set<string>>(new Set());

  const isSelected = (id: string) => selectedBatchIds.has(id);

  const toggleSelection = (id: string) => {
    setSelectedBatchIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const clearSelection = () => setSelectedBatchIds(new Set());

  const selectAll = () => setSelectedBatchIds(new Set(importBatches.map(b => b.id)));

  const isAllSelected =
    importBatches.length > 0 && importBatches.every(b => selectedBatchIds.has(b.id));
  const isPartiallySelected =
    selectedBatchIds.size > 0 && !isAllSelected;

  return {
    selectedBatchIds,
    isSelected,
    toggleSelection,
    clearSelection,
    selectAll,
    isAllSelected,
    isPartiallySelected
  };
}
