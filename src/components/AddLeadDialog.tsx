
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
      const { error } = await supabase
        .from('leads')
        .insert([{
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          company: formData.company || null,
          title: formData.title || null,
          phone: formData.phone || null,
          linkedin: formData.linkedin || null,
          category_id: formData.categoryId || null,
          remarks: formData.remarks || null,
          status: 'New'
        }]);

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: 'Success!',
        description: 'Lead has been added successfully.',
      });

      resetForm();
      onClose();
      onLeadAdded();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
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
      <DialogContent className="w-[95vw] max-w-md mx-auto h-[90vh] max-h-[700px] p-0 gap-0 rounded-2xl border-0 shadow-2xl bg-background/95 backdrop-blur-xl">
        {/* Header */}
        <div className="relative px-6 pt-8 pb-6 border-b border-border/10">
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 p-2 rounded-full hover:bg-accent/50 transition-colors"
            disabled={loading}
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
          <DialogHeader className="space-y-3 text-left">
            <DialogTitle className="text-2xl font-semibold text-foreground">
              Add New Lead
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground leading-relaxed">
              Create a new lead by filling out the form below. Required fields are marked with an asterisk.
            </DialogDescription>
          </DialogHeader>
        </div>
        
        {/* Scrollable Content */}
        <ScrollArea className="flex-1">
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-8">
            {/* Contact Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-foreground">Contact Information</h3>
              </div>
              
              <div className="space-y-5">
                <div className="space-y-3">
                  <Label htmlFor="firstName" className="text-sm font-medium text-foreground flex items-center gap-2">
                    First Name <span className="text-destructive text-base">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter first name"
                    className="h-12 text-base"
                    required
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="lastName" className="text-sm font-medium text-foreground flex items-center gap-2">
                    Last Name <span className="text-destructive text-base">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter last name"
                    className="h-12 text-base"
                    required
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email <span className="text-destructive text-base">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="name@company.com"
                    className="h-12 text-base"
                    required
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="h-12 text-base"
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Building className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-foreground">Professional Details</h3>
              </div>
              
              <div className="space-y-5">
                <div className="space-y-3">
                  <Label htmlFor="company" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Company
                  </Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="Company name"
                    className="h-12 text-base"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="title" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Job Title
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Job title or role"
                    className="h-12 text-base"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="linkedin" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn Profile
                  </Label>
                  <Input
                    id="linkedin"
                    value={formData.linkedin}
                    onChange={(e) => handleInputChange('linkedin', e.target.value)}
                    placeholder="linkedin.com/in/username"
                    className="h-12 text-base"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="category" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Category
                  </Label>
                  <Select value={formData.categoryId} onValueChange={(value) => handleInputChange('categoryId', value)}>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border shadow-lg">
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id} className="py-3">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: category.color }}
                            />
                            <span className="text-base">{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-foreground">Additional Information</h3>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="remarks" className="text-sm font-medium text-foreground">
                  Notes & Remarks
                </Label>
                <Textarea
                  id="remarks"
                  value={formData.remarks}
                  onChange={(e) => handleInputChange('remarks', e.target.value)}
                  placeholder="Add any additional notes about this lead..."
                  rows={4}
                  className="resize-none text-base"
                />
              </div>
            </div>
          </form>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-border/10 bg-background/80 backdrop-blur-sm p-6">
          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="flex-1 h-12 text-base font-medium"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 h-12 text-base font-medium bg-primary hover:bg-primary/90"
            >
              {loading ? 'Adding...' : 'Add Lead'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
