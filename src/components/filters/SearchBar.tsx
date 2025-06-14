
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange
}) => {
  return (
    <div className="relative group">
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
        <Search className="text-muted-foreground h-5 w-5 group-focus-within:text-primary transition-colors duration-200" />
      </div>
      <Input 
        placeholder="Search leads by name, company, email, or phone..." 
        value={searchTerm} 
        onChange={(e) => onSearchChange(e.target.value)} 
        className="pl-12 pr-4 h-12 text-base bg-white/80 border border-border/40 rounded-xl shadow-sm backdrop-blur-sm focus:bg-white focus:border-primary/50 focus:shadow-md focus:shadow-primary/5 transition-all duration-300 ease-out placeholder:text-muted-foreground/70 hover:border-border/60 hover:shadow-sm font-medium" 
      />
      {searchTerm && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onSearchChange('')} 
          className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 rounded-full hover:bg-muted/80 opacity-70 hover:opacity-100 transition-all duration-200"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </Button>
      )}
    </div>
  );
};
