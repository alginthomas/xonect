
import React, { useState, useMemo } from 'react';
import { CompactLeadCard } from './compact-lead-card';
import { MobileSearchFilters } from './mobile-search-filters';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowUpDown,
  CheckSquare,
  Square,
  Trash2,
  MessageSquare,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import type { Lead, LeadStatus } from '@/types/lead';
import type { Category } from '@/types/category';

interface MobileLeadsListProps {
  leads: Lead[];
  categories: Category[];
  onUpdateLead: (leadId: string, updates: Partial<Lead>) => void;
  onDeleteLead: (leadId: string) => void;
  onEmailClick: (leadId: string) => void;
  onViewDetails: (lead: Lead) => void;
  onBulkUpdateStatus: (leadIds: string[], status: LeadStatus) => void;
  onBulkDelete: (leadIds: string[]) => void;
}

export const MobileLeadsList: React.FC<MobileLeadsListProps> = ({
  leads,
  categories,
  onUpdateLead,
  onDeleteLead,
  onEmailClick,
  onViewDetails,
  onBulkUpdateStatus,
  onBulkDelete
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'status'>('date');
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [leadsPerPage, setLeadsPerPage] = useState(10);

  // Filter and sort leads
  const filteredAndSortedLeads = useMemo(() => {
    let filtered = leads.filter(lead => {
      const searchRegex = new RegExp(searchQuery, 'i');
      const matchesSearch = searchRegex.test(lead.firstName) || 
        searchRegex.test(lead.lastName) || 
        searchRegex.test(lead.email) || 
        searchRegex.test(lead.company) || 
        searchRegex.test(lead.title);
      
      const matchesStatus = selectedStatus === 'all' || lead.status === selectedStatus;
      const matchesCategory = selectedCategory === 'all' || lead.categoryId === selectedCategory;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });

    // Sort leads
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'date':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return filtered;
  }, [leads, searchQuery, selectedStatus, selectedCategory, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedLeads.length / leadsPerPage);
  const startIndex = (currentPage - 1) * leadsPerPage;
  const paginatedLeads = filteredAndSortedLeads.slice(startIndex, startIndex + leadsPerPage);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus, selectedCategory, sortBy]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedStatus !== 'all') count++;
    if (selectedCategory !== 'all') count++;
    return count;
  }, [selectedStatus, selectedCategory]);

  const handleClearFilters = () => {
    setSelectedStatus('all');
    setSelectedCategory('all');
    setSearchQuery('');
  };

  const handleSelectLead = (leadId: string, checked: boolean) => {
    const newSelected = new Set(selectedLeads);
    if (checked) {
      newSelected.add(leadId);
    } else {
      newSelected.delete(leadId);
    }
    setSelectedLeads(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedLeads.size === paginatedLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(paginatedLeads.map(lead => lead.id)));
    }
  };

  const handleBulkAction = (action: 'delete' | LeadStatus) => {
    const leadIds = Array.from(selectedLeads);
    if (action === 'delete') {
      onBulkDelete(leadIds);
    } else {
      onBulkUpdateStatus(leadIds, action);
    }
    setSelectedLeads(new Set());
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, newPage)));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search and Filters */}
      <MobileSearchFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
        activeFiltersCount={activeFiltersCount}
        onClearFilters={handleClearFilters}
      />

      {/* Results Summary and Controls */}
      <div className="px-4 py-2 bg-muted/20 border-b border-border/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {filteredAndSortedLeads.length} lead{filteredAndSortedLeads.length !== 1 ? 's' : ''}
            </span>
            {selectedLeads.size > 0 && (
              <Badge variant="secondary" className="text-xs">
                {selectedLeads.size} selected
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={leadsPerPage.toString()} onValueChange={(value) => setLeadsPerPage(parseInt(value))}>
              <SelectTrigger className="w-16 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
              <SelectTrigger className="w-auto h-8 text-xs">
                <ArrowUpDown className="h-3 w-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">By Date</SelectItem>
                <SelectItem value="name">By Name</SelectItem>
                <SelectItem value="status">By Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedLeads.size > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              className="h-7 px-2 text-xs"
            >
              {selectedLeads.size === paginatedLeads.length ? (
                <CheckSquare className="h-3 w-3 mr-1" />
              ) : (
                <Square className="h-3 w-3 mr-1" />
              )}
              {selectedLeads.size === paginatedLeads.length ? 'Deselect' : 'Select All'}
            </Button>
            
            <Select onValueChange={(value) => handleBulkAction(value as LeadStatus)}>
              <SelectTrigger className="w-auto h-7 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Contacted">Contacted</SelectItem>
                <SelectItem value="Qualified">Qualified</SelectItem>
                <SelectItem value="Interested">Interested</SelectItem>
                <SelectItem value="Not Interested">Not Interested</SelectItem>
                <SelectItem value="Unresponsive">Unresponsive</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleBulkAction('delete')}
              className="h-7 px-2 text-xs"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="px-4 py-2 border-b border-border/30 bg-background">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Page {currentPage} of {totalPages} ({startIndex + 1}-{Math.min(startIndex + leadsPerPage, filteredAndSortedLeads.length)} of {filteredAndSortedLeads.length})
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Leads List */}
      <div className="flex-1 overflow-y-auto px-3 pb-20">
        {paginatedLeads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <MessageSquare className="h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium mb-2">No leads found</h3>
            <p className="text-muted-foreground mb-4 max-w-sm text-sm">
              {searchQuery || activeFiltersCount > 0 
                ? 'Try adjusting your search or filters.'
                : 'Start by importing leads or adding them manually.'
              }
            </p>
            {(searchQuery || activeFiltersCount > 0) && (
              <Button variant="outline" onClick={handleClearFilters} size="sm">
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-0 pt-3">
            {paginatedLeads.map((lead) => (
              <CompactLeadCard
                key={lead.id}
                lead={lead}
                categories={categories}
                isSelected={selectedLeads.has(lead.id)}
                onSelect={(checked) => handleSelectLead(lead.id, checked)}
                onStatusChange={(status) => onUpdateLead(lead.id, { status })}
                onRemarksUpdate={(remarks) => onUpdateLead(lead.id, { remarks })}
                onEmailClick={() => onEmailClick(lead.id)}
                onViewDetails={() => onViewDetails(lead)}
                onDeleteLead={() => onDeleteLead(lead.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
