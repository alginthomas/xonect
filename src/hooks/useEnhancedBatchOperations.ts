import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { ImportBatch } from '@/types/category';
import type { LeadStatus } from '@/types/lead';

interface CleanupSuggestion {
  id: string;
  type: 'old_batches' | 'low_performance' | 'duplicate_batches' | 'unused_batches';
  batchIds: string[];
  action: string;
}

export const useEnhancedBatchOperations = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const smartDeleteBatches = async (
    batchIds: string[], 
    deletionType: 'cascade' | 'preserve' | 'soft'
  ): Promise<boolean> => {
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
      switch (deletionType) {
        case 'soft':
          // Mark batches as deleted but keep the data
          const { error: softError } = await supabase
            .from('import_batches')
            .update({ 
              metadata: { 
                deleted_at: new Date().toISOString(),
                deletion_type: 'soft'
              }
            })
            .in('id', batchIds);

          if (softError) throw softError;

          toast({
            title: "Batches archived",
            description: `${batchIds.length} batches have been archived and can be restored within 30 days`,
          });
          break;

        case 'preserve':
          // Move leads to unassigned category, then delete batches
          const { error: preserveLeadsError } = await supabase
            .from('leads')
            .update({ 
              category_id: null,
              import_batch_id: null 
            })
            .in('import_batch_id', batchIds);

          if (preserveLeadsError) throw preserveLeadsError;

          const { error: preserveBatchError } = await supabase
            .from('import_batches')
            .delete()
            .in('id', batchIds);

          if (preserveBatchError) throw preserveBatchError;

          toast({
            title: "Batches deleted, leads preserved",
            description: `${batchIds.length} batches deleted. All leads moved to unassigned category`,
          });
          break;

        case 'cascade':
          // Delete leads first, then batches (existing behavior)
          const { error: cascadeLeadsError } = await supabase
            .from('leads')
            .delete()
            .in('import_batch_id', batchIds);

          if (cascadeLeadsError) {
            console.error('Error deleting leads:', cascadeLeadsError);
          }

          const { error: cascadeBatchError } = await supabase
            .from('import_batches')
            .delete()
            .in('id', batchIds);

          if (cascadeBatchError) throw cascadeBatchError;

          toast({
            title: "Batches permanently deleted",
            description: `${batchIds.length} batches and all associated leads have been permanently deleted`,
          });
          break;
      }

      return true;
    } catch (error) {
      console.error('Error in smart delete:', error);
      toast({
        title: "Error deleting batches",
        description: "Failed to delete the selected batches",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const applyCleanupSuggestion = async (suggestion: CleanupSuggestion): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to apply cleanup suggestions",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      switch (suggestion.type) {
        case 'old_batches':
        case 'unused_batches':
          // Soft delete old/unused batches
          return await smartDeleteBatches(suggestion.batchIds, 'soft');

        case 'low_performance':
          // Just mark for review, don't delete
          const { error: reviewError } = await supabase
            .from('import_batches')
            .update({ 
              metadata: { 
                marked_for_review: true,
                review_reason: 'low_performance'
              }
            })
            .in('id', suggestion.batchIds);

          if (reviewError) throw reviewError;

          toast({
            title: "Batches marked for review",
            description: `${suggestion.batchIds.length} low-performance batches marked for review`,
          });
          return true;

        case 'duplicate_batches':
          // Soft delete duplicates
          return await smartDeleteBatches(suggestion.batchIds, 'soft');

        default:
          toast({
            title: "Unknown suggestion type",
            description: "Cannot apply this cleanup suggestion",
            variant: "destructive",
          });
          return false;
      }
    } catch (error) {
      console.error('Error applying cleanup suggestion:', error);
      toast({
        title: "Error applying suggestion",
        description: "Failed to apply the cleanup suggestion",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const restoreArchivedBatches = async (batchIds: string[]): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to restore batches",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('import_batches')
        .update({ 
          metadata: { deleted_at: null, deletion_type: null }
        })
        .in('id', batchIds);

      if (error) throw error;

      toast({
        title: "Batches restored",
        description: `${batchIds.length} batches have been restored successfully`,
      });

      return true;
    } catch (error) {
      console.error('Error restoring batches:', error);
      toast({
        title: "Error restoring batches",
        description: "Failed to restore the selected batches",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    smartDeleteBatches,
    applyCleanupSuggestion,
    restoreArchivedBatches,
    loading
  };
};
