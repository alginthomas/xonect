
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
        "fixed bottom-24 right-6 h-16 w-16 rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 z-50",
        "bg-primary hover:bg-primary/90 text-primary-foreground",
        "md:hidden flex items-center justify-center", // Only show on mobile, ensure flex display
        className
      )}
      size="default"
      aria-label={label}
    >
      {icon}
    </Button>
  );
};
