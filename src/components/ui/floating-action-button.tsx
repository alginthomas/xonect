
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingActionButtonProps {
  onClick: () => void;
  icon?: React.ReactNode;
  label?: string;
  className?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  icon = <Plus className="h-6 w-6" />,
  label = "Add Lead",
  className
}) => {
  return (
    <Button
      onClick={onClick}
      className={cn(
        // Base styles with better mobile responsiveness
        "fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50",
        "bg-primary hover:bg-primary/90 text-primary-foreground",
        // Enhanced mobile styles
        "touch-manipulation select-none",
        "sm:h-16 sm:w-16", // Slightly larger on small screens and up
        "md:bottom-6 md:right-6",
        // Ensure proper touch target size (minimum 44px)
        "min-w-[56px] min-h-[56px]",
        className
      )}
      size="icon-lg"
      aria-label={label}
    >
      {icon}
    </Button>
  );
};
