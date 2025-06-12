import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AppleTable, AppleTableHeader, AppleTableBody, AppleTableHead, AppleTableRow, AppleTableCell } from '@/components/ui/apple-table';
import { LeadSidebar } from '@/components/LeadSidebar';
import { QuickStatusEditor } from '@/components/QuickStatusEditor';
import { QuickRemarksCell } from '@/components/QuickRemarksCell';
import { QuickActionsCell } from '@/components/QuickActionsCell';
import { EmailDialog } from '@/components/EmailDialog';
import {
  Search,
  Download,
  Users,
  Mail,
  Phone,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRightIcon,
  Filter,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { exportLeadsToCSV } from '@/utils/csvExport';
import type { Lead, EmailTemplate, LeadStatus } from '@/types/lead';
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
  onDeleteLead: (leadId: string) => void;
  onBulkUpdateStatus: (leadIds: string[], status: LeadStatus) => void;
  onBulkDelete: (leadIds: string[]) => void;
  onSendEmail: (leadId: string) => void;
  selectedBatchId?: string | null;
  onCreateCategory?: (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

export const LeadsDashboard: React.FC<LeadsDashboardProps> = ({
  leads,
  templates,
  categories,
  importBatches,
  branding,
  onUpdateLead,
  onDeleteLead,
  onBulkUpdateStatus,
  onBulkDelete,
  onSendEmail,
  selectedBatchId,
  onCreateCategory
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dataAvailabilityFilter, setDataAvailabilityFilter] = useState<string>('all');
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const saved = localStorage.getItem('leadsPerPage');
    return saved ? parseInt(saved) : 25;
  });
  
  // Sidebar state
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  
  // Email dialog state
  const [selectedLeadForEmail, setSelectedLeadForEmail] = useState<Lead | null>(null);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  
  const { toast } = useToast();

  // Persist items per page setting
  useEffect(() => {
    localStorage.setItem('leadsPerPage', itemsPerPage.toString());
  }, [itemsPerPage]);

  // All available statuses for filtering
  const allStatuses: LeadStatus[] = [
    'New', 'Contacted', 'Opened', 'Clicked', 'Replied', 
    'Qualified', 'Unqualified', 'Call Back', 'Unresponsive', 
    'Not Interested', 'Interested'
  ];

  // Filter leads based on batch selection and other filters
  const filteredLeads = useMemo(() => {
    console.log('Filtering leads:', { 
      totalLeads: leads.length, 
      selectedBatchId, 
      searchTerm, 
      statusFilter, 
      categoryFilter, 
      dataAvailabilityFilter 
    });
    
    let filtered = leads;

    // Filter by selected batch
    if (selectedBatchId) {
      filtered = filtered.filter(lead => lead.importBatchId === selectedBatchId);
      console.log('After batch filter:', filtered.length);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(lead =>
        lead.firstName?.toLowerCase().includes(term) ||
        lead.lastName?.toLowerCase().includes(term) ||
        lead.email?.toLowerCase().includes(term) ||
        lead.company?.toLowerCase().includes(term) ||
        lead.title?.toLowerCase().includes(term)
      );
      console.log('After search filter:', filtered.length);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
      console.log('After status filter:', filtered.length);
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(lead => lead.categoryId === categoryFilter);
      console.log('After category filter:', filtered.length);
    }

    // Filter by data availability
    if (dataAvailabilityFilter === 'has-phone') {
      filtered = filtered.filter(lead => lead.phone && lead.phone.trim() !== '');
    } else if (dataAvailabilityFilter === 'has-email') {
      filtered = filtered.filter(lead => lead.email && lead.email.trim() !== '');
    } else if (dataAvailabilityFilter === 'has-both') {
      filtered = filtered.filter(lead => 
        lead.phone && lead.phone.trim() !== '' && 
        lead.email && lead.email.trim() !== ''
      );
    }

    console.log('Final filtered count:', filtered.length);
    return filtered;
  }, [leads, selectedBatchId, searchTerm, statusFilter, categoryFilter, dataAvailabilityFilter]);

  // Sort leads
  const sortedLeads = useMemo(() => {
    return [...filteredLeads].sort((a, b) => {
      let aValue: any = a[sortField as keyof Lead];
      let bValue: any = b[sortField as keyof Lead];

      if (aValue instanceof Date) aValue = aValue.getTime();
      if (bValue instanceof Date) bValue = bValue.getTime();

      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredLeads, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLeads = sortedLeads.slice(startIndex, startIndex + itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, categoryFilter, dataAvailabilityFilter, selectedBatchId]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = useCallback(() => {
    const currentPageLeadIds = paginatedLeads.map(lead => lead.id);
    const allCurrentSelected = currentPageLeadIds.every(id => selectedLeads.has(id));
    
    if (allCurrentSelected) {
      setSelectedLeads(prev => {
        const newSet = new Set(prev);
        currentPageLeadIds.forEach(id => newSet.delete(id));
        return newSet;
      });
    } else {
      setSelectedLeads(prev => new Set([...prev, ...currentPageLeadIds]));
    }
  }, [paginatedLeads, selectedLeads]);

  const handleSelectLead = (leadId: string, checked: boolean) => {
    setSelectedLeads(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(leadId);
      } else {
        newSet.delete(leadId);
      }
      return newSet;
    });
  };

  const handleBulkAction = async (action: 'delete' | 'status', value?: string) => {
    if (selectedLeads.size === 0) {
      toast({
        title: 'No leads selected',
        description: 'Please select leads to perform bulk actions.',
        variant: 'destructive',
      });
      return;
    }

    const leadIds = Array.from(selectedLeads);

    try {
      if (action === 'delete') {
        await onBulkDelete(leadIds);
        toast({
          title: 'Leads deleted',
          description: `${leadIds.length} leads have been deleted.`,
        });
      } else if (action === 'status' && value) {
        await onBulkUpdateStatus(leadIds, value as LeadStatus);
        toast({
          title: 'Status updated',
          description: `${leadIds.length} leads status updated to ${value}.`,
        });
      }
      setSelectedLeads(new Set());
    } catch (error) {
      toast({
        title: 'Action failed',
        description: 'Failed to perform bulk action. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleExport = () => {
    const leadsToExport = selectedLeads.size > 0 
      ? sortedLeads.filter(lead => selectedLeads.has(lead.id))
      : sortedLeads;
    
    exportLeadsToCSV(leadsToExport, categories);
    toast({
      title: 'Export successful',
      description: `${leadsToExport.length} leads exported to CSV.`,
    });
  };

  const openLeadSidebar = (lead: Lead) => {
    setSelectedLead(lead);
    setShowSidebar(true);
  };

  const closeSidebar = () => {
    setShowSidebar(false);
    setSelectedLead(null);
  };

  const handleStatusChange = async (leadId: string, status: LeadStatus) => {
    try {
      await onUpdateLead(leadId, { status });
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

  const handleRemarksUpdate = async (leadId: string, remarks: string) => {
    try {
      await onUpdateLead(leadId, { remarks });
      toast({
        title: 'Remarks updated',
        description: 'Lead remarks have been updated.',
      });
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Failed to update remarks. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getBatchName = (batchId: string | undefined) => {
    if (!batchId) return 'Direct Entry';
    const batch = importBatches.find(b => b.id === batchId);
    return batch ? batch.name : 'Unknown Batch';
  };

  const getCategoryInfo = (categoryId: string | undefined) => {
    if (!categoryId) return { name: 'Uncategorized', color: '#6B7280' };
    const category = categories.find(c => c.id === categoryId);
    return category ? { name: category.name, color: category.color } : { name: 'Unknown', color: '#6B7280' };
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

  // Calculate checkbox state for select all
  const currentPageLeadIds = paginatedLeads.map(lead => lead.id);
  const selectedCurrentPageCount = currentPageLeadIds.filter(id => selectedLeads.has(id)).length;
  const isAllCurrentPageSelected = currentPageLeadIds.length > 0 && selectedCurrentPageCount === currentPageLeadIds.length;
  const isPartialSelection = selectedCurrentPageCount > 0 && selectedCurrentPageCount < currentPageLeadIds.length;

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search leads by name, email, company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {allStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dataAvailabilityFilter} onValueChange={setDataAvailabilityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Data Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Leads</SelectItem>
                <SelectItem value="has-phone">Has Phone</SelectItem>
                <SelectItem value="has-email">Has Email</SelectItem>
                <SelectItem value="has-both">Has Both</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleExport} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedLeads.size > 0 && (
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <span className="text-sm font-medium">
              {selectedLeads.size} lead{selectedLeads.size > 1 ? 's' : ''} selected
            </span>
            
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Update Status
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {allStatuses.map((status) => (
                    <DropdownMenuItem key={status} onClick={() => handleBulkAction('status', status)}>
                      Mark as {status}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleBulkAction('delete')}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show</span>
            <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(parseInt(value))}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">per page</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Showing {Math.min(startIndex + 1, filteredLeads.length)} to {Math.min(startIndex + itemsPerPage, filteredLeads.length)} of {filteredLeads.length} leads
            </span>
            
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className="flex items-center px-3 text-sm">
                {currentPage} of {Math.max(1, Math.ceil(filteredLeads.length / itemsPerPage))}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredLeads.length / itemsPerPage), prev + 1))}
                disabled={currentPage >= Math.ceil(filteredLeads.length / itemsPerPage)}
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Leads Overview
            {selectedBatchId && (
              <Badge variant="secondary">
                Batch: {getBatchName(selectedBatchId)}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''} found
            {selectedLeads.size > 0 && ` (${selectedLeads.size} selected)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AppleTable>
            <AppleTableHeader>
              <AppleTableRow>
                <AppleTableHead className="w-12">
                  <Checkbox
                    checked={isAllCurrentPageSelected}
                    ref={(el) => {
                      if (el) {
                        (el as any).indeterminate = isPartialSelection;
                      }
                    }}
                    onCheckedChange={handleSelectAll}
                  />
                </AppleTableHead>
                <AppleTableHead 
                  className="cursor-pointer hover:bg-muted/50 w-24"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-2">
                    Status
                    {sortField === 'status' && (
                      sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </AppleTableHead>
                <AppleTableHead className="w-48">
                  Quick Remarks
                </AppleTableHead>
                <AppleTableHead className="w-32">
                  Actions
                </AppleTableHead>
                <AppleTableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('firstName')}
                >
                  <div className="flex items-center gap-2">
                    Name
                    {sortField === 'firstName' && (
                      sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </AppleTableHead>
                <AppleTableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('company')}
                >
                  <div className="flex items-center gap-2">
                    Company
                    {sortField === 'company' && (
                      sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </AppleTableHead>
                <AppleTableHead>Contact</AppleTableHead>
                <AppleTableHead>Category</AppleTableHead>
                <AppleTableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center gap-2">
                    Created
                    {sortField === 'createdAt' && (
                      sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </AppleTableHead>
              </AppleTableRow>
            </AppleTableHeader>
            <AppleTableBody>
              {paginatedLeads.map((lead) => {
                const category = getCategoryInfo(lead.categoryId);
                
                return (
                  <AppleTableRow 
                    key={lead.id}
                    className="group hover:bg-muted/50 cursor-pointer"
                    onClick={() => openLeadSidebar(lead)}
                  >
                    <AppleTableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedLeads.has(lead.id)}
                        onCheckedChange={(checked) => handleSelectLead(lead.id, checked as boolean)}
                      />
                    </AppleTableCell>
                    
                    <AppleTableCell onClick={(e) => e.stopPropagation()}>
                      <QuickStatusEditor
                        status={lead.status}
                        onChange={(status) => handleStatusChange(lead.id, status)}
                      />
                    </AppleTableCell>
                    
                    <AppleTableCell onClick={(e) => e.stopPropagation()}>
                      <QuickRemarksCell
                        remarks={lead.remarks || ''}
                        onUpdate={(remarks) => handleRemarksUpdate(lead.id, remarks)}
                      />
                    </AppleTableCell>
                    
                    <AppleTableCell onClick={(e) => e.stopPropagation()}>
                      <QuickActionsCell
                        lead={lead}
                        onEmailClick={() => {
                          setSelectedLeadForEmail(lead);
                          setShowEmailDialog(true);
                        }}
                        onViewDetails={() => openLeadSidebar(lead)}
                        onDeleteLead={() => onDeleteLead(lead.id)}
                      />
                    </AppleTableCell>
                    
                    <AppleTableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={lead.photoUrl} alt={`${lead.firstName} ${lead.lastName}`} />
                          <AvatarFallback>
                            {lead.firstName.charAt(0)}{lead.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {lead.firstName} {lead.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {lead.title}
                          </div>
                        </div>
                      </div>
                    </AppleTableCell>
                    
                    <AppleTableCell>
                      <div>
                        <div className="font-medium">{lead.company}</div>
                        <div className="flex gap-1 mt-1">
                          <Badge variant="outline" className={getSizeColor(lead.companySize)}>
                            {lead.companySize.replace(/\s*\([^)]*\)/, '')}
                          </Badge>
                        </div>
                      </div>
                    </AppleTableCell>
                    
                    <AppleTableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3" />
                          <span className="truncate max-w-[200px]">{lead.email}</span>
                        </div>
                        {lead.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3" />
                            <span>{lead.phone}</span>
                          </div>
                        )}
                      </div>
                    </AppleTableCell>
                    
                    <AppleTableCell>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm">{category.name}</span>
                      </div>
                    </AppleTableCell>
                    
                    <AppleTableCell>
                      <div className="text-sm text-muted-foreground">
                        {format(lead.createdAt, 'MMM dd, yyyy')}
                      </div>
                    </AppleTableCell>
                  </AppleTableRow>
                );
              })}
            </AppleTableBody>
          </AppleTable>

          {paginatedLeads.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No leads found</h3>
              <p>Try adjusting your search criteria or filters.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sidebar for Lead Details */}
      <LeadSidebar
        lead={selectedLead}
        isOpen={showSidebar}
        onClose={closeSidebar}
        categories={categories}
        onUpdateLead={onUpdateLead}
        onCreateCategory={onCreateCategory}
      />

      {/* Email Dialog */}
      {selectedLeadForEmail && (
        <EmailDialog
          lead={selectedLeadForEmail}
          templates={templates}
          branding={branding}
          onEmailSent={(leadId) => {
            onSendEmail(leadId);
            setShowEmailDialog(false);
            setSelectedLeadForEmail(null);
          }}
        />
      )}
    </div>
  );
};
