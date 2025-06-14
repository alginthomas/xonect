
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QuickStatusEditor } from '@/components/QuickStatusEditor';
import { QuickRemarksCell } from '@/components/QuickRemarksCell';
import { QuickActionsCell } from '@/components/QuickActionsCell';
import { Mail, Phone, Linkedin, Globe, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { copyEmailOnly } from '@/utils/emailUtils';
import type { Lead, LeadStatus } from '@/types/lead';
import type { Category } from '@/types/category';

interface LeadTableCellProps {
  columnId: string;
  lead: Lead;
  categories: Category[];
  selectedLeads: Set<string>;
  onSelectLead: (leadId: string, selected?: boolean) => void;
  onStatusChange: (leadId: string, status: LeadStatus) => void;
  onRemarksUpdate: (leadId: string, remarks: string) => void;
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
  const handleRemarksUpdateWrapper = (remarks: string, remarksHistory: import('@/types/lead').RemarkEntry[]) => {
    onRemarksUpdate(lead.id, remarks);
  };

  switch (columnId) {
    case 'select':
      return (
        <Checkbox
          checked={selectedLeads.has(lead.id)}
          onCheckedChange={(checked) => onSelectLead(lead.id, !!checked)}
          aria-label={`Select ${lead.firstName} ${lead.lastName}`}
        />
      );

    case 'name':
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={lead.photoUrl} alt={`${lead.firstName} ${lead.lastName}`} />
            <AvatarFallback>
              {lead.firstName.charAt(0)}{lead.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{lead.firstName} {lead.lastName}</div>
            <div className="text-sm text-muted-foreground">{lead.email}</div>
          </div>
        </div>
      );

    case 'company':
      return (
        <div>
          <div className="font-medium">{lead.company}</div>
          <div className="text-sm text-muted-foreground">{lead.title}</div>
        </div>
      );

    case 'status':
      return (
        <QuickStatusEditor
          status={lead.status}
          onChange={(status) => onStatusChange(lead.id, status)}
        />
      );

    case 'category':
      const category = categories.find(c => c.id === lead.categoryId);
      return category ? (
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: category.color }}
          />
          <span className="text-sm">{category.name}</span>
        </div>
      ) : (
        <span className="text-sm text-muted-foreground">Uncategorized</span>
      );

    case 'phone':
      return lead.phone ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            window.open(`tel:${lead.phone}`, '_self');
          }}
          className="h-8 px-2 text-left justify-start"
        >
          <Phone className="h-4 w-4 mr-2" />
          {lead.phone}
        </Button>
      ) : (
        <span className="text-muted-foreground">-</span>
      );

    case 'email':
      return lead.email ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            copyEmailOnly(lead.email);
          }}
          className="h-8 px-2 text-left justify-start"
        >
          <Mail className="h-4 w-4 mr-2" />
          {lead.email}
        </Button>
      ) : (
        <span className="text-muted-foreground">-</span>
      );

    case 'linkedin':
      return lead.linkedin ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            window.open(lead.linkedin, '_blank', 'noopener,noreferrer');
          }}
          className="h-8 px-2"
        >
          <Linkedin className="h-4 w-4 mr-2" />
          Profile
          <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
      ) : (
        <span className="text-muted-foreground">-</span>
      );

    case 'location':
      return <span className="text-sm">{lead.location || '-'}</span>;

    case 'industry':
      return <span className="text-sm">{lead.industry || '-'}</span>;

    case 'companySize':
      return (
        <Badge variant="outline" className="text-xs">
          {lead.companySize}
        </Badge>
      );

    case 'seniority':
      return (
        <Badge variant="outline" className="text-xs">
          {lead.seniority}
        </Badge>
      );

    case 'emailsSent':
      return <span className="text-sm">{lead.emailsSent || 0}</span>;

    case 'lastContact':
      return (
        <span className="text-sm">
          {lead.lastContactDate ? format(lead.lastContactDate, 'MMM dd, yyyy') : 'Never'}
        </span>
      );

    case 'createdAt':
      return (
        <span className="text-sm">
          {format(lead.createdAt, 'MMM dd, yyyy')}
        </span>
      );

    case 'website':
      return lead.organizationWebsite ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            let url = lead.organizationWebsite!;
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
              url = 'https://' + url;
            }
            window.open(url, '_blank', 'noopener,noreferrer');
          }}
          className="h-8 px-2"
        >
          <Globe className="h-4 w-4 mr-2" />
          Visit
          <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
      ) : (
        <span className="text-muted-foreground">-</span>
      );

    case 'remarks':
      return (
        <div className="max-w-xs">
          <QuickRemarksCell
            remarks={lead.remarks || ''}
            remarksHistory={lead.remarksHistory || []}
            onUpdate={handleRemarksUpdateWrapper}
          />
        </div>
      );

    case 'actions':
      return (
        <QuickActionsCell
          lead={lead}
          onEmailClick={onEmailClick}
          onViewDetails={onViewDetails}
          onDeleteLead={onDeleteLead}
        />
      );

    default:
      return <span>-</span>;
  }
};
