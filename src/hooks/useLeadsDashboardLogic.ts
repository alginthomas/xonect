
import { useEffect, useMemo } from 'react';
import { useLeadsCache } from '@/hooks/useLeadsCache';
import { useLeadsFiltering } from '@/hooks/useLeadsFiltering';
import { useLeadsSelection } from '@/hooks/useLeadsSelection';
import { useColumnConfiguration } from '@/hooks/useColumnConfiguration';
import { useLeadsDashboardState } from '@/hooks/useLeadsDashboardState';
import { useLeadsDashboardActions } from '@/hooks/useLeadsDashboardActions';
import { useLeadsDashboardFilters } from '@/hooks/useLeadsDashboardFilters';
import type { Lead, LeadStatus, RemarkEntry } from '@/types/lead';
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

  const {
    duplicatePhoneFilter,
    setDuplicatePhoneFilter,
    remarksFilter,
    setRemarksFilter,
    selectedLead,
    setSelectedLead,
    showSidebar,
    setShowSidebar,
    selectedLeadForEmail,
    setSelectedLeadForEmail,
    showEmailDialog,
    setShowEmailDialog
  } = useLeadsDashboardState();

  // Check URL parameters for navigation filter on component mount and batch selection
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const statusParam = urlParams.get('status');
    const batchParam = urlParams.get('batch');
    
    console.log('URL params:', { statusParam, batchParam, selectedBatchId });
    
    if (statusParam && !navigationFilter) {
      console.log('Setting navigation filter from URL:', statusParam);
      setNavigationFilter({ status: statusParam });
      setStatusFilter(statusParam as any);
    }
    
    // If we have a batch ID from URL but it doesn't match selectedBatchId, log it
    if (batchParam && batchParam !== selectedBatchId) {
      console.log('Batch ID mismatch - URL:', batchParam, 'Selected:', selectedBatchId);
    }
  }, [navigationFilter, setNavigationFilter, setStatusFilter, selectedBatchId]);

  // Log when selectedBatchId changes
  useEffect(() => {
    if (selectedBatchId) {
      console.log('Selected batch changed:', selectedBatchId);
      console.log('Leads with this batch ID:', leads.filter(lead => lead.importBatchId === selectedBatchId).length);
    }
  }, [selectedBatchId, leads]);

  // Clear navigation filter when status filter is manually changed to prevent conflicts
  const handleStatusFilterChange = (status: string) => {
    console.log('Manual status filter change:', status);
    setStatusFilter(status);
    // Clear navigation filter to prevent conflicts
    if (navigationFilter?.status) {
      console.log('Clearing navigation filter due to manual status change');
      setNavigationFilter(undefined);
      // Update URL to remove status parameter
      const url = new URL(window.location.href);
      url.searchParams.delete('status');
      window.history.replaceState({}, '', url.toString());
    }
  };

  const { filteredLeads, sortedLeads } = useLeadsFiltering({
    leads,
    importBatches,
    selectedBatchId,
    searchTerm,
    selectedStatus: statusFilter as LeadStatus | 'all', // Use statusFilter instead of navigationFilter
    selectedCategory: categoryFilter,
    selectedSeniority: 'all',
    selectedCompanySize: 'all',
    selectedLocation: '',
    selectedIndustry: '',
    selectedDataFilter: dataAvailabilityFilter,
    countryFilter,
    duplicatePhoneFilter,
    remarksFilter,
    currentPage,
    itemsPerPage,
    sortField,
    sortDirection,
    setCurrentPage,
    navigationFilter: undefined // Don't use navigation filter for normal filtering
  });

  // Log filtered results
  useEffect(() => {
    console.log('Filtered leads result:', {
      totalLeads: leads.length,
      filteredLeads: filteredLeads.length,
      sortedLeads: sortedLeads.length,
      selectedBatchId,
      statusFilter,
      navigationFilter: navigationFilter?.status,
      batchFilteredLeads: selectedBatchId ? leads.filter(l => l.importBatchId === selectedBatchId).length : 'N/A'
    });
  }, [filteredLeads, sortedLeads, selectedBatchId, leads, statusFilter, navigationFilter]);

  const { selectedLeads, handleSelectAll, handleSelectLead, clearSelection } = useLeadsSelection();

  const {
    columns,
    visibleColumns,
    reorderColumns,
    toggleColumnVisibility,
    resetToDefault
  } = useColumnConfiguration();

  const { activeFiltersCount, clearAllFilters } = useLeadsDashboardFilters({
    statusFilter,
    categoryFilter,
    dataAvailabilityFilter,
    countryFilter,
    duplicatePhoneFilter,
    remarksFilter,
    setStatusFilter: handleStatusFilterChange, // Use the wrapper function
    setCategoryFilter,
    setDataAvailabilityFilter,
    setCountryFilter,
    setDuplicatePhoneFilter,
    setRemarksFilter,
    setSearchTerm,
    setNavigationFilter
  });

  const { handleBulkAction, handleExport, handleStatusChange, handleRemarksUpdate } = useLeadsDashboardActions({
    leads,
    categories,
    sortedLeads,
    selectedLeads,
    onUpdateLead,
    onBulkUpdateStatus,
    onBulkDelete,
    clearSelection
  });

  // Create a wrapper for handleRemarksUpdate to match the expected signature
  const handleRemarksUpdateWrapper = async (leadId: string, remarks: string, remarksHistory: RemarkEntry[]) => {
    await handleRemarksUpdate(leadId, remarks, remarksHistory);
  };

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

  return {
    // State
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter: handleStatusFilterChange, // Use the wrapper function
    categoryFilter,
    setCategoryFilter,
    dataAvailabilityFilter,
    setDataAvailabilityFilter,
    countryFilter,
    setCountryFilter,
    duplicatePhoneFilter,
    setDuplicatePhoneFilter,
    remarksFilter,
    setRemarksFilter,
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
    handleRemarksUpdate: handleRemarksUpdateWrapper,
    handleSelectAll,
    handleSelectLead,
    clearSelection,
    clearAllFilters,
    reorderColumns,
    toggleColumnVisibility,
    resetToDefault
  };
};
