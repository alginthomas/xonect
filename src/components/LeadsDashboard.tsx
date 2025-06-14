import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MobileSearchToolbar } from '@/components/ui/mobile-search-toolbar';
import { DesktopFilters } from '@/components/DesktopFilters';
import { BulkActionsBar } from '@/components/BulkActionsBar';
import { ResultsOverview } from '@/components/ResultsOverview';
import { LeadsTable } from '@/components/LeadsTable';
import { LeadsPagination } from '@/components/LeadsPagination';
import { NavigationFilterIndicator } from '@/components/NavigationFilterIndicator';
import { BatchFilterIndicator } from '@/components/BatchFilterIndicator';
import { LeadSidebar } from '@/components/LeadSidebar';
import { EmailDialog } from '@/components/EmailDialog';
import { DateGroupedLeads } from '@/components/ui/date-grouped-leads';
import { useLeadsDashboardLogic } from '@/hooks/useLeadsDashboardLogic';
import { useIsMobile } from '@/hooks/use-mobile';
import { Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Lead, EmailTemplate, LeadStatus, RemarkEntry } from '@/types/lead';
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
  onClearBatchFilter?: () => void;
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
  onCreateCategory,
  onClearBatchFilter
}) => {
  const isMobile = useIsMobile();

  const {
    // State
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    dataAvailabilityFilter,
    setDataAvailabilityFilter,
    countryFilter,
    setCountryFilter,
    duplicatePhoneFilter,
    setDuplicatePhoneFilter,
    remarksFilter,
    setRemarksFilter,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    navigationFilter,
    setNavigationFilter,
    selectedLead,
    setSelectedLead,
    showSidebar,
    setShowSidebar,
    selectedLeadForEmail,
    setSelectedLeadForEmail,
    showEmailDialog,
    setShowEmailDialog,

    // Computed values
    filteredLeads,
    sortedLeads,
    paginatedLeads,
    totalPages,
    startIndex,
    activeFiltersCount,
    selectedLeads,
    columns,
    visibleColumns,

    // Handlers
    handleSort,
    handleBulkAction,
    handleExport,
    handleStatusChange,
    handleRemarksUpdate,
    handleSelectAll,
    handleSelectLead,
    clearSelection,
    clearAllFilters,
    reorderColumns,
    toggleColumnVisibility,
    resetToDefault,
    lastUpdatedLeadId,
    setLastUpdatedLeadId
  } = useLeadsDashboardLogic({
    leads,
    categories,
    importBatches,
    selectedBatchId,
    onUpdateLead,
    onDeleteLead,
    onBulkUpdateStatus,
    onBulkDelete,
    onSendEmail
  });

  const openLeadSidebar = (lead: Lead) => {
    console.log('Opening sidebar for lead:', lead.id);
    setSelectedLead(lead);
    setShowSidebar(true);
  };

  const closeSidebar = () => {
    setShowSidebar(false);
    setSelectedLead(null);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      reorderColumns(active.id, over.id);
    }
  };

  const handleDuplicatePhoneChange = (value: string) => {
    setDuplicatePhoneFilter(value as 'all' | 'unique-only' | 'duplicates-only');
  };

  const handleRemarksChange = (value: string) => {
    setRemarksFilter(value as 'all' | 'has-remarks' | 'no-remarks');
  };

  const clearNavigationFilter = () => {
    setNavigationFilter(undefined);
    setStatusFilter('all');
    const url = new URL(window.location.href);
    url.searchParams.delete('status');
    window.history.replaceState({}, '', url.toString());
  };

  // Create a wrapper for handleSelectAll that matches the expected signature
  const handleSelectAllWrapper = (selected: boolean) => {
    handleSelectAll(paginatedLeads);
  };

  // Create a wrapper for handleSelectLead that matches the expected signature  
  const handleSelectLeadWrapper = (leadId: string, selected?: boolean) => {
    handleSelectLead(leadId, selected);
  };

  // Create a wrapper for handleRemarksUpdate that includes the full signature for mobile
  const handleRemarksUpdateMobile = async (leadId: string, remarks: string) => {
    const currentLead = leads.find(lead => lead.id === leadId);
    if (!currentLead) return;

    // Create new remark entry
    const newEntry: RemarkEntry = {
      id: crypto.randomUUID(),
      text: remarks,
      timestamp: new Date()
    };

    // Get existing history and add new entry
    const existingHistory = currentLead.remarksHistory || [];
    const updatedHistory = [...existingHistory, newEntry];

    // Call the actual handler with all required parameters
    await handleRemarksUpdate(leadId, remarks, updatedHistory);
  };

  // Create a wrapper for handleRemarksUpdate that includes the full signature for desktop
  const handleRemarksUpdateDesktop = async (leadId: string, remarks: string, remarksHistory: RemarkEntry[]) => {
    await handleRemarksUpdate(leadId, remarks, remarksHistory);
  };

  return (
    <div className="w-full h-full bg-background">
      {/* Mobile Layout */}
      {isMobile ? (
        <div className="flex flex-col h-full">
          {/* Mobile Search Toolbar - Fixed at top */}
          <div className="flex-shrink-0 bg-background/95 backdrop-blur-sm border-b border-border/40 sticky top-0 z-30">
            <MobileSearchToolbar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
              dataAvailabilityFilter={dataAvailabilityFilter}
              onDataAvailabilityChange={setDataAvailabilityFilter}
              countryFilter={countryFilter}
              onCountryChange={setCountryFilter}
              duplicatePhoneFilter={duplicatePhoneFilter}
              onDuplicatePhoneChange={handleDuplicatePhoneChange}
              remarksFilter={remarksFilter}
              onRemarksChange={handleRemarksChange}
              categories={categories}
              leads={leads}
              onExport={handleExport}
              onClearFilters={clearAllFilters}
              activeFiltersCount={activeFiltersCount}
            />
          </div>

          {/* Batch Filter Indicator */}
          {selectedBatchId && onClearBatchFilter && (
            <div className="flex-shrink-0 px-4 pt-3">
              <BatchFilterIndicator
                batchId={selectedBatchId}
                importBatches={importBatches}
                onClearFilter={onClearBatchFilter}
              />
            </div>
          )}

          {/* Navigation Filter Indicator */}
          {navigationFilter && (
            <div className="flex-shrink-0 px-4 pt-3">
              <NavigationFilterIndicator
                navigationFilter={navigationFilter}
                onClearFilter={clearNavigationFilter}
              />
            </div>
          )}

          {/* Bulk Actions */}
          {selectedLeads.size > 0 && (
            <div className="flex-shrink-0 px-4 pt-3">
              <BulkActionsBar
                selectedCount={selectedLeads.size}
                onClearSelection={clearSelection}
                onBulkAction={handleBulkAction}
              />
            </div>
          )}

          {/* Main Content - Scrollable */}
          <div className="flex-1 overflow-hidden">
            <Card className="apple-card h-full rounded-none border-x-0 border-b-0">
              <div className="px-4 py-3 border-b border-border/40">
                <ResultsOverview
                  filteredLeadsCount={filteredLeads.length}
                  selectedCount={selectedLeads.size}
                  selectedBatchId={selectedBatchId}
                  importBatches={importBatches}
                />
              </div>
              <CardContent className="p-0 h-full overflow-auto">
                {/* Mobile Date Grouped Leads */}
                <DateGroupedLeads
                  leads={paginatedLeads}
                  categories={categories}
                  selectedLeads={selectedLeads}
                  onSelectLead={handleSelectLeadWrapper}
                  onViewDetails={openLeadSidebar}
                  onStatusChange={handleStatusChange}
                  onRemarksUpdate={handleRemarksUpdateMobile}
                  onEmailClick={(lead) => {
                    setSelectedLeadForEmail(lead);
                    setShowEmailDialog(true);
                  }}
                  onDeleteLead={onDeleteLead}
                />

                {/* Mobile Pagination */}
                <div className="p-4 border-t border-border/40 bg-background">
                  <LeadsPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    itemsPerPage={itemsPerPage}
                    totalItems={sortedLeads.length}
                    startIndex={startIndex}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={(newItemsPerPage) => {
                      setItemsPerPage(newItemsPerPage);
                      setCurrentPage(1);
                    }}
                  />
                </div>

                {/* No Results State */}
                {sortedLeads.length === 0 && (
                  <div className="text-center py-12 px-4">
                    <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-medium mb-2">No leads found</h3>
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
          </div>
        </div>
      ) : (
        /* Desktop Layout */
        <div className="space-y-6 p-6">
          {/* Desktop Filters */}
          <DesktopFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
            dataAvailabilityFilter={dataAvailabilityFilter}
            onDataAvailabilityChange={setDataAvailabilityFilter}
            countryFilter={countryFilter}
            onCountryChange={setCountryFilter}
            duplicatePhoneFilter={duplicatePhoneFilter}
            onDuplicatePhoneChange={handleDuplicatePhoneChange}
            remarksFilter={remarksFilter}
            onRemarksChange={handleRemarksChange}
            categories={categories}
            leads={leads}
            onExport={handleExport}
            onClearFilters={clearAllFilters}
            activeFiltersCount={activeFiltersCount}
            columns={columns}
            onToggleColumnVisibility={toggleColumnVisibility}
            onResetColumns={resetToDefault}
          />

          {/* Batch Filter Indicator */}
          {selectedBatchId && onClearBatchFilter && (
            <BatchFilterIndicator
              batchId={selectedBatchId}
              importBatches={importBatches}
              onClearFilter={onClearBatchFilter}
            />
          )}

          {/* Navigation Filter Indicator */}
          <NavigationFilterIndicator
            navigationFilter={navigationFilter}
            onClearFilter={clearNavigationFilter}
          />

          {/* Bulk Actions */}
          <BulkActionsBar
            selectedCount={selectedLeads.size}
            onClearSelection={clearSelection}
            onBulkAction={handleBulkAction}
          />

          {/* Main Content */}
          <Card className="apple-card">
            <ResultsOverview
              filteredLeadsCount={filteredLeads.length}
              selectedCount={selectedLeads.size}
              selectedBatchId={selectedBatchId}
              importBatches={importBatches}
            />
            <CardContent className="pt-0">
              {/* Desktop Table */}
              <LeadsTable
                leads={paginatedLeads}
                categories={categories}
                selectedLeads={selectedLeads}
                columns={columns}
                visibleColumns={visibleColumns}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                onSelectLead={handleSelectLeadWrapper}
                onSelectAll={handleSelectAllWrapper}
                onStatusChange={handleStatusChange}
                onRemarksUpdate={handleRemarksUpdateDesktop}
                onEmailClick={(lead) => {
                  setSelectedLeadForEmail(lead);
                  setShowEmailDialog(true);
                }}
                onViewDetails={openLeadSidebar}
                onDeleteLead={onDeleteLead}
                onDragEnd={handleDragEnd}
                lastUpdatedLeadId={lastUpdatedLeadId}
              />

              {/* Pagination */}
              <LeadsPagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={sortedLeads.length}
                startIndex={startIndex}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(newItemsPerPage) => {
                  setItemsPerPage(newItemsPerPage);
                  setCurrentPage(1);
                }}
              />

              {/* No Results State */}
              {sortedLeads.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
                  <h3 className="text-2xl font-medium mb-3">No leads found</h3>
                  <p className="text-muted-foreground text-lg max-w-md mx-auto">
                    {filteredLeads.length === 0 
                      ? "Try adjusting your search or filters to find leads."
                      : "All leads are filtered out by your current criteria."
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Shared Components */}
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
