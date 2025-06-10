
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Category } from '@/types/category';

export const useCategoriesData = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['categories', user?.id],
    queryFn: async (): Promise<Category[]> => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, description, color, criteria, created_at, updated_at')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      return (data || []).map(cat => ({
        id: cat.id,
        name: cat.name,
        description: cat.description || '',
        color: cat.color,
        criteria: (cat.criteria && typeof cat.criteria === 'object' && cat.criteria !== null) ? cat.criteria as Record<string, any> : {},
        createdAt: new Date(cat.created_at),
        updatedAt: new Date(cat.updated_at)
      }));
    },
    enabled: !!user,
    staleTime: 120000, // 2 minutes
    gcTime: 600000, // 10 minutes
  });
};
