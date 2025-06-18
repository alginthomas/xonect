import React, { useState } from 'react';
import { Check, ChevronsUpDown, Calendar, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import type { ImportBatch } from '@/types/category';
interface BatchComboboxProps {
  batches: ImportBatch[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  leadCounts?: Record<string, number>;
}
export const BatchCombobox: React.FC<BatchComboboxProps> = ({
  batches,
  value,
  onChange,
  placeholder = "Select batch...",
  className,
  leadCounts = {}
}) => {
  const [open, setOpen] = useState(false);
  const selectedBatch = batches.find(batch => batch.id === value);
  return <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search batches..." />
          <CommandList>
            <CommandEmpty>No batches found.</CommandEmpty>
            <CommandGroup>
              <CommandItem onSelect={() => {
              onChange('all');
              setOpen(false);
            }}>
                <Check className={cn("mr-2 h-4 w-4", value === 'all' ? "opacity-100" : "opacity-0")} />
                <span className="font-medium">All Batches</span>
              </CommandItem>
              {batches.map(batch => <CommandItem key={batch.id} onSelect={() => {
              onChange(batch.id);
              setOpen(false);
            }}>
                  <Check className={cn("mr-2 h-4 w-4", value === batch.id ? "opacity-100" : "opacity-0")} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate">{batch.name}</span>
                      {leadCounts[batch.id] && <Badge variant="outline" className="text-xs ml-2">
                          {leadCounts[batch.id]} leads
                        </Badge>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{format(batch.createdAt, 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{batch.totalLeads} imported</span>
                      </div>
                    </div>
                  </div>
                </CommandItem>)}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>;
};