
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
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
  MoreHorizontal, 
  Eye, 
  Trash2,
  Edit3,
  Check,
  X,
  Linkedin,
  Globe,
  MessageSquare,
  Clock,
  Activity
} from 'lucide-react';
import { QuickStatusEditor } from '@/components/QuickStatusEditor';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import type { Lead, LeadStatus, ActivityEntry, RemarkEntry } from '@/types/lead';
import type { Category } from '@/types/category';

interface EnhancedMobileLeadCardProps {
  lead: Lead;
  categories: Category[];
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onStatusChange: (status: LeadStatus) => void;
  onRemarksUpdate: (remarks: string, remarksHistory: RemarkEntry[], activityLog: ActivityEntry[]) => void;
  onEmailClick: () => void;
  onViewDetails: () => void;
  onDeleteLead: () => void;
}

export const EnhancedMobileLeadCard: React.FC<EnhancedMobileLeadCardProps> = ({
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
      case 'Send Email': return 'bg-pink-500 text-white';
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
    } else {
      toast({
        title: 'No phone number',
        description: 'This lead does not have a phone number.',
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
    // Create timestamped remark entry
    const remarkEntry: RemarkEntry = {
      id: crypto.randomUUID(),
      text: remarksText,
      timestamp: new Date()
    };
    
    // Update remarks history
    const updatedRemarksHistory = [...(lead.remarksHistory || []), remarkEntry];
    
    // Create activity log entry
    const activityEntry: ActivityEntry = {
      id: crypto.randomUUID(),
      type: 'remark_added',
      description: `Remark added: ${remarksText.substring(0, 50)}${remarksText.length > 50 ? '...' : ''}`,
      newValue: remarksText,
      timestamp: new Date()
    };

    const updatedActivityLog = [...(lead.activityLog || []), activityEntry];
    
    // Call the update function with remarks, history, and activity log
    onRemarksUpdate(remarksText, updatedRemarksHistory, updatedActivityLog);
    setIsEditingRemarks(false);
    toast({
      title: 'Remarks updated',
      description: 'Lead remarks have been saved with timestamp.',
    });
  };

  const cancelRemarksEdit = () => {
    setRemarksText(lead.remarks || '');
    setIsEditingRemarks(false);
  };

  const category = getCategoryInfo(lead.categoryId);

  return (
    <Card className="mb-4 shadow-sm border-border/50 bg-card hover:shadow-md transition-all duration-200 rounded-xl overflow-hidden">
      <div className="p-5">
        {/* Header Section - Clean and Spacious */}
        <div className="flex items-start gap-4 mb-4">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            className="mt-1 h-5 w-5 flex-shrink-0"
          />
          
          <Avatar className="h-14 w-14 flex-shrink-0 ring-2 ring-background shadow-md">
            <AvatarImage src={lead.photoUrl} alt={`${lead.firstName} ${lead.lastName}`} />
            <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
              {lead.firstName.charAt(0)}{lead.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-base leading-tight mb-1 text-foreground text-left">
                  {lead.firstName} {lead.lastName}
                </h3>
                <p className="text-sm text-muted-foreground leading-tight mb-1 text-left">
                  {lead.title}
                </p>
                <p className="text-sm text-muted-foreground leading-tight text-left">
                  {lead.company}
                </p>
              </div>
              
              <Badge className={`text-xs px-3 py-1 font-medium rounded-full ${getStatusColor(lead.status)}`}>
                {lead.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Contact Info Row - Left aligned */}
        <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <Mail className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{lead.email}</span>
          </div>
          {lead.phone && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Phone className="h-4 w-4" />
              <span className="text-xs">{lead.phone}</span>
            </div>
          )}
        </div>

        {/* Primary Actions - Left justified */}
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="default"
            size="sm"
            className="flex-1 h-10 font-medium justify-start"
            onClick={copyEmail}
          >
            <Mail className="h-4 w-4 mr-2" />
            Copy Email
          </Button>

          {lead.phone && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-10 font-medium justify-start"
              onClick={callLead}
            >
              <Phone className="h-4 w-4 mr-2" />
              Call
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="h-10 px-4"
            onClick={onViewDetails}
          >
            <Eye className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
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
              <DropdownMenuItem onClick={() => setIsEditingRemarks(true)}>
                <MessageSquare className="h-4 w-4 mr-2" />
                {lead.remarks ? 'Edit Remarks' : 'Add Remarks'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDeleteLead} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Lead
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status Editor - Left aligned */}
        <div className="flex items-center justify-between mb-4 p-3 bg-muted/30 rounded-lg">
          <span className="text-sm font-medium text-foreground">Status:</span>
          <QuickStatusEditor
            status={lead.status}
            onChange={onStatusChange}
          />
        </div>

        {/* Remarks Section - Left aligned */}
        {isEditingRemarks && (
          <div className="mb-4 space-y-3">
            <Textarea
              value={remarksText}
              onChange={(e) => setRemarksText(e.target.value)}
              placeholder="Add remarks about this lead..."
              className="min-h-[80px] text-sm text-left"
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

        {/* Show existing remarks with timestamp - Left aligned */}
        {lead.remarks && !isEditingRemarks && (
          <div className="mb-4 p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Remarks:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingRemarks(true)}
                className="h-6 px-2 text-xs"
              >
                <Edit3 className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground text-left mb-2">{lead.remarks}</p>
            {lead.remarksHistory && lead.remarksHistory.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  Last updated: {format(lead.remarksHistory[lead.remarksHistory.length - 1].timestamp, 'MMM dd, yyyy HH:mm')}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Expandable Details */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between h-10 text-sm font-medium"
            >
              {isExpanded ? 'Hide Details' : 'Show Details'}
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-3">
            {/* Category - Left aligned */}
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm font-medium">Category:</span>
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm">{category.name}</span>
              </div>
            </div>

            {/* Additional Details - Left aligned */}
            {(lead.companySize || lead.seniority || lead.lastContactDate) && (
              <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                <h4 className="text-sm font-medium mb-2 text-left">Additional Information</h4>
                {lead.companySize && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Company Size:</span>
                    <span>{lead.companySize}</span>
                  </div>
                )}
                {lead.seniority && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Seniority:</span>
                    <span>{lead.seniority}</span>
                  </div>
                )}
                {lead.lastContactDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last Contact:</span>
                    <span>{format(lead.lastContactDate, 'MMM dd, yyyy')}</span>
                  </div>
                )}
              </div>
            )}

            {/* Activity Log */}
            {lead.activityLog && lead.activityLog.length > 0 && (
              <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                <h4 className="text-sm font-medium mb-2 text-left flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Recent Activity
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {lead.activityLog.slice().reverse().slice(0, 3).map((activity) => (
                    <div key={activity.id} className="text-xs">
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="text-xs shrink-0">
                          {activity.type === 'status_change' ? 'Status' : 
                           activity.type === 'remark_added' ? 'Remark' : 'Email'}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-left">{activity.description}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Clock className="h-2 w-2" />
                            <span>{format(activity.timestamp, 'MMM dd, HH:mm')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {lead.activityLog.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{lead.activityLog.length - 3} more activities
                  </p>
                )}
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Meta Information - Left aligned */}
        <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
          <span>Added {format(lead.createdAt, 'MMM dd, yyyy')}</span>
          {lead.emailsSent > 0 && (
            <span>{lead.emailsSent} email{lead.emailsSent !== 1 ? 's' : ''} sent</span>
          )}
        </div>
      </div>
    </Card>
  );
};
