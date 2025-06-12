
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
  onEmailClick: () => void;
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
      window.open(`tel:${lead.phone}`, '_self');
    }
  };

  const emailLead = () => {
    window.open(`mailto:${lead.email}`, '_self');
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
      <CardContent className="p-3">
        {/* Compact Header Section */}
        <div className="flex items-start gap-3 mb-2">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            className="mt-0.5 h-4 w-4 rounded-full data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
          
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={lead.photoUrl} alt={`${lead.firstName} ${lead.lastName}`} />
            <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
              {lead.firstName.charAt(0)}{lead.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm leading-tight mb-0.5 truncate">
                  {lead.firstName} {lead.lastName}
                </h3>
                <p className="text-xs text-muted-foreground leading-tight truncate">
                  {lead.title} • {lead.company}
                </p>
              </div>
              
              <Badge className={`text-xs px-2 py-0.5 font-medium ${getStatusColor(lead.status)}`}>
                {lead.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Contact Info and Actions Row */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground min-w-0 flex-1">
            <Mail className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{lead.email}</span>
            {lead.phone && (
              <>
                <span className="mx-1">•</span>
                <Phone className="h-3 w-3 flex-shrink-0" />
                <span className="flex-shrink-0">{lead.phone}</span>
              </>
            )}
          </div>
          
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {format(lead.createdAt, 'MMM dd')}
          </span>
        </div>

        {/* Primary Actions - Better Spaced */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-primary/10"
                  onClick={emailLead}
                >
                  <Mail className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Send Email</p>
              </TooltipContent>
            </Tooltip>

            {lead.phone && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-green-50"
                    onClick={callLead}
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Call Lead</p>
                </TooltipContent>
              </Tooltip>
            )}

            {lead.linkedin && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-blue-50"
                    onClick={openLinkedIn}
                  >
                    <Linkedin className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Open LinkedIn</p>
                </TooltipContent>
              </Tooltip>
            )}

            {lead.organizationWebsite && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-gray-50"
                    onClick={openWebsite}
                  >
                    <Globe className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Visit Website</p>
                </TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-blue-50"
                  onClick={onViewDetails}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View Details</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="flex items-center gap-2">
            {/* Remarks Toggle - Only show if has remarks or when editing */}
            {(lead.remarks || isEditingRemarks) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={() => setIsEditingRemarks(!isEditingRemarks)}
              >
                <MessageSquare className="h-3 w-3 mr-1" />
                {isEditingRemarks ? 'Cancel' : 'Edit'}
              </Button>
            )}

            {/* Expand/Collapse */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            {/* More Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
          <div className="mt-3 space-y-2">
            <Textarea
              value={remarksText}
              onChange={(e) => setRemarksText(e.target.value)}
              placeholder="Add remarks..."
              className="min-h-[60px] text-sm"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={saveRemarks} className="flex-1">
                <Check className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={cancelRemarksEdit} className="flex-1">
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Show existing remarks if not editing */}
        {lead.remarks && !isEditingRemarks && (
          <div className="mt-2 p-2 bg-muted/30 rounded text-xs text-muted-foreground">
            {lead.remarks}
          </div>
        )}

        {/* Collapsible Details */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent className="space-y-2 pt-2 border-t border-border/50 mt-2">
            {/* Status Editor */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Status:</span>
              <QuickStatusEditor
                status={lead.status}
                onChange={onStatusChange}
              />
            </div>

            {/* Category */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Category:</span>
              <div className="flex items-center gap-1">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-xs">{category.name}</span>
              </div>
            </div>

            {/* LinkedIn and Website Links */}
            {(lead.linkedin || lead.organizationWebsite) && (
              <div className="space-y-1">
                {lead.linkedin && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">LinkedIn:</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={openLinkedIn}
                    >
                      <Linkedin className="h-3 w-3 mr-1" />
                      Open Profile
                    </Button>
                  </div>
                )}
                {lead.organizationWebsite && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Website:</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
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
            <div className="space-y-1 text-xs text-muted-foreground">
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
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};
