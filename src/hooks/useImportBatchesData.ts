
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { ImportBatch } from '@/types/category';

export const useImportBatchesData = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['import-batches', user?.id],
    queryFn: async (): Promise<ImportBatch[]> => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('import_batches')
        .select('id, name, category_id, source_file, total_leads, successful_imports, failed_imports, created_at, metadata')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      return (data || []).map(batch => ({
        id: batch.id,
        name: batch.name,
        categoryId: batch.category_id || '',
        sourceFile: batch.source_file || '',
        totalLeads: batch.total_leads,
        successfulImports: batch.successful_imports,
        failedImports: batch.failed_imports,
        createdAt: new Date(batch.created_at),
        metadata: (batch.metadata && typeof batch.metadata === 'object' && batch.metadata !== null) ? batch.metadata as Record<string, any> : {}
      }));
    },
    enabled: !!user,
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes
  });
};
