
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Phone, 
  Mail, 
  Eye,
  Trash2,
  Globe,
  Linkedin
} from 'lucide-react';
import { QuickStatusEditor } from '@/components/QuickStatusEditor';
import { QuickRemarksCell } from '@/components/QuickRemarksCell';
import { copyEmailOnly } from '@/utils/emailUtils';
import type { Lead, LeadStatus, RemarkEntry } from '@/types/lead';
import type { Category } from '@/types/category';

interface LeadTableCellProps {
  columnId: string;
  lead: Lead;
  categories: Category[];
  selectedLeads: Set<string>;
  onSelectLead: (leadId: string, selected: boolean) => void;
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
  const handleCallAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lead.phone) {
      window.open(`tel:${lead.phone}`, '_self');
    }
  };

  const handleEmailAction = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await copyEmailOnly(lead.email);
  };

  const handleWebsiteAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lead.organizationWebsite) {
      let url = lead.organizationWebsite;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleLinkedInAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lead.linkedin) {
      let url = lead.linkedin;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetails();
  };

  const handleDeleteLead = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteLead();
  };

  const renderCellContent = () => {
    switch (columnId) {
      case 'select':
        return (
          <Checkbox
            checked={selectedLeads.has(lead.id)}
            onCheckedChange={(checked) => onSelectLead(lead.id, checked as boolean)}
            onClick={(e) => e.stopPropagation()}
          />
        );

      case 'name':
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={lead.photoUrl} alt={`${lead.firstName} ${lead.lastName}`} />
              <AvatarFallback className="text-sm font-medium bg-primary/10 text-primary">
                {lead.firstName.charAt(0)}{lead.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-sm truncate">
                {lead.firstName} {lead.lastName}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {lead.email}
              </div>
            </div>
          </div>
        );

      case 'company':
        return (
          <div className="min-w-0">
            <div className="font-medium text-sm truncate">{lead.company}</div>
            <div className="text-xs text-muted-foreground truncate">{lead.title}</div>
          </div>
        );

      case 'status':
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <QuickStatusEditor
              status={lead.status}
              onChange={(status) => onStatusChange(lead.id, status)}
            />
          </div>
        );

      case 'category':
        const category = categories.find(cat => cat.id === lead.categoryId);
        return category ? (
          <Badge variant="outline" className="text-xs">
            {category.name}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        );

      case 'location':
        return (
          <div className="text-sm truncate max-w-[150px]">
            {lead.location || '—'}
          </div>
        );

      case 'industry':
        return (
          <div className="text-sm truncate max-w-[120px]">
            {lead.industry || '—'}
          </div>
        );

      case 'phone':
        return lead.phone ? (
          <div className="text-sm truncate max-w-[120px]">
            {lead.phone}
          </div>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        );

      case 'linkedin':
        return lead.linkedin ? (
          <a 
            href={lead.linkedin} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-xs underline truncate max-w-[100px] inline-block"
            onClick={(e) => e.stopPropagation()}
          >
            LinkedIn
          </a>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        );

      case 'remarks':
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <QuickRemarksCell
              remarks={lead.remarks || ''}
              remarksHistory={lead.remarksHistory || []}
              onUpdate={(remarks, remarksHistory) => onRemarksUpdate(lead.id, remarks, remarksHistory)}
            />
          </div>
        );

      case 'actions':
        return (
          <div className="flex items-center gap-1">
            {/* Website Button - Globe Icon for Organization Website */}
            {lead.organizationWebsite && (
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-8 w-8"
                onClick={handleWebsiteAction}
                title="Visit Company Website"
              >
                <Globe className="h-4 w-4" />
              </Button>
            )}
            
            {/* LinkedIn Button - LinkedIn Icon for LinkedIn Profile */}
            {lead.linkedin && (
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-8 w-8"
                onClick={handleLinkedInAction}
                title="View LinkedIn Profile"
              >
                <Linkedin className="h-4 w-4" />
              </Button>
            )}
            
            {/* Call Button */}
            {lead.phone && (
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-8 w-8"
                onClick={handleCallAction}
                title="Call"
              >
                <Phone className="h-4 w-4" />
              </Button>
            )}
            
            {/* Email Button */}
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-8 w-8"
              onClick={handleEmailAction}
              title="Copy Email"
            >
              <Mail className="h-4 w-4" />
            </Button>
            
            {/* View Details Button */}
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-8 w-8"
              onClick={handleViewDetails}
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            {/* Delete Button */}
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={handleDeleteLead}
              title="Delete Lead"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );

      default:
        return <span className="text-muted-foreground text-xs">—</span>;
    }
  };

  return renderCellContent();
};
