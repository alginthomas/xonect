import React from 'react';
import { format, isToday, isYesterday, isThisWeek, parseISO } from 'date-fns';
import { CompactLeadCard } from '@/components/ui/compact-lead-card';
import type { Lead, LeadStatus } from '@/types/lead';
import type { Category } from '@/types/category';
interface DateGroupedLeadsProps {
  leads: Lead[];
  categories: Category[];
  selectedLeads: Set<string>;
  onSelectLead: (leadId: string, checked: boolean) => void;
  onStatusChange: (leadId: string, status: LeadStatus) => void;
  onRemarksUpdate: (leadId: string, remarks: string) => void;
  onEmailClick: (lead: Lead) => void;
  onViewDetails: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
}
export const DateGroupedLeads: React.FC<DateGroupedLeadsProps> = ({
  leads,
  categories,
  selectedLeads,
  onSelectLead,
  onStatusChange,
  onRemarksUpdate,
  onEmailClick,
  onViewDetails,
  onDeleteLead
}) => {
  const getDateGroup = (date: Date): string => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    if (isThisWeek(date)) return 'This Week';
    return format(date, 'MMM dd, yyyy');
  };

  // Group leads by date
  const groupedLeads = leads.reduce((groups, lead) => {
    const dateGroup = getDateGroup(lead.createdAt);
    if (!groups[dateGroup]) {
      groups[dateGroup] = [];
    }
    groups[dateGroup].push(lead);
    return groups;
  }, {} as Record<string, Lead[]>);

  // Sort date groups
  const sortedGroups = Object.entries(groupedLeads).sort(([a], [b]) => {
    const order = ['Today', 'Yesterday', 'This Week'];
    const indexA = order.indexOf(a);
    const indexB = order.indexOf(b);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;

    // For other dates, sort chronologically (newest first)
    return new Date(b).getTime() - new Date(a).getTime();
  });
  return <div className="space-y-4">
      {sortedGroups.map(([dateGroup, groupLeads]) => <div key={dateGroup} className="space-y-2">
          {/* Date Group Header */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-2">
            <div className="flex items-center gap-2">
              <div className="h-px bg-border flex-1" />
              <span className="text-xs font-medium text-muted-foreground px-3 py-1 bg-muted/50 rounded-full">
                {dateGroup} ({groupLeads.length})
              </span>
              <div className="h-px bg-border flex-1" />
            </div>
          </div>

          {/* Leads in this date group */}
          <div className="space-y-3 px-3 my-0">
            {groupLeads.map(lead => <CompactLeadCard 
              key={lead.id} 
              lead={lead} 
              categories={categories} 
              isSelected={selectedLeads.has(lead.id)} 
              onSelect={checked => onSelectLead(lead.id, checked)} 
              onStatusChange={status => onStatusChange(lead.id, status)} 
              onRemarksUpdate={remarks => onRemarksUpdate(lead.id, remarks)} 
              onEmailClick={() => onEmailClick(lead)} 
              onViewDetails={() => onViewDetails(lead)} 
              onDeleteLead={() => onDeleteLead(lead.id)} 
            />)}
          </div>
        </div>)}
    </div>;
};
