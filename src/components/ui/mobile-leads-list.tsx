
import React from 'react';
import { CompactLeadCard } from '@/components/ui/compact-lead-card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Lead, LeadStatus } from '@/types/lead';
import type { Category } from '@/types/category';

interface MobileLeadsListProps {
  leads: Lead[];
  categories: Category[];
  selectedLeads: string[];
  onSelectLead: (leadId: string, checked: boolean) => void;
  onStatusChange: (leadId: string, status: LeadStatus) => void;
  onRemarksUpdate: (leadId: string, remarks: string) => void;
  onEmailClick: (leadId: string) => void;
  onViewDetails: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
  isLoading?: boolean;
}

export const MobileLeadsList: React.FC<MobileLeadsListProps> = ({
  leads,
  categories,
  selectedLeads,
  onSelectLead,
  onStatusChange,
  onRemarksUpdate,
  onEmailClick,
  onViewDetails,
  onDeleteLead,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
                <div className="flex gap-2 pt-1">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">📋</span>
        </div>
        <h3 className="text-lg font-semibold mb-2">No leads found</h3>
        <p className="text-muted-foreground text-sm max-w-sm">
          Try adjusting your search terms or filters, or add some new leads to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {leads.map((lead) => (
        <CompactLeadCard
          key={lead.id}
          lead={lead}
          categories={categories}
          isSelected={selectedLeads.includes(lead.id)}
          onSelect={(checked) => onSelectLead(lead.id, checked)}
          onStatusChange={(status) => onStatusChange(lead.id, status)}
          onRemarksUpdate={(remarks) => onRemarksUpdate(lead.id, remarks)}
          onEmailClick={() => onEmailClick(lead.id)}
          onViewDetails={() => onViewDetails(lead)}
          onDeleteLead={() => onDeleteLead(lead.id)}
        />
      ))}
    </div>
  );
};
