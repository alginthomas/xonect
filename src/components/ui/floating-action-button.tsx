
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
  icon = <Plus className="h-5 w-5" />,
  label = "Add Lead",
  className
}) => {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50",
        "bg-primary hover:bg-primary/90 text-primary-foreground",
        "md:hidden", // Only show on mobile
        className
      )}
      size="default"
      aria-label={label}
    >
      {icon}
    </Button>
  );
};
