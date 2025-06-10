
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { sanitizeInput, validateCSVData } from '@/utils/security';
import type { Lead } from '@/types/lead';
import type { ImportBatch } from '@/types/category';

export const useLeadOperations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateLeadMutation = useMutation({
    mutationFn: async ({ leadId, updates }: { leadId: string; updates: Partial<Lead> }) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('leads')
        .update({
          status: updates.status,
          emails_sent: updates.emailsSent,
          last_contact_date: updates.lastContactDate?.toISOString(),
          remarks: updates.remarks,
        })
        .eq('id', leadId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: (error) => {
      console.error('Error updating lead:', error);
      toast({
        title: "Error updating lead",
        description: "Failed to update the lead",
        variant: "destructive",
      });
    },
  });

  const importLeadsMutation = useMutation({
    mutationFn: async ({ leads, importBatch }: { leads: Lead[]; importBatch: ImportBatch }) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Starting import process for', leads.length, 'leads');
      
      // Validate and sanitize input data
      const sanitizedLeads = leads.map(lead => ({
        ...lead,
        firstName: sanitizeInput(lead.firstName),
        lastName: sanitizeInput(lead.lastName),
        email: sanitizeInput(lead.email),
        company: sanitizeInput(lead.company),
        title: sanitizeInput(lead.title),
        user_id: user.id,
      }));

      // Validate CSV data structure
      const validation = validateCSVData(sanitizedLeads);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Create import batch
      const { data: batchData, error: batchError } = await supabase
        .from('import_batches')
        .insert({
          name: importBatch.name,
          category_id: importBatch.categoryId,
          source_file: importBatch.sourceFile,
          total_leads: leads.length,
          user_id: user.id,
        })
        .select()
        .single();

      if (batchError) throw batchError;

      // Transform leads to database format
      const leadsToInsert = sanitizedLeads.map(lead => ({
        first_name: lead.firstName,
        last_name: lead.lastName,
        email: lead.email,
        company: lead.company,
        title: lead.title,
        seniority: lead.seniority,
        company_size: lead.companySize,
        industry: lead.industry,
        location: lead.location,
        phone: lead.phone,
        linkedin: lead.linkedin,
        personal_email: lead.personalEmail,
        headline: lead.headline,
        department: lead.department,
        keywords: lead.keywords,
        twitter_url: lead.twitterUrl,
        facebook_url: lead.facebookUrl,
        photo_url: lead.photoUrl,
        organization_website: lead.organizationWebsite,
        organization_logo: lead.organizationLogo,
        organization_domain: lead.organizationDomain,
        organization_founded: lead.organizationFounded,
        organization_address: lead.organizationAddress,
        tags: lead.tags,
        status: lead.status,
        emails_sent: lead.emailsSent || 0,
        completeness_score: lead.completenessScore || 0,
        remarks: lead.remarks,
        import_batch_id: batchData.id,
        category_id: importBatch.categoryId,
        user_id: user.id,
      }));

      const { error: leadsError } = await supabase
        .from('leads')
        .insert(leadsToInsert);

      if (leadsError) throw leadsError;

      // Update batch statistics
      const { error: updateError } = await supabase
        .from('import_batches')
        .update({
          successful_imports: leads.length,
          failed_imports: 0,
        })
        .eq('id', batchData.id);

      if (updateError) throw updateError;

      return { successCount: leads.length };
    },
    onSuccess: (data) => {
      toast({
        title: "Import successful",
        description: `Successfully imported ${data.successCount} leads`,
      });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['import-batches'] });
    },
    onError: (error) => {
      console.error('Import error:', error);
      toast({
        title: "Import failed",
        description: "Failed to import leads. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    updateLead: updateLeadMutation.mutate,
    importLeads: importLeadsMutation.mutate,
    isUpdatingLead: updateLeadMutation.isPending,
    isImportingLeads: importLeadsMutation.isPending,
  };
};
