
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, Mail, TrendingUp, Filter, Search } from 'lucide-react';
import type { Lead } from '@/types/lead';

interface LeadsDashboardProps {
  leads: Lead[];
  onUpdateLead: (leadId: string, updates: Partial<Lead>) => void;
}

export const LeadsDashboard: React.FC<LeadsDashboardProps> = ({ leads, onUpdateLead }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [seniorityFilter, setSeniorityFilter] = useState('all');
  const [companySizeFilter, setCompanySizeFilter] = useState('all');

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = searchTerm === '' || 
        lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      const matchesSeniority = seniorityFilter === 'all' || lead.seniority === seniorityFilter;
      const matchesCompanySize = companySizeFilter === 'all' || lead.companySize === companySizeFilter;

      return matchesSearch && matchesStatus && matchesSeniority && matchesCompanySize;
    });
  }, [leads, searchTerm, statusFilter, seniorityFilter, companySizeFilter]);

  const stats = useMemo(() => {
    const totalLeads = leads.length;
    const validLeads = leads.filter(lead => lead.email && lead.completenessScore >= 60).length;
    const emailsSent = leads.reduce((sum, lead) => sum + lead.emailsSent, 0);
    const openRate = leads.length > 0 ? 
      (leads.filter(lead => lead.status === 'Opened' || lead.status === 'Clicked' || lead.status === 'Replied').length / totalLeads * 100) : 0;

    return {
      totalLeads,
      validLeads,
      emailsSent,
      openRate: openRate.toFixed(1),
    };
  }, [leads]);

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

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold">{stats.totalLeads}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Valid Leads</p>
                <p className="text-2xl font-bold">{stats.validLeads}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Mail className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Emails Sent</p>
                <p className="text-2xl font-bold">{stats.emailsSent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Open Rate</p>
                <p className="text-2xl font-bold">{stats.openRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Lead Management
          </CardTitle>
          <CardDescription>
            Filter and manage your lead database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
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
                <SelectItem value="Junior">Junior</SelectItem>
                <SelectItem value="Mid-level">Mid-level</SelectItem>
                <SelectItem value="Senior">Senior</SelectItem>
                <SelectItem value="Executive">Executive</SelectItem>
                <SelectItem value="C-level">C-level</SelectItem>
              </SelectContent>
            </Select>

            <Select value={companySizeFilter} onValueChange={setCompanySizeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Company Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sizes</SelectItem>
                <SelectItem value="Small (1-50)">Small (1-50)</SelectItem>
                <SelectItem value="Medium (51-200)">Medium (51-200)</SelectItem>
                <SelectItem value="Large (201-1000)">Large (201-1000)</SelectItem>
                <SelectItem value="Enterprise (1000+)">Enterprise (1000+)</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-muted-foreground flex items-center">
              Showing {filteredLeads.length} of {leads.length} leads
            </div>
          </div>

          {/* Leads Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 font-medium">Name</th>
                    <th className="text-left p-3 font-medium">Email</th>
                    <th className="text-left p-3 font-medium">Company</th>
                    <th className="text-left p-3 font-medium">Title</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Score</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map(lead => (
                    <tr key={lead.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{lead.firstName} {lead.lastName}</div>
                          <div className="text-sm text-muted-foreground">{lead.seniority}</div>
                        </div>
                      </td>
                      <td className="p-3">{lead.email}</td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{lead.company}</div>
                          <div className="text-sm text-muted-foreground">{lead.companySize}</div>
                        </div>
                      </td>
                      <td className="p-3">{lead.title}</td>
                      <td className="p-3">
                        <Badge className={getStatusColor(lead.status)}>
                          {lead.status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all"
                              style={{ width: `${lead.completenessScore}%` }}
                            />
                          </div>
                          <span className="text-sm">{lead.completenessScore}%</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <Button variant="outline" size="sm">
                          Send Email
                        </Button>
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
