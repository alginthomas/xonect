
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { exportLeadsToCSV } from '@/utils/csvExport';
import type { Lead, LeadStatus } from '@/types/lead';
import type { Category } from '@/types/category';

interface UseLeadsDashboardActionsProps {
  leads: Lead[];
  categories: Category[];
  sortedLeads: Lead[];
  selectedLeads: Set<string>;
  onUpdateLead: (leadId: string, updates: Partial<Lead>) => void;
  onBulkUpdateStatus: (leadIds: string[], status: LeadStatus) => void;
  onBulkDelete: (leadIds: string[]) => void;
  clearSelection: () => void;
}

export const useLeadsDashboardActions = ({
  leads,
  categories,
  sortedLeads,
  selectedLeads,
  onUpdateLead,
  onBulkUpdateStatus,
  onBulkDelete,
  clearSelection
}: UseLeadsDashboardActionsProps) => {
  const { toast } = useToast();

  const handleBulkAction = async (action: 'delete' | 'status', value?: string) => {
    if (selectedLeads.size === 0) {
      toast({
        title: 'No leads selected',
        description: 'Please select leads to perform bulk actions.',
        variant: 'destructive'
      });
      return;
    }

    const leadIds = Array.from(selectedLeads);
    try {
      if (action === 'delete') {
        await onBulkDelete(leadIds);
        toast({
          title: 'Leads deleted',
          description: `${leadIds.length} leads have been deleted.`
        });
      } else if (action === 'status' && value) {
        await onBulkUpdateStatus(leadIds, value as LeadStatus);
        toast({
          title: 'Status updated',
          description: `${leadIds.length} leads status updated to ${value}.`
        });
      }
      clearSelection();
    } catch (error) {
      toast({
        title: 'Action failed',
        description: 'Failed to perform bulk action. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleExport = () => {
    const leadsToExport = selectedLeads.size > 0 
      ? sortedLeads.filter(lead => selectedLeads.has(lead.id)) 
      : sortedLeads;
    exportLeadsToCSV(leadsToExport, categories);
    toast({
      title: 'Export successful',
      description: `${leadsToExport.length} leads exported to CSV.`
    });
  };

  const handleStatusChange = async (leadId: string, status: LeadStatus) => {
    try {
      await onUpdateLead(leadId, { status });
      toast({
        title: 'Status updated',
        description: `Lead status updated to ${status}`
      });
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Failed to update status. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleRemarksUpdate = async (leadId: string, remarks: string) => {
    try {
      // Find the current lead to get existing remarks history
      const currentLead = leads.find(lead => lead.id === leadId);
      if (!currentLead) return;

      // Only create a new remark entry if the remarks text has actually changed
      if (currentLead.remarks === remarks) {
        console.log('Remarks unchanged, skipping update');
        return;
      }

      // Create new remark entry with precise timestamp
      const newRemarkEntry: import('@/types/lead').RemarkEntry = {
        id: crypto.randomUUID(),
        text: remarks,
        timestamp: new Date() // This will capture the exact moment of creation
      };

      // Update remarks history with new entry
      const updatedRemarksHistory = [...(currentLead.remarksHistory || []), newRemarkEntry];

      console.log('Updating remarks for lead:', leadId);
      console.log('New remark entry:', newRemarkEntry);
      console.log('Updated remarks history:', updatedRemarksHistory);

      // Update lead with both current remarks and history
      await onUpdateLead(leadId, { 
        remarks,
        remarksHistory: updatedRemarksHistory
      });
      
      toast({
        title: 'Remarks updated',
        description: `Remark added at ${format(newRemarkEntry.timestamp, 'MMM dd, yyyy • HH:mm')}`
      });
    } catch (error) {
      console.error('Error updating remarks:', error);
      toast({
        title: 'Update failed',
        description: 'Failed to update remarks. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return {
    handleBulkAction,
    handleExport,
    handleStatusChange,
    handleRemarksUpdate
  };
};
