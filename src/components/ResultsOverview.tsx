
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import type { ImportBatch } from '@/types/category';

interface ResultsOverviewProps {
  filteredLeadsCount: number;
  selectedCount: number;
  selectedBatchId?: string | null;
  importBatches: ImportBatch[];
}

export const ResultsOverview: React.FC<ResultsOverviewProps> = ({
  filteredLeadsCount,
  selectedCount,
  selectedBatchId,
  importBatches
}) => {
  const getBatchName = (batchId: string | undefined) => {
    if (!batchId) return 'Direct Entry';
    const batch = importBatches.find(b => b.id === batchId);
    return batch ? batch.name : 'Unknown Batch';
  };

  return (
    <CardHeader className="pb-2 lg:pb-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <CardTitle className="flex items-center gap-2 text-base lg:text-xl">
            <Users className="h-4 w-4 lg:h-5 lg:w-5" />
            {filteredLeadsCount} Lead{filteredLeadsCount !== 1 ? 's' : ''}
            {selectedCount > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {selectedCount} selected
              </Badge>
            )}
          </CardTitle>
          {selectedBatchId && (
            <CardDescription className="mt-1 flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Batch: {getBatchName(selectedBatchId)}
              </Badge>
            </CardDescription>
          )}
        </div>
      </div>
    </CardHeader>
  );
};
