
import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import AppleLayout from '@/layouts/AppleLayout';
import { LeadsDashboard } from '@/components/LeadsDashboard';
import { MobileSearchFilters } from '@/components/ui/mobile-search-filters';
import { MobileLeadsList } from '@/components/ui/mobile-leads-list';
import { Lead } from '@/types/lead';
import { Category } from '@/types/category';
import { LeadStatus } from '@/types/lead';
import { useIsMobile } from '@/hooks/use-mobile';

interface IndexProps {}

const Index: React.FC<IndexProps> = () => {
  const [activeTab, setActiveTab] = useState('leads');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [isBulkActionsOpen, setIsBulkActionsOpen] = useState(false);
  const isMobile = useIsMobile();
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();

  const fetcher = (url: string) => fetch(url).then(res => res.json());

  const { data: leadsData, error: leadsError, refetch: refetchLeads } = useQuery({
    queryKey: ['leads'],
    queryFn: () => fetcher('/api/leads'),
    enabled: !!session,
  });

  const { data: categoriesData, error: categoriesError } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetcher('/api/categories'),
  });

  const leads = leadsData?.data || [];
  const categories = categoriesData?.data || [];
  const isLoading = !leadsData && !leadsError;

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
    }
  }, [session, router]);

  const filteredLeads = leads.filter(lead => {
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

  const handleSelectLead = (leadId: string, checked: boolean) => {
    setSelectedLeads(prev => {
      if (checked) {
        return [...prev, leadId];
      } else {
        return prev.filter(id => id !== leadId);
      }
    });
  };

  const handleSelectAllLeads = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(filteredLeads.map(lead => lead.id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleStatusChange = async (leadId: string, status: LeadStatus) => {
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      // Refetch leads data
      refetchLeads();

      toast({
        title: 'Status updated',
        description: `Lead status updated to ${status}.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update lead status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRemarksUpdate = async (leadId: string, remarks: string) => {
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ remarks }),
      });
  
      // Refetch leads data
      refetchLeads();
  
      toast({
        title: 'Remarks updated',
        description: 'Lead remarks have been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update lead remarks. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleEmailClick = async (leadId: string) => {
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailsSent: { increment: 1 } }),
      });

      // Refetch leads data
      refetchLeads();

      toast({
        title: 'Email count updated',
        description: 'Email count has been incremented.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update email count. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleViewDetails = (lead: Lead) => {
    toast({
      title: 'Details',
      description: `Viewing details for ${lead.firstName} ${lead.lastName}.`,
    });
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: 'DELETE',
      });

      // Refetch leads data
      refetchLeads();

      toast({
        title: 'Lead deleted',
        description: 'Lead has been deleted successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete lead. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedStatus('all');
    setSelectedCategory('all');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchQuery) count++;
    if (selectedStatus !== 'all') count++;
    if (selectedCategory !== 'all') count++;
    return count;
  };

  const handleRefetchLeads = useCallback(() => {
    refetchLeads();
  }, [refetchLeads]);

  const renderContent = () => {
    switch (activeTab) {
      case 'leads':
        return (
          <div className="space-y-4">
            {isMobile ? (
              <>
                <MobileSearchFilters
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedStatus={selectedStatus}
                  onStatusChange={setSelectedStatus}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  categories={categories}
                  activeFiltersCount={getActiveFiltersCount()}
                  onClearFilters={clearAllFilters}
                />
                <MobileLeadsList
                  leads={filteredLeads}
                  categories={categories}
                  selectedLeads={selectedLeads}
                  onSelectLead={handleSelectLead}
                  onStatusChange={handleStatusChange}
                  onRemarksUpdate={handleRemarksUpdate}
                  onEmailClick={handleEmailClick}
                  onViewDetails={handleViewDetails}
                  onDeleteLead={handleDeleteLead}
                  isLoading={isLoading}
                />
              </>
            ) : (
              <LeadsDashboard 
                leads={filteredLeads}
                categories={categories}
                selectedLeads={selectedLeads}
                onSelectLead={handleSelectLead}
                onSelectAllLeads={handleSelectAllLeads}
                onStatusChange={handleStatusChange}
                onRemarksUpdate={handleRemarksUpdate}
                onEmailClick={handleEmailClick}
                onViewDetails={handleViewDetails}
                onDeleteLead={handleDeleteLead}
                isBulkActionsOpen={isBulkActionsOpen}
                setIsBulkActionsOpen={setIsBulkActionsOpen}
                isLoading={isLoading}
              />
            )}
          </div>
        );
      case 'dashboard':
        return (
          <div>
            <h2>Dashboard Content</h2>
            <p>This is the dashboard page content.</p>
          </div>
        );
      case 'import':
        return (
          <div>
            <h2>Import Leads</h2>
            <p>This is where you can import leads.</p>
          </div>
        );
      case 'categories':
        return (
          <div>
            <h2>Categories</h2>
            <p>Manage your lead categories here.</p>
          </div>
        );
      case 'templates':
        return (
          <div>
            <h2>Templates</h2>
            <p>Create and manage email templates.</p>
          </div>
        );
      case 'settings':
        return (
          <div>
            <h2>Settings</h2>
            <p>Configure your application settings.</p>
          </div>
        );
      default:
        return (
          <div>
            <h2>404 - Not Found</h2>
            <p>The requested content was not found.</p>
          </div>
        );
    }
  };

  return (
    <AppleLayout 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      categories={categories}
      onLeadAdded={handleRefetchLeads}
    >
      {renderContent()}
    </AppleLayout>
  );
};

export default Index;
