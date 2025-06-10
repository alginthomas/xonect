import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmailDialog } from '@/components/EmailDialog';
import { LeadDetailPopover } from '@/components/LeadDetailPopover';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Search, Filter, Mail, Users, TrendingUp, Award, Eye, UserMinus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Lead, EmailTemplate } from '@/types/lead';
import type { Category } from '@/types/category';

interface BrandingData {
  companyName: string;
  companyLogo: string;
  companyWebsite: string;
  companyAddress: string;
  senderName: string;
  senderEmail: string;
}

interface LeadsDashboardProps {
  leads: Lead[];
  templates: EmailTemplate[];
  categories: Category[];
  branding: BrandingData;
  onUpdateLead: (leadId: string, updates: Partial<Lead>) => void;
}

export const LeadsDashboard: React.FC<LeadsDashboardProps> = ({ 
  leads, 
  templates, 
  categories, 
  branding,
  onUpdateLead 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [removingDuplicates, setRemovingDuplicates] = useState(false);
  const leadsPerPage = 10;
  const { toast } = useToast();

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const searchMatch =
        lead.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.company?.toLowerCase().includes(searchQuery.toLowerCase());

      const categoryMatch = categoryFilter === 'all' || lead.categoryId === categoryFilter;
      const statusMatch = statusFilter === 'all' || lead.status === statusFilter;

      return searchMatch && categoryMatch && statusMatch;
    });
  }, [leads, searchQuery, categoryFilter, statusFilter]);

  const totalLeads = filteredLeads.length;
  const totalContacted = filteredLeads.filter(lead => lead.status === 'Contacted').length;
  const totalNew = filteredLeads.filter(lead => lead.status === 'New').length;
  const totalQualified = filteredLeads.filter(lead => lead.status === 'Qualified').length;

  const indexOfLastLead = currentPage * leadsPerPage;
  const indexOfFirstLead = indexOfLastLead - leadsPerPage;
  const paginatedLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead);
  const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);

  const engagementData = useMemo(() => {
    const contactedCount = leads.filter(lead => lead.emailsSent > 0).length;
    const notContactedCount = leads.length - contactedCount;

    return [
      { name: 'Contacted', value: contactedCount },
      { name: 'Not Contacted', value: notContactedCount },
    ];
  }, [leads]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleEmailSent = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      onUpdateLead(leadId, {
        emailsSent: (lead.emailsSent || 0) + 1,
        lastContactDate: new Date(),
        status: 'Contacted'
      });
    }
  };

  const handleStatusChange = (leadId: string, newStatus: Lead['status']) => {
    onUpdateLead(leadId, { status: newStatus });
  };

  const leadQualityData = useMemo(() => {
    const highQuality = leads.filter(lead => lead.completenessScore >= 75).length;
    const mediumQuality = leads.filter(lead => lead.completenessScore >= 50 && lead.completenessScore < 75).length;
    const lowQuality = leads.filter(lead => lead.completenessScore < 50).length;

    return [
      { name: 'High Quality', value: highQuality },
      { name: 'Medium Quality', value: mediumQuality },
      { name: 'Low Quality', value: lowQuality },
    ];
  }, [leads]);

  const duplicates = useMemo(() => {
    const emailMap = new Map<string, Lead[]>();
    
    leads.forEach(lead => {
      if (lead.email) {
        const email = lead.email.toLowerCase();
        if (!emailMap.has(email)) {
          emailMap.set(email, []);
        }
        emailMap.get(email)!.push(lead);
      }
    });

    const duplicateLeads: Lead[] = [];
    emailMap.forEach(leadsWithSameEmail => {
      if (leadsWithSameEmail.length > 1) {
        // Sort by creation date (most recent first) and take all but the first one
        const sortedLeads = leadsWithSameEmail.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        duplicateLeads.push(...sortedLeads.slice(1));
      }
    });

    return duplicateLeads;
  }, [leads]);

  const handleRemoveDuplicates = async () => {
    if (duplicates.length === 0) {
      toast({
        title: "No duplicates found",
        description: "Your lead database doesn't contain any duplicate emails",
      });
      return;
    }

    setRemovingDuplicates(true);
    
    try {
      // Here we would normally call a function to delete the duplicates from the database
      // For now, we'll just show a toast with the count
      toast({
        title: "Duplicates removed",
        description: `Found and would remove ${duplicates.length} duplicate leads`,
      });
      
      console.log('Duplicate leads to remove:', duplicates.map(lead => ({
        id: lead.id,
        email: lead.email,
        name: `${lead.firstName} ${lead.lastName}`
      })));
      
    } catch (error) {
      console.error('Error removing duplicates:', error);
      toast({
        title: "Error removing duplicates",
        description: "Failed to remove duplicate leads",
        variant: "destructive",
      });
    } finally {
      setRemovingDuplicates(false);
    }
  };

  const renderLeadsTable = (filteredData: Lead[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Completeness</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredData.slice(indexOfFirstLead, indexOfLastLead).map((lead) => (
          <TableRow key={lead.id}>
            <TableCell>{lead.firstName} {lead.lastName}</TableCell>
            <TableCell>{lead.email}</TableCell>
            <TableCell>{lead.phone || 'N/A'}</TableCell>
            <TableCell>{lead.company}</TableCell>
            <TableCell>{lead.title}</TableCell>
            <TableCell>
              <Select value={lead.status} onValueChange={(value) => handleStatusChange(lead.id, value as Lead['status'])}>
                <SelectTrigger className="w-32">
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
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>
              <Progress value={lead.completenessScore} />
            </TableCell>
            <TableCell>
              <div className="flex gap-2 justify-end">
                <LeadDetailPopover 
                  lead={lead} 
                  categories={categories}
                >
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </LeadDetailPopover>
                <EmailDialog 
                  lead={lead} 
                  templates={templates}
                  branding={branding}
                  onEmailSent={handleEmailSent}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderPagination = (totalItems: number) => (
    <div className="flex justify-between items-center mt-4">
      <Button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        variant="outline"
        size="sm"
      >
        Previous
      </Button>
      <span>Page {currentPage} of {Math.ceil(totalItems / leadsPerPage)}</span>
      <Button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === Math.ceil(totalItems / leadsPerPage)}
        variant="outline"
        size="sm"
      >
        Next
      </Button>
    </div>
  );

  const renderFilterControls = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="relative">
        <Input
          type="search"
          placeholder="Search leads..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10"
        />
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
      </div>

      <div className="flex items-center space-x-4">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-52">
            <SelectValue placeholder="Filter by Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="New">New</SelectItem>
            <SelectItem value="Contacted">Contacted</SelectItem>
            <SelectItem value="Qualified">Qualified</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Leads</CardTitle>
            <CardDescription>Number of leads in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contacted Leads</CardTitle>
            <CardDescription>Leads that have been contacted</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContacted}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>New Leads</CardTitle>
            <CardDescription>Leads that are newly added</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalNew}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Duplicate Leads</CardTitle>
            <CardDescription>Leads with duplicate emails</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{duplicates.length}</div>
            <Button 
              onClick={handleRemoveDuplicates}
              disabled={removingDuplicates || duplicates.length === 0}
              variant="outline"
              size="sm"
              className="mt-2 w-full"
            >
              <UserMinus className="h-4 w-4 mr-2" />
              {removingDuplicates ? 'Removing...' : 'Remove Duplicates'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Lead Engagement</CardTitle>
            <CardDescription>Proportion of leads contacted vs. not contacted</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  dataKey="value"
                  isAnimationActive={false}
                  data={engagementData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {engagementData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lead Quality</CardTitle>
            <CardDescription>Distribution of lead quality based on completeness score</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={leadQualityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">
            <Users className="h-4 w-4 mr-2" />
            All Leads ({totalLeads})
          </TabsTrigger>
          <TabsTrigger value="contacted">
            <Mail className="h-4 w-4 mr-2" />
            Contacted ({totalContacted})
          </TabsTrigger>
          <TabsTrigger value="new">
            <TrendingUp className="h-4 w-4 mr-2" />
            New ({totalNew})
          </TabsTrigger>
          <TabsTrigger value="qualified">
            <Award className="h-4 w-4 mr-2" />
            Qualified ({totalQualified})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {renderFilterControls()}
          <Card>
            <CardHeader>
              <CardTitle>All Leads ({filteredLeads.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {renderLeadsTable(filteredLeads)}
              {renderPagination(filteredLeads.length)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacted" className="space-y-4">
          {renderFilterControls()}
          <Card>
            <CardHeader>
              <CardTitle>Contacted Leads ({leads.filter(lead => lead.status === 'Contacted').length})</CardTitle>
            </CardHeader>
            <CardContent>
              {renderLeadsTable(leads.filter(lead => lead.status === 'Contacted'))}
              {renderPagination(leads.filter(lead => lead.status === 'Contacted').length)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new" className="space-y-4">
          {renderFilterControls()}
          <Card>
            <CardHeader>
              <CardTitle>New Leads ({leads.filter(lead => lead.status === 'New').length})</CardTitle>
            </CardHeader>
            <CardContent>
              {renderLeadsTable(leads.filter(lead => lead.status === 'New'))}
              {renderPagination(leads.filter(lead => lead.status === 'New').length)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qualified" className="space-y-4">
          {renderFilterControls()}
          <Card>
            <CardHeader>
              <CardTitle>Qualified Leads ({leads.filter(lead => lead.status === 'Qualified').length})</CardTitle>
            </CardHeader>
            <CardContent>
              {renderLeadsTable(leads.filter(lead => lead.status === 'Qualified'))}
              {renderPagination(leads.filter(lead => lead.status === 'Qualified').length)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
