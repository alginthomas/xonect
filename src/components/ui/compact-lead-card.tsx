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

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case 'New': return 'bg-blue-500 text-white';
      case 'Contacted': return 'bg-green-500 text-white';
      case 'Qualified': return 'bg-emerald-500 text-white';
      case 'Interested': return 'bg-purple-500 text-white';
      case 'Not Interested': return 'bg-red-500 text-white';
      case 'Unresponsive': return 'bg-gray-500 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePrimaryAction = async () => {
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

  const handleSecondaryAction = async () => {
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

  return (
    <Card className="mb-2 shadow-sm border-border/40 bg-card hover:shadow-md transition-all duration-200 rounded-lg overflow-hidden">
      <div className="p-3">
        {/* Single row layout with all essential info */}
        <div className="flex items-center gap-3">
          {/* Selection checkbox */}
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            className="h-4 w-4 flex-shrink-0"
          />
          
          {/* Compact avatar */}
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={lead.photoUrl} alt={`${lead.firstName} ${lead.lastName}`} />
            <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
              {lead.firstName.charAt(0)}{lead.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          {/* Main content - optimized for single line */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-sm leading-tight truncate">
                {lead.firstName} {lead.lastName}
              </h3>
              <Badge className={`text-xs px-2 py-0.5 font-medium flex-shrink-0 ml-2 ${getStatusColor(lead.status)}`}>
                {lead.status}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground truncate">
                  {lead.company} • {lead.title}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {lead.email}
                </p>
              </div>
            </div>
          </div>

          {/* Compact action buttons - larger touch targets */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Primary action button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 hover:bg-primary/10"
              onClick={handlePrimaryAction}
            >
              {lead.phone ? (
                <Phone className="h-4 w-4 text-primary" />
              ) : (
                <Mail className="h-4 w-4 text-primary" />
              )}
            </Button>

            {/* Secondary action button (only if phone exists) */}
            {lead.phone && (
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 hover:bg-blue-50"
                onClick={handleSecondaryAction}
              >
                <Mail className="h-4 w-4 text-blue-600" />
              </Button>
            )}

            {/* More actions menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={onViewDetails}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  // Quick status change
                }}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Change Status
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDeleteLead} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Lead
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Progressive disclosure - status editor (appears on tap) */}
        <div className="mt-2 pt-2 border-t border-border/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Status:</span>
            <QuickStatusEditor
              status={lead.status}
              onChange={onStatusChange}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
