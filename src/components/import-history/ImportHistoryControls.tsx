
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface ImportHistoryControlsProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortBy: 'date' | 'name' | 'leads';
  onSortChange: (value: 'date' | 'name' | 'leads') => void;
  filteredBatchesLength: number;
  selectedCount: number;
  onSelectAll: () => void;
}

export const ImportHistoryControls: React.FC<ImportHistoryControlsProps> = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  filteredBatchesLength,
  selectedCount,
  onSelectAll
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Import Batches</CardTitle>
        <CardDescription>
          Search, sort, and manage your imported lead batches
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search import batches..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Sort by Date</SelectItem>
                <SelectItem value="name">Sort by Name</SelectItem>
                <SelectItem value="leads">Sort by Lead Count</SelectItem>
              </SelectContent>
            </Select>

            {filteredBatchesLength > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSelectAll}
                className="whitespace-nowrap"
              >
                {selectedCount === filteredBatchesLength ? 'Deselect All' : 'Select All'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
