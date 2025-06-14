
import { useState } from 'react';
import type { Lead } from '@/types/lead';

export const useLeadsDashboardState = () => {
  const [duplicatePhoneFilter, setDuplicatePhoneFilter] = useState<'all' | 'unique-only' | 'duplicates-only'>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedLeadForEmail, setSelectedLeadForEmail] = useState<Lead | null>(null);
  const [showEmailDialog, setShowEmailDialog] = useState(false);

  return {
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
  };
};
