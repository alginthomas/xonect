
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Mail, TrendingUp, Filter, Search, CheckCircle, Phone, Linkedin, MapPin, Building, Globe, Calendar, User, Briefcase, ExternalLink, Twitter, Facebook } from 'lucide-react';
import { EmailDialog } from './EmailDialog';
import { LeadStatusSelect } from './LeadStatusSelect';
import type { Lead, EmailTemplate } from '@/types/lead';

interface LeadsDashboardProps {
  leads: Lead[];
  templates?: EmailTemplate[];
  onUpdateLead: (leadId: string, updates: Partial<Lead>) => void;
}

export const LeadsDashboard: React.FC<LeadsDashboardProps> = ({ 
  leads, 
  templates = [], 
  onUpdateLead 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [seniorityFilter, setSeniorityFilter] = useState('all');
  const [companySizeFilter, setCompanySizeFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = searchTerm === '' || 
        lead.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.organization_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.title && lead.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (lead.industry && lead.industry.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (lead.department && lead.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (lead.keywords && lead.keywords.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      const matchesSeniority = seniorityFilter === 'all' || lead.seniority === seniorityFilter;
      const matchesCompanySize = companySizeFilter === 'all' || lead.estimated_num_employees === companySizeFilter;
      const matchesDepartment = departmentFilter === 'all' || lead.department === departmentFilter;

      return matchesSearch && matchesStatus && matchesSeniority && matchesCompanySize && matchesDepartment;
    });
  }, [leads, searchTerm, statusFilter, seniorityFilter, companySizeFilter, departmentFilter]);

  const stats = useMemo(() => {
    const totalLeads = leads.length;
    const validLeads = leads.filter(lead => lead.email && lead.completenessScore >= 60).length;
    const emailsSent = leads.reduce((sum, lead) => sum + lead.emailsSent, 0);
    const highPriorityLeads = leads.filter(lead => lead.seniority === 'C-level' || lead.seniority === 'Executive').length;
    const leadsWithPhone = leads.filter(lead => lead.organization_phone).length;
    const leadsWithLinkedIn = leads.filter(lead => lead.linkedin_url).length;

    return {
      totalLeads,
      validLeads,
      emailsSent,
      highPriorityLeads,
      leadsWithPhone,
      leadsWithLinkedIn,
    };
  }, [leads]);

  const departments = useMemo(() => {
    return [...new Set(leads.map(lead => lead.department).filter(Boolean))];
  }, [leads]);

  const handleEmailSent = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      onUpdateLead(leadId, {
        emailsSent: lead.emailsSent + 1,
        status: 'Contacted',
        lastContactDate: new Date(),
      });
    }
  };

  const handleStatusChange = (leadId: string, newStatus: Lead['status']) => {
    onUpdateLead(leadId, { status: newStatus });
  };

  const getStatusColor = (status: Lead['status']) => {
    const colors = {
      'New': 'bg-blue-100 text-blue-800',
      'Contacted': 'bg-yellow-100 text-yellow-800',
      'Opened': 'bg-green-100 text-green-800',
      'Clicked': 'bg-purple-100 text-purple-800',
      'Replied': 'bg-emerald-100 text-emerald-800',
      'Qualified': 'bg-green-100 text-green-800',
      'Unqualified': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getSeniorityColor = (seniority: Lead['seniority']) => {
    const colors = {
      'C-level': 'bg-red-100 text-red-800',
      'Executive': 'bg-orange-100 text-orange-800',
      'Senior': 'bg-purple-100 text-purple-800',
      'Mid-level': 'bg-blue-100 text-blue-800',
      'Junior': 'bg-gray-100 text-gray-800',
    };
    return colors[seniority] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-6 w-6 text-blue-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-muted-foreground">Total Leads</p>
                <p className="text-xl font-bold">{stats.totalLeads}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-muted-foreground">Complete Profiles</p>
                <p className="text-xl font-bold">{stats.validLeads}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="h-6 w-6 text-red-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-muted-foreground">High Priority</p>
                <p className="text-xl font-bold">{stats.highPriorityLeads}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Phone className="h-6 w-6 text-green-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-muted-foreground">Has Phone</p>
                <p className="text-xl font-bold">{stats.leadsWithPhone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Linkedin className="h-6 w-6 text-blue-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-muted-foreground">Has LinkedIn</p>
                <p className="text-xl font-bold">{stats.leadsWithLinkedIn}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Mail className="h-6 w-6 text-purple-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-muted-foreground">Emails Sent</p>
                <p className="text-xl font-bold">{stats.emailsSent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Sales Lead Database
          </CardTitle>
          <CardDescription>
            Comprehensive lead management with detailed prospect information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Contacted">Contacted</SelectItem>
                <SelectItem value="Opened">Opened</SelectItem>
                <SelectItem value="Clicked">Clicked</SelectItem>
                <SelectItem value="Replied">Replied</SelectItem>
                <SelectItem value="Qualified">Qualified</SelectItem>
                <SelectItem value="Unqualified">Unqualified</SelectItem>
              </SelectContent>
            </Select>

            <Select value={seniorityFilter} onValueChange={setSeniorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Seniority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="C-level">C-level</SelectItem>
                <SelectItem value="Executive">Executive</SelectItem>
                <SelectItem value="Senior">Senior</SelectItem>
                <SelectItem value="Mid-level">Mid-level</SelectItem>
                <SelectItem value="Junior">Junior</SelectItem>
              </SelectContent>
            </Select>

            <Select value={companySizeFilter} onValueChange={setCompanySizeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Company Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sizes</SelectItem>
                <SelectItem value="1-10">1-10</SelectItem>
                <SelectItem value="11-50">11-50</SelectItem>
                <SelectItem value="51-200">51-200</SelectItem>
                <SelectItem value="201-500">201-500</SelectItem>
                <SelectItem value="501-1000">501-1000</SelectItem>
                <SelectItem value="1001-5000">1001-5000</SelectItem>
                <SelectItem value="5001-10000">5001-10000</SelectItem>
                <SelectItem value="10000+">10000+</SelectItem>
              </SelectContent>
            </Select>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="text-sm text-muted-foreground flex items-center">
              Showing {filteredLeads.length} of {leads.length} leads
            </div>
          </div>

          {/* Comprehensive Leads Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 font-medium min-w-[250px]">Prospect Profile</th>
                    <th className="text-left p-3 font-medium min-w-[300px]">Contact & Social</th>
                    <th className="text-left p-3 font-medium min-w-[250px]">Organization</th>
                    <th className="text-left p-3 font-medium min-w-[200px]">Position & Department</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map(lead => (
                    <tr key={lead.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={lead.photo_url} alt={`${lead.first_name} ${lead.last_name}`} />
                            <AvatarFallback>
                              {lead.first_name?.charAt(0)}{lead.last_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <div className="font-medium text-sm">
                              {lead.first_name} {lead.last_name}
                            </div>
                            {lead.headline && (
                              <div className="text-xs text-muted-foreground">
                                {lead.headline}
                              </div>
                            )}
                            {(lead.city || lead.state || lead.country) && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span>{[lead.city, lead.state, lead.country].filter(Boolean).join(', ')}</span>
                              </div>
                            )}
                            {lead.keywords && (
                              <div className="text-xs text-blue-600 truncate max-w-[180px]">
                                Keywords: {lead.keywords}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-3">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="truncate max-w-[200px]">{lead.email}</span>
                          </div>
                          
                          {lead.personal_email && lead.personal_email !== lead.email && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span className="truncate max-w-[180px]">Personal: {lead.personal_email}</span>
                            </div>
                          )}
                          
                          {lead.organization_phone && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span>{lead.organization_phone}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2">
                            {lead.linkedin_url && (
                              <a 
                                href={lead.linkedin_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Linkedin className="h-4 w-4" />
                              </a>
                            )}
                            {lead.twitter_url && (
                              <a 
                                href={lead.twitter_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-600"
                              >
                                <Twitter className="h-4 w-4" />
                              </a>
                            )}
                            {lead.facebook_url && (
                              <a 
                                href={lead.facebook_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-700 hover:text-blue-900"
                              >
                                <Facebook className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-3">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Building className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium text-sm">{lead.organization_name}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" />
                            <span>{lead.estimated_num_employees} employees</span>
                          </div>
                          
                          {lead.industry && (
                            <Badge variant="outline" className="text-xs">
                              {lead.industry}
                            </Badge>
                          )}
                          
                          <div className="flex items-center gap-2">
                            {lead.organization_website_url && (
                              <a 
                                href={lead.organization_website_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Globe className="h-3 w-3" />
                              </a>
                            )}
                            {lead.organization_founded_year && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>Est. {lead.organization_founded_year}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-3">
                        <div className="space-y-2">
                          <div className="text-sm font-medium">{lead.title}</div>
                          
                          {lead.department && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Briefcase className="h-3 w-3" />
                              <span>{lead.department}</span>
                            </div>
                          )}
                          
                          <Badge className={getSeniorityColor(lead.seniority)}>
                            {lead.seniority}
                          </Badge>
                        </div>
                      </td>
                      
                      <td className="p-3">
                        <div className="space-y-3">
                          <LeadStatusSelect
                            leadId={lead.id}
                            currentStatus={lead.status}
                            onStatusChange={handleStatusChange}
                          />
                          
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary transition-all"
                                style={{ width: `${lead.completenessScore}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium">{lead.completenessScore}%</span>
                          </div>
                          
                          {lead.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {lead.tags.slice(0, 2).map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {lead.tags.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{lead.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="p-3">
                        <EmailDialog 
                          lead={lead} 
                          templates={templates}
                          onEmailSent={handleEmailSent}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
