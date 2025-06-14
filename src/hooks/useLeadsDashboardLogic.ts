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
    selectedLead,
    setSelectedLead,
    showSidebar,
    setShowSidebar,
    selectedLeadForEmail,
    setSelectedLeadForEmail,
    showEmailDialog,
    setShowEmailDialog
  } = useLeadsDashboardState();

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

  const { activeFiltersCount, clearAllFilters } = useLeadsDashboardFilters({
    statusFilter,
    categoryFilter,
    dataAvailabilityFilter,
    countryFilter,
    duplicatePhoneFilter,
    setStatusFilter,
    setCategoryFilter,
    setDataAvailabilityFilter,
    setCountryFilter,
    setDuplicatePhoneFilter,
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
