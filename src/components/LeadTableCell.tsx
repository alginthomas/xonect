
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { QuickStatusEditor } from '@/components/QuickStatusEditor';
import { SimpleRemarksList } from '@/components/remarks/SimpleRemarksList';
import { Mail, Phone, ExternalLink, Eye, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import type { Lead, LeadStatus, RemarkEntry } from '@/types/lead';
import type { Category } from '@/types/category';

interface LeadTableCellProps {
  columnId: string;
  lead: Lead;
  categories: Category[];
  selectedLeads: Set<string>;
  onSelectLead: (leadId: string, selected?: boolean) => void;
  onStatusChange: (leadId: string, status: LeadStatus) => void;
  onRemarksUpdate: (leadId: string, remarks: string, remarksHistory: RemarkEntry[]) => void;
  onEmailClick: () => void;
  onViewDetails: () => void;
  onDeleteLead: () => void;
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
  const category = categories.find(cat => cat.id === lead.categoryId);

  // Helper function to stop event propagation for interactive elements
  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  switch (columnId) {
    case 'select':
      return (
        <div onClick={stopPropagation}>
          <Checkbox
            checked={selectedLeads.has(lead.id)}
            onCheckedChange={(checked) => onSelectLead(lead.id, !!checked)}
          />
        </div>
      );

    case 'name':
      return (
        <div className="font-medium">
          {lead.firstName} {lead.lastName}
        </div>
      );

    case 'status':
      return (
        <div onClick={stopPropagation}>
          <QuickStatusEditor
            status={lead.status}
            onChange={(status) => onStatusChange(lead.id, status)}
          />
        </div>
      );

    case 'company':
      return <div>{lead.company}</div>;

    case 'phone':
      return (
        <div className="flex items-center gap-2">
          <span>{lead.phone}</span>
          {lead.phone && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                stopPropagation(e);
                window.open(`tel:${lead.phone}`, '_self');
              }}
            >
              <Phone className="h-3 w-3" />
            </Button>
          )}
        </div>
      );

    case 'email':
      return (
        <div className="flex items-center gap-2">
          <span className="truncate max-w-48">{lead.email}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              stopPropagation(e);
              onEmailClick();
            }}
          >
            <Mail className="h-3 w-3" />
          </Button>
        </div>
      );

    case 'category':
      return (
        <Badge variant={category?.color as any || 'default'}>
          {category?.name || 'Uncategorized'}
        </Badge>
      );

    case 'remarks':
      return (
        <div onClick={stopPropagation} className="max-w-64">
          <SimpleRemarksList
            remarks={lead.remarks}
            remarksHistory={lead.remarksHistory}
            onUpdate={(remarks, remarksHistory) => onRemarksUpdate(lead.id, remarks, remarksHistory)}
            className="text-sm"
          />
        </div>
      );

    case 'linkedin':
      return (
        <div>
          {lead.linkedin && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                stopPropagation(e);
                window.open(lead.linkedin, '_blank');
              }}
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          )}
        </div>
      );

    case 'location':
      return <div>{lead.location}</div>;

    case 'industry':
      return <div>{lead.industry}</div>;

    case 'companySize':
      return <div>{lead.companySize}</div>;

    case 'seniority':
      return <div>{lead.seniority}</div>;

    case 'emailsSent':
      return <div>{lead.emailsSent || 0}</div>;

    case 'lastContact':
      return (
        <div>
          {lead.lastContactDate ? format(new Date(lead.lastContactDate), 'MMM dd, yyyy') : '-'}
        </div>
      );

    case 'createdAt':
      return (
        <div>
          {format(new Date(lead.createdAt), 'MMM dd, yyyy')}
        </div>
      );

    case 'website':
      return (
        <div>
          {lead.organizationWebsite && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                stopPropagation(e);
                window.open(lead.organizationWebsite, '_blank');
              }}
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          )}
        </div>
      );

    case 'actions':
      return (
        <div className="flex gap-1" onClick={stopPropagation}>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              stopPropagation(e);
              onViewDetails();
            }}
          >
            <Eye className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
            onClick={(e) => {
              stopPropagation(e);
              onDeleteLead();
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      );

    default:
      return <div>-</div>;
  }
};
