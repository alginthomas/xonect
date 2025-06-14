
import { useState } from 'react';
import type { Lead } from '@/types/lead';

export const useLeadsDashboardState = () => {
  const [duplicatePhoneFilter, setDuplicatePhoneFilter] = useState<'all' | 'unique-only' | 'duplicates-only'>('all');
  const [remarksFilter, setRemarksFilter] = useState<'all' | 'has-remarks' | 'no-remarks'>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedLeadForEmail, setSelectedLeadForEmail] = useState<Lead | null>(null);
  const [showEmailDialog, setShowEmailDialog] = useState(false);

  return {
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
  };
};
