
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
        "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50",
        "bg-blue-600 hover:bg-blue-700 text-white",
        "flex items-center justify-center",
        className
      )}
      size="icon"
      aria-label={label}
    >
      {icon}
    </Button>
  );
};
