
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Package } from 'lucide-react';
import type { ImportBatch } from '@/types/category';

interface BatchFilterIndicatorProps {
  batchId: string;
  importBatches: ImportBatch[];
  onClearFilter: () => void;
}

export const BatchFilterIndicator: React.FC<BatchFilterIndicatorProps> = ({
  batchId,
  importBatches,
  onClearFilter
}) => {
  const batch = importBatches.find(b => b.id === batchId);
  
  if (!batch) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">
            Viewing leads from batch:
          </span>
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
            {batch.name}
          </Badge>
          <span className="text-xs text-blue-600">
            ({batch.successfulImports} leads imported)
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilter}
          className="h-6 w-6 p-0 text-blue-600 hover:bg-blue-100"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
