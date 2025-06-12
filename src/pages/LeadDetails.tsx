
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Mail,
  Phone,
  Globe,
  Linkedin,
  Twitter,
  Facebook,
  Building2,
  MapPin,
  Calendar,
  User,
  Save,
  Edit3
} from 'lucide-react';
import { QuickStatusEditor } from '@/components/QuickStatusEditor';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import type { Lead, LeadStatus } from '@/types/lead';
import type { Category } from '@/types/category';

export default function LeadDetails() {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lead, setLead] = useState<Lead | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [remarks, setRemarks] = useState('');
  const [isEditingRemarks, setIsEditingRemarks] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (leadId) {
      fetchLead();
      fetchCategories();
    }
  }, [leadId]);

  const fetchLead = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();

      if (error) throw error;

      if (data) {
        const transformedLead: Lead = {
          id: data.id,
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          company: data.company,
          title: data.title,
          phone: data.phone || '',
          linkedin: data.linkedin || '',
          status: data.status,
          createdAt: new Date(data.created_at),
          categoryId: data.category_id,
          companySize: data.company_size,
          seniority: data.seniority,
          emailsSent: data.emails_sent || 0,
          lastContactDate: data.last_contact_date ? new Date(data.last_contact_date) : undefined,
          completenessScore: data.completeness_score || 0,
          industry: data.industry || '',
          location: data.location || '',
          department: data.department || '',
          personalEmail: data.personal_email || '',
          photoUrl: data.photo_url || '',
          twitterUrl: data.twitter_url || '',
          facebookUrl: data.facebook_url || '',
          organizationWebsite: data.organization_website || '',
          organizationFounded: data.organization_founded,
          remarks: data.remarks || '',
          tags: data.tags || [],
          importBatchId: data.import_batch_id || undefined,
        };
        
        setLead(transformedLead);
        setRemarks(transformedLead.remarks || '');
      }
    } catch (error: any) {
      toast({
        title: 'Error fetching lead',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const transformedCategories: Category[] = data.map(category => ({
          id: category.id,
          name: category.name,
          description: category.description || '',
          color: category.color || '#3B82F6',
          criteria: (typeof category.criteria === 'object' && category.criteria !== null) 
            ? category.criteria as Record<string, any> 
            : {},
          createdAt: new Date(category.created_at),
          updatedAt: new Date(category.updated_at)
        }));
        setCategories(transformedCategories);
      }
    } catch (error: any) {
      toast({
        title: 'Error fetching categories',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleStatusChange = async (status: LeadStatus) => {
    if (!lead) return;

    try {
      const { error } = await supabase
        .from('leads')
        .update({ status })
        .eq('id', lead.id);

      if (error) throw error;

      setLead({ ...lead, status });
      toast({
        title: 'Status updated',
        description: `Lead status updated to ${status}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error updating status',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSaveRemarks = async () => {
    if (!lead) return;

    try {
      const { error } = await supabase
        .from('leads')
        .update({ remarks })
        .eq('id', lead.id);

      if (error) throw error;

      setLead({ ...lead, remarks });
      setIsEditingRemarks(false);
      toast({
        title: 'Remarks saved',
        description: 'Lead remarks have been updated.',
      });
    } catch (error: any) {
      toast({
        title: 'Error saving remarks',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-xl font-semibold mb-2">Lead not found</h2>
        <Button onClick={() => navigate('/?tab=leads')} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Leads
        </Button>
      </div>
    );
  }

  const category = getCategoryInfo(lead.categoryId);

  return (
    <div className="min-h-screen bg-background p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/?tab=leads')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Lead Details</h1>
          <p className="text-muted-foreground">View and manage lead information</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={lead.photoUrl} alt={`${lead.firstName} ${lead.lastName}`} />
                  <AvatarFallback className="text-lg">
                    {lead.firstName.charAt(0)}{lead.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-xl">
                    {lead.firstName} {lead.lastName}
                  </CardTitle>
                  <CardDescription className="text-base mt-1">
                    {lead.title} at {lead.company}
                  </CardDescription>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={`${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-sm text-muted-foreground">{category.name}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${lead.email}`} className="text-sm hover:underline">
                    {lead.email}
                  </a>
                </div>
                {lead.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${lead.phone}`} className="text-sm hover:underline">
                      {lead.phone}
                    </a>
                  </div>
                )}
                {lead.linkedin && (
                  <div className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4 text-muted-foreground" />
                    <a href={lead.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">
                      LinkedIn Profile
                    </a>
                  </div>
                )}
                {lead.organizationWebsite && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a href={lead.organizationWebsite} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">
                      Company Website
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Company</Label>
                  <p className="text-sm font-medium">{lead.company}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Industry</Label>
                  <p className="text-sm">{lead.industry || 'Not specified'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Company Size</Label>
                  <p className="text-sm">{lead.companySize}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Location</Label>
                  <p className="text-sm">{lead.location || 'Not specified'}</p>
                </div>
                {lead.department && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Department</Label>
                    <p className="text-sm">{lead.department}</p>
                  </div>
                )}
                <div>
                  <Label className="text-xs text-muted-foreground">Seniority</Label>
                  <p className="text-sm">{lead.seniority}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Remarks */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Edit3 className="h-5 w-5" />
                  Remarks
                </CardTitle>
                {!isEditingRemarks && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingRemarks(true)}
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditingRemarks ? (
                <div className="space-y-3">
                  <Textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Add remarks about this lead..."
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSaveRemarks} size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setRemarks(lead.remarks || '');
                        setIsEditingRemarks(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {lead.remarks || 'No remarks added yet.'}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Current Status</Label>
                <div className="mt-1">
                  <QuickStatusEditor
                    status={lead.status}
                    onChange={handleStatusChange}
                  />
                </div>
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Emails Sent</span>
                  <span className="font-medium">{lead.emailsSent}</span>
                </div>
                {lead.lastContactDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Contact</span>
                    <span className="font-medium">{format(lead.lastContactDate, 'MMM dd, yyyy')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Added</span>
                  <span className="font-medium">{format(lead.createdAt, 'MMM dd, yyyy')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href={`mailto:${lead.email}`}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </a>
              </Button>
              {lead.phone && (
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href={`tel:${lead.phone}`}>
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </a>
                </Button>
              )}
              {lead.linkedin && (
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href={lead.linkedin} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-4 w-4 mr-2" />
                    View LinkedIn
                  </a>
                </Button>
              )}
              {lead.organizationWebsite && (
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href={lead.organizationWebsite} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4 mr-2" />
                    Visit Website
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Social Links */}
          {(lead.twitterUrl || lead.facebookUrl) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Social Profiles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {lead.twitterUrl && (
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href={lead.twitterUrl} target="_blank" rel="noopener noreferrer">
                      <Twitter className="h-4 w-4 mr-2" />
                      Twitter
                    </a>
                  </Button>
                )}
                {lead.facebookUrl && (
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href={lead.facebookUrl} target="_blank" rel="noopener noreferrer">
                      <Facebook className="h-4 w-4 mr-2" />
                      Facebook
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
