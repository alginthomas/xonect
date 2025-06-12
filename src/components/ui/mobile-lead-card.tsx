
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
  X
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
    <Card className="mb-3 shadow-sm border-border/50">
      <CardContent className="p-4">
        {/* Header Section */}
        <div className="flex items-start gap-3 mb-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            className="mt-1"
          />
          
          <Avatar className="h-12 w-12 flex-shrink-0">
            <AvatarImage src={lead.photoUrl} alt={`${lead.firstName} ${lead.lastName}`} />
            <AvatarFallback className="text-sm font-medium">
              {lead.firstName.charAt(0)}{lead.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base leading-tight mb-1">
              {lead.firstName} {lead.lastName}
            </h3>
            <p className="text-sm text-muted-foreground leading-tight mb-1 truncate">
              {lead.title}
            </p>
            <p className="text-sm text-muted-foreground leading-tight truncate">
              {lead.company}
            </p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onEmailClick}>
                <Mail className="h-4 w-4 mr-2" />
                Send Email
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
              <DropdownMenuItem onClick={onViewDetails}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDeleteLead} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Lead
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status and Quick Actions */}
        <div className="flex items-center justify-between mb-3">
          <QuickStatusEditor
            status={lead.status}
            onChange={onStatusChange}
          />
          
          <div className="flex items-center gap-2">
            {lead.email && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={onEmailClick}
              >
                <Mail className="h-4 w-4" />
              </Button>
            )}
            {lead.phone && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={callLead}
              >
                <Phone className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={onViewDetails}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Remarks Section */}
        <div className="mb-3">
          {isEditingRemarks ? (
            <div className="space-y-2">
              <Textarea
                value={remarksText}
                onChange={(e) => setRemarksText(e.target.value)}
                placeholder="Add remarks..."
                className="min-h-[80px] text-sm"
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
          ) : (
            <Button
              variant="ghost"
              className="w-full h-auto p-3 text-left justify-start border border-dashed border-border hover:border-primary/50"
              onClick={() => setIsEditingRemarks(true)}
            >
              <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="text-sm text-muted-foreground">
                {lead.remarks || 'Add remarks...'}
              </span>
              <Edit3 className="h-3 w-3 ml-auto flex-shrink-0" />
            </Button>
          )}
        </div>

        {/* Collapsible Details */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full p-2 h-auto">
              <div className="flex items-center justify-between w-full">
                <span className="text-sm text-muted-foreground">
                  {isExpanded ? 'Less details' : 'More details'}
                </span>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-3">
            {/* Contact Information */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Contact</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  <span className="truncate">{lead.email}</span>
                </div>
                {lead.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <span>{lead.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Category</h4>
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm">{category.name}</span>
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Details</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                {lead.companySize && (
                  <div>Company Size: {lead.companySize}</div>
                )}
                {lead.seniority && (
                  <div>Seniority: {lead.seniority}</div>
                )}
                <div>Added: {format(lead.createdAt, 'MMM dd, yyyy')}</div>
                {lead.lastContactDate && (
                  <div>Last Contact: {format(lead.lastContactDate, 'MMM dd, yyyy')}</div>
                )}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};
