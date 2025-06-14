
import { useState, useCallback } from 'react';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Lead, LeadStatus } from '@/types/lead';

export const useOrganizationLeads = () => {
  const [loading, setLoading] = useState(false);
  const { currentOrganization } = useOrganizationContext();
  const { toast } = useToast();

  const createLead = useCallback(async (leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
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
      // Prepare data with organization_id and ensure required fields are present
      const insertData = {
        first_name: leadData.first_name || '',
        last_name: leadData.last_name || '',
        company: leadData.company,
        email: leadData.email,
        phone: leadData.phone,
        status: leadData.status,
        industry: leadData.industry,
        linkedin: leadData.linkedin,
        location: leadData.location,
        organization_id: currentOrganization.id,
        // Include other optional fields if they exist
        ...(leadData.department && { department: leadData.department }),
        ...(leadData.remarks && { remarks: leadData.remarks }),
        ...(leadData.category_id && { category_id: leadData.category_id }),
        ...(leadData.assigned_to && { assigned_to: leadData.assigned_to }),
        ...(leadData.team_id && { team_id: leadData.team_id }),
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

  const updateLead = useCallback(async (leadId: string, updates: Partial<Lead>) => {
    if (!currentOrganization) return null;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .update(updates)
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

    return updateLead(leadId, { assigned_to: assignedTo });
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
