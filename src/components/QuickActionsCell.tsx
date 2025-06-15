
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Mail, Phone, Globe, Linkedin, View, Trash } from 'lucide-react';
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
    // Optionally, call onEmailClick to trigger marking as "Contacted"
    if (onEmailClick) onEmailClick();
  };

  const openLinkedIn = () => {
    if (lead.linkedin) {
      window.open(lead.linkedin, '_blank', 'noopener,noreferrer');
    }
  };

  const openWebsite = () => {
    if (lead.organizationWebsite) {
      let url = lead.organizationWebsite;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={`flex items-center gap-6 justify-center ${className}`}>
      {/* Website Button */}
      <Button
        size="sm"
        variant="ghost"
        className="h-8 w-8 p-0"
        onClick={(e) => handleClick(e, openWebsite)}
        title="Visit Website"
        disabled={!lead.organizationWebsite}
      >
        <Globe className="h-5 w-5" />
      </Button>

      {/* Phone Button */}
      <Button
        size="sm"
        variant="ghost"
        className="h-8 w-8 p-0"
        onClick={(e) => handleClick(e, callLead)}
        title="Call Lead"
        disabled={!lead.phone}
      >
        <Phone className="h-5 w-5" />
      </Button>

      {/* Email Button */}
      <Button
        size="sm"
        variant="ghost"
        className="h-8 w-8 p-0"
        onClick={(e) => handleClick(e, copyEmail)}
        title="Copy Email"
        disabled={!lead.email}
      >
        <Mail className="h-5 w-5" />
      </Button>

      {/* LinkedIn Button */}
      <Button
        size="sm"
        variant="ghost"
        className="h-8 w-8 p-0"
        onClick={(e) => handleClick(e, openLinkedIn)}
        title="Open LinkedIn"
        disabled={!lead.linkedin}
      >
        <Linkedin className="h-5 w-5" />
      </Button>

      {/* View Details Button */}
      <Button
        size="sm"
        variant="ghost"
        className="h-8 w-8 p-0"
        onClick={(e) => handleClick(e, onViewDetails)}
        title="View Details"
      >
        <View className="h-5 w-5" />
      </Button>

      {/* Delete Button */}
      <Button
        size="sm"
        variant="ghost"
        className="h-8 w-8 p-0 text-red-600 hover:bg-red-100"
        onClick={(e) => handleClick(e, onDeleteLead)}
        title="Delete Lead"
      >
        <Trash className="h-5 w-5" />
      </Button>
    </div>
  );
};
