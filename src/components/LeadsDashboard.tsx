import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { format } from 'date-fns';
import { CalendarIcon, ChevronDown, ChevronUp, Copy, Edit, Mail, FileText, MoreVertical, Plus, Search, Trash2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DateRange } from "react-day-picker"
import { sendEmailToLeads } from '@/utils/emailSender';
import { LeadDetailPopover } from '@/components/LeadDetailPopover';
import { LeadRemarksDialog } from '@/components/LeadRemarksDialog';
import { QuickRemarkEditor } from '@/components/QuickRemarkEditor';
import { BulkStatusUpdater } from '@/components/BulkStatusUpdater';
import type { Lead, EmailTemplate } from '@/types/lead';
import type { Category } from '@/types/category';

interface LeadsDashboardProps {
  leads: Lead[];
  categories: Category[];
  emailTemplates: EmailTemplate[];
  onSendEmail: (leadIds: string[], templateId: string) => Promise<void>;
  onUpdateLead: (leadId: string, updates: Partial<Lead>) => void;
  onDeleteLeads: (leadIds: string[]) => void;
  onUpdateRemarks: (leadId: string, remarks: string) => void;
  onBulkUpdateStatus: (leadIds: string[], status: Lead['status']) => void;
  isLoading?: boolean;
}

export const LeadsDashboard: React.FC<LeadsDashboardProps> = ({
  leads = [],
  categories = [],
  emailTemplates = [],
  onSendEmail,
  onUpdateLead,
  onDeleteLeads,
  onUpdateRemarks,
  onBulkUpdateStatus,
  isLoading = false
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Load saved state from localStorage
  const [searchQuery, setSearchQuery] = useState(() => {
    return localStorage.getItem('leadsDashboard_searchQuery') || '';
  });
  const [selectedStatus, setSelectedStatus] = useState<Lead['status'] | 'All'>(() => {
    return (localStorage.getItem('leadsDashboard_selectedStatus') as Lead['status'] | 'All') || 'All';
  });
  const [selectedCategory, setSelectedCategory] = useState<string | 'All'>(() => {
    return localStorage.getItem('leadsDashboard_selectedCategory') || 'All';
  });
  const [selectedLeads, setSelectedLeads] = useState<string[]>(() => {
    const storedLeads = localStorage.getItem('leadsDashboard_selectedLeads');
    return storedLeads ? JSON.parse(storedLeads) : [];
  });
  const [sortField, setSortField] = useState<'firstName' | 'email' | 'company' | 'title' | 'status'>(() => {
    return (localStorage.getItem('leadsDashboard_sortField') as 'firstName' | 'email' | 'company' | 'title' | 'status') || 'firstName';
  });
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(() => {
    return (localStorage.getItem('leadsDashboard_sortDirection') as 'asc' | 'desc') || 'asc';
  });
  const [currentPage, setCurrentPage] = useState(() => {
    return parseInt(localStorage.getItem('leadsDashboard_currentPage') || '1');
  });
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    return parseInt(localStorage.getItem('leadsDashboard_itemsPerPage') || '25');
  });
  const [isEmailDrawerOpen, setIsEmailDrawerOpen] = useState(() => {
    return localStorage.getItem('leadsDashboard_isEmailDrawerOpen') === 'true';
  });
  const [selectedTemplate, setSelectedTemplate] = useState(() => {
    return localStorage.getItem('leadsDashboard_selectedTemplate') || '';
  });
  const [date, setDate] = useState<DateRange | undefined>(() => {
    const storedDate = localStorage.getItem('leadsDashboard_dateRange');
    return storedDate ? JSON.parse(storedDate) : undefined;
  });
  const [isBulkStatusOpen, setIsBulkStatusOpen] = useState(() => {
    return localStorage.getItem('leadsDashboard_isBulkStatusOpen') === 'true';
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isFilterOpen, setIsFilterOpen] = useState(() => {
    return localStorage.getItem('leadsDashboard_isFilterOpen') === 'true';
  });

  // Save state changes to localStorage
  useEffect(() => {
    localStorage.setItem('leadsDashboard_searchQuery', searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    localStorage.setItem('leadsDashboard_selectedStatus', selectedStatus);
  }, [selectedStatus]);

  useEffect(() => {
    localStorage.setItem('leadsDashboard_selectedCategory', selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    localStorage.setItem('leadsDashboard_sortField', sortField);
  }, [sortField]);

  useEffect(() => {
    localStorage.setItem('leadsDashboard_sortDirection', sortDirection);
  }, [sortDirection]);

  useEffect(() => {
    localStorage.setItem('leadsDashboard_currentPage', currentPage.toString());
  }, [currentPage]);

  useEffect(() => {
    localStorage.setItem('leadsDashboard_itemsPerPage', itemsPerPage.toString());
  }, [itemsPerPage]);

  useEffect(() => {
    localStorage.setItem('leadsDashboard_isEmailDrawerOpen', isEmailDrawerOpen.toString());
  }, [isEmailDrawerOpen]);

  useEffect(() => {
    localStorage.setItem('leadsDashboard_selectedTemplate', selectedTemplate);
  }, [selectedTemplate]);

  useEffect(() => {
    localStorage.setItem('leadsDashboard_dateRange', JSON.stringify(date));
  }, [date]);

  useEffect(() => {
    localStorage.setItem('leadsDashboard_isBulkStatusOpen', isBulkStatusOpen.toString());
  }, [isBulkStatusOpen]);

  useEffect(() => {
    localStorage.setItem('leadsDashboard_isFilterOpen', isFilterOpen.toString());
  }, [isFilterOpen]);

  useEffect(() => {
    const batchId = searchParams.get('batch');
    if (batchId) {
      setSelectedCategory(batchId);
    } else {
      // Only reset if no batch param and current category is not 'All'
      if (selectedCategory !== 'All') {
        setSelectedCategory('All');
      }
    }
  }, [searchParams]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('All');
    setSelectedCategory('All');
    setDate(undefined);
    setSearchParams({});
    
    // Clear from localStorage
    localStorage.removeItem('leadsDashboard_searchQuery');
    localStorage.removeItem('leadsDashboard_selectedStatus');
    localStorage.removeItem('leadsDashboard_selectedCategory');
    localStorage.removeItem('leadsDashboard_dateRange');
  };

  const filteredLeads = useMemo(() => {
    let filtered = leads;

    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(lead =>
        lead.firstName.toLowerCase().includes(lowerCaseQuery) ||
        lead.lastName.toLowerCase().includes(lowerCaseQuery) ||
        lead.email.toLowerCase().includes(lowerCaseQuery) ||
        lead.company.toLowerCase().includes(lowerCaseQuery) ||
        lead.title.toLowerCase().includes(lowerCaseQuery)
      );
    }

    if (selectedStatus !== 'All') {
      filtered = filtered.filter(lead => lead.status === selectedStatus);
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(lead => lead.categoryId === selectedCategory);
    }

    if (date?.from && date?.to) {
      filtered = filtered.filter(lead => {
        const leadDate = new Date(lead.createdAt);
        const fromDate = new Date(date.from as Date);
        const toDate = new Date(date.to as Date);
        return leadDate >= fromDate && leadDate <= toDate;
      });
    }

    return filtered;
  }, [leads, searchQuery, selectedStatus, selectedCategory, date]);

  const sortedLeads = useMemo(() => {
    const sorted = [...filteredLeads];

    sorted.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }, [filteredLeads, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedLeads.length / itemsPerPage);
  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedLeads.slice(startIndex, endIndex);
  }, [sortedLeads, currentPage, itemsPerPage]);

  const handleSelectAll = () => {
    const currentPageLeadIds = paginatedLeads.map(lead => lead.id);
    const allCurrentPageSelected = currentPageLeadIds.every(id => selectedLeads.includes(id));
    
    let newSelectedLeads;
    if (allCurrentPageSelected) {
      // If all current page leads are selected, deselect them
      newSelectedLeads = selectedLeads.filter(id => !currentPageLeadIds.includes(id));
    } else {
      // If not all are selected, select all current page leads
      newSelectedLeads = [...new Set([...selectedLeads, ...currentPageLeadIds])];
    }
    
    setSelectedLeads(newSelectedLeads);
    localStorage.setItem('leadsDashboard_selectedLeads', JSON.stringify(newSelectedLeads));
  };

  const handleSelectLead = (leadId: string) => {
    const isSelected = selectedLeads.includes(leadId);
    let newSelectedLeads;

    if (isSelected) {
      newSelectedLeads = selectedLeads.filter(id => id !== leadId);
    } else {
      newSelectedLeads = [...selectedLeads, leadId];
    }

    setSelectedLeads(newSelectedLeads);
    localStorage.setItem('leadsDashboard_selectedLeads', JSON.stringify(newSelectedLeads));
  };

  const handleSort = (field: 'firstName' | 'email' | 'company' | 'title' | 'status') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSendEmail = async () => {
    if (!selectedTemplate) {
      toast({
        title: 'No template selected',
        description: 'Please select an email template to send.',
        variant: 'destructive',
      });
      return;
    }

    if (selectedLeads.length === 0) {
      toast({
        title: 'No leads selected',
        description: 'Please select leads to send the email to.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await onSendEmail(selectedLeads, selectedTemplate);
      toast({
        title: 'Emails sent',
        description: `Emails have been sent to ${selectedLeads.length} leads.`,
      });
      setIsEmailDrawerOpen(false);
    } catch (error) {
      toast({
        title: 'Error sending emails',
        description: 'Failed to send emails. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteLeads = () => {
    if (selectedLeads.length === 0) {
      toast({
        title: 'No leads selected',
        description: 'Please select leads to delete.',
        variant: 'destructive',
      });
      return;
    }

    onDeleteLeads(selectedLeads);
    setSelectedLeads([]);
    localStorage.removeItem('leadsDashboard_selectedLeads');
    toast({
      title: 'Leads deleted',
      description: `Selected leads have been deleted.`,
    });
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId || !categories || !Array.isArray(categories)) return 'Uncategorized';
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Unknown Category';
  };

  // Update the checkbox state calculation
  const allCurrentPageSelected = paginatedLeads.length > 0 && paginatedLeads.every(lead => selectedLeads.includes(lead.id));
  const someCurrentPageSelected = paginatedLeads.some(lead => selectedLeads.includes(lead.id)) && !allCurrentPageSelected;

  // Create a ref for the checkbox to handle indeterminate state
  const selectAllCheckboxRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate = someCurrentPageSelected;
    }
  }, [someCurrentPageSelected]);

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Input
            type="search"
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
        </div>

        <Button variant="outline" size="sm" onClick={() => setIsFilterOpen(true)}>
          Show Filters
        </Button>
      </div>

      {/* Filter Drawer */}
      <Drawer open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Filters</DrawerTitle>
            <DrawerDescription>
              Filter leads based on various criteria.
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 space-y-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Status</h4>
              <Select value={selectedStatus} onValueChange={(value: Lead['status'] | 'All') => setSelectedStatus(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
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
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Category</h4>
              <Select value={selectedCategory} onValueChange={(value: string | 'All') => setSelectedCategory(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Date Range</h4>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                      date.to ? (
                        `${format(date.from, "LLL dd, y")} - ${format(date.to, "LLL dd, y")}`
                      ) : (
                        format(date.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                    pagedNavigation
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DrawerFooter>
            <Button variant="outline" className="w-full" onClick={clearFilters}>Clear Filters</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Bulk Actions */}
      {selectedLeads.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {selectedLeads.length} leads selected.
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEmailDrawerOpen(true)}>
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsBulkStatusOpen(true)}>
              Update Status
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Leads
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Leads</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete the selected leads? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteLeads}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}

      {/* Leads Table */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Leads ({filteredLeads.length})</CardTitle>
              <CardDescription>
                Manage and track your leads
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="25">25 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                  <SelectItem value="100">100 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredLeads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No leads found</h3>
              <p>Start by importing some leads or adjust your filters.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        ref={selectAllCheckboxRef}
                        checked={allCurrentPageSelected}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('firstName')}
                    >
                      <div className="flex items-center gap-1">
                        Name
                        {sortField === 'firstName' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center gap-1">
                        Email
                        {sortField === 'email' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('company')}
                    >
                      <div className="flex items-center gap-1">
                        Company
                        {sortField === 'company' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('title')}
                    >
                      <div className="flex items-center gap-1">
                        Title
                        {sortField === 'title' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center gap-1">
                        Status
                        {sortField === 'status' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">
                        <Checkbox
                          checked={selectedLeads.includes(lead.id)}
                          onCheckedChange={() => handleSelectLead(lead.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <LeadDetailPopover lead={lead} categories={categories}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback>{lead.firstName.charAt(0)}{lead.lastName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {lead.firstName} {lead.lastName}
                          </div>
                        </LeadDetailPopover>
                      </TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell>{lead.company}</TableCell>
                      <TableCell>{lead.title}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{lead.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <QuickRemarkEditor lead={lead} onUpdateRemarks={onUpdateRemarks} />
                          <LeadRemarksDialog lead={lead} onUpdateRemarks={onUpdateRemarks}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </LeadRemarksDialog>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                if (lead.email) {
                                  navigator.clipboard.writeText(lead.email);
                                  toast({
                                    title: "Copied to clipboard",
                                    description: "Email address copied to clipboard.",
                                  })
                                } else {
                                  toast({
                                    title: "No email address",
                                    description: "This lead does not have an email address.",
                                    variant: "destructive",
                                  })
                                }
                              }}>
                                <Copy className="mr-2 h-4 w-4" /> Copy Email
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive hover:bg-destructive/20 focus:bg-destructive/20"
                                onClick={() => {
                                  onDeleteLeads([lead.id]);
                                  toast({
                                    title: "Lead deleted",
                                    description: `${lead.firstName} ${lead.lastName} has been deleted.`,
                                  })
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {paginatedLeads.length} of {filteredLeads.length} leads
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Side Panel Drawer for Sending Emails */}
      <Drawer open={isEmailDrawerOpen} onOpenChange={setIsEmailDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Send Email</DrawerTitle>
            <DrawerDescription>
              Select an email template to send to the selected leads.
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template">Email Template</Label>
              <Select value={selectedTemplate} onValueChange={(value) => setSelectedTemplate(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {emailTemplates.map(template => (
                    <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DrawerFooter>
            <Button className="w-full" onClick={handleSendEmail}>Send Email</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Bulk Status Updater */}
      <BulkStatusUpdater
        isOpen={isBulkStatusOpen}
        onClose={() => setIsBulkStatusOpen(false)}
        leadIds={selectedLeads}
        onUpdateStatus={onBulkUpdateStatus}
      />
    </div>
  );
};

export default LeadsDashboard;
