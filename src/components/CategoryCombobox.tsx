
import React, { useState, useCallback } from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { Category } from '@/types/category';

interface CategoryComboboxProps {
  categories: Category[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const CategoryCombobox: React.FC<CategoryComboboxProps> = ({
  categories,
  value,
  onChange,
  placeholder = "Select or type category name...",
  className
}) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const selectedCategory = categories.find(cat => cat.name.toLowerCase() === value.toLowerCase());
  const isNewCategory = value && !selectedCategory;

  const handleSelect = useCallback((categoryName: string) => {
    onChange(categoryName);
    setOpen(false);
    setSearchValue('');
  }, [onChange]);

  const handleInputChange = useCallback((search: string) => {
    setSearchValue(search);
    onChange(search);
  }, [onChange]);

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Determine what to display in the button
  const displayText = value || placeholder;
  const showPlaceholder = !value;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full h-12 justify-between text-left font-normal px-4 py-3",
            showPlaceholder && "text-muted-foreground",
            className
          )}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {selectedCategory && (
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: selectedCategory.color }}
              />
            )}
            {isNewCategory && (
              <Plus className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            )}
            <span className="truncate flex-1">
              {displayText}
            </span>
            {isNewCategory && (
              <span className="text-xs text-muted-foreground flex-shrink-0">
                (will create)
              </span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 flex-shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search or type new category name..."
            value={searchValue}
            onValueChange={handleInputChange}
            className="h-12"
          />
          <CommandList>
            <CommandEmpty>
              {searchValue ? (
                <div className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-3">
                    <Plus className="h-4 w-4" />
                    Create new category
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSelect(searchValue)}
                    className="w-full"
                  >
                    "{searchValue}"
                  </Button>
                </div>
              ) : (
                "No categories found."
              )}
            </CommandEmpty>
            
            {filteredCategories.length > 0 && (
              <CommandGroup heading="Existing Categories">
                {filteredCategories.map((category) => (
                  <CommandItem
                    key={category.id}
                    value={category.name}
                    onSelect={() => handleSelect(category.name)}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="truncate font-medium">{category.name}</span>
                    </div>
                    <Check
                      className={cn(
                        "h-4 w-4 flex-shrink-0",
                        value === category.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {searchValue && !filteredCategories.some(cat => 
              cat.name.toLowerCase() === searchValue.toLowerCase()
            ) && (
              <CommandGroup heading="Create New">
                <CommandItem
                  value={searchValue}
                  onSelect={() => handleSelect(searchValue)}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <Plus className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span>Create "{searchValue}"</span>
                  </div>
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
