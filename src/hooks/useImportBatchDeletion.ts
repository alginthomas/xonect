
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { ImportBatch } from '@/types/category';

export const useImportBatchDeletion = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const deleteBatch = async (batchId: string, batchName?: string) => {
    try {
      setIsDeleting(true);

      // First, delete all leads associated with this batch
      const { error: leadsError } = await supabase
        .from('leads')
        .delete()
        .eq('import_batch_id', batchId);

      if (leadsError) {
        console.error('Error deleting leads:', leadsError);
        throw leadsError;
      }

      // Then delete the import batch itself
      const { error: batchError } = await supabase
        .from('import_batches')
        .delete()
        .eq('id', batchId);

      if (batchError) {
        console.error('Error deleting batch:', batchError);
        throw batchError;
      }

      toast({
        title: "Batch deleted successfully",
        description: `Import batch "${batchName || 'Unknown'}" and all its leads have been deleted.`,
      });

      return true;
    } catch (error) {
      console.error('Failed to delete batch:', error);
      toast({
        title: "Failed to delete batch",
        description: "There was an error deleting the import batch. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteBatch,
    isDeleting
  };
};
