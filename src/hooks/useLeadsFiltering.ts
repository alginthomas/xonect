
import { useMemo, useEffect } from 'react';
import type { Lead } from '@/types/lead';
import type { ImportBatch } from '@/types/category';

interface UseLeadsFilteringProps {
  leads: Lead[];
  importBatches: ImportBatch[];
  selectedBatchId?: string | null;
  searchTerm: string;
  statusFilter: string;
  categoryFilter: string;
  dataAvailabilityFilter: string;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  setCurrentPage: (page: number) => void;
}

export const useLeadsFiltering = ({
  leads,
  importBatches,
  selectedBatchId,
  searchTerm,
  statusFilter,
  categoryFilter,
  dataAvailabilityFilter,
  sortField,
  sortDirection,
  setCurrentPage
}: UseLeadsFilteringProps) => {
  // Filter leads based on batch selection and other filters
  const filteredLeads = useMemo(() => {
    console.log('Filtering leads:', {
      totalLeads: leads.length,
      selectedBatchId,
      searchTerm,
      statusFilter,
      categoryFilter,
      dataAvailabilityFilter
    });
    let filtered = leads;

    // Filter by selected batch
    if (selectedBatchId) {
      const selectedBatch = importBatches.find(b => b.id === selectedBatchId);
      filtered = filtered.filter(lead => 
        lead.importBatchId === selectedBatchId || 
        (selectedBatch && lead.categoryId === selectedBatch.categoryId)
      );
      console.log('After batch filter:', filtered.length, 'leads found for batch:', selectedBatchId);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(lead =>
        lead.firstName?.toLowerCase().includes(term) ||
        lead.lastName?.toLowerCase().includes(term) ||
        lead.email?.toLowerCase().includes(term) ||
        lead.company?.toLowerCase().includes(term) ||
        lead.title?.toLowerCase().includes(term)
      );
      console.log('After search filter:', filtered.length);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
      console.log('After status filter:', filtered.length);
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(lead => lead.categoryId === categoryFilter);
      console.log('After category filter:', filtered.length);
    }

    // Filter by data availability
    if (dataAvailabilityFilter === 'has-phone') {
      filtered = filtered.filter(lead => lead.phone && lead.phone.trim() !== '');
    } else if (dataAvailabilityFilter === 'has-email') {
      filtered = filtered.filter(lead => lead.email && lead.email.trim() !== '');
    } else if (dataAvailabilityFilter === 'has-both') {
      filtered = filtered.filter(lead => 
        lead.phone && lead.phone.trim() !== '' && 
        lead.email && lead.email.trim() !== ''
      );
    }

    console.log('Final filtered count:', filtered.length);
    return filtered;
  }, [leads, selectedBatchId, searchTerm, statusFilter, categoryFilter, dataAvailabilityFilter, importBatches]);

  // Sort leads
  const sortedLeads = useMemo(() => {
    return [...filteredLeads].sort((a, b) => {
      let aValue: any = a[sortField as keyof Lead];
      let bValue: any = b[sortField as keyof Lead];

      if (aValue instanceof Date) aValue = aValue.getTime();
      if (bValue instanceof Date) bValue = bValue.getTime();
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredLeads, sortField, sortDirection]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, categoryFilter, dataAvailabilityFilter, selectedBatchId, setCurrentPage]);

  return {
    filteredLeads,
    sortedLeads
  };
};
