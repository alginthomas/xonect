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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Compact Sticky Header */}
      <div className="flex-shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="flex items-center gap-2 px-3 py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/?tab=leads')}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-base truncate">
              {leadData.firstName} {leadData.lastName}
            </h1>
            <p className="text-xs text-muted-foreground truncate">
              {leadData.title}
            </p>
          </div>
        </div>
      </div>

      {/* Compact Hero Section */}
      <div className="flex-shrink-0 px-3 py-4 bg-gradient-to-b from-muted/20 to-background">
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="h-16 w-16 ring-2 ring-background shadow-md">
            <AvatarImage src={leadData.photoUrl} alt={`${leadData.firstName} ${leadData.lastName}`} />
            <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
              {leadData.firstName.charAt(0)}{leadData.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-lg leading-tight text-left">
                  {leadData.firstName} {leadData.lastName}
                </h2>
                <p className="text-sm text-muted-foreground leading-tight text-left">
                  {leadData.title}
                </p>
                <p className="text-sm font-medium text-left">
                  {leadData.company}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={`text-xs px-2 py-1 ${getStatusColor(leadData.status)}`}>
                {leadData.status}
              </Badge>
              <div className="flex items-center gap-1">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-xs text-muted-foreground">{category.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Contact Info */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <Mail className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{leadData.email}</span>
          </div>
          {leadData.phone && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Phone className="h-3 w-3" />
              <span className="text-xs">{leadData.phone}</span>
            </div>
          )}
        </div>

        {/* Compact Primary Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="default"
            size="sm"
            className="h-9 font-medium text-xs"
            onClick={copyEmail}
          >
            <Mail className="h-4 w-4 mr-1" />
            Copy Email
          </Button>
          {leadData.phone && (
            <Button
              variant="outline"
              size="sm"
              className="h-9 font-medium text-xs"
              onClick={callLead}
            >
              <Phone className="h-4 w-4 mr-1" />
              Call
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Area - Flexible height */}
      <div className="flex-1 flex flex-col min-h-0">
        <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0">
          {/* Compact Tabs Header */}
          <div className="flex-shrink-0 px-3 py-2">
            <TabsList className="grid w-full grid-cols-4 h-8 p-0.5 bg-muted rounded-md">
              <TabsTrigger 
                value="overview" 
                className="text-[10px] sm:text-xs px-0.5 py-1 h-7 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-sm transition-all"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="contact" 
                className="text-[10px] sm:text-xs px-0.5 py-1 h-7 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-sm transition-all"
              >
                Contact
              </TabsTrigger>
              <TabsTrigger 
                value="company" 
                className="text-[10px] sm:text-xs px-0.5 py-1 h-7 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-sm transition-all"
              >
                Company
              </TabsTrigger>
              <TabsTrigger 
                value="activity" 
                className="text-[10px] sm:text-xs px-0.5 py-1 h-7 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-sm transition-all"
              >
                Activity
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Scrollable Content Area - Takes remaining space */}
          <div className="flex-1 overflow-y-auto px-3 pb-20">
            <TabsContent value="overview" className="space-y-3 mt-2">
              {/* Status Management */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Status Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <QuickStatusEditor
                    status={leadData.status}
                    onChange={handleStatusChange}
                  />
                  <div className="text-xs space-y-1">
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
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <MessageSquare className="h-3 w-3" />
                      Remarks
                    </CardTitle>
                    {!isEditingRemarks && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingRemarks(true)}
                        className="h-6 px-2"
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditingRemarks ? (
                    <div className="space-y-2">
                      <Textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Add remarks about this lead..."
                        rows={3}
                        className="text-left text-xs"
                      />
                      <div className="flex gap-2">
                        <Button onClick={handleSaveRemarks} size="sm" className="flex-1 h-8 text-xs">
                          <Check className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setRemarks(leadData.remarks || '');
                            setIsEditingRemarks(false);
                          }}
                          className="flex-1 h-8 text-xs"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground text-left">
                      {leadData.remarks || 'No remarks added yet.'}
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="space-y-3 mt-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-medium">Email</span>
                      </div>
                      <Button variant="ghost" size="sm" asChild className="h-6 px-2">
                        <a href={`mailto:${leadData.email}`} className="text-xs">
                          {leadData.email}
                        </a>
                      </Button>
                    </div>

                    {leadData.phone && (
                      <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs font-medium">Phone</span>
                        </div>
                        <Button variant="ghost" size="sm" asChild className="h-6 px-2">
                          <a href={`tel:${leadData.phone}`} className="text-xs">
                            {leadData.phone}
                          </a>
                        </Button>
                      </div>
                    )}

                    {leadData.linkedin && (
                      <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Linkedin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs font-medium">LinkedIn</span>
                        </div>
                        <Button variant="ghost" size="sm" asChild className="h-6 px-2">
                          <a href={leadData.linkedin} target="_blank" rel="noopener noreferrer" className="text-xs">
                            View Profile
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="company" className="space-y-3 mt-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Building2 className="h-3 w-3" />
                    Company Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid gap-2">
                    <div className="flex justify-between p-2 bg-muted/30 rounded-lg">
                      <span className="text-xs font-medium">Company</span>
                      <span className="text-xs text-right">{leadData.company}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted/30 rounded-lg">
                      <span className="text-xs font-medium">Industry</span>
                      <span className="text-xs text-right">{leadData.industry || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted/30 rounded-lg">
                      <span className="text-xs font-medium">Size</span>
                      <span className="text-xs text-right">{leadData.companySize}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted/30 rounded-lg">
                      <span className="text-xs font-medium">Location</span>
                      <span className="text-xs text-right">{leadData.location || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted/30 rounded-lg">
                      <span className="text-xs font-medium">Seniority</span>
                      <span className="text-xs text-right">{leadData.seniority}</span>
                    </div>
                    {leadData.department && (
                      <div className="flex justify-between p-2 bg-muted/30 rounded-lg">
                        <span className="text-xs font-medium">Department</span>
                        <span className="text-xs text-right">{leadData.department}</span>
                      </div>
                    )}
                  </div>

                  {leadData.organizationWebsite && (
                    <Button variant="outline" className="w-full mt-3 h-8 text-xs" asChild>
                      <a href={leadData.organizationWebsite} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-3 w-3 mr-1" />
                        Visit Website
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-3 mt-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="h-3 w-3" />
                    Activity Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-center py-6 text-muted-foreground">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">Activity tracking coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Compact Floating Action Bar - Fixed at bottom */}
      <div className="flex-shrink-0 p-3">
        <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border border-border rounded-xl shadow-lg p-2">
          <div className="flex items-center justify-around gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 h-9"
              onClick={copyEmail}
            >
              <Mail className="h-4 w-4" />
            </Button>
            {leadData.phone && (
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-9"
                onClick={callLead}
              >
                <Phone className="h-4 w-4" />
              </Button>
            )}
            {leadData.linkedin && (
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-9"
                asChild
              >
                <a href={leadData.linkedin} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-4 w-4" />
                </a>
              </Button>
            )}
            {leadData.organizationWebsite && (
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-9"
                asChild
              >
                <a href={leadData.organizationWebsite} target="_blank" rel="noopener noreferrer">
                  <Globe className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
