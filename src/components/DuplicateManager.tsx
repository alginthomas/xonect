
import React from 'react';
import { EnhancedDuplicateManager } from '@/components/EnhancedDuplicateManager';
import type { Lead } from '@/types/lead';

interface DuplicateManagerProps {
  leads: Lead[];
  onBulkAction: (action: 'delete' | 'merge', leadIds: string[]) => Promise<void>;
}

export const DuplicateManager: React.FC<DuplicateManagerProps> = ({
  leads,
  onBulkAction
}) => {
  const handleMergeLeads = async (leadsToMerge: Lead[], keepLead: Lead) => {
    // This would integrate with your backend to merge leads
    // For now, we'll use the existing bulk action to delete duplicates
    const idsToRemove = leadsToMerge.filter(l => l.id !== keepLead.id).map(l => l.id);
    await onBulkAction('delete', idsToRemove);
  };

  return (
    <EnhancedDuplicateManager
      leads={leads}
      onBulkAction={onBulkAction}
      onMergeLeads={handleMergeLeads}
    />
  );
};
