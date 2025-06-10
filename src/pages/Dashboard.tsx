
import React from 'react';
import { useLeadsData } from '@/hooks/useLeadsData';
import { useTemplatesData } from '@/hooks/useTemplatesData';
import { useCategoriesData } from '@/hooks/useCategoriesData';
import { useImportBatchesData } from '@/hooks/useImportBatchesData';
import { useLeadOperations } from '@/hooks/useLeadOperations';
import { LeadsDashboard } from '@/components/LeadsDashboard';

const Dashboard = () => {
  const { data: leads = [] } = useLeadsData();
  const { data: templates = [] } = useTemplatesData();
  const { data: categories = [] } = useCategoriesData();
  const { data: importBatches = [] } = useImportBatchesData();
  const { updateLead } = useLeadOperations();

  const handleUpdateLead = (leadId: string, updates: any) => {
    updateLead({ leadId, updates });
  };

  return (
    <div className="p-6">
      <LeadsDashboard 
        leads={leads}
        templates={templates}
        categories={categories}
        importBatches={importBatches}
        branding={{
          companyName: '',
          companyLogo: '',
          companyWebsite: '',
          companyAddress: '',
          senderName: '',
          senderEmail: ''
        }}
        onUpdateLead={handleUpdateLead}
      />
    </div>
  );
};

export default Dashboard;
