import React, { useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Briefcase, 
  MapPin, 
  Calendar,
  MessageSquare,
  Save,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import type { Lead, LeadStatus } from '@/types/lead';
import type { Category } from '@/types/category';

interface LeadDetailSheetProps {
  lead: Lead | null;
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateLead?: (leadId: string, updates: Partial<Lead>) => void;
}

export const LeadDetailSheet: React.FC<LeadDetailSheetProps> = ({
  lead,
  categories,
  isOpen,
  onClose,
  onUpdateLead
}) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Lead>>({});
  const { toast } = useToast();

  if (!lead) return null;

  const handleEdit = (field: string) => {
    setEditingField(field);
    setFormData({ [field]: lead[field as keyof Lead] });
  };

  const handleSave = (field: string) => {
    if (onUpdateLead && formData[field as keyof Lead] !== undefined) {
      onUpdateLead(lead.id, { [field]: formData[field as keyof Lead] });
      toast({
        title: 'Updated successfully',
        description: `${field} has been updated.`,
      });
    }
    setEditingField(null);
    setFormData({});
  };

  const handleCancel = () => {
    setEditingField(null);
    setFormData({});
  };

  const handleStatusChange = (newStatus: LeadStatus) => {
    if (onUpdateLead) {
      onUpdateLead(lead.id, { status: newStatus });
      toast({
        title: 'Status updated',
        description: `Lead status changed to ${newStatus}.`,
      });
    }
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return 'Uncategorized';
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Unknown Category';
  };

  const renderEditableField = (
    field: keyof Lead,
    label: string,
    value: any,
    type: 'text' | 'email' | 'textarea' = 'text'
  ) => {
    const isEditing = editingField === field;

    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium text-muted-foreground">{label}</Label>
        {isEditing ? (
          <div className="space-y-2">
            {type === 'textarea' ? (
              <Textarea
                value={formData[field] as string || ''}
                onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                rows={3}
                className="resize-none"
              />
            ) : (
              <Input
                type={type}
                value={formData[field] as string || ''}
                onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
              />
            )}
            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleSave(field)}>
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div 
            className="cursor-pointer hover:bg-muted/50 rounded p-2 -m-2 group"
            onClick={() => handleEdit(field)}
          >
            <p className="text-sm">{value || 'Click to add'}</p>
            <p className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              Click to edit
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[500px] sm:w-[600px]">
        <SheetHeader className="pb-6">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="text-lg">
                {lead.firstName.charAt(0)}{lead.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <SheetTitle className="text-xl">
                {lead.firstName} {lead.lastName}
              </SheetTitle>
              <SheetDescription className="text-base">
                {lead.title} at {lead.company}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] pr-4">
          <div className="space-y-6">
            {/* Status Section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-muted-foreground">Status</Label>
              <Select value={lead.status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Contacted">Contacted</SelectItem>
                  <SelectItem value="Opened">Opened</SelectItem>
                  <SelectItem value="Clicked">Clicked</SelectItem>
                  <SelectItem value="Replied">Replied</SelectItem>
                  <SelectItem value="Qualified">Qualified</SelectItem>
                  <SelectItem value="Unqualified">Unqualified</SelectItem>
                  <SelectItem value="Call Back">Call Back</SelectItem>
                  <SelectItem value="Unresponsive">Unresponsive</SelectItem>
                  <SelectItem value="Not Interested">Not Interested</SelectItem>
                  <SelectItem value="Interested">Interested</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Contact Information
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                {renderEditableField('firstName', 'First Name', lead.firstName)}
                {renderEditableField('lastName', 'Last Name', lead.lastName)}
              </div>
              
              {renderEditableField('email', 'Email', lead.email, 'email')}
              {renderEditableField('phone', 'Phone', lead.phone)}
              
              {lead.personalEmail && (
                renderEditableField('personalEmail', 'Personal Email', lead.personalEmail, 'email')
              )}
            </div>

            <Separator />

            {/* Company Information */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Company Information
              </h3>
              
              {renderEditableField('company', 'Company', lead.company)}
              {renderEditableField('title', 'Title', lead.title)}
              {renderEditableField('department', 'Department', lead.department)}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Seniority</Label>
                  <p className="text-sm">{lead.seniority}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Company Size</Label>
                  <p className="text-sm">{lead.companySize}</p>
                </div>
              </div>
              
              {renderEditableField('industry', 'Industry', lead.industry)}
              {renderEditableField('location', 'Location', lead.location)}
            </div>

            <Separator />

            {/* Remarks Section */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Remarks & Notes
              </h3>
              
              {renderEditableField('remarks', 'Remarks', lead.remarks || 'No remarks added yet', 'textarea')}
            </div>

            <Separator />

            {/* Social Links */}
            {(lead.linkedin || lead.twitterUrl || lead.facebookUrl) && (
              <>
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Social Links
                  </h3>
                  
                  <div className="space-y-2">
                    {lead.linkedin && (
                      <Button variant="outline" size="sm" asChild className="w-full justify-start">
                        <a href={lead.linkedin} target="_blank" rel="noopener noreferrer">
                          LinkedIn Profile
                          <ExternalLink className="h-3 w-3 ml-auto" />
                        </a>
                      </Button>
                    )}
                    
                    {lead.twitterUrl && (
                      <Button variant="outline" size="sm" asChild className="w-full justify-start">
                        <a href={lead.twitterUrl} target="_blank" rel="noopener noreferrer">
                          Twitter Profile
                          <ExternalLink className="h-3 w-3 ml-auto" />
                        </a>
                      </Button>
                    )}
                    
                    {lead.facebookUrl && (
                      <Button variant="outline" size="sm" asChild className="w-full justify-start">
                        <a href={lead.facebookUrl} target="_blank" rel="noopener noreferrer">
                          Facebook Profile
                          <ExternalLink className="h-3 w-3 ml-auto" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
                
                <Separator />
              </>
            )}

            {/* Metadata */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Lead Information
              </h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                  <p>{getCategoryName(lead.categoryId)}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Emails Sent</Label>
                  <p>{lead.emailsSent}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                  <p>{format(new Date(lead.createdAt), 'MMM dd, yyyy')}</p>
                </div>
                
                {lead.lastContactDate && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Last Contact</Label>
                    <p>{format(new Date(lead.lastContactDate), 'MMM dd, yyyy')}</p>
                  </div>
                )}
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Completeness</Label>
                  <p>{lead.completenessScore}%</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
