import { useState, useMemo, useEffect } from 'react';
import { useLeadsCache } from '@/hooks/useLeadsCache';
import { useLeadsFiltering } from '@/hooks/useLeadsFiltering';
import { useLeadsSelection } from '@/hooks/useLeadsSelection';
import { useColumnConfiguration } from '@/hooks/useColumnConfiguration';
import { useToast } from '@/hooks/use-toast';
import { exportLeadsToCSV } from '@/utils/csvExport';
import type { Lead, LeadStatus } from '@/types/lead';
import type { Category, ImportBatch } from '@/types/category';

interface UseLeadsDashboardLogicProps {
  leads: Lead[];
  categories: Category[];
  importBatches: ImportBatch[];
  selectedBatchId?: string | null;
  onUpdateLead: (leadId: string, updates: Partial<Lead>) => void;
  onDeleteLead: (leadId: string) => void;
  onBulkUpdateStatus: (leadIds: string[], status: LeadStatus) => void;
  onBulkDelete: (leadIds: string[]) => void;
  onSendEmail: (leadId: string) => void;
}

export const useLeadsDashboardLogic = ({
  leads,
  categories,
  importBatches,
  selectedBatchId,
  onUpdateLead,
  onDeleteLead,
  onBulkUpdateStatus,
  onBulkDelete,
  onSendEmail
}: UseLeadsDashboardLogicProps) => {
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    dataAvailabilityFilter,
    setDataAvailabilityFilter,
    countryFilter,
    setCountryFilter,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    navigationFilter,
    setNavigationFilter
  } = useLeadsCache();

  const [duplicatePhoneFilter, setDuplicatePhoneFilter] = useState<'all' | 'unique-only' | 'duplicates-only'>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedLeadForEmail, setSelectedLeadForEmail] = useState<Lead | null>(null);
  const [showEmailDialog, setShowEmailDialog] = useState(false);

  const { toast } = useToast();

  // Check URL parameters for navigation filter on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const statusParam = urlParams.get('status');
    if (statusParam && !navigationFilter) {
      console.log('Setting navigation filter from URL:', statusParam);
      setNavigationFilter({ status: statusParam });
      setStatusFilter(statusParam as any);
    }
  }, [navigationFilter, setNavigationFilter, setStatusFilter]);

  const { filteredLeads, sortedLeads } = useLeadsFiltering({
    leads,
    importBatches,
    selectedBatchId,
    searchTerm,
    selectedStatus: navigationFilter?.status ? navigationFilter.status as any : statusFilter as LeadStatus | 'all',
    selectedCategory: categoryFilter,
    selectedSeniority: 'all',
    selectedCompanySize: 'all',
    selectedLocation: '',
    selectedIndustry: '',
    selectedDataFilter: dataAvailabilityFilter,
    countryFilter,
    duplicatePhoneFilter,
    currentPage,
    itemsPerPage,
    sortField,
    sortDirection,
    setCurrentPage,
    navigationFilter
  });

  const { selectedLeads, handleSelectAll, handleSelectLead, clearSelection } = useLeadsSelection();

  const {
    columns,
    visibleColumns,
    reorderColumns,
    toggleColumnVisibility,
    resetToDefault
  } = useColumnConfiguration();

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== 'all') count++;
    if (categoryFilter !== 'all') count++;
    if (dataAvailabilityFilter !== 'all') count++;
    if (countryFilter !== 'all') count++;
    if (duplicatePhoneFilter !== 'all') count++;
    return count;
  }, [statusFilter, categoryFilter, dataAvailabilityFilter, countryFilter, duplicatePhoneFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(sortedLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLeads = sortedLeads.slice(startIndex, startIndex + itemsPerPage);

  // Event handlers
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

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

  const clearAllFilters = () => {
    setStatusFilter('all');
    setCategoryFilter('all');
    setDataAvailabilityFilter('all');
    setCountryFilter('all');
    setDuplicatePhoneFilter('all');
    setSearchTerm('');
    setNavigationFilter(undefined);
    
    const url = new URL(window.location.href);
    url.searchParams.delete('status');
    window.history.replaceState({}, '', url.toString());
  };

  return {
    // State
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    dataAvailabilityFilter,
    setDataAvailabilityFilter,
    countryFilter,
    setCountryFilter,
    duplicatePhoneFilter,
    setDuplicatePhoneFilter,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    navigationFilter,
    setNavigationFilter,
    selectedLead,
    setSelectedLead,
    showSidebar,
    setShowSidebar,
    selectedLeadForEmail,
    setSelectedLeadForEmail,
    showEmailDialog,
    setShowEmailDialog,

    // Computed values
    filteredLeads,
    sortedLeads,
    paginatedLeads,
    totalPages,
    startIndex,
    activeFiltersCount,
    selectedLeads,
    columns,
    visibleColumns,

    // Handlers
    handleSort,
    handleBulkAction,
    handleExport,
    handleStatusChange,
    handleRemarksUpdate,
    handleSelectAll,
    handleSelectLead,
    clearSelection,
    clearAllFilters,
    reorderColumns,
    toggleColumnVisibility,
    resetToDefault
  };
};
