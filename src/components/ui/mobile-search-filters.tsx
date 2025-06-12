import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Search, Filter, X, SlidersHorizontal, Calendar, Building2, MapPin, Users } from 'lucide-react';
import type { LeadStatus, Seniority, CompanySize } from '@/types/lead';
import type { Category } from '@/types/category';
interface MobileSearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedStatus: LeadStatus | 'all';
  onStatusChange: (status: LeadStatus | 'all') => void;
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  categories: Category[];
  activeFiltersCount: number;
  onClearFilters: () => void;
  // New filter props
  selectedSeniority?: Seniority | 'all';
  onSeniorityChange?: (seniority: Seniority | 'all') => void;
  selectedCompanySize?: CompanySize | 'all';
  onCompanySizeChange?: (size: CompanySize | 'all') => void;
  selectedLocation?: string;
  onLocationChange?: (location: string) => void;
  selectedIndustry?: string;
  onIndustryChange?: (industry: string) => void;
  availableLocations?: string[];
  availableIndustries?: string[];
}
export const MobileSearchFilters: React.FC<MobileSearchFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedCategory,
  onCategoryChange,
  categories,
  activeFiltersCount,
  onClearFilters,
  selectedSeniority = 'all',
  onSeniorityChange,
  selectedCompanySize = 'all',
  onCompanySizeChange,
  selectedLocation = '',
  onLocationChange,
  selectedIndustry = '',
  onIndustryChange,
  availableLocations = [],
  availableIndustries = []
}) => {
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const handleClearAllFilters = () => {
    onClearFilters();
    if (onSeniorityChange) onSeniorityChange('all');
    if (onCompanySizeChange) onCompanySizeChange('all');
    if (onLocationChange) onLocationChange('');
    if (onIndustryChange) onIndustryChange('');
    setIsFilterSheetOpen(false);
  };
  const handleLocationChange = (value: string) => {
    if (onLocationChange) {
      onLocationChange(value === 'all-locations' ? '' : value);
    }
  };
  const handleIndustryChange = (value: string) => {
    if (onIndustryChange) {
      onIndustryChange(value === 'all-industries' ? '' : value);
    }
  };
  const totalActiveFilters = activeFiltersCount + (selectedSeniority !== 'all' ? 1 : 0) + (selectedCompanySize !== 'all' ? 1 : 0) + (selectedLocation ? 1 : 0) + (selectedIndustry ? 1 : 0);
  return <div className="sticky top-0 z-40 bg-background border-b border-border/30 p-4 space-y-3 px-0 py-[6px]">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search leads..." value={searchQuery} onChange={e => onSearchChange(e.target.value)} className="pl-10 pr-4" />
        {searchQuery && <Button variant="ghost" size="sm" className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0" onClick={() => onSearchChange('')}>
            <X className="h-3 w-3" />
          </Button>}
      </div>

      {/* Quick Filters Row - Horizontal Scrolling Container */}
      <div className="relative">
        <div className="overflow-x-auto scrollbar-hide">
          <div style={{
          minWidth: 'max-content'
        }} className="flex items-center gap-2 pb-2 py-[4px] px-[6px]">
            <Select value={selectedStatus} onValueChange={onStatusChange}>
              <SelectTrigger className="w-28 h-9 text-xs flex-shrink-0">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Contacted">Contacted</SelectItem>
                <SelectItem value="Qualified">Qualified</SelectItem>
                <SelectItem value="Interested">Interested</SelectItem>
                <SelectItem value="Not Interested">Not Interested</SelectItem>
                <SelectItem value="Unresponsive">Unresponsive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={onCategoryChange}>
              <SelectTrigger className="w-28 h-9 text-xs flex-shrink-0">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>)}
              </SelectContent>
            </Select>

            {/* Advanced Filters Sheet */}
            <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 px-3 text-xs relative flex-shrink-0 whitespace-nowrap">
                  <SlidersHorizontal className="h-3 w-3 mr-1" />
                  More
                  {totalActiveFilters > 0 && <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs flex items-center justify-center">
                      {totalActiveFilters}
                    </Badge>}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[90vh] max-h-[90vh] flex flex-col p-0">
                <div className="flex-shrink-0 p-4 sm:p-6 border-b">
                  <SheetHeader className="text-left">
                    <SheetTitle>Advanced Filters</SheetTitle>
                    <SheetDescription>
                      Refine your search with additional filters
                    </SheetDescription>
                  </SheetHeader>
                </div>
                
                <div className="flex-1 min-h-0 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="p-4 sm:p-6">
                      <div className="space-y-6 pb-24">
                        {/* Status & Category (repeated for convenience) */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm">Basic Filters</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-muted-foreground mb-1 block">Status</label>
                              <Select value={selectedStatus} onValueChange={onStatusChange}>
                                <SelectTrigger className="h-10 w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">All Status</SelectItem>
                                  <SelectItem value="New">New</SelectItem>
                                  <SelectItem value="Contacted">Contacted</SelectItem>
                                  <SelectItem value="Qualified">Qualified</SelectItem>
                                  <SelectItem value="Interested">Interested</SelectItem>
                                  <SelectItem value="Not Interested">Not Interested</SelectItem>
                                  <SelectItem value="Unresponsive">Unresponsive</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <label className="text-xs text-muted-foreground mb-1 block">Category</label>
                              <Select value={selectedCategory} onValueChange={onCategoryChange}>
                                <SelectTrigger className="h-10 w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">All Categories</SelectItem>
                                  {categories.map(category => <SelectItem key={category.id} value={category.id}>
                                      {category.name}
                                    </SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                        {/* Professional Filters */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Professional Details
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {onSeniorityChange && <div>
                                <label className="text-xs text-muted-foreground mb-1 block">Seniority</label>
                                <Select value={selectedSeniority} onValueChange={onSeniorityChange}>
                                  <SelectTrigger className="h-10 w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="all">All Levels</SelectItem>
                                    <SelectItem value="Junior">Junior</SelectItem>
                                    <SelectItem value="Mid-level">Mid-level</SelectItem>
                                    <SelectItem value="Senior">Senior</SelectItem>
                                    <SelectItem value="Executive">Executive</SelectItem>
                                    <SelectItem value="C-level">C-level</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>}
                            
                            {onCompanySizeChange && <div>
                                <label className="text-xs text-muted-foreground mb-1 block">Company Size</label>
                                <Select value={selectedCompanySize} onValueChange={onCompanySizeChange}>
                                  <SelectTrigger className="h-10 w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="all">All Sizes</SelectItem>
                                    <SelectItem value="Small (1-50)">Small (1-50)</SelectItem>
                                    <SelectItem value="Medium (51-200)">Medium (51-200)</SelectItem>
                                    <SelectItem value="Large (201-1000)">Large (201-1000)</SelectItem>
                                    <SelectItem value="Enterprise (1000+)">Enterprise (1000+)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>}
                          </div>
                        </div>

                        {/* Location & Industry Filters */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Company Details
                          </h4>
                          <div className="space-y-3">
                            {onLocationChange && <div>
                                <label className="text-xs text-muted-foreground mb-1 block">Location</label>
                                <Select value={selectedLocation || 'all-locations'} onValueChange={handleLocationChange}>
                                  <SelectTrigger className="h-10 w-full">
                                    <SelectValue placeholder="All Locations" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="all-locations">All Locations</SelectItem>
                                    {availableLocations.map(location => <SelectItem key={location} value={location}>
                                        {location}
                                      </SelectItem>)}
                                  </SelectContent>
                                </Select>
                              </div>}
                            
                            {onIndustryChange && <div>
                                <label className="text-xs text-muted-foreground mb-1 block">Industry</label>
                                <Select value={selectedIndustry || 'all-industries'} onValueChange={handleIndustryChange}>
                                  <SelectTrigger className="h-10 w-full">
                                    <SelectValue placeholder="All Industries" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="all-industries">All Industries</SelectItem>
                                    {availableIndustries.map(industry => <SelectItem key={industry} value={industry}>
                                        {industry}
                                      </SelectItem>)}
                                  </SelectContent>
                                </Select>
                              </div>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </div>

                {/* Fixed Action Buttons */}
                <div className="flex-shrink-0 bg-background border-t p-4 safe-area-inset-bottom">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" onClick={handleClearAllFilters} className="flex-1 h-11">
                      Clear All
                    </Button>
                    <Button onClick={() => setIsFilterSheetOpen(false)} className="flex-1 h-11">
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Clear Filters Button */}
            {totalActiveFilters > 0 && <Button variant="ghost" size="sm" onClick={handleClearAllFilters} className="h-9 px-2 text-xs flex-shrink-0 whitespace-nowrap">
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>}
          </div>
        </div>
        
        {/* Fade effect to indicate scrollable content */}
        <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>

      {/* Active Filters Display */}
      {totalActiveFilters > 0 && <div className="overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2 pb-1" style={{
        minWidth: 'max-content'
      }}>
            <span className="text-xs text-muted-foreground flex-shrink-0">Active filters:</span>
            {selectedStatus !== 'all' && <Badge variant="secondary" className="text-xs flex-shrink-0">
                Status: {selectedStatus}
              </Badge>}
            {selectedCategory !== 'all' && <Badge variant="secondary" className="text-xs flex-shrink-0">
                Category: {categories.find(c => c.id === selectedCategory)?.name}
              </Badge>}
            {selectedSeniority !== 'all' && <Badge variant="secondary" className="text-xs flex-shrink-0">
                Seniority: {selectedSeniority}
              </Badge>}
            {selectedCompanySize !== 'all' && <Badge variant="secondary" className="text-xs flex-shrink-0">
                Size: {selectedCompanySize}
              </Badge>}
            {selectedLocation && <Badge variant="secondary" className="text-xs flex-shrink-0">
                Location: {selectedLocation}
              </Badge>}
            {selectedIndustry && <Badge variant="secondary" className="text-xs flex-shrink-0">
                Industry: {selectedIndustry}
              </Badge>}
          </div>
        </div>}
    </div>;
};