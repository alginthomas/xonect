import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AppleTable, AppleTableHeader, AppleTableBody, AppleTableHead, AppleTableRow, AppleTableCell } from '@/components/ui/apple-table';
import { LeadRemarksDialog } from '@/components/LeadRemarksDialog';
import { QuickRemarkEditor } from '@/components/QuickRemarkEditor';
import { EmailDialog } from '@/components/EmailDialog';
import {
  Search,
  Download,
  Users,
  Mail,
  Phone,
  MessageSquare,
  Trash2,
  MoreHorizontal,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Globe,
  Linkedin,
  MapPin,
  Building,
  Calendar,
  Briefcase,
  Target,
  Tag,
  X,
  Eye,
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
  categories: Category[];
  templates: EmailTemplate[];
  importBatches: ImportBatch[];
  branding: BrandingData;
  onUpdateLead: (leadId: string, updates: Partial<Lead>) => void;
  selectedBatchId?: string | null;
  onDeleteLead?: (leadId: string) => void;
  onBulkUpdateStatus?: (leadIds: string[], status: LeadStatus) => void;
  onBulkDelete?: (leadIds: string[]) => void;
  onSendEmail?: (leadId: string) => void;
}

export const LeadsDashboard: React.FC<LeadsDashboardProps> = ({
  leads = [],
  categories = [],
  templates = [],
  importBatches = [],
  branding,
  onUpdateLead,
  selectedBatchId,
  onDeleteLead,
  onBulkUpdateStatus,
  onBulkDelete,
  onSendEmail,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [selectedLeadForPanel, setSelectedLeadForPanel] = useState<Lead | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<keyof Lead | null>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const { toast } = useToast();

  const handleSort = (field: keyof Lead) => {
    setSortField(field);
    setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const openLeadPanel = (lead: Lead) => {
    setSelectedLeadForPanel(lead);
    setIsPanelOpen(true);
  };

  const closeLeadPanel = () => {
    setIsPanelOpen(false);
    setSelectedLeadForPanel(null);
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId || !categories || !Array.isArray(categories)) return 'Uncategorized';
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Unknown Category';
  };

  const getStatusBadgeVariant = (status: LeadStatus) => {
    switch (status) {
      case 'New':
        return 'secondary';
      case 'Contacted':
        return 'default';
      case 'Opened':
        return 'outline';
      case 'Clicked':
        return 'outline';
      case 'Replied':
        return 'default';
      case 'Qualified':
        return 'default';
      case 'Unqualified':
        return 'destructive';
      case 'Call Back':
        return 'outline';
      case 'Unresponsive':
        return 'secondary';
      case 'Not Interested':
        return 'destructive';
      case 'Interested':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getStatusBadgeColor = (status: LeadStatus) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800';
      case 'Contacted':
        return 'bg-yellow-100 text-yellow-800';
      case 'Opened':
        return 'bg-green-100 text-green-800';
      case 'Clicked':
        return 'bg-purple-100 text-purple-800';
      case 'Replied':
        return 'bg-emerald-100 text-emerald-800';
      case 'Qualified':
        return 'bg-green-500 text-white';
      case 'Unqualified':
        return 'bg-red-500 text-white';
      case 'Call Back':
        return 'bg-orange-100 text-orange-800';
      case 'Unresponsive':
        return 'bg-gray-100 text-gray-800';
      case 'Not Interested':
        return 'bg-red-100 text-red-800';
      case 'Interested':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const sortedAndFilteredLeads = useMemo(() => {
    let filteredLeads = leads.filter(lead => {
      const searchRegex = new RegExp(searchQuery, 'i');
      const matchesSearch =
        searchRegex.test(lead.firstName) ||
        searchRegex.test(lead.lastName) ||
        searchRegex.test(lead.company) ||
        searchRegex.test(lead.title) ||
        searchRegex.test(lead.email);

      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || lead.categoryId === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });

    if (sortField) {
      filteredLeads = [...filteredLeads].sort((a, b) => {
        const aValue = a[sortField] || '';
        const bValue = b[sortField] || '';

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        } else {
          if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
          return 0;
        }
      });
    }

    return filteredLeads;
  }, [leads, searchQuery, statusFilter, categoryFilter, sortField, sortDirection]);

  const totalItems = sortedAndFilteredLeads.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentPageLeads = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedAndFilteredLeads.slice(startIndex, endIndex);
  }, [sortedAndFilteredLeads, page, itemsPerPage]);

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    onUpdateLead(leadId, { status: newStatus });
    toast({
      title: "Lead status updated",
      description: `Lead status updated to ${newStatus}`,
    });
  };

  const handleUpdateRemarks = async (leadId: string, remarks: string) => {
    onUpdateLead(leadId, { remarks: remarks });
    toast({
      title: "Lead remarks updated",
      description: "Lead remarks updated successfully",
    });
  };

  const handleSelectLead = (leadId: string) => {
    setSelectedLeads(prev => {
      if (prev.includes(leadId)) {
        return prev.filter(id => id !== leadId);
      } else {
        return [...prev, leadId];
      }
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(currentPageLeads.map(lead => lead.id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleBulkStatusUpdate = (status: LeadStatus) => {
    if (selectedLeads.length === 0) {
      toast({
        title: "No leads selected",
        description: "Please select leads to update status",
        variant: "destructive",
      });
      return;
    }

    if (onBulkUpdateStatus) {
      onBulkUpdateStatus(selectedLeads, status);
      setSelectedLeads([]);
      toast({
        title: "Leads status updated",
        description: `Updated status of ${selectedLeads.length} leads to ${status}`,
      });
    }
  };

  const handleBulkDelete = () => {
    if (selectedLeads.length === 0) {
      toast({
        title: "No leads selected",
        description: "Please select leads to delete",
        variant: "destructive",
      });
      return;
    }

    if (onBulkDelete) {
      onBulkDelete(selectedLeads);
      setSelectedLeads([]);
      toast({
        title: "Leads deleted",
        description: `Deleted ${selectedLeads.length} leads`,
      });
    }
  };

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast({ description: message });
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          type="search"
          placeholder="Search leads..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <Select value={statusFilter} onValueChange={(value: LeadStatus | 'all') => setStatusFilter(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
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

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions */}
      {selectedLeads.length > 0 && (
        <div className="flex items-center gap-2">
          <Select onValueChange={(value: LeadStatus) => handleBulkStatusUpdate(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Update Status" />
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
          <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
            Delete ({selectedLeads.length})
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                Leads ({sortedAndFilteredLeads.length})
              </CardTitle>
              <CardDescription>
                Manage and track your leads
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportLeadsToCSV(sortedAndFilteredLeads, categories)}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sortedAndFilteredLeads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No leads found</h3>
              <p>
                {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'Import some leads to get started.'}
              </p>
            </div>
          ) : (
            <AppleTable>
              <AppleTableHeader>
                <AppleTableRow>
                  <AppleTableHead className="w-12">
                    <Checkbox
                      checked={selectedLeads.length === sortedAndFilteredLeads.length && sortedAndFilteredLeads.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </AppleTableHead>
                  <AppleTableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('firstName')}
                      className="h-auto p-0 font-semibold text-xs uppercase tracking-wider"
                    >
                      Name
                      {sortField === 'firstName' && (
                        sortDirection === 'asc' ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />
                      )}
                    </Button>
                  </AppleTableHead>
                  <AppleTableHead>Actions</AppleTableHead>
                  <AppleTableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('status')}
                      className="h-auto p-0 font-semibold text-xs uppercase tracking-wider"
                    >
                      Status
                      {sortField === 'status' && (
                        sortDirection === 'asc' ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />
                      )}
                    </Button>
                  </AppleTableHead>
                  <AppleTableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('company')}
                      className="h-auto p-0 font-semibold text-xs uppercase tracking-wider"
                    >
                      Company
                      {sortField === 'company' && (
                        sortDirection === 'asc' ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />
                      )}
                    </Button>
                  </AppleTableHead>
                  <AppleTableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('title')}
                      className="h-auto p-0 font-semibold text-xs uppercase tracking-wider"
                    >
                      Title
                      {sortField === 'title' && (
                        sortDirection === 'asc' ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />
                      )}
                    </Button>
                  </AppleTableHead>
                  <AppleTableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('email')}
                      className="h-auto p-0 font-semibold text-xs uppercase tracking-wider"
                    >
                      Email
                      {sortField === 'email' && (
                        sortDirection === 'asc' ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />
                      )}
                    </Button>
                  </AppleTableHead>
                  <AppleTableHead>Category</AppleTableHead>
                  <AppleTableHead>Remarks</AppleTableHead>
                  <AppleTableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('createdAt')}
                      className="h-auto p-0 font-semibold text-xs uppercase tracking-wider"
                    >
                      Created
                      {sortField === 'createdAt' && (
                        sortDirection === 'asc' ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />
                      )}
                    </Button>
                  </AppleTableHead>
                </AppleTableRow>
              </AppleTableHeader>
              <AppleTableBody>
                {currentPageLeads.map((lead) => (
                  <AppleTableRow key={lead.id}>
                    <AppleTableCell>
                      <Checkbox
                        checked={selectedLeads.includes(lead.id)}
                        onCheckedChange={() => handleSelectLead(lead.id)}
                      />
                    </AppleTableCell>
                    <AppleTableCell>
                      <div className="flex items-center gap-3">
                        <Button 
                          variant="ghost" 
                          className="h-auto p-0 text-left"
                          onClick={() => openLeadPanel(lead)}
                        >
                          <div>
                            <div className="font-medium">
                              {lead.firstName} {lead.lastName}
                            </div>
                            {lead.phone && (
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {lead.phone}
                              </div>
                            )}
                          </div>
                        </Button>
                      </div>
                    </AppleTableCell>
                    <AppleTableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openLeadPanel(lead)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <QuickRemarkEditor
                          lead={lead}
                          onUpdateRemarks={handleUpdateRemarks}
                        />
                        <EmailDialog
                          lead={lead}
                          templates={templates}
                          branding={branding}
                          onEmailSent={onSendEmail}
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => copyToClipboard(lead.email, 'Email copied')}>
                              <Mail className="mr-2 h-4 w-4" />
                              Copy email
                            </DropdownMenuItem>
                            {lead.phone && (
                              <DropdownMenuItem onClick={() => copyToClipboard(lead.phone, 'Phone copied')}>
                                <Phone className="mr-2 h-4 w-4" />
                                Copy phone
                              </DropdownMenuItem>
                            )}
                            {lead.linkedin && (
                              <DropdownMenuItem onClick={() => window.open(lead.linkedin, '_blank')}>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                LinkedIn
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <LeadRemarksDialog
                              lead={lead}
                              onUpdateRemarks={handleUpdateRemarks}
                            >
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Edit remarks
                              </DropdownMenuItem>
                            </LeadRemarksDialog>
                            <DropdownMenuSeparator />
                            {onDeleteLead && (
                              <DropdownMenuItem
                                onClick={() => onDeleteLead(lead.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </AppleTableCell>
                    <AppleTableCell>
                      <Select
                        value={lead.status}
                        onValueChange={(newStatus: LeadStatus) => handleStatusChange(lead.id, newStatus)}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="New">
                            <Badge className={getStatusBadgeColor('New')}>New</Badge>
                          </SelectItem>
                          <SelectItem value="Contacted">
                            <Badge className={getStatusBadgeColor('Contacted')}>Contacted</Badge>
                          </SelectItem>
                          <SelectItem value="Opened">
                            <Badge className={getStatusBadgeColor('Opened')}>Opened</Badge>
                          </SelectItem>
                          <SelectItem value="Clicked">
                            <Badge className={getStatusBadgeColor('Clicked')}>Clicked</Badge>
                          </SelectItem>
                          <SelectItem value="Replied">
                            <Badge className={getStatusBadgeColor('Replied')}>Replied</Badge>
                          </SelectItem>
                          <SelectItem value="Qualified">
                            <Badge className={getStatusBadgeColor('Qualified')}>Qualified</Badge>
                          </SelectItem>
                          <SelectItem value="Unqualified">
                            <Badge className={getStatusBadgeColor('Unqualified')}>Unqualified</Badge>
                          </SelectItem>
                          <SelectItem value="Call Back">
                            <Badge className={getStatusBadgeColor('Call Back')}>Call Back</Badge>
                          </SelectItem>
                          <SelectItem value="Unresponsive">
                            <Badge className={getStatusBadgeColor('Unresponsive')}>Unresponsive</Badge>
                          </SelectItem>
                          <SelectItem value="Not Interested">
                            <Badge className={getStatusBadgeColor('Not Interested')}>Not Interested</Badge>
                          </SelectItem>
                          <SelectItem value="Interested">
                            <Badge className={getStatusBadgeColor('Interested')}>Interested</Badge>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </AppleTableCell>
                    <AppleTableCell>
                      <div className="font-medium">{lead.company}</div>
                      {lead.industry && (
                        <div className="text-sm text-muted-foreground">{lead.industry}</div>
                      )}
                    </AppleTableCell>
                    <AppleTableCell>
                      <div className="font-medium">{lead.title}</div>
                      {lead.department && (
                        <div className="text-sm text-muted-foreground">{lead.department}</div>
                      )}
                    </AppleTableCell>
                    <AppleTableCell>
                      <div className="font-medium">{lead.email}</div>
                      {lead.personalEmail && (
                        <div className="text-sm text-muted-foreground">{lead.personalEmail}</div>
                      )}
                    </AppleTableCell>
                    <AppleTableCell>
                      {getCategoryName(lead.categoryId)}
                    </AppleTableCell>
                    <AppleTableCell>
                      <div className="max-w-xs">
                        {lead.remarks ? (
                          <div className="text-sm text-muted-foreground truncate" title={lead.remarks}>
                            {lead.remarks}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">No remarks</span>
                        )}
                      </div>
                    </AppleTableCell>
                    <AppleTableCell>
                      {format(new Date(lead.createdAt), 'MMM dd, yyyy')}
                    </AppleTableCell>
                  </AppleTableRow>
                ))}
              </AppleTableBody>
            </AppleTable>
          )}

          {/* Pagination */}
          {sortedAndFilteredLeads.length > 0 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {currentPageLeads.length} of {totalItems} leads
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lead Detail Panel */}
      <Drawer open={isPanelOpen} onOpenChange={setIsPanelOpen}>
        <DrawerContent className="h-[80vh]">
          <DrawerHeader className="border-b">
            <div className="flex items-center justify-between">
              <DrawerTitle>
                {selectedLeadForPanel && `${selectedLeadForPanel.firstName} ${selectedLeadForPanel.lastName}`}
              </DrawerTitle>
              <DrawerClose>
                <Button variant="ghost" size="sm">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>
          
          {selectedLeadForPanel && (
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                      <p className="font-medium">{selectedLeadForPanel.firstName} {selectedLeadForPanel.lastName}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{selectedLeadForPanel.email}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(selectedLeadForPanel.email, 'Email copied')}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {selectedLeadForPanel.personalEmail && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Personal Email</label>
                        <p className="font-medium">{selectedLeadForPanel.personalEmail}</p>
                      </div>
                    )}

                    {selectedLeadForPanel.phone && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Phone</label>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{selectedLeadForPanel.phone}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(selectedLeadForPanel.phone, 'Phone copied')}
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {selectedLeadForPanel.location && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Location</label>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">{selectedLeadForPanel.location}</p>
                        </div>
                      </div>
                    )}

                    {selectedLeadForPanel.linkedin && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">LinkedIn</label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(selectedLeadForPanel.linkedin, '_blank')}
                          className="flex items-center gap-2"
                        >
                          <Linkedin className="h-4 w-4" />
                          View Profile
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Company Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Company Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Company</label>
                      <p className="font-medium">{selectedLeadForPanel.company}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Title</label>
                      <p className="font-medium">{selectedLeadForPanel.title}</p>
                    </div>

                    {selectedLeadForPanel.department && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Department</label>
                        <p className="font-medium">{selectedLeadForPanel.department}</p>
                      </div>
                    )}

                    {selectedLeadForPanel.industry && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Industry</label>
                        <p className="font-medium">{selectedLeadForPanel.industry}</p>
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Company Size</label>
                      <p className="font-medium">{selectedLeadForPanel.companySize}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Seniority</label>
                      <p className="font-medium">{selectedLeadForPanel.seniority}</p>
                    </div>

                    {selectedLeadForPanel.organizationWebsite && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Website</label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(selectedLeadForPanel.organizationWebsite?.startsWith('http') 
                            ? selectedLeadForPanel.organizationWebsite 
                            : `https://${selectedLeadForPanel.organizationWebsite}`, '_blank')}
                          className="flex items-center gap-2"
                        >
                          <Globe className="h-4 w-4" />
                          Visit Website
                        </Button>
                      </div>
                    )}

                    {selectedLeadForPanel.organizationAddress && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Address</label>
                        <p className="font-medium">{selectedLeadForPanel.organizationAddress}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Lead Status & Tracking */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Lead Status & Tracking
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <Badge className={getStatusBadgeColor(selectedLeadForPanel.status)}>
                        {selectedLeadForPanel.status}
                      </Badge>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Category</label>
                      <p className="font-medium">{getCategoryName(selectedLeadForPanel.categoryId)}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Emails Sent</label>
                      <p className="font-medium">{selectedLeadForPanel.emailsSent}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Completeness Score</label>
                      <p className="font-medium">{selectedLeadForPanel.completenessScore}%</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Created</label>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{format(new Date(selectedLeadForPanel.createdAt), 'MMM dd, yyyy HH:mm')}</p>
                      </div>
                    </div>

                    {selectedLeadForPanel.lastContactDate && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Last Contact</label>
                        <p className="font-medium">{format(new Date(selectedLeadForPanel.lastContactDate), 'MMM dd, yyyy')}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Additional Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Tag className="h-5 w-5" />
                      Additional Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedLeadForPanel.headline && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Headline</label>
                        <p className="font-medium">{selectedLeadForPanel.headline}</p>
                      </div>
                    )}

                    {selectedLeadForPanel.keywords && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Keywords</label>
                        <p className="font-medium">{selectedLeadForPanel.keywords}</p>
                      </div>
                    )}

                    {selectedLeadForPanel.tags && selectedLeadForPanel.tags.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Tags</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedLeadForPanel.tags.map((tag, index) => (
                            <Badge key={index} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedLeadForPanel.remarks && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Remarks</label>
                        <div className="bg-muted p-3 rounded-md">
                          <p className="text-sm">{selectedLeadForPanel.remarks}</p>
                        </div>
                      </div>
                    )}

                    {selectedLeadForPanel.organizationFounded && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Company Founded</label>
                        <p className="font-medium">{selectedLeadForPanel.organizationFounded}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
};
