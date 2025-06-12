
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
  MessageSquare
} from 'lucide-react';
import { QuickStatusEditor } from '@/components/QuickStatusEditor';
import { useToast } from '@/hooks/use-toast';
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
  onDeleteLead
}) => {
  const { toast } = useToast();

  const handlePrimaryAction = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lead.phone) {
      // Primary action is call if phone exists
      window.open(`tel:${lead.phone}`, '_self');
    } else {
      // Fallback to email
      try {
        await navigator.clipboard.writeText(lead.email);
        onEmailClick();
        toast({
          title: 'Email copied',
          description: `${lead.email} copied to clipboard.`,
        });
      } catch (error) {
        toast({
          title: 'Copy failed',
          description: 'Failed to copy email.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleSecondaryAction = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lead.phone) {
      // Secondary action is email if phone exists
      try {
        await navigator.clipboard.writeText(lead.email);
        onEmailClick();
        toast({
          title: 'Email copied',
          description: `${lead.email} copied to clipboard.`,
        });
      } catch (error) {
        toast({
          title: 'Copy failed',
          description: 'Failed to copy email.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleCardClick = () => {
    onViewDetails();
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Card 
      className="mb-4 shadow-sm border-border/40 bg-card hover:shadow-md transition-all duration-200 rounded-lg overflow-hidden cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="p-4">
        {/* Main content row with avatar and info */}
        <div className="flex items-start gap-3 mb-3">
          {/* Selection checkbox */}
          <div onClick={handleCheckboxClick} className="pt-1">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              className="h-4 w-4 flex-shrink-0"
            />
          </div>
          
          {/* Avatar */}
          <Avatar className="h-12 w-12 flex-shrink-0">
            <AvatarImage src={lead.photoUrl} alt={`${lead.firstName} ${lead.lastName}`} />
            <AvatarFallback className="text-sm font-medium bg-primary/10 text-primary">
              {lead.firstName.charAt(0)}{lead.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          {/* Lead info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base leading-tight mb-1">
              {lead.firstName} {lead.lastName}
            </h3>
            <p className="text-sm text-muted-foreground mb-1">
              {lead.company} • {lead.title}
            </p>
            <p className="text-sm text-muted-foreground">
              {lead.email}
            </p>
          </div>

          {/* More actions menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 flex-shrink-0"
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

        {/* Status and action buttons row */}
        <div className="flex items-center justify-between pt-3 border-t border-border/30" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Status:</span>
            <QuickStatusEditor
              status={lead.status}
              onChange={onStatusChange}
            />
          </div>
          
          {/* Action buttons positioned next to status */}
          <div className="flex items-center gap-2">
            {/* Primary action button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 hover:bg-primary/10"
              onClick={handlePrimaryAction}
            >
              {lead.phone ? (
                <>
                  <Phone className="h-4 w-4 mr-1 text-primary" />
                  <span className="text-xs">Call</span>
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-1 text-primary" />
                  <span className="text-xs">Email</span>
                </>
              )}
            </Button>

            {/* Secondary action button (only if phone exists) */}
            {lead.phone && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 hover:bg-blue-50"
                onClick={handleSecondaryAction}
              >
                <Mail className="h-4 w-4 mr-1 text-blue-600" />
                <span className="text-xs">Email</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
