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
  return;
};