
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CategoryCombobox } from '@/components/CategoryCombobox';
import {
  Mail,
  Phone,
  Globe,
  Linkedin,
  MapPin,
  Building,
  Calendar,
  Target,
  MessageSquare,
  Save,
  Edit3,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import type { Lead, LeadStatus } from '@/types/lead';
import type { Category } from '@/types/category';

interface LeadSidebarProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onUpdateLead: (leadId: string, updates: Partial<Lead>) => void;
  onCreateCategory?: (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

export const LeadSidebar: React.FC<LeadSidebarProps> = ({
  lead,
  isOpen,
  onClose,
  categories,
  onUpdateLead,
  onCreateCategory
}) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const { toast } = useToast();

  if (!lead) return null;

  const getCategoryInfo = (categoryId: string | undefined) => {
    if (!categoryId) return { name: 'Uncategorized', color: '#6B7280' };
    const category = categories.find(c => c.id === categoryId);
    return category ? { name: category.name, color: category.color } : { name: 'Unknown', color: '#6B7280' };
  };

  const category = getCategoryInfo(lead.categoryId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'Contacted': return 'bg-yellow-100 text-yellow-800';
      case 'Qualified': return 'bg-green-100 text-green-800';
      case 'Unqualified': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeniorityColor = (seniority: string) => {
    switch (seniority) {
      case 'Entry-level': return 'bg-green-100 text-green-800';
      case 'Mid-level': return 'bg-blue-100 text-blue-800';
      case 'Senior': return 'bg-orange-100 text-orange-800';
      case 'Executive': return 'bg-purple-100 text-purple-800';
      case 'C-level': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSizeColor = (size: string) => {
    switch (size) {
      case 'Small (1-50)': return 'bg-blue-100 text-blue-800';
      case 'Medium (51-200)': return 'bg-yellow-100 text-yellow-800';
      case 'Large (201-1000)': return 'bg-orange-100 text-orange-800';
      case 'Enterprise (1000+)': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const startEdit = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValues({ ...editValues, [field]: currentValue || '' });
  };

  const saveEdit = async (field: string) => {
    try {
      const updates: Partial<Lead> = {
        [field]: editValues[field]
      };
      
      await onUpdateLead(lead.id, updates);
      setEditingField(null);
      
      toast({
        title: 'Lead updated',
        description: 'Lead information has been successfully updated.',
      });
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Failed to update lead. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValues({});
  };

  const handleCategoryChange = async (categoryName: string) => {
    try {
      let categoryId = '';
      const existingCategory = categories.find(cat => 
        cat.name.toLowerCase() === categoryName.toLowerCase()
      );

      if (existingCategory) {
        categoryId = existingCategory.id;
      } else if (onCreateCategory) {
        await onCreateCategory({
          name: categoryName,
          description: `Created automatically`,
          color: '#3B82F6',
          criteria: {}
        });
        
        const newCategory = categories.find(cat => 
          cat.name.toLowerCase() === categoryName.toLowerCase()
        );
        
        if (newCategory) {
          categoryId = newCategory.id;
        }
      }

      if (categoryId) {
        await onUpdateLead(lead.id, { categoryId });
        toast({
          title: 'Category updated',
          description: `Lead category updated to ${categoryName}`,
        });
      }
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Failed to update category. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleStatusChange = async (status: LeadStatus) => {
    try {
      await onUpdateLead(lead.id, { status });
      toast({
        title: 'Status updated',
        description: `Lead status updated to ${status}`,
      });
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Failed to update status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const renderEditableField = (field: string, label: string, value: string, type: 'text' | 'textarea' | 'select' = 'text', options?: string[]) => {
    const isEditing = editingField === field;

    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">{label}</Label>
        {isEditing ? (
          <div className="flex gap-2">
            {type === 'textarea' ? (
              <Textarea
                value={editValues[field] || ''}
                onChange={(e) => setEditValues({ ...editValues, [field]: e.target.value })}
                className="flex-1"
                rows={3}
              />
            ) : type === 'select' && options ? (
              <Select 
                value={editValues[field] || ''} 
                onValueChange={(value) => setEditValues({ ...editValues, [field]: value })}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={editValues[field] || ''}
                onChange={(e) => setEditValues({ ...editValues, [field]: e.target.value })}
                className="flex-1"
              />
            )}
            <Button size="sm" onClick={() => saveEdit(field)}>
              <Save className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={cancelEdit}>
              Cancel
            </Button>
          </div>
        ) : (
          <div 
            className="flex items-center justify-between p-2 rounded border hover:bg-muted/50 cursor-pointer group"
            onClick={() => startEdit(field, value)}
          >
            <span className="flex-1">{value || 'Not set'}</span>
            <Edit3 className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:w-[600px] sm:max-w-[600px] overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={lead.photoUrl} alt={`${lead.firstName} ${lead.lastName}`} />
              <AvatarFallback className="text-lg">
                {lead.firstName.charAt(0)}{lead.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <SheetTitle className="text-xl">
                {lead.firstName} {lead.lastName}
              </SheetTitle>
              <p className="text-muted-foreground">{lead.title}</p>
              <div className="flex gap-2 mt-2">
                <Badge className={getStatusColor(lead.status)}>
                  {lead.status}
                </Badge>
                <div className="flex items-center gap-1">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm">{category.name}</span>
                </div>
              </div>
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="company">Company</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Quick Actions */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Target className="h-4 w-4" />
                Quick Actions
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={lead.status} onValueChange={handleStatusChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Contacted">Contacted</SelectItem>
                      <SelectItem value="Qualified">Qualified</SelectItem>
                      <SelectItem value="Unqualified">Unqualified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <CategoryCombobox
                    categories={categories}
                    value={category.name}
                    onChange={handleCategoryChange}
                    placeholder="Select category"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Quick Remarks</Label>
                {renderEditableField('remarks', '', lead.remarks || '', 'textarea')}
              </div>
            </div>

            {/* Lead Scoring */}
            <div className="space-y-4">
              <h3 className="font-semibold">Lead Score</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all" 
                    style={{ width: `${lead.completenessScore || 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{lead.completenessScore || 0}%</span>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 border rounded-lg">
                <div className="text-2xl font-bold">{lead.emailsSent || 0}</div>
                <div className="text-sm text-muted-foreground">Emails Sent</div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="text-2xl font-bold">
                  {lead.lastContactDate ? format(new Date(lead.lastContactDate), 'MMM dd') : 'Never'}
                </div>
                <div className="text-sm text-muted-foreground">Last Contact</div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="text-2xl font-bold">
                  {Math.floor((new Date().getTime() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24))}d
                </div>
                <div className="text-sm text-muted-foreground">Days Old</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6 mt-6">
            <h3 className="font-semibold flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contact Information
            </h3>
            
            <div className="space-y-4">
              {renderEditableField('email', 'Email', lead.email)}
              {renderEditableField('phone', 'Phone', lead.phone || '')}
              {renderEditableField('personalEmail', 'Personal Email', lead.personalEmail || '')}
              
              {lead.linkedin && (
                <div className="space-y-2">
                  <Label>LinkedIn</Label>
                  <div className="flex items-center gap-2 p-2 border rounded">
                    <Linkedin className="h-4 w-4" />
                    <a 
                      href={lead.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex-1"
                    >
                      View LinkedIn Profile
                    </a>
                    <ExternalLink className="h-4 w-4" />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="company" className="space-y-6 mt-6">
            <h3 className="font-semibold flex items-center gap-2">
              <Building className="h-4 w-4" />
              Company Information
            </h3>
            
            <div className="space-y-4">
              {renderEditableField('company', 'Company', lead.company)}
              {renderEditableField('industry', 'Industry', lead.industry || '')}
              {renderEditableField('location', 'Location', lead.location || '')}
              {renderEditableField('department', 'Department', lead.department || '')}
              {renderEditableField('companySize', 'Company Size', lead.companySize, 'select', [
                'Small (1-50)', 'Medium (51-200)', 'Large (201-1000)', 'Enterprise (1000+)'
              ])}
              {renderEditableField('seniority', 'Seniority', lead.seniority, 'select', [
                'Entry-level', 'Mid-level', 'Senior', 'Executive', 'C-level'
              ])}
              
              {lead.organizationWebsite && (
                <div className="space-y-2">
                  <Label>Company Website</Label>
                  <div className="flex items-center gap-2 p-2 border rounded">
                    <Globe className="h-4 w-4" />
                    <a 
                      href={lead.organizationWebsite} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex-1"
                    >
                      {lead.organizationWebsite}
                    </a>
                    <ExternalLink className="h-4 w-4" />
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <Badge variant="outline" className={getSizeColor(lead.companySize)}>
                  {lead.companySize}
                </Badge>
                <Badge variant="outline" className={getSeniorityColor(lead.seniority)}>
                  {lead.seniority}
                </Badge>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6 mt-6">
            <h3 className="font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Activity & Timeline
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="font-medium">Lead Created</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(lead.createdAt), 'MMM dd, yyyy at h:mm a')}
                </p>
              </div>
              
              {lead.lastContactDate && (
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium">Last Contact</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(lead.lastContactDate), 'MMM dd, yyyy at h:mm a')}
                  </p>
                </div>
              )}
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="font-medium">Current Status</span>
                </div>
                <Badge className={getStatusColor(lead.status)}>
                  {lead.status}
                </Badge>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};
