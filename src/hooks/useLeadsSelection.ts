
import { useState, useCallback } from 'react';
import type { Lead } from '@/types/lead';

export const useLeadsSelection = () => {
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());

  const selectLead = useCallback((leadId: string, checked: boolean) => {
    setSelectedLeads(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(leadId);
      } else {
        newSet.delete(leadId);
      }
      return newSet;
    });
  }, []);

  const selectAllLeads = useCallback((paginatedLeads: Lead[]) => {
    const currentPageLeadIds = paginatedLeads.map(lead => lead.id);
    const allCurrentSelected = currentPageLeadIds.every(id => selectedLeads.has(id));
    
    if (allCurrentSelected) {
      setSelectedLeads(prev => {
        const newSet = new Set(prev);
        currentPageLeadIds.forEach(id => newSet.delete(id));
        return newSet;
      });
    } else {
      setSelectedLeads(prev => new Set([...prev, ...currentPageLeadIds]));
    }
  }, [selectedLeads]);

  const handleSelectAll = useCallback((paginatedLeads: Lead[]) => {
    selectAllLeads(paginatedLeads);
  }, [selectAllLeads]);

  const handleSelectLead = useCallback((leadId: string, checked: boolean) => {
    selectLead(leadId, checked);
  }, [selectLead]);

  const clearSelection = useCallback(() => {
    setSelectedLeads(new Set());
  }, []);

  const isAllSelected = useCallback((paginatedLeads: Lead[]) => {
    if (paginatedLeads.length === 0) return false;
    return paginatedLeads.every(lead => selectedLeads.has(lead.id));
  }, [selectedLeads]);

  return {
    selectedLeads,
    selectLead,
    selectAllLeads,
    handleSelectAll,
    handleSelectLead,
    clearSelection,
    isAllSelected
  };
};
