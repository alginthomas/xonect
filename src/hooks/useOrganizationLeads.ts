
import { useState, useCallback } from 'react';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Lead, LeadStatus } from '@/types/lead';

export const useOrganizationLeads = () => {
  const [loading, setLoading] = useState(false);
  const { currentOrganization } = useOrganizationContext();
  const { toast } = useToast();

  const createLead = useCallback(async (leadData: Omit<Lead, 'id' | 'createdAt' | 'completenessScore'>) => {
    if (!currentOrganization) {
      toast({
        title: 'Error',
        description: 'No organization selected',
        variant: 'destructive'
      });
      return null;
    }

    setLoading(true);
    try {
      // Map camelCase Lead interface to snake_case database schema
      const insertData = {
        first_name: leadData.firstName || '',
        last_name: leadData.lastName || '',
        company: leadData.company,
        title: leadData.title,
        email: leadData.email,
        phone: leadData.phone,
        status: leadData.status,
        industry: leadData.industry,
        linkedin: leadData.linkedin,
        location: leadData.location,
        seniority: leadData.seniority,
        company_size: leadData.companySize,
        organization_id: currentOrganization.id,
        // Include other optional fields if they exist
        ...(leadData.department && { department: leadData.department }),
        ...(leadData.remarks && { remarks: leadData.remarks }),
        ...(leadData.categoryId && { category_id: leadData.categoryId }),
        ...(leadData.tags && { tags: leadData.tags }),
        ...(leadData.personalEmail && { personal_email: leadData.personalEmail }),
        ...(leadData.photoUrl && { photo_url: leadData.photoUrl }),
        ...(leadData.twitterUrl && { twitter_url: leadData.twitterUrl }),
        ...(leadData.facebookUrl && { facebook_url: leadData.facebookUrl }),
        ...(leadData.organizationWebsite && { organization_website: leadData.organizationWebsite }),
        ...(leadData.organizationFounded && { organization_founded: leadData.organizationFounded }),
      };

      const { data, error } = await supabase
        .from('leads')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Lead created successfully'
      });

      return data;
    } catch (error) {
      console.error('Error creating lead:', error);
      toast({
        title: 'Error',
        description: 'Failed to create lead',
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentOrganization, toast]);

  const updateLead = useCallback(async (leadId: string, updates: Partial<Omit<Lead, 'id' | 'createdAt' | 'completenessScore'>>) => {
    if (!currentOrganization) return null;

    setLoading(true);
    try {
      // Map camelCase updates to snake_case database schema
      const dbUpdates: any = {};
      
      if (updates.firstName !== undefined) dbUpdates.first_name = updates.firstName;
      if (updates.lastName !== undefined) dbUpdates.last_name = updates.lastName;
      if (updates.company !== undefined) dbUpdates.company = updates.company;
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.email !== undefined) dbUpdates.email = updates.email;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.industry !== undefined) dbUpdates.industry = updates.industry;
      if (updates.linkedin !== undefined) dbUpdates.linkedin = updates.linkedin;
      if (updates.location !== undefined) dbUpdates.location = updates.location;
      if (updates.seniority !== undefined) dbUpdates.seniority = updates.seniority;
      if (updates.companySize !== undefined) dbUpdates.company_size = updates.companySize;
      if (updates.department !== undefined) dbUpdates.department = updates.department;
      if (updates.remarks !== undefined) dbUpdates.remarks = updates.remarks;
      if (updates.categoryId !== undefined) dbUpdates.category_id = updates.categoryId;
      if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
      if (updates.personalEmail !== undefined) dbUpdates.personal_email = updates.personalEmail;
      if (updates.photoUrl !== undefined) dbUpdates.photo_url = updates.photoUrl;
      if (updates.twitterUrl !== undefined) dbUpdates.twitter_url = updates.twitterUrl;
      if (updates.facebookUrl !== undefined) dbUpdates.facebook_url = updates.facebookUrl;
      if (updates.organizationWebsite !== undefined) dbUpdates.organization_website = updates.organizationWebsite;
      if (updates.organizationFounded !== undefined) dbUpdates.organization_founded = updates.organizationFounded;

      const { data, error } = await supabase
        .from('leads')
        .update(dbUpdates)
        .eq('id', leadId)
        .eq('organization_id', currentOrganization.id)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error updating lead:', error);
      toast({
        title: 'Error',
        description: 'Failed to update lead',
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentOrganization, toast]);

  const deleteLead = useCallback(async (leadId: string) => {
    if (!currentOrganization) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId)
        .eq('organization_id', currentOrganization.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Lead deleted successfully'
      });

      return true;
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete lead',
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentOrganization, toast]);

  const assignLead = useCallback(async (leadId: string, assignedTo: string) => {
    if (!currentOrganization) return null;

    return updateLead(leadId, { assignedTo } as any);
  }, [currentOrganization, updateLead]);

  const bulkUpdateStatus = useCallback(async (leadIds: string[], status: LeadStatus) => {
    if (!currentOrganization || leadIds.length === 0) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status })
        .in('id', leadIds)
        .eq('organization_id', currentOrganization.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `${leadIds.length} leads updated successfully`
      });

      return true;
    } catch (error) {
      console.error('Error bulk updating leads:', error);
      toast({
        title: 'Error',
        description: 'Failed to update leads',
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentOrganization, toast]);

  return {
    createLead,
    updateLead,
    deleteLead,
    assignLead,
    bulkUpdateStatus,
    loading
  };
};
