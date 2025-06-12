
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { X, User, Mail, Building, Briefcase, Phone, Linkedin, Tag, MessageSquare } from 'lucide-react';
import type { Category } from '@/types/category';

interface AddLeadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onLeadAdded: () => void;
}

export const AddLeadDialog: React.FC<AddLeadDialogProps> = ({
  isOpen,
  onClose,
  categories,
  onLeadAdded
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    title: '',
    phone: '',
    linkedin: '',
    categoryId: '',
    remarks: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      company: '',
      title: '',
      phone: '',
      linkedin: '',
      categoryId: '',
      remarks: ''
    });
  };

  const calculateCompletenessScore = () => {
    const fields = [
      formData.firstName,
      formData.lastName,
      formData.email,
      formData.company,
      formData.title,
      formData.phone,
      formData.linkedin,
      formData.categoryId,
      formData.remarks
    ];
    const filledFields = fields.filter(field => field && field.trim() !== '').length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast({
        title: 'Required fields missing',
        description: 'Please fill in first name, last name, and email.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Submitting lead data:', formData);
      
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error getting user:', userError);
        throw new Error('You must be logged in to add leads');
      }

      if (!user) {
        throw new Error('You must be logged in to add leads');
      }

      console.log('Current user ID:', user.id);

      const { data, error } = await supabase
        .from('leads')
        .insert([{
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          company: formData.company || '',
          title: formData.title || '',
          phone: formData.phone || null,
          linkedin: formData.linkedin || null,
          category_id: formData.categoryId || null,
          remarks: formData.remarks || null,
          status: 'New',
          completeness_score: calculateCompletenessScore(),
          emails_sent: 0,
          seniority: 'Mid-level',
          company_size: 'Small (1-50)',
          tags: [],
          user_id: user.id // Add the user_id field
        }])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message);
      }

      console.log('Lead created successfully:', data);

      toast({
        title: 'Success!',
        description: 'Lead has been added successfully.',
      });

      resetForm();
      onClose();
      onLeadAdded();
    } catch (error: any) {
      console.error('Error creating lead:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create lead',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto h-[90vh] max-h-[640px] p-0 gap-0 rounded-2xl border-0 shadow-2xl bg-background overflow-hidden">
        {/* Fixed Header */}
        <div className="flex-shrink-0 px-5 pt-6 pb-4 bg-background border-b border-border/5">
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 p-2.5 rounded-full hover:bg-accent/50 transition-colors z-10"
            disabled={loading}
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
          <DialogHeader className="space-y-2 text-left pr-10">
            <DialogTitle className="text-xl font-semibold text-foreground">
              Add New Lead
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              Create a new lead by filling out the form below. Required fields are marked with an asterisk.
            </DialogDescription>
          </DialogHeader>
        </div>
        
        {/* Scrollable Content */}
        <ScrollArea className="flex-1 px-5">
          <form onSubmit={handleSubmit} className="py-4 space-y-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="p-1.5 rounded-lg bg-primary/10 shrink-0">
                  <User className="h-3.5 w-3.5 text-primary" />
                </div>
                <h3 className="text-base font-medium text-foreground">Contact Information</h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    First Name <span className="text-destructive text-sm">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter first name"
                    className="h-11 text-base rounded-xl border-border/30 focus:border-primary"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    Last Name <span className="text-destructive text-sm">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter last name"
                    className="h-11 text-base rounded-xl border-border/30 focus:border-primary"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    Email <span className="text-destructive text-sm">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="name@company.com"
                    className="h-11 text-base rounded-xl border-border/30 focus:border-primary"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="h-11 text-base rounded-xl border-border/30 focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="p-1.5 rounded-lg bg-primary/10 shrink-0">
                  <Building className="h-3.5 w-3.5 text-primary" />
                </div>
                <h3 className="text-base font-medium text-foreground">Professional Details</h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5" />
                    Company
                  </Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="Company name"
                    className="h-11 text-base rounded-xl border-border/30 focus:border-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5" />
                    Job Title
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Job title or role"
                    className="h-11 text-base rounded-xl border-border/30 focus:border-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="linkedin" className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <Linkedin className="h-3.5 w-3.5" />
                    LinkedIn Profile
                  </Label>
                  <Input
                    id="linkedin"
                    value={formData.linkedin}
                    onChange={(e) => handleInputChange('linkedin', e.target.value)}
                    placeholder="linkedin.com/in/username"
                    className="h-11 text-base rounded-xl border-border/30 focus:border-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" />
                    Category
                  </Label>
                  <Select value={formData.categoryId} onValueChange={(value) => handleInputChange('categoryId', value)}>
                    <SelectTrigger className="h-11 text-base rounded-xl border-border/30 focus:border-primary">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border shadow-lg rounded-xl max-h-48">
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id} className="py-2.5 rounded-lg">
                          <div className="flex items-center gap-2.5">
                            <div 
                              className="w-2.5 h-2.5 rounded-full shrink-0" 
                              style={{ backgroundColor: category.color }}
                            />
                            <span className="text-sm">{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="p-1.5 rounded-lg bg-primary/10 shrink-0">
                  <MessageSquare className="h-3.5 w-3.5 text-primary" />
                </div>
                <h3 className="text-base font-medium text-foreground">Additional Information</h3>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="remarks" className="text-sm font-medium text-foreground">
                  Notes & Remarks
                </Label>
                <Textarea
                  id="remarks"
                  value={formData.remarks}
                  onChange={(e) => handleInputChange('remarks', e.target.value)}
                  placeholder="Add any additional notes about this lead..."
                  rows={3}
                  className="resize-none text-base rounded-xl border-border/30 focus:border-primary"
                />
              </div>
            </div>
            
            {/* Bottom padding for scroll */}
            <div className="h-4" />
          </form>
        </ScrollArea>

        {/* Fixed Footer */}
        <div className="flex-shrink-0 border-t border-border/5 bg-background px-5 py-4 rounded-b-2xl">
          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="flex-1 h-11 text-base font-medium rounded-xl border-border/30"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 h-11 text-base font-medium bg-primary hover:bg-primary/90 rounded-xl"
            >
              {loading ? 'Adding...' : 'Add Lead'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
