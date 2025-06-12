
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Mail, 
  Phone, 
  MoreHorizontal, 
  Eye, 
  Trash2,
  MessageSquare,
  Check
} from 'lucide-react';
import { QuickStatusEditor } from '@/components/QuickStatusEditor';
import { copyEmailOnly } from '@/utils/emailUtils';
import type { Lead, LeadStatus } from '@/types/lead';
import type { Category } from '@/types/category';

interface CompactLeadCardProps {
  lead: Lead;
  categories: Category[];
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onStatusChange: (status: LeadStatus) => void;
  onRemarksUpdate: (remarks: string) => void;
  onEmailClick: () => void;
  onViewDetails: () => void;
  onDeleteLead: () => void;
  selectionMode?: boolean;
}

export const CompactLeadCard: React.FC<CompactLeadCardProps> = ({
  lead,
  categories,
  isSelected,
  onSelect,
  onStatusChange,
  onRemarksUpdate,
  onEmailClick,
  onViewDetails,
  onDeleteLead,
  selectionMode = false
}) => {
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  const handlePrimaryAction = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lead.phone) {
      // Primary action is call if phone exists
      window.open(`tel:${lead.phone}`, '_self');
    } else {
      // Fallback to email copy only
      await copyEmailOnly(lead.email);
    }
  };

  const handleSecondaryAction = async (e: React.MouseEvent) => {
    e.stopPropagation();
    // Always just copy email for secondary action
    await copyEmailOnly(lead.email);
  };

  const handleCardClick = () => {
    if (selectionMode) {
      onSelect(!isSelected);
    } else {
      onViewDetails();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!selectionMode) {
      const timer = setTimeout(() => {
        // Trigger haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
        onSelect(true);
      }, 500); // 500ms long press
      setLongPressTimer(timer);
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleTouchMove = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  return (
    <Card 
      className={`mb-4 shadow-sm border-border/40 bg-card hover:shadow-md transition-all duration-200 rounded-xl overflow-hidden cursor-pointer ${
        isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
      }`}
      onClick={handleCardClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
    >
      <div className="p-5">
        {/* Main content row with avatar and info */}
        <div className="flex items-start gap-4 mb-4">
          {/* Selection indicator */}
          {selectionMode && (
            <div className="pt-1 flex-shrink-0">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                isSelected 
                  ? 'bg-primary border-primary text-primary-foreground' 
                  : 'border-border bg-background'
              }`}>
                {isSelected && <Check className="h-3 w-3" />}
              </div>
            </div>
          )}
          
          {/* Avatar */}
          <Avatar className="h-14 w-14 flex-shrink-0">
            <AvatarImage src={lead.photoUrl} alt={`${lead.firstName} ${lead.lastName}`} />
            <AvatarFallback className="text-sm font-medium bg-primary/10 text-primary">
              {lead.firstName.charAt(0)}{lead.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          {/* Lead info - left aligned */}
          <div className="flex-1 min-w-0 pr-3">
            <h3 className="font-semibold text-base leading-tight mb-2 text-left">
              {lead.firstName} {lead.lastName}
            </h3>
            <div className="space-y-1.5 text-left">
              <p className="text-sm text-muted-foreground">
                {lead.company} • {lead.title}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {lead.email}
              </p>
            </div>
          </div>

          {/* More actions menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-9 w-9 p-0 flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewDetails(); }}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDeleteLead(); }} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Lead
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status section */}
        <div className="pt-4 border-t border-border/30" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">Status:</span>
            <QuickStatusEditor
              status={lead.status}
              onChange={onStatusChange}
            />
          </div>
          
          {/* Action buttons placed below status */}
          <div className="flex items-center gap-3">
            {/* Primary action button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-10 px-4 hover:bg-primary/10 flex-1 justify-start"
              onClick={handlePrimaryAction}
            >
              {lead.phone ? (
                <>
                  <Phone className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-sm">Call</span>
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-sm">Copy Email</span>
                </>
              )}
            </Button>

            {/* Secondary action button (only if phone exists) */}
            {lead.phone && (
              <Button
                variant="ghost"
                size="sm"
                className="h-10 px-4 hover:bg-blue-50 flex-1 justify-start"
                onClick={handleSecondaryAction}
              >
                <Mail className="h-4 w-4 mr-2 text-blue-600" />
                <span className="text-sm">Copy Email</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
