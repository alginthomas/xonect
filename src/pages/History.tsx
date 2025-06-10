
import React, { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ImportHistory } from '@/components/ImportHistory';
import { useLeadsData } from '@/hooks/useLeadsData';
import { useCategoriesData } from '@/hooks/useCategoriesData';
import { useImportBatchesData } from '@/hooks/useImportBatchesData';

const History = () => {
  const queryClient = useQueryClient();
  const { data: leads = [] } = useLeadsData();
  const { data: categories = [] } = useCategoriesData();
  const { data: importBatches = [] } = useImportBatchesData();

  const handleDeleteBatch = useCallback(async (batchId: string) => {
    queryClient.invalidateQueries({ queryKey: ['import-batches'] });
    queryClient.invalidateQueries({ queryKey: ['leads'] });
  }, [queryClient]);

  const handleViewBatchLeads = useCallback((batchId: string) => {
    // Navigate to dashboard or filter leads by batch
    console.log('View batch leads:', batchId);
  }, []);

  return (
    <div className="p-6">
      <ImportHistory 
        leads={leads}
        importBatches={importBatches}
        categories={categories}
        onDeleteBatch={handleDeleteBatch}
        onViewBatchLeads={handleViewBatchLeads}
      />
    </div>
  );
};

export default History;
