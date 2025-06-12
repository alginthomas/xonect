
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { 
  Mail, 
  Phone, 
  Eye, 
  MoreVertical,
  ChevronRight,
  User,
  Building2,
  MessageSquare,
  Save,
  Edit3,
  Linkedin,
  Globe
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

  const getStatusIcon = (status: LeadStatus) => {
    switch (status) {
      case 'Contacted': return '✓';
      case 'Qualified': return '🎯';
      case 'Interested': return '💚';
      case 'Not Interested': return '❌';
      case 'Unresponsive': return '⏰';
      default: return '●';
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
    toast({
      title: 'Remarks updated',
      description: 'Lead remarks have been saved successfully.',
    });
  };

  const cancelRemarksEdit = () => {
    setRemarksText(lead.remarks || '');
    setIsEditingRemarks(false);
  };

  const category = getCategoryInfo(lead.categoryId);

  return (
    <>
      {/* Compact Card */}
      <Card 
        className="mb-2 shadow-sm border-border/50 bg-card hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
        onClick={() => setIsExpanded(true)}
      >
        <div className="p-3">
          <div className="flex items-center gap-3">
            {/* Selection Checkbox */}
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              onClick={(e) => e.stopPropagation()}
              className="h-4 w-4 flex-shrink-0 rounded-full data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            
            {/* Avatar */}
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={lead.photoUrl} alt={`${lead.firstName} ${lead.lastName}`} />
              <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                {lead.firstName.charAt(0)}{lead.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            {/* Lead Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-semibold text-sm leading-tight truncate pr-2">
                  {lead.firstName} {lead.lastName}
                </h3>
                <Badge className={`text-xs px-2 py-0.5 font-medium flex items-center gap-1 flex-shrink-0 ${getStatusColor(lead.status)}`}>
                  <span>{getStatusIcon(lead.status)}</span>
                  {lead.status}
                </Badge>
              </div>
              
              <p className="text-xs text-muted-foreground leading-tight truncate mb-2">
                {lead.title} • {lead.company}
              </p>
              
              {/* Quick Actions Row - Responsive */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 hover:bg-primary/10 text-xs flex items-center gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      emailLead();
                    }}
                  >
                    <Mail className="h-3 w-3" />
                    <span className="hidden xs:inline">Email</span>
                  </Button>

                  {lead.phone && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 hover:bg-green-50 text-xs flex items-center gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        callLead();
                      }}
                    >
                      <Phone className="h-3 w-3" />
                      <span className="hidden xs:inline">Call</span>
                    </Button>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-muted-foreground flex items-center gap-1 flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(true);
                  }}
                >
                  <span className="hidden xs:inline">View</span>
                  <Eye className="h-3 w-3 xs:hidden" />
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Expanded Details Sheet */}
      <Sheet open={isExpanded} onOpenChange={setIsExpanded}>
        <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
          <SheetHeader className="text-left mb-4">
            <div className="flex items-center gap-3 mb-2">
              <Avatar className="h-12 w-12">
                <AvatarImage src={lead.photoUrl} alt={`${lead.firstName} ${lead.lastName}`} />
                <AvatarFallback className="text-sm font-medium bg-primary/10 text-primary">
                  {lead.firstName.charAt(0)}{lead.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <SheetTitle className="text-lg font-semibold">
                  {lead.firstName} {lead.lastName}
                </SheetTitle>
                <p className="text-sm text-muted-foreground">
                  {lead.title} at {lead.company}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={copyEmail}>
                    <Mail className="h-4 w-4 mr-2" />
                    Copy Email
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onDeleteLead} className="text-red-600">
                    <MoreVertical className="h-4 w-4 mr-2" />
                    Delete Lead
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SheetHeader>

          <div className="space-y-4">
            {/* Status Editor */}
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm font-medium">Status:</span>
              <QuickStatusEditor
                status={lead.status}
                onChange={onStatusChange}
              />
            </div>

            {/* Contact Information */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <User className="h-4 w-4" />
                Contact Information
              </h4>
              
              <div className="space-y-2 pl-6">
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm">{lead.email}</span>
                </div>
                {lead.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{lead.phone}</span>
                  </div>
                )}
                {lead.linkedin && (
                  <div className="flex items-center gap-2">
                    <Linkedin className="h-3 w-3 text-muted-foreground" />
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-sm font-normal"
                      onClick={openLinkedIn}
                    >
                      LinkedIn Profile
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Company Information */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Company Details
              </h4>
              
              <div className="space-y-2 pl-6">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Company:</span>
                  <span className="text-sm">{lead.company}</span>
                </div>
                {lead.organizationWebsite && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Website:</span>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-sm font-normal"
                      onClick={openWebsite}
                    >
                      <Globe className="h-3 w-3 mr-1" />
                      Visit Website
                    </Button>
                  </div>
                )}
                {lead.companySize && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Size:</span>
                    <span className="text-sm">{lead.companySize}</span>
                  </div>
                )}
                {lead.seniority && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Seniority:</span>
                    <span className="text-sm">{lead.seniority}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Category */}
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

            {/* Remarks Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Remarks
                </h4>
                {!isEditingRemarks && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingRemarks(true)}
                    className="h-7 px-2 text-xs"
                  >
                    <Edit3 className="h-3 w-3 mr-1" />
                    {lead.remarks ? 'Edit' : 'Add'}
                  </Button>
                )}
              </div>

              {isEditingRemarks ? (
                <div className="space-y-3">
                  <Textarea
                    value={remarksText}
                    onChange={(e) => setRemarksText(e.target.value)}
                    placeholder="Add your remarks about this lead..."
                    className="min-h-[80px]"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveRemarks} className="flex-1">
                      <Save className="h-3 w-3 mr-1" />
                      Save Remarks
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelRemarksEdit} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-muted/30 rounded-lg min-h-[60px]">
                  {lead.remarks ? (
                    <p className="text-sm text-muted-foreground">{lead.remarks}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No remarks added yet</p>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons - Responsive */}
            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button 
                onClick={emailLead} 
                className="flex-1"
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              {lead.phone && (
                <Button 
                  variant="outline" 
                  onClick={callLead}
                  className="flex-1"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
