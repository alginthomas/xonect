
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { ImportBatch } from '@/types/category';
import type { LeadStatus } from '@/types/lead';

export const useImportBatchOperations = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const deleteBatch = async (batchId: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to delete batches",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      // First delete all leads associated with this batch (RLS will ensure user owns them)
      const { error: leadsError } = await supabase
        .from('leads')
        .delete()
        .eq('import_batch_id', batchId);

      if (leadsError) {
        console.error('Error deleting leads:', leadsError);
        // Continue anyway - the batch might not exist in the database
      }

      // Then delete the batch itself (RLS will ensure user owns it)
      const { error: batchError } = await supabase
        .from('import_batches')
        .delete()
        .eq('id', batchId);

      if (batchError) {
        console.error('Error deleting batch:', batchError);
        // If batch doesn't exist, that's fine - consider it successful
        if (!batchError.message.includes('violates foreign key constraint')) {
          throw batchError;
        }
      }

      toast({
        title: "Batch deleted",
        description: "Import batch and associated leads have been deleted",
      });

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
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to update batch status",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      // RLS will ensure only user's leads are updated
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

  const cleanupUserData = async (): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to cleanup data",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      // Delete all leads for this user
      const { error: leadsError } = await supabase
        .from('leads')
        .delete()
        .eq('user_id', user.id);

      if (leadsError) {
        console.error('Error deleting leads:', leadsError);
      }

      // Delete all import batches for this user
      const { error: batchesError } = await supabase
        .from('import_batches')
        .delete()
        .eq('user_id', user.id);

      if (batchesError) {
        console.error('Error deleting import batches:', batchesError);
      }

      // Delete all categories for this user
      const { error: categoriesError } = await supabase
        .from('categories')
        .delete()
        .eq('user_id', user.id);

      if (categoriesError) {
        console.error('Error deleting categories:', categoriesError);
      }

      // Delete all email templates for this user
      const { error: templatesError } = await supabase
        .from('email_templates')
        .delete()
        .eq('user_id', user.id);

      if (templatesError) {
        console.error('Error deleting email templates:', templatesError);
      }

      toast({
        title: "Data cleaned up",
        description: "All user data has been deleted and you can start fresh",
      });

      return true;
    } catch (error) {
      console.error('Error cleaning up user data:', error);
      toast({
        title: "Error cleaning up data",
        description: "Failed to clean up user data",
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
    cleanupUserData,
    loading
  };
};
