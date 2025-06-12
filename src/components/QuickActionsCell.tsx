
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Mail, Phone, MessageSquare, MoreHorizontal, Eye, Trash2 } from 'lucide-react';
import type { Lead } from '@/types/lead';

interface QuickActionsCellProps {
  lead: Lead;
  onEmailClick: () => void;
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

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* Quick Email Button */}
      <Button
        size="sm"
        variant="ghost"
        className="h-7 w-7 p-0"
        onClick={(e) => handleClick(e, onEmailClick)}
        title="Send Email"
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
          <DropdownMenuItem onClick={() => onEmailClick()}>
            <Mail className="h-4 w-4 mr-2" />
            Send Email
          </DropdownMenuItem>
          {lead.phone && (
            <DropdownMenuItem onClick={() => callLead()}>
              <Phone className="h-4 w-4 mr-2" />
              Call Lead
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
