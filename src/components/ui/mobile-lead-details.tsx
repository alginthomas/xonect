import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Mail,
  Phone,
  Globe,
  Linkedin,
  Building2,
  MapPin,
  Calendar,
  User,
  Save,
  Edit3,
  Check,
  X,
  MessageSquare,
  Activity
} from 'lucide-react';
import { QuickStatusEditor } from '@/components/QuickStatusEditor';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import type { Lead, LeadStatus } from '@/types/lead';
import type { Category } from '@/types/category';

interface MobileLeadDetailsProps {
  lead: Lead;
  categories: Category[];
}

export const MobileLeadDetails: React.FC<MobileLeadDetailsProps> = ({
  lead,
  categories
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [remarks, setRemarks] = useState(lead.remarks || '');
  const [isEditingRemarks, setIsEditingRemarks] = useState(false);
  const [leadData, setLeadData] = useState(lead);

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

  const handleStatusChange = async (status: LeadStatus) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status })
        .eq('id', leadData.id);

      if (error) throw error;

      setLeadData({ ...leadData, status });
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
    try {
      const { error } = await supabase
        .from('leads')
        .update({ remarks })
        .eq('id', leadData.id);

      if (error) throw error;

      setLeadData({ ...leadData, remarks });
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

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(leadData.email);
      toast({
        title: 'Email copied',
        description: `${leadData.email} has been copied to clipboard.`,
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
    if (leadData.phone) {
      window.open(`tel:${leadData.phone}`, '_self');
    } else {
      toast({
        title: 'No phone number',
        description: 'This lead does not have a phone number.',
        variant: 'destructive',
      });
    }
  };

  const category = getCategoryInfo(leadData.categoryId);

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Sticky Header */}
      <div className="flex-shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/?tab=leads')}
            className="h-9 w-9 p-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-lg truncate">
              {leadData.firstName} {leadData.lastName}
            </h1>
            <p className="text-sm text-muted-foreground truncate">
              {leadData.title} • {leadData.company}
            </p>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="flex-shrink-0 px-4 py-6 bg-gradient-to-b from-muted/30 to-background">
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="h-20 w-20 ring-4 ring-background shadow-lg">
            <AvatarImage src={leadData.photoUrl} alt={`${leadData.firstName} ${leadData.lastName}`} />
            <AvatarFallback className="text-xl font-semibold bg-primary/10 text-primary">
              {leadData.firstName.charAt(0)}{leadData.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-xl leading-tight text-left">
                  {leadData.firstName} {leadData.lastName}
                </h2>
                <p className="text-base text-muted-foreground leading-tight text-left">
                  {leadData.title}
                </p>
                <p className="text-base font-medium text-left">
                  {leadData.company}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={`text-sm px-3 py-1 ${getStatusColor(leadData.status)}`}>
                {leadData.status}
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

        {/* Quick Contact Info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <Mail className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{leadData.email}</span>
          </div>
          {leadData.phone && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Phone className="h-4 w-4" />
              <span>{leadData.phone}</span>
            </div>
          )}
        </div>

        {/* Primary Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="default"
            size="lg"
            className="h-12 font-medium"
            onClick={copyEmail}
          >
            <Mail className="h-5 w-5 mr-2" />
            Copy Email
          </Button>
          {leadData.phone && (
            <Button
              variant="outline"
              size="lg"
              className="h-12 font-medium"
              onClick={callLead}
            >
              <Phone className="h-5 w-5 mr-2" />
              Call
            </Button>
          )}
        </div>
      </div>

      {/* Content Tabs - Fixed height container */}
      <div className="flex-1 flex flex-col min-h-0">
        <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0">
          <div className="flex-shrink-0 px-4 mt-4">
            <TabsList className="flex w-full h-auto p-1 bg-muted">
              <TabsTrigger value="overview" className="flex-1 text-xs sm:text-sm px-2 py-2 min-w-0">Overview</TabsTrigger>
              <TabsTrigger value="contact" className="flex-1 text-xs sm:text-sm px-2 py-2 min-w-0">Contact</TabsTrigger>
              <TabsTrigger value="company" className="flex-1 text-xs sm:text-sm px-2 py-2 min-w-0">Company</TabsTrigger>
              <TabsTrigger value="activity" className="flex-1 text-xs sm:text-sm px-2 py-2 min-w-0">Activity</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-20">
            <TabsContent value="overview" className="space-y-4 mt-4">
              {/* Status Management */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Status Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <QuickStatusEditor
                    status={leadData.status}
                    onChange={handleStatusChange}
                  />
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Emails Sent</span>
                      <span className="font-medium">{leadData.emailsSent}</span>
                    </div>
                    {leadData.lastContactDate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Contact</span>
                        <span className="font-medium">{format(leadData.lastContactDate, 'MMM dd, yyyy')}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Added</span>
                      <span className="font-medium">{format(leadData.createdAt, 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Remarks */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Remarks
                    </CardTitle>
                    {!isEditingRemarks && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingRemarks(true)}
                      >
                        <Edit3 className="h-4 w-4" />
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
                        className="text-left"
                      />
                      <div className="flex gap-2">
                        <Button onClick={handleSaveRemarks} size="sm" className="flex-1">
                          <Check className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setRemarks(leadData.remarks || '');
                            setIsEditingRemarks(false);
                          }}
                          className="flex-1"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-left">
                      {leadData.remarks || 'No remarks added yet.'}
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Email</span>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`mailto:${leadData.email}`} className="text-sm">
                          {leadData.email}
                        </a>
                      </Button>
                    </div>

                    {leadData.phone && (
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Phone</span>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={`tel:${leadData.phone}`} className="text-sm">
                            {leadData.phone}
                          </a>
                        </Button>
                      </div>
                    )}

                    {leadData.linkedin && (
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Linkedin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">LinkedIn</span>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={leadData.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm">
                            View Profile
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="company" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Company Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-3">
                    <div className="flex justify-between p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm font-medium">Company</span>
                      <span className="text-sm text-right">{leadData.company}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm font-medium">Industry</span>
                      <span className="text-sm text-right">{leadData.industry || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm font-medium">Size</span>
                      <span className="text-sm text-right">{leadData.companySize}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm font-medium">Location</span>
                      <span className="text-sm text-right">{leadData.location || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm font-medium">Seniority</span>
                      <span className="text-sm text-right">{leadData.seniority}</span>
                    </div>
                    {leadData.department && (
                      <div className="flex justify-between p-3 bg-muted/30 rounded-lg">
                        <span className="text-sm font-medium">Department</span>
                        <span className="text-sm text-right">{leadData.department}</span>
                      </div>
                    )}
                  </div>

                  {leadData.organizationWebsite && (
                    <Button variant="outline" className="w-full mt-4" asChild>
                      <a href={leadData.organizationWebsite} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-4 w-4 mr-2" />
                        Visit Website
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Activity Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Activity tracking coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Floating Action Bar - Fixed at bottom */}
      <div className="flex-shrink-0 p-4">
        <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border border-border rounded-xl shadow-lg p-3">
          <div className="flex items-center justify-around gap-2">
            <Button
              variant="ghost"
              size="lg"
              className="flex-1 h-12"
              onClick={copyEmail}
            >
              <Mail className="h-5 w-5" />
            </Button>
            {leadData.phone && (
              <Button
                variant="ghost"
                size="lg"
                className="flex-1 h-12"
                onClick={callLead}
              >
                <Phone className="h-5 w-5" />
              </Button>
            )}
            {leadData.linkedin && (
              <Button
                variant="ghost"
                size="lg"
                className="flex-1 h-12"
                asChild
              >
                <a href={leadData.linkedin} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-5 w-5" />
                </a>
              </Button>
            )}
            {leadData.organizationWebsite && (
              <Button
                variant="ghost"
                size="lg"
                className="flex-1 h-12"
                asChild
              >
                <a href={leadData.organizationWebsite} target="_blank" rel="noopener noreferrer">
                  <Globe className="h-5 w-5" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
