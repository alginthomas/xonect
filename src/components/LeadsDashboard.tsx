import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { CategoryCombobox } from '@/components/CategoryCombobox';
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
  ChevronRight,
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
  Edit,
  Save,
  Filter,
  ChevronLeft,
  ChevronRightIcon,
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
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  const [editingLead, setEditingLead] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [showRemarksDialog, setShowRemarksDialog] = useState(false);
  const [selectedLeadForRemarks, setSelectedLeadForRemarks] = useState<Lead | null>(null);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [selectedLeadForEmail, setSelectedLeadForEmail] = useState<Lead | null>(null);
  const { toast } = useToast();

  // Persist items per page setting
  useEffect(() => {
    localStorage.setItem('leadsPerPage', itemsPerPage.toString());
  }, [itemsPerPage]);

  // Filter leads based on batch selection and other filters
  const filteredLeads = useMemo(() => {
    let filtered = leads;

    // Filter by selected batch
    if (selectedBatchId) {
      filtered = filtered.filter(lead => lead.importBatchId === selectedBatchId);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(lead =>
        lead.firstName.toLowerCase().includes(term) ||
        lead.lastName.toLowerCase().includes(term) ||
        lead.email.toLowerCase().includes(term) ||
        lead.company.toLowerCase().includes(term) ||
        lead.title.toLowerCase().includes(term)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(lead => lead.categoryId === categoryFilter);
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
      // Deselect all current page leads
      setSelectedLeads(prev => {
        const newSet = new Set(prev);
        currentPageLeadIds.forEach(id => newSet.delete(id));
        return newSet;
      });
    } else {
      // Select all current page leads
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

  const startEdit = (leadId: string, field: string, currentValue: string) => {
    setEditingLead(leadId);
    setEditingField(field);
    setEditValue(currentValue || '');
  };

  const saveEdit = async () => {
    if (!editingLead || !editingField) return;

    try {
      const updates: Partial<Lead> = {
        [editingField]: editValue
      };
      
      await onUpdateLead(editingLead, updates);
      
      setEditingLead(null);
      setEditingField(null);
      setEditValue('');
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Failed to update lead. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const cancelEdit = () => {
    setEditingLead(null);
    setEditingField(null);
    setEditValue('');
  };

  const handleCategoryChange = async (leadId: string, categoryName: string) => {
    try {
      // Check if category exists
      let categoryId = '';
      const existingCategory = categories.find(cat => 
        cat.name.toLowerCase() === categoryName.toLowerCase()
      );

      if (existingCategory) {
        categoryId = existingCategory.id;
      } else if (onCreateCategory) {
        // Create new category
        await onCreateCategory({
          name: categoryName,
          description: `Created automatically`,
          color: '#3B82F6',
          criteria: {}
        });
        
        // Find the newly created category
        const newCategory = categories.find(cat => 
          cat.name.toLowerCase() === categoryName.toLowerCase()
        );
        
        if (newCategory) {
          categoryId = newCategory.id;
        }
      }

      if (categoryId) {
        await onUpdateLead(leadId, { categoryId });
        toast({
          title: 'Category updated',
          description: `Lead category updated to ${categoryName}`,
        });
      }
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Failed to update category. Please try again.',
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'Contacted': return 'bg-yellow-100 text-yellow-800';
      case 'Qualified': return 'bg-green-100 text-green-800';
      case 'Unqualified': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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

  const getSeniorityColor = (seniority: string) => {
    switch (seniority) {
      case 'Entry-level': return 'bg-green-100 text-green-800';
      case 'Mid-level': return 'bg-blue-100 text-blue-800';
      case 'Senior': return 'bg-orange-100 text-orange-800';
      case 'Executive': return 'bg-purple-100 text-purple-800';
      case 'C-level': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderEditableField = (lead: Lead, field: string, value: string, type: 'text' | 'select' = 'text', options?: string[]) => {
    const isEditing = editingLead === lead.id && editingField === field;

    if (isEditing) {
      return (
        <div className="flex items-center gap-2">
          {type === 'select' && options ? (
            <Select value={editValue} onValueChange={setEditValue}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="h-8 text-xs"
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveEdit();
                if (e.key === 'Escape') cancelEdit();
              }}
            />
          )}
          <Button size="sm" variant="ghost" onClick={saveEdit} className="h-8 w-8 p-0">
            <Save className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-8 w-8 p-0">
            <X className="h-3 w-3" />
          </Button>
        </div>
      );
    }

    return (
      <div 
        className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded px-2 py-1"
        onClick={() => startEdit(lead.id, field, value)}
      >
        <span className="flex-1">{value || 'Not set'}</span>
        <Edit className="h-3 w-3 opacity-0 group-hover:opacity-100" />
      </div>
    );
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
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Contacted">Contacted</SelectItem>
                <SelectItem value="Qualified">Qualified</SelectItem>
                <SelectItem value="Unqualified">Unqualified</SelectItem>
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
                  <DropdownMenuItem onClick={() => handleBulkAction('status', 'New')}>
                    Mark as New
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction('status', 'Contacted')}>
                    Mark as Contacted
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction('status', 'Qualified')}>
                    Mark as Qualified
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction('status', 'Unqualified')}>
                    Mark as Unqualified
                  </DropdownMenuItem>
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
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedLeads.length)} of {sortedLeads.length} leads
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
                {currentPage} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
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
                <AppleTableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-2">
                    Status
                    {sortField === 'status' && (
                      sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </AppleTableHead>
                <AppleTableHead>Category</AppleTableHead>
                <AppleTableHead>Details</AppleTableHead>
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
                <AppleTableHead className="w-12">Actions</AppleTableHead>
              </AppleTableRow>
            </AppleTableHeader>
            <AppleTableBody>
              {paginatedLeads.map((lead) => {
                const category = getCategoryInfo(lead.categoryId);
                const isExpanded = expandedLead === lead.id;
                
                return (
                  <React.Fragment key={lead.id}>
                    <AppleTableRow className="group hover:bg-muted/50">
                      <AppleTableCell>
                        <Checkbox
                          checked={selectedLeads.has(lead.id)}
                          onCheckedChange={(checked) => handleSelectLead(lead.id, checked as boolean)}
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
                        <Badge className={getStatusColor(lead.status)}>
                          {lead.status}
                        </Badge>
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
                        <div className="flex gap-1">
                          <Badge variant="outline" className={getSeniorityColor(lead.seniority)}>
                            {lead.seniority}
                          </Badge>
                          {lead.industry && (
                            <Badge variant="outline">
                              {lead.industry}
                            </Badge>
                          )}
                        </div>
                      </AppleTableCell>
                      
                      <AppleTableCell>
                        <div className="text-sm text-muted-foreground">
                          {format(lead.createdAt, 'MMM dd, yyyy')}
                        </div>
                      </AppleTableCell>
                      
                      <AppleTableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedLead(isExpanded ? null : lead.id)}
                          >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedLeadForEmail(lead);
                                  setShowEmailDialog(true);
                                }}
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedLeadForRemarks(lead);
                                  setShowRemarksDialog(true);
                                }}
                              >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Add Remarks
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => onDeleteLead(lead.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </AppleTableCell>
                    </AppleTableRow>
                    
                    {/* Expanded Details Row */}
                    {isExpanded && (
                      <AppleTableRow>
                        <AppleTableCell colSpan={9} className="bg-muted/30">
                          <div className="p-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {/* Contact Information */}
                              <div className="space-y-3">
                                <h4 className="font-semibold text-sm flex items-center gap-2">
                                  <Phone className="h-4 w-4" />
                                  Contact Information
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="group">
                                    <label className="text-muted-foreground">Email:</label>
                                    {renderEditableField(lead, 'email', lead.email)}
                                  </div>
                                  <div className="group">
                                    <label className="text-muted-foreground">Phone:</label>
                                    {renderEditableField(lead, 'phone', lead.phone)}
                                  </div>
                                  <div className="group">
                                    <label className="text-muted-foreground">Personal Email:</label>
                                    {renderEditableField(lead, 'personalEmail', lead.personalEmail)}
                                  </div>
                                  {lead.linkedin && (
                                    <div className="flex items-center gap-2">
                                      <Linkedin className="h-3 w-3" />
                                      <a 
                                        href={lead.linkedin} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                      >
                                        LinkedIn Profile
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Company Information */}
                              <div className="space-y-3">
                                <h4 className="font-semibold text-sm flex items-center gap-2">
                                  <Building className="h-4 w-4" />
                                  Company Information
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="group">
                                    <label className="text-muted-foreground">Industry:</label>
                                    {renderEditableField(lead, 'industry', lead.industry)}
                                  </div>
                                  <div className="group">
                                    <label className="text-muted-foreground">Location:</label>
                                    {renderEditableField(lead, 'location', lead.location)}
                                  </div>
                                  <div className="group">
                                    <label className="text-muted-foreground">Department:</label>
                                    {renderEditableField(lead, 'department', lead.department)}
                                  </div>
                                  <div className="group">
                                    <label className="text-muted-foreground">Company Size:</label>
                                    {renderEditableField(lead, 'companySize', lead.companySize, 'select', [
                                      'Small (1-50)', 'Medium (51-200)', 'Large (201-1000)', 'Enterprise (1000+)'
                                    ])}
                                  </div>
                                  {lead.organizationWebsite && (
                                    <div className="flex items-center gap-2">
                                      <Globe className="h-3 w-3" />
                                      <a 
                                        href={lead.organizationWebsite} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                      >
                                        Company Website
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Lead Management */}
                              <div className="space-y-3">
                                <h4 className="font-semibold text-sm flex items-center gap-2">
                                  <Target className="h-4 w-4" />
                                  Lead Management
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="group">
                                    <label className="text-muted-foreground">Status:</label>
                                    {renderEditableField(lead, 'status', lead.status, 'select', [
                                      'New', 'Contacted', 'Qualified', 'Unqualified'
                                    ])}
                                  </div>
                                  <div className="group">
                                    <label className="text-muted-foreground">Seniority:</label>
                                    {renderEditableField(lead, 'seniority', lead.seniority, 'select', [
                                      'Entry-level', 'Mid-level', 'Senior', 'Executive', 'C-level'
                                    ])}
                                  </div>
                                  <div>
                                    <label className="text-muted-foreground">Category:</label>
                                    <CategoryCombobox
                                      categories={categories}
                                      value={category.name}
                                      onChange={(categoryName) => handleCategoryChange(lead.id, categoryName)}
                                      placeholder="Select or create category"
                                      className="mt-1"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-muted-foreground">Batch:</label>
                                    <div className="text-sm">{getBatchName(lead.importBatchId)}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Remarks Section */}
                            <div className="space-y-2">
                              <h4 className="font-semibold text-sm flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Remarks
                              </h4>
                              <QuickRemarkEditor
                                lead={lead}
                                onUpdateRemarks={(leadId, remarks) => onUpdateLead(leadId, { remarks })}
                              />
                            </div>

                            {/* Stats */}
                            <div className="flex gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {lead.emailsSent} emails sent
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Last contact: {lead.lastContactDate ? format(lead.lastContactDate, 'MMM dd, yyyy') : 'Never'}
                              </div>
                              <div className="flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                Completeness: {lead.completenessScore}%
                              </div>
                            </div>
                          </div>
                        </AppleTableCell>
                      </AppleTableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </AppleTableBody>
          </AppleTable>

          {paginatedLeads.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No leads found</h3>
              <p>Try adjusting your search criteria or filters.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      {selectedLeadForRemarks && (
        <LeadRemarksDialog
          lead={selectedLeadForRemarks}
          onUpdateRemarks={(leadId, remarks) => {
            onUpdateLead(leadId, { remarks });
            setShowRemarksDialog(false);
            setSelectedLeadForRemarks(null);
          }}
        />
      )}

      {selectedLeadForEmail && (
        <EmailDialog
          lead={selectedLeadForEmail}
          templates={templates}
          branding={branding}
          onSend={(leadId) => {
            onSendEmail(leadId);
            setShowEmailDialog(false);
            setSelectedLeadForEmail(null);
          }}
        />
      )}
    </div>
  );
};
