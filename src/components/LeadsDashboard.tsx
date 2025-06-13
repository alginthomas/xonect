import React, { useState, useMemo } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AppleTable, AppleTableHeader, AppleTableBody, AppleTableHead, AppleTableRow, AppleTableCell } from '@/components/ui/apple-table';
import { LeadSidebar } from '@/components/LeadSidebar';
import { QuickStatusEditor } from '@/components/QuickStatusEditor';
import { QuickRemarksCell } from '@/components/QuickRemarksCell';
import { QuickActionsCell } from '@/components/QuickActionsCell';
import { EmailDialog } from '@/components/EmailDialog';
import { DraggableTableHeader } from '@/components/DraggableTableHeader';
import { MobilePagination } from '@/components/ui/mobile-pagination';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { DateGroupedLeads } from '@/components/ui/date-grouped-leads';
import { MobileSearchToolbar } from '@/components/ui/mobile-search-toolbar';
import { DesktopFilters } from '@/components/DesktopFilters';
import { BulkActionsBar } from '@/components/BulkActionsBar';
import { ResultsOverview } from '@/components/ResultsOverview';
import { useColumnConfiguration } from '@/hooks/useColumnConfiguration';
import { useLeadsCache } from '@/hooks/useLeadsCache';
import { useLeadsFiltering } from '@/hooks/useLeadsFiltering';
import { useLeadsSelection } from '@/hooks/useLeadsSelection';
import { useIsMobile } from '@/hooks/use-mobile';
import { Mail, Phone, ChevronLeft, ChevronRightIcon, Plus, Users } from 'lucide-react';
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
  // Hooks
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    dataAvailabilityFilter,
    setDataAvailabilityFilter,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage
  } = useLeadsCache();

  const { filteredLeads, sortedLeads } = useLeadsFiltering({
    leads,
    importBatches,
    selectedBatchId,
    searchTerm,
    statusFilter,
    categoryFilter,
    dataAvailabilityFilter,
    sortField,
    sortDirection,
    setCurrentPage
  });

  const { selectedLeads, handleSelectAll, handleSelectLead, clearSelection } = useLeadsSelection();

  const {
    columns,
    visibleColumns,
    reorderColumns,
    toggleColumnVisibility,
    resetToDefault
  } = useColumnConfiguration();

  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Local state
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedLeadForEmail, setSelectedLeadForEmail] = useState<Lead | null>(null);
  const [showEmailDialog, setShowEmailDialog] = useState(false);

  // Drag and drop sensors
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== 'all') count++;
    if (categoryFilter !== 'all') count++;
    if (dataAvailabilityFilter !== 'all') count++;
    return count;
  }, [statusFilter, categoryFilter, dataAvailabilityFilter]);

  // Pagination
  const totalPages = Math.ceil(sortedLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLeads = sortedLeads.slice(startIndex, startIndex + itemsPerPage);

  // Mobile-optimized column visibility
  const mobileVisibleColumns = useMemo(() => {
    if (!isMobile) return visibleColumns;
    return visibleColumns.filter(col => ['select', 'name', 'status', 'actions'].includes(col.id));
  }, [visibleColumns, isMobile]);

  const activeColumns = isMobile ? mobileVisibleColumns : visibleColumns;

  // Event handlers
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleBulkAction = async (action: 'delete' | 'status', value?: string) => {
    if (selectedLeads.size === 0) {
      toast({
        title: 'No leads selected',
        description: 'Please select leads to perform bulk actions.',
        variant: 'destructive'
      });
      return;
    }

    const leadIds = Array.from(selectedLeads);
    try {
      if (action === 'delete') {
        await onBulkDelete(leadIds);
        toast({
          title: 'Leads deleted',
          description: `${leadIds.length} leads have been deleted.`
        });
      } else if (action === 'status' && value) {
        await onBulkUpdateStatus(leadIds, value as LeadStatus);
        toast({
          title: 'Status updated',
          description: `${leadIds.length} leads status updated to ${value}.`
        });
      }
      clearSelection();
    } catch (error) {
      toast({
        title: 'Action failed',
        description: 'Failed to perform bulk action. Please try again.',
        variant: 'destructive'
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
      description: `${leadsToExport.length} leads exported to CSV.`
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
        description: `Lead status updated to ${status}`
      });
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Failed to update status. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleRemarksUpdate = async (leadId: string, remarks: string) => {
    try {
      await onUpdateLead(leadId, { remarks });
      toast({
        title: 'Remarks updated',
        description: 'Lead remarks have been updated.'
      });
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Failed to update remarks. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      reorderColumns(active.id, over.id);
    }
  };

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const clearAllFilters = () => {
    setStatusFilter('all');
    setCategoryFilter('all');
    setDataAvailabilityFilter('all');
    setSearchTerm('');
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

  // Fixed handleSelectAll function to match useLeadsSelection expectations
  const handleSelectAllCurrentPage = (checked: boolean) => {
    if (checked) {
      // Select all current page leads
      currentPageLeadIds.forEach(id => {
        if (!selectedLeads.has(id)) {
          handleSelectLead(id, true);
        }
      });
    } else {
      // Deselect all current page leads
      currentPageLeadIds.forEach(id => {
        if (selectedLeads.has(id)) {
          handleSelectLead(id, false);
        }
      });
    }
  };

  // Render column content based on column id
  const renderColumnContent = (columnId: string, lead: Lead) => {
    switch (columnId) {
      case 'select':
        return (
          <Checkbox
            checked={selectedLeads.has(lead.id)}
            onCheckedChange={(checked) => handleSelectLead(lead.id, checked as boolean)}
            className="h-4 w-4"
          />
        );
      case 'status':
        return (
          <QuickStatusEditor
            status={lead.status}
            onChange={(status) => handleStatusChange(lead.id, status)}
          />
        );
      case 'remarks':
        return (
          <QuickRemarksCell
            remarks={lead.remarks || ''}
            onUpdate={(remarks) => handleRemarksUpdate(lead.id, remarks)}
          />
        );
      case 'actions':
        return (
          <QuickActionsCell
            lead={lead}
            onEmailClick={() => {
              setSelectedLeadForEmail(lead);
              setShowEmailDialog(true);
            }}
            onViewDetails={() => openLeadSidebar(lead)}
            onDeleteLead={() => onDeleteLead(lead.id)}
          />
        );
      case 'name':
        return (
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
        );
      case 'company':
        return (
          <div>
            <div className="font-medium">{lead.company}</div>
            <div className="flex gap-1 mt-1">
              <Badge variant="outline" className={getSizeColor(lead.companySize)}>
                {lead.companySize.replace(/\s*\([^)]*\)/, '')}
              </Badge>
            </div>
          </div>
        );
      case 'contact':
        return (
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
        );
      case 'category':
        const category = getCategoryInfo(lead.categoryId);
        return (
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: category.color }}
            />
            <span className="text-sm">{category.name}</span>
          </div>
        );
      case 'created':
        return (
          <div className="text-sm text-muted-foreground">
            {format(lead.createdAt, 'MMM dd')}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3 lg:space-y-6">
      {/* Mobile Search Toolbar - Only show on mobile */}
      {isMobile && (
        <MobileSearchToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          dataAvailabilityFilter={dataAvailabilityFilter}
          onDataAvailabilityChange={setDataAvailabilityFilter}
          categories={categories}
          onExport={handleExport}
          onClearFilters={clearAllFilters}
          activeFiltersCount={activeFiltersCount}
        />
      )}

      {/* Desktop Search and Filters - Only show on desktop */}
      {!isMobile && (
        <DesktopFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          dataAvailabilityFilter={dataAvailabilityFilter}
          onDataAvailabilityChange={setDataAvailabilityFilter}
          categories={categories}
          onExport={handleExport}
          onClearFilters={clearAllFilters}
          activeFiltersCount={activeFiltersCount}
          columns={columns}
          onToggleColumnVisibility={toggleColumnVisibility}
          onResetColumns={resetToDefault}
        />
      )}

      {/* Bulk Actions - Mobile Optimized */}
      <BulkActionsBar
        selectedCount={selectedLeads.size}
        onClearSelection={clearSelection}
        onBulkAction={handleBulkAction}
      />

      {/* Results Overview - Compact */}
      <Card className="apple-card">
        <ResultsOverview
          filteredLeadsCount={filteredLeads.length}
          selectedCount={selectedLeads.size}
          selectedBatchId={selectedBatchId}
          importBatches={importBatches}
        />
        <CardContent className="pt-0">
          {/* Desktop Table */}
          {!isMobile && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <AppleTable>
                <AppleTableHeader>
                  <AppleTableRow>
                    <SortableContext
                      items={activeColumns.map(col => col.id)}
                      strategy={horizontalListSortingStrategy}
                    >
                      {activeColumns.map((column) => (
                        <DraggableTableHeader
                          key={column.id}
                          column={column}
                          sortField={sortField}
                          sortDirection={sortDirection}
                          onSort={handleSort}
                          isAllSelected={isAllCurrentPageSelected}
                          isPartiallySelected={isPartialSelection}
                          onSelectAll={handleSelectAllCurrentPage}
                        />
                      ))}
                    </SortableContext>
                  </AppleTableRow>
                </AppleTableHeader>
                <AppleTableBody>
                  {paginatedLeads.map((lead) => (
                    <AppleTableRow
                      key={lead.id}
                      className={`cursor-pointer transition-colors ${
                        selectedLeads.has(lead.id) ? 'bg-muted/50' : 'hover:bg-muted/30'
                      }`}
                      onClick={() => openLeadSidebar(lead)}
                    >
                      {activeColumns.map((column) => (
                        <AppleTableCell 
                          key={column.id} 
                          className="py-3"
                          onClick={(e) => {
                            // Prevent row click when clicking on interactive elements
                            if (column.id === 'select' || column.id === 'status' || column.id === 'remarks' || column.id === 'actions') {
                              e.stopPropagation();
                            }
                          }}
                        >
                          {renderColumnContent(column.id, lead)}
                        </AppleTableCell>
                      ))}
                    </AppleTableRow>
                  ))}
                </AppleTableBody>
              </AppleTable>
            </DndContext>
          )}

          {/* Mobile Date Grouped Leads */}
          {isMobile && (
            <DateGroupedLeads
              leads={paginatedLeads}
              categories={categories}
              selectedLeads={selectedLeads}
              onSelectLead={handleSelectLead}
              onViewDetails={openLeadSidebar}
              onStatusChange={handleStatusChange}
              onRemarksUpdate={handleRemarksUpdate}
              onEmailClick={(lead) => {
                setSelectedLeadForEmail(lead);
                setShowEmailDialog(true);
              }}
              onDeleteLead={onDeleteLead}
            />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-border/30">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedLeads.length)} of {sortedLeads.length} leads
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">
                  {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* No Results State */}
          {sortedLeads.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No leads found</h3>
              <p className="text-muted-foreground">
                {filteredLeads.length === 0 
                  ? "Try adjusting your search or filters to find leads."
                  : "All leads are filtered out by your current criteria."
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Floating Action Button for Mobile */}
      <FloatingActionButton
        onClick={() => {
          toast({
            title: 'Add Lead',
            description: 'Lead creation feature coming soon!'
          });
        }}
        icon={<Plus className="h-5 w-5" />}
        label="Add Lead"
        className="bottom-20 right-4 h-12 w-12 shadow-xl"
      />

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
