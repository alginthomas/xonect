
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Mail, Phone, MessageSquare, MoreHorizontal, Eye, Trash2, Copy, Linkedin, Globe } from 'lucide-react';
import { copyEmailOnly } from '@/utils/emailUtils';
import type { Lead } from '@/types/lead';

interface QuickActionsCellProps {
  lead: Lead;
  onEmailClick?: () => void;
  onViewDetails: () => void;
  onDeleteLead: () => void;
  className?: string;
}

export const QuickActionsCell: React.FC<QuickActionsCellProps> = ({
  lead,
  onEmailClick,
  onViewDetails,
  onDeleteLead,
  className = ""
}) => {
  const handleClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const callLead = () => {
    if (lead.phone) {
      window.open(`tel:${lead.phone}`, '_self');
    }
  };

  const copyEmail = async () => {
    await copyEmailOnly(lead.email);
  };

  const emailLead = async () => {
    await copyEmailOnly(lead.email);
    // Do not call onEmailClick to prevent status changes
  };

  const openLinkedIn = () => {
    if (lead.linkedin) {
      window.open(lead.linkedin, '_blank', 'noopener,noreferrer');
    }
  };

  const openWebsite = () => {
    if (lead.organizationWebsite) {
      window.open(lead.organizationWebsite, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* Quick Email Button */}
      <Button
        size="sm"
        variant="ghost"
        className="h-7 w-7 p-0"
        onClick={(e) => handleClick(e, emailLead)}
        title="Copy Email"
      >
        <Mail className="h-3 w-3" />
      </Button>

      {/* Quick Call Button */}
      {lead.phone && (
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0"
          onClick={(e) => handleClick(e, callLead)}
          title="Call Lead"
        >
          <Phone className="h-3 w-3" />
        </Button>
      )}

      {/* LinkedIn Button */}
      {lead.linkedin && (
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0"
          onClick={(e) => handleClick(e, openLinkedIn)}
          title="Open LinkedIn"
        >
          <Linkedin className="h-3 w-3" />
        </Button>
      )}

      {/* Website Button */}
      {lead.organizationWebsite && (
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0"
          onClick={(e) => handleClick(e, openWebsite)}
          title="Visit Website"
        >
          <Globe className="h-3 w-3" />
        </Button>
      )}

      {/* View Details Button */}
      <Button
        size="sm"
        variant="ghost"
        className="h-7 w-7 p-0"
        onClick={(e) => handleClick(e, onViewDetails)}
        title="View Details"
      >
        <Eye className="h-3 w-3" />
      </Button>

      {/* More Actions Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-7 w-7 p-0"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => emailLead()}>
            <Mail className="h-4 w-4 mr-2" />
            Copy Email
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => copyEmail()}>
            <Copy className="h-4 w-4 mr-2" />
            Copy Email
          </DropdownMenuItem>
          {lead.phone && (
            <DropdownMenuItem onClick={() => callLead()}>
              <Phone className="h-4 w-4 mr-2" />
              Call Lead
            </DropdownMenuItem>
          )}
          {lead.linkedin && (
            <DropdownMenuItem onClick={() => openLinkedIn()}>
              <Linkedin className="h-4 w-4 mr-2" />
              Open LinkedIn
            </DropdownMenuItem>
          )}
          {lead.organizationWebsite && (
            <DropdownMenuItem onClick={() => openWebsite()}>
              <Globe className="h-4 w-4 mr-2" />
              Visit Website
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => onViewDetails()}>
            <Eye className="h-4 w-4 mr-2" />
            View Full Details
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => onDeleteLead()}
            className="text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Lead
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
