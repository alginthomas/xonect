
import { useImportBatchDeletion } from './useImportBatchDeletion';
import { useQueryClient } from '@tanstack/react-query';

export const useImportBatchOperations = () => {
  const { deleteBatch, isDeleting } = useImportBatchDeletion();
  const queryClient = useQueryClient();

  const handleDeleteBatch = async (batchId: string, batchName?: string) => {
    const success = await deleteBatch(batchId, batchName);
    
    if (success) {
      // Invalidate queries to refresh the data
      await queryClient.invalidateQueries({ queryKey: ['import-batches'] });
      await queryClient.invalidateQueries({ queryKey: ['leads'] });
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
    
    return success;
  };

  return {
    handleDeleteBatch,
    isDeleting
  };
};
