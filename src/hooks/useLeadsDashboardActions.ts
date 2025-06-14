
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { exportLeadsToCSV } from '@/utils/csvExport';
import type { Lead, LeadStatus, RemarkEntry } from '@/types/lead';
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
      // Update only the status, preserving all other data
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

  const handleRemarksUpdate = async (leadId: string, remarks: string, remarksHistory: RemarkEntry[]) => {
    try {
      const currentLead = leads.find(lead => lead.id === leadId);
      if (!currentLead) {
        console.error('Lead not found:', leadId);
        return;
      }

      // Check if remarks have actually changed
      if (currentLead.remarks === remarks) {
        console.log('Remarks unchanged, skipping update');
        return;
      }

      console.log('Updating remarks for lead:', leadId);

      // Ensure all timestamp entries are proper Date objects
      const processedHistory = remarksHistory.map(entry => ({
        ...entry,
        timestamp: entry.timestamp instanceof Date ? entry.timestamp : new Date(entry.timestamp)
      }));

      // Create minimal update object - ONLY what changed
      const updateData: Partial<Lead> = { 
        remarks,
        remarksHistory: processedHistory
      };

      // Perform the update
      await onUpdateLead(leadId, updateData);
      
      // Get the latest entry for the toast
      const latestEntry = processedHistory[processedHistory.length - 1];
      
      toast({
        title: 'Remark saved',
        description: `Added at ${format(latestEntry.timestamp, 'MMM dd, HH:mm')}`
      });

      console.log('Remarks update completed successfully');
    } catch (error) {
      console.error('Error updating remarks:', error);
      toast({
        title: 'Update failed',
        description: 'Failed to save remark. Please try again.',
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
