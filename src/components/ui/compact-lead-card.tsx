
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
      // Fallback to email - copy email and open mailto
      try {
        await navigator.clipboard.writeText(lead.email);
        toast({
          title: 'Email copied',
          description: `${lead.email} copied to clipboard.`,
        });
        window.open(`mailto:${lead.email}`, '_self');
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
      // Secondary action is email if phone exists - copy email and open mailto
      try {
        await navigator.clipboard.writeText(lead.email);
        toast({
          title: 'Email copied',
          description: `${lead.email} copied to clipboard.`,
        });
        window.open(`mailto:${lead.email}`, '_self');
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
        <div className="flex items-start gap-3 mb-4">
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
          
          {/* Lead info - left aligned */}
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm leading-tight mb-1 truncate text-left">
                  {lead.firstName} {lead.lastName}
                </h3>
                <p className="text-xs text-muted-foreground leading-tight truncate text-left">
                  {lead.title} • {lead.company}
                </p>
                <p className="text-xs text-muted-foreground mt-1 truncate text-left">
                  {lead.email}
                </p>
              </div>
              
              <div className="flex flex-col items-end gap-1">
                <Badge className={`text-xs px-2 py-1 font-medium whitespace-nowrap ${
                  lead.status === 'New' ? 'bg-blue-500 text-white' :
                  lead.status === 'Contacted' ? 'bg-green-500 text-white' :
                  lead.status === 'Qualified' ? 'bg-emerald-500 text-white' :
                  lead.status === 'Interested' ? 'bg-purple-500 text-white' :
                  lead.status === 'Not Interested' ? 'bg-red-500 text-white' :
                  lead.status === 'Unresponsive' ? 'bg-gray-500 text-white' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {lead.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Primary action button */}
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={handlePrimaryAction}
            >
              {lead.phone ? (
                <>
                  <Phone className="h-3 w-3 mr-1" />
                  Call
                </>
              ) : (
                <>
                  <Mail className="h-3 w-3 mr-1" />
                  Email
                </>
              )}
            </Button>

            {/* Secondary action button - only show if phone exists */}
            {lead.phone && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={handleSecondaryAction}
              >
                <Mail className="h-3 w-3 mr-1" />
                Email
              </Button>
            )}

            {/* View details button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails();
              }}
            >
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
          </div>

          {/* Status editor and more actions */}
          <div className="flex items-center gap-2">
            <QuickStatusEditor
              status={lead.status}
              onChange={onStatusChange}
            />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  window.open(`mailto:${lead.email}`, '_self');
                  onEmailClick();
                }}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </DropdownMenuItem>
                {lead.phone && (
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    window.open(`tel:${lead.phone}`, '_self');
                  }}>
                    <Phone className="h-4 w-4 mr-2" />
                    Call Lead
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails();
                }}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteLead();
                  }}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Lead
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Show remarks if exists */}
        {lead.remarks && (
          <div className="mt-2 p-2 bg-muted/30 rounded text-xs text-muted-foreground text-left">
            {lead.remarks}
          </div>
        )}
      </div>
    </Card>
  );
};
