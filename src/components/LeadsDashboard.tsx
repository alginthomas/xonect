import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AppleTable, AppleTableBody, AppleTableCell, AppleTableHead, AppleTableHeader, AppleTableRow } from '@/components/ui/apple-table';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmailDialog } from '@/components/EmailDialog';
import { LeadDetailPopover } from '@/components/LeadDetailPopover';
import { LeadRemarksDialog } from '@/components/LeadRemarksDialog';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Search, Filter, Mail, Users, TrendingUp, Award, Eye, UserMinus, Download, MessageSquare, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { exportLeadsToCSV } from '@/utils/csvExport';
import type { Lead, EmailTemplate } from '@/types/lead';
import type { Category, ImportBatch } from '@/types/category';

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
  importBatches: ImportBatch[];
  branding: BrandingData;
  onUpdateLead: (leadId: string, updates: Partial<Lead>) => void;
  selectedBatchId?: string;
}

const FILTER_STORAGE_KEY = 'leadsDashboard_filters';

export const LeadsDashboard: React.FC<LeadsDashboardProps> = ({ 
  leads, 
  templates, 
  categories, 
  importBatches,
  branding,
  onUpdateLead,
  selectedBatchId 
}) => {
  // Load initial filter states from localStorage
  const loadFiltersFromStorage = () => {
    try {
      const stored = localStorage.getItem(FILTER_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading filters from localStorage:', error);
    }
    return {
      searchQuery: '',
      categoryFilter: 'all',
      statusFilter: 'all',
      batchFilter: selectedBatchId || 'all'
    };
  };

  const initialFilters = loadFiltersFromStorage();
  const [searchQuery, setSearchQuery] = useState(initialFilters.searchQuery);
  const [categoryFilter, setCategoryFilter] = useState(initialFilters.categoryFilter);
  const [statusFilter, setStatusFilter] = useState(initialFilters.statusFilter);
  const [batchFilter, setBatchFilter] = useState(selectedBatchId || initialFilters.batchFilter);
  const [currentPage, setCurrentPage] = useState(1);
  const [removingDuplicates, setRemovingDuplicates] = useState(false);
  const leadsPerPage = 10;
  const { toast } = useToast();

  // Update batch filter when selectedBatchId changes
  useEffect(() => {
    if (selectedBatchId) {
      setBatchFilter(selectedBatchId);
      // Reset other filters when viewing a specific batch
      setSearchQuery('');
      setCategoryFilter('all');
      setStatusFilter('all');
      setCurrentPage(1);
    }
  }, [selectedBatchId]);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    const filters = {
      searchQuery,
      categoryFilter,
      statusFilter,
      batchFilter
    };
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
  }, [searchQuery, categoryFilter, statusFilter, batchFilter]);

  const filteredLeads = useMemo(() => {
    console.log('Filtering leads:', { 
      totalLeads: leads.length, 
      selectedBatchId, 
      batchFilter,
      importBatches: importBatches.map(b => ({ id: b.id, name: b.name, categoryId: b.categoryId }))
    });

    return leads.filter(lead => {
      const searchMatch =
        lead.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.company?.toLowerCase().includes(searchQuery.toLowerCase());

      const categoryMatch = categoryFilter === 'all' || lead.categoryId === categoryFilter;
      const statusMatch = statusFilter === 'all' || lead.status === statusFilter;
      
      // Improved batch filtering logic
      let batchMatch = true;
      if (batchFilter !== 'all') {
        const selectedBatch = importBatches.find(batch => batch.id === batchFilter);
        if (selectedBatch) {
          // Filter leads that belong to the selected batch's category
          batchMatch = lead.categoryId === selectedBatch.categoryId;
        } else {
          batchMatch = false;
        }
      }

      const result = searchMatch && categoryMatch && statusMatch && batchMatch;
      
      if (batchFilter !== 'all') {
        console.log(`Lead ${lead.firstName} ${lead.lastName}:`, {
          leadCategoryId: lead.categoryId,
          batchCategoryId: importBatches.find(b => b.id === batchFilter)?.categoryId,
          matches: result
        });
      }

      return result;
    });
  }, [leads, searchQuery, categoryFilter, statusFilter, batchFilter, importBatches]);

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

  const handleUpdateRemarks = (leadId: string, remarks: string) => {
    onUpdateLead(leadId, { remarks });
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
      const duplicateIds = duplicates.map(lead => lead.id);
      
      const { data, error } = await supabase.rpc('delete_duplicate_leads', {
        lead_ids: duplicateIds
      });

      if (error) throw error;
      
      toast({
        title: "Duplicates removed",
        description: `Successfully removed ${data} duplicate leads`,
      });
      
      window.location.reload();
      
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

  const handleExportLeads = (leadsToExport: Lead[], filterDescription: string = '') => {
    if (leadsToExport.length === 0) {
      toast({
        title: "No leads to export",
        description: "There are no leads matching your current filters",
        variant: "destructive",
      });
      return;
    }

    const filename = filterDescription 
      ? `leads-${filterDescription.toLowerCase().replace(/\s+/g, '-')}`
      : 'leads-export';
    
    exportLeadsToCSV(leadsToExport, categories, filename);
    
    toast({
      title: "Export successful",
      description: `Exported ${leadsToExport.length} leads to CSV file`,
    });
  };

  const getBatchName = (batchId: string) => {
    const batch = importBatches.find(b => b.id === batchId);
    return batch?.name || 'Unknown Batch';
  };

  const renderLeadsTable = (filteredData: Lead[]) => (
    <AppleTable>
      <AppleTableHeader>
        <AppleTableRow>
          <AppleTableHead>Name</AppleTableHead>
          <AppleTableHead>Email</AppleTableHead>
          <AppleTableHead>Phone</AppleTableHead>
          <AppleTableHead>Company</AppleTableHead>
          <AppleTableHead>Title</AppleTableHead>
          <AppleTableHead>Status</AppleTableHead>
          <AppleTableHead>Quality</AppleTableHead>
          <AppleTableHead>Industry</AppleTableHead>
          <AppleTableHead>Location</AppleTableHead>
          <AppleTableHead>Department</AppleTableHead>
          <AppleTableHead>LinkedIn</AppleTableHead>
          <AppleTableHead>Organization Website</AppleTableHead>
          <AppleTableHead>Actions</AppleTableHead>
        </AppleTableRow>
      </AppleTableHeader>
      <AppleTableBody>
        {filteredData.slice(indexOfFirstLead, indexOfLastLead).map((lead) => (
          <AppleTableRow key={lead.id}>
            <AppleTableCell className="font-medium">
              <div className="flex flex-col">
                <span className="font-semibold">{lead.firstName} {lead.lastName}</span>
              </div>
            </AppleTableCell>
            <AppleTableCell className="text-muted-foreground">
              {lead.email}
            </AppleTableCell>
            <AppleTableCell className="text-muted-foreground">
              {lead.phone || 'N/A'}
            </AppleTableCell>
            <AppleTableCell className="font-medium">
              {lead.company}
            </AppleTableCell>
            <AppleTableCell className="text-muted-foreground">
              {lead.title}
            </AppleTableCell>
            <AppleTableCell>
              <Select value={lead.status} onValueChange={(value) => handleStatusChange(lead.id, value as Lead['status'])}>
                <SelectTrigger className="w-32 h-8 text-xs font-medium">
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
            </AppleTableCell>
            <AppleTableCell>
              <div className="flex items-center gap-2">
                <Progress value={lead.completenessScore} className="w-16" />
                <span className="text-xs text-muted-foreground font-medium">{lead.completenessScore}%</span>
              </div>
            </AppleTableCell>
            <AppleTableCell className="text-muted-foreground">
              {lead.industry || 'N/A'}
            </AppleTableCell>
            <AppleTableCell className="text-muted-foreground">
              {lead.location || 'N/A'}
            </AppleTableCell>
            <AppleTableCell className="text-muted-foreground">
              {lead.department || 'N/A'}
            </AppleTableCell>
            <AppleTableCell className="text-muted-foreground">
              {lead.linkedin ? (
                <a href={lead.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  LinkedIn
                </a>
              ) : 'N/A'}
            </AppleTableCell>
            <AppleTableCell className="text-muted-foreground">
              {lead.organizationWebsite ? (
                <a href={lead.organizationWebsite} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Website
                </a>
              ) : 'N/A'}
            </AppleTableCell>
            <AppleTableCell>
              <div className="flex gap-1 justify-end">
                <LeadDetailPopover 
                  lead={lead} 
                  categories={categories}
                >
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Eye className="h-4 w-4" />
                  </Button>
                </LeadDetailPopover>
                <LeadRemarksDialog
                  lead={lead}
                  onUpdateRemarks={handleUpdateRemarks}
                >
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className={`h-8 w-8 p-0 ${lead.remarks ? "text-primary" : ""}`}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </LeadRemarksDialog>
                <EmailDialog 
                  lead={lead} 
                  templates={templates}
                  branding={branding}
                  onEmailSent={handleEmailSent}
                />
              </div>
            </AppleTableCell>
          </AppleTableRow>
        ))}
      </AppleTableBody>
    </AppleTable>
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

  const renderFilterControls = (leadsData?: Lead[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
        <SelectTrigger>
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
        <SelectTrigger>
          <SelectValue placeholder="Filter by Status" />
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
          <SelectItem value="Call Back">Call Back</SelectItem>
          <SelectItem value="Unresponsive">Unresponsive</SelectItem>
          <SelectItem value="Not Interested">Not Interested</SelectItem>
          <SelectItem value="Interested">Interested</SelectItem>
        </SelectContent>
      </Select>

      <Select value={batchFilter} onValueChange={setBatchFilter}>
        <SelectTrigger>
          <SelectValue placeholder="Filter by Import Batch" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Import Batches</SelectItem>
          {importBatches.map(batch => (
            <SelectItem key={batch.id} value={batch.id}>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                {batch.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="lg:col-span-2 flex gap-2">
        <Button 
          onClick={() => handleExportLeads(leadsData || filteredLeads, getFilterDescription())}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
        
        {batchFilter !== 'all' && (
          <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
            <Package className="h-3 w-3" />
            Batch: {getBatchName(batchFilter)}
          </Badge>
        )}
      </div>
    </div>
  );

  const getFilterDescription = () => {
    const parts = [];
    if (searchQuery) parts.push(`search-${searchQuery}`);
    if (categoryFilter !== 'all') {
      const category = categories.find(c => c.id === categoryFilter);
      if (category) parts.push(`category-${category.name}`);
    }
    if (statusFilter !== 'all') parts.push(`status-${statusFilter}`);
    if (batchFilter !== 'all') {
      const batch = importBatches.find(b => b.id === batchFilter);
      if (batch) parts.push(`batch-${batch.name}`);
    }
    return parts.join('-') || 'all';
  };

  console.log('Rendering LeadsDashboard with filteredLeads:', filteredLeads.length);

  return (
    <div className="space-y-8">
      {/* Show batch-specific header when viewing a specific batch */}
      {selectedBatchId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-blue-900">
              Viewing leads from: {getBatchName(selectedBatchId)}
            </h2>
          </div>
          <p className="text-sm text-blue-700 mt-1">
            Showing {filteredLeads.length} leads from this import batch
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="apple-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Leads</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              leads in system
            </p>
          </CardContent>
        </Card>

        <Card className="apple-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Contacted</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-green-600">{totalContacted}</div>
            <p className="text-xs text-muted-foreground">
              leads contacted
            </p>
          </CardContent>
        </Card>

        <Card className="apple-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">New Leads</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-blue-600">{totalNew}</div>
            <p className="text-xs text-muted-foreground">
              newly added
            </p>
          </CardContent>
        </Card>

        <Card className="apple-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Duplicates</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-orange-600">{duplicates.length}</div>
            <Button 
              onClick={handleRemoveDuplicates}
              disabled={removingDuplicates || duplicates.length === 0}
              variant="outline"
              size="sm"
              className="mt-2 w-full h-8 text-xs"
            >
              <UserMinus className="h-3 w-3 mr-1" />
              {removingDuplicates ? 'Removing...' : 'Remove'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Only show charts if not viewing a specific batch or if there are leads to show */}
      {(!selectedBatchId || filteredLeads.length > 0) && (
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
      )}

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
          {renderFilterControls(filteredLeads)}
          <Card>
            <CardHeader>
              <CardTitle>All Leads ({filteredLeads.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredLeads.length > 0 ? (
                <>
                  {renderLeadsTable(filteredLeads)}
                  {renderPagination(filteredLeads.length)}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {selectedBatchId ? (
                    <div>
                      <Package className="mx-auto h-12 w-12 mb-4 text-muted-foreground/50" />
                      <p>No leads found in this import batch.</p>
                      <p className="text-sm mt-2">The batch might be empty or leads may have been categorized differently.</p>
                    </div>
                  ) : (
                    <div>
                      <Users className="mx-auto h-12 w-12 mb-4 text-muted-foreground/50" />
                      <p>No leads match your current filters.</p>
                      <p className="text-sm mt-2">Try adjusting your search criteria or clear some filters.</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacted" className="space-y-4">
          {renderFilterControls(leads.filter(lead => lead.status === 'Contacted'))}
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
          {renderFilterControls(leads.filter(lead => lead.status === 'New'))}
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
          {renderFilterControls(leads.filter(lead => lead.status === 'Qualified'))}
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

export default LeadsDashboard;
