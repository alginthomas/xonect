
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { QuickStatusEditor } from '@/components/QuickStatusEditor';
import { QuickRemarksCell } from '@/components/QuickRemarksCell';
import { QuickActionsCell } from '@/components/QuickActionsCell';
import { Mail, Phone, Globe } from 'lucide-react';
import { format } from 'date-fns';
import type { Lead, LeadStatus } from '@/types/lead';
import type { Category } from '@/types/category';

interface LeadTableCellProps {
  columnId: string;
  lead: Lead;
  categories: Category[];
  selectedLeads: Set<string>;
  onSelectLead: (leadId: string, selected: boolean) => void;
  onStatusChange: (leadId: string, status: LeadStatus) => void;
  onRemarksUpdate: (leadId: string, remarks: string) => void;
  onEmailClick: (lead: Lead) => void;
  onViewDetails: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
}

export const LeadTableCell: React.FC<LeadTableCellProps> = ({
  columnId,
  lead,
  categories,
  selectedLeads,
  onSelectLead,
  onStatusChange,
  onRemarksUpdate,
  onEmailClick,
  onViewDetails,
  onDeleteLead
}) => {
  const getCategoryInfo = (categoryId: string | undefined) => {
    if (!categoryId) return { name: 'Uncategorized', color: '#6B7280' };
    const category = categories.find(c => c.id === categoryId);
    return category ? { name: category.name, color: category.color } : { name: 'Unknown', color: '#6B7280' };
  };

  const getSizeColor = (size: string) => {
    switch (size) {
      case 'Small (1-50)': return 'bg-blue-100 text-blue-800';
      case 'Medium (51-200)': return 'bg-yellow-100 text-yellow-800';
      case 'Large (201-1000)': return 'bg-orange-100 text-orange-800';
      case 'Enterprise (1000+)': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  switch (columnId) {
    case 'select':
      return (
        <Checkbox
          checked={selectedLeads.has(lead.id)}
          onCheckedChange={(checked) => onSelectLead(lead.id, checked as boolean)}
          className="h-4 w-4"
        />
      );
    case 'status':
      return (
        <QuickStatusEditor
          status={lead.status}
          onChange={(status) => onStatusChange(lead.id, status)}
        />
      );
    case 'remarks':
      return (
        <QuickRemarksCell
          remarks={lead.remarks || ''}
          onUpdate={(remarks) => onRemarksUpdate(lead.id, remarks)}
        />
      );
    case 'actions':
      return (
        <QuickActionsCell
          lead={lead}
          onEmailClick={() => onEmailClick(lead)}
          onViewDetails={() => onViewDetails(lead)}
          onDeleteLead={() => onDeleteLead(lead.id)}
        />
      );
    case 'name':
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={lead.photoUrl} alt={`${lead.firstName} ${lead.lastName}`} />
            <AvatarFallback>
              {lead.firstName.charAt(0)}{lead.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">
              {lead.firstName} {lead.lastName}
            </div>
            <div className="text-sm text-muted-foreground">
              {lead.title}
            </div>
          </div>
        </div>
      );
    case 'company':
      return (
        <div>
          <div className="font-medium">{lead.company}</div>
          <div className="flex gap-1 mt-1">
            <Badge variant="outline" className={getSizeColor(lead.companySize)}>
              {lead.companySize.replace(/\s*\([^)]*\)/, '')}
            </Badge>
          </div>
        </div>
      );
    case 'contact':
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-3 w-3" />
            <span className="truncate max-w-[200px]">{lead.email}</span>
          </div>
          {lead.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-3 w-3" />
              <span>{lead.phone}</span>
              {lead.country && (
                <div className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  <span className="text-xs">{lead.countryFlag} {lead.country}</span>
                </div>
              )}
            </div>
          )}
        </div>
      );
    case 'category':
      const category = getCategoryInfo(lead.categoryId);
      return (
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: category.color }}
          />
          <span className="text-sm">{category.name}</span>
        </div>
      );
    case 'created':
      return (
        <div className="text-sm text-muted-foreground">
          {format(lead.createdAt, 'MMM dd')}
        </div>
      );
    default:
      return null;
  }
};
