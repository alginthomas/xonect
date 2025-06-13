
import { useState, useCallback } from 'react';
import type { Lead } from '@/types/lead';

export const useLeadsSelection = () => {
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());

  const handleSelectAll = useCallback((paginatedLeads: Lead[]) => {
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

  const handleSelectLead = (leadId: string, checked: boolean) => {
    setSelectedLeads(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(leadId);
      } else {
        newSet.delete(leadId);
      }
      return newSet;
    });
  };

  const clearSelection = () => {
    setSelectedLeads(new Set());
  };

  return {
    selectedLeads,
    handleSelectAll,
    handleSelectLead,
    clearSelection
  };
};
