
import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Filter, X, Phone } from 'lucide-react';
import type { Category } from '@/types/category';
import type { LeadStatus } from '@/types/lead';

interface MobileFilterDrawerProps {
  statusFilter: string;
  categoryFilter: string;
  dataAvailabilityFilter: string;
  duplicatePhoneFilter?: string;
  categories: Category[];
  onStatusChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onDataAvailabilityChange: (value: string) => void;
  onDuplicatePhoneChange?: (value: string) => void;
  onClearFilters: () => void;
}

// All available lead statuses
const allLeadStatuses: LeadStatus[] = [
  'New', 'Contacted', 'Opened', 'Clicked', 'Replied', 
  'Qualified', 'Unqualified', 'Call Back', 'Unresponsive', 
  'Not Interested', 'Interested', 'Send Email'
];

export const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({
  statusFilter,
  categoryFilter,
  dataAvailabilityFilter,
  duplicatePhoneFilter = 'all',
  categories,
  onStatusChange,
  onCategoryChange,
  onDataAvailabilityChange,
  onDuplicatePhoneChange,
  onClearFilters
}) => {
  const [open, setOpen] = useState(false);

  const getActiveFilterCount = () => {
    let count = 0;
    if (statusFilter !== 'all') count++;
    if (categoryFilter !== 'all') count++;
    if (dataAvailabilityFilter !== 'all') count++;
    if (duplicatePhoneFilter !== 'all') count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative gap-2">
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[90vh] flex flex-col p-0">
        <div className="flex-shrink-0 p-6 border-b">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              Filter Leads
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearFilters}
                  className="text-muted-foreground"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              )}
            </SheetTitle>
            <SheetDescription>
              Filter your leads by status, category, data availability, and phone duplicates
            </SheetDescription>
          </SheetHeader>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full px-6">
            <div className="space-y-6 py-6">
              {/* Status Filter */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={onStatusChange}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {allLeadStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Category</label>
                <Select value={categoryFilter} onValueChange={onCategoryChange}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="All Categories" />
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
              </div>

              {/* Data Availability Filter */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Data Availability</label>
                <Select value={dataAvailabilityFilter} onValueChange={onDataAvailabilityChange}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="All Leads" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Leads</SelectItem>
                    <SelectItem value="has-phone">Has Phone</SelectItem>
                    <SelectItem value="has-email">Has Email</SelectItem>
                    <SelectItem value="has-both">Has Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Duplicate Phone Filter */}
              {onDuplicatePhoneChange && (
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number Duplicates
                  </label>
                  <Select value={duplicatePhoneFilter} onValueChange={onDuplicatePhoneChange}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="All Phone Numbers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Phone Numbers</SelectItem>
                      <SelectItem value="unique-only">
                        <div className="flex flex-col">
                          <span>Unique Phone Only</span>
                          <span className="text-xs text-muted-foreground">Best lead per phone number</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="duplicates-only">
                        <div className="flex flex-col">
                          <span>Duplicates Only</span>
                          <span className="text-xs text-muted-foreground">Show leads with duplicate phones</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Extra padding for better scrolling */}
              <div className="h-20" />
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};
