
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { ImportBatch } from '@/types/category';
import type { LeadStatus } from '@/types/lead';

export const useImportBatchOperations = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const deleteBatch = async (batchId: string): Promise<boolean> => {
    setLoading(true);
    try {
      // First delete all leads associated with this batch
      const { error: leadsError } = await supabase
        .from('leads')
        .delete()
        .eq('import_batch_id', batchId);

      if (leadsError) throw leadsError;

      // Then delete the batch itself
      const { error: batchError } = await supabase
        .from('import_batches')
        .delete()
        .eq('id', batchId);

      if (batchError) throw batchError;

      return true;
    } catch (error) {
      console.error('Error deleting batch:', error);
      toast({
        title: "Error deleting batch",
        description: "Failed to delete the import batch",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateBatchLeadsStatus = async (batchId: string, status: LeadStatus): Promise<boolean> => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status })
        .eq('import_batch_id', batchId);

      if (error) throw error;

      toast({
        title: "Batch updated",
        description: `All leads in this batch have been marked as ${status}`,
      });

      return true;
    } catch (error) {
      console.error('Error updating batch status:', error);
      toast({
        title: "Error updating batch",
        description: "Failed to update the batch status",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteBatch,
    updateBatchLeadsStatus,
    loading
  };
};
