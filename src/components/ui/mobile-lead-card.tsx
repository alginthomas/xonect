
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Mail, 
  Phone, 
  ChevronDown, 
  ChevronUp, 
  MoreVertical, 
  Eye, 
  Trash2, 
  Copy,
  MessageSquare,
  Edit3,
  Check,
  X,
  Linkedin,
  Globe
} from 'lucide-react';
import { QuickStatusEditor } from '@/components/QuickStatusEditor';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import type { Lead, LeadStatus } from '@/types/lead';
import type { Category } from '@/types/category';

interface MobileLeadCardProps {
  lead: Lead;
  categories: Category[];
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onStatusChange: (status: LeadStatus) => void;
  onRemarksUpdate: (remarks: string) => void;
  onEmailClick?: () => void;
  onViewDetails: () => void;
  onDeleteLead: () => void;
}

export const MobileLeadCard: React.FC<MobileLeadCardProps> = ({
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingRemarks, setIsEditingRemarks] = useState(false);
  const [remarksText, setRemarksText] = useState(lead.remarks || '');
  const { toast } = useToast();

  const getCategoryInfo = (categoryId: string | undefined) => {
    if (!categoryId) return { name: 'Uncategorized', color: '#6B7280' };
    const category = categories.find(c => c.id === categoryId);
    return category ? { name: category.name, color: category.color } : { name: 'Unknown', color: '#6B7280' };
  };

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

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(lead.email);
      toast({
        title: 'Email copied',
        description: `${lead.email} has been copied to clipboard.`,
      });
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Failed to copy email to clipboard.',
        variant: 'destructive',
      });
    }
  };

  const callLead = () => {
    if (lead.phone) {
      window.open(`tel:${lead.phone}`, '_blank');
    } else {
      toast({
        title: 'No phone number',
        description: 'This lead does not have a phone number.',
        variant: 'destructive',
      });
    }
  };

  const emailLead = async () => {
    try {
      // Copy email to clipboard first
      await navigator.clipboard.writeText(lead.email);
      toast({
        title: 'Email copied',
        description: `${lead.email} has been copied to clipboard.`,
      });

      const subject = encodeURIComponent(`Following up on your interest`);
      const body = encodeURIComponent(`Hi ${lead.firstName},\n\nI hope this email finds you well.\n\nBest regards`);
      window.open(`mailto:${lead.email}?subject=${subject}&body=${body}`, '_blank');
      
      toast({
        title: 'Email opened',
        description: 'Default email client has been opened.',
      });
    } catch (error) {
      toast({
        title: 'Email failed',
        description: 'Failed to open email client or copy email.',
        variant: 'destructive',
      });
    }
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

  const saveRemarks = () => {
    onRemarksUpdate(remarksText);
    setIsEditingRemarks(false);
  };

  const cancelRemarksEdit = () => {
    setRemarksText(lead.remarks || '');
    setIsEditingRemarks(false);
  };

  const category = getCategoryInfo(lead.categoryId);

  return (
    <Card className="mb-2 shadow-sm border-border/50 bg-card hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        {/* Header Section */}
        <div className="flex items-start gap-3 mb-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            className="mt-0.5 h-4 w-4 rounded-full aspect-square data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
          
          <Avatar className="h-12 w-12 flex-shrink-0">
            <AvatarImage src={lead.photoUrl} alt={`${lead.firstName} ${lead.lastName}`} />
            <AvatarFallback className="text-sm font-medium bg-primary/10 text-primary">
              {lead.firstName.charAt(0)}{lead.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-base leading-tight mb-1 truncate text-left">
                  {lead.firstName} {lead.lastName}
                </h3>
                <p className="text-sm text-muted-foreground leading-tight mb-1 truncate text-left">
                  {lead.title} • {lead.company}
                </p>
                <p className="text-xs text-muted-foreground leading-tight truncate text-left">
                  {lead.email}
                </p>
              </div>
              
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {format(lead.createdAt, 'MMM dd')}
              </span>
            </div>
          </div>
        </div>

        {/* Status and Website Row */}
        <div className="mb-3">
          <QuickStatusEditor
            status={lead.status}
            onChange={onStatusChange}
            websiteUrl={lead.organizationWebsite}
            showWebsiteButton={true}
            compact={true}
          />
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-1">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-10 text-sm font-medium justify-center"
              onClick={callLead}
              disabled={!lead.phone}
            >
              <Phone className="h-4 w-4 mr-2 text-blue-600" />
              Call
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-10 text-sm font-medium justify-center"
              onClick={copyEmail}
            >
              <Mail className="h-4 w-4 mr-2 text-blue-600" />
              Copy Email
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {/* View Details */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0"
                  onClick={onViewDetails}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View Details</p>
              </TooltipContent>
            </Tooltip>

            {/* Expand/Collapse */}
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            {/* More Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={emailLead}>
                  <Mail className="h-4 w-4 mr-2" />
                  Open Email App
                </DropdownMenuItem>
                <DropdownMenuItem onClick={copyEmail}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Email
                </DropdownMenuItem>
                {lead.phone && (
                  <DropdownMenuItem onClick={callLead}>
                    <Phone className="h-4 w-4 mr-2" />
                    Call Lead
                  </DropdownMenuItem>
                )}
                {lead.linkedin && (
                  <DropdownMenuItem onClick={openLinkedIn}>
                    <Linkedin className="h-4 w-4 mr-2" />
                    Open LinkedIn
                  </DropdownMenuItem>
                )}
                {lead.organizationWebsite && (
                  <DropdownMenuItem onClick={openWebsite}>
                    <Globe className="h-4 w-4 mr-2" />
                    Visit Website
                  </DropdownMenuItem>
                )}
                {!lead.remarks && !isEditingRemarks && (
                  <DropdownMenuItem onClick={() => setIsEditingRemarks(true)}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Add Remarks
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDeleteLead} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Lead
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Remarks Editor - Only when editing */}
        {isEditingRemarks && (
          <div className="mb-3 space-y-2">
            <Textarea
              value={remarksText}
              onChange={(e) => setRemarksText(e.target.value)}
              placeholder="Add remarks..."
              className="min-h-[60px] text-sm text-left"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={saveRemarks} className="flex-1 justify-center">
                <Check className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={cancelRemarksEdit} className="flex-1 justify-center">
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Show existing remarks if not editing */}
        {lead.remarks && !isEditingRemarks && (
          <div className="mb-3 p-2 bg-muted/30 rounded text-xs text-muted-foreground text-left">
            {lead.remarks}
          </div>
        )}

        {/* Collapsible Details */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent className="space-y-3 pt-3 border-t border-border/50">
            {/* Category */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Category:</span>
              <div className="flex items-center gap-1">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm">{category.name}</span>
              </div>
            </div>

            {/* LinkedIn and Website Links */}
            {(lead.linkedin || lead.organizationWebsite) && (
              <div className="space-y-2">
                {lead.linkedin && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">LinkedIn:</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-sm justify-start"
                      onClick={openLinkedIn}
                    >
                      <Linkedin className="h-3 w-3 mr-1" />
                      Open Profile
                    </Button>
                  </div>
                )}
                {lead.organizationWebsite && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Website:</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-sm justify-start"
                      onClick={openWebsite}
                    >
                      <Globe className="h-3 w-3 mr-1" />
                      Visit Site
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Additional Details */}
            <div className="space-y-1 text-sm text-muted-foreground">
              {lead.companySize && (
                <div className="flex justify-between">
                  <span>Company Size:</span>
                  <span>{lead.companySize}</span>
                </div>
              )}
              {lead.seniority && (
                <div className="flex justify-between">
                  <span>Seniority:</span>
                  <span>{lead.seniority}</span>
                </div>
              )}
              {lead.lastContactDate && (
                <div className="flex justify-between">
                  <span>Last Contact:</span>
                  <span>{format(lead.lastContactDate, 'MMM dd, yyyy')}</span>
                </div>
              )}
            </div>

            {/* Edit Remarks Button */}
            {!isEditingRemarks && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingRemarks(true)}
                className="w-full h-8 text-sm justify-center"
              >
                <Edit3 className="h-3 w-3 mr-1" />
                {lead.remarks ? 'Edit Remarks' : 'Add Remarks'}
              </Button>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};
