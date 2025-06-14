
import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Archive, Trash2, MoveRight } from 'lucide-react';
import type { ImportBatch } from '@/types/category';

interface SmartDeletionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  batches: ImportBatch[];
  onConfirm: (batchIds: string[], deletionType: 'cascade' | 'preserve' | 'soft') => void;
}

export const SmartDeletionDialog: React.FC<SmartDeletionDialogProps> = ({
  isOpen,
  onClose,
  batches,
  onConfirm
}) => {
  const [deletionType, setDeletionType] = useState<'cascade' | 'preserve' | 'soft'>('soft');
  
  const totalLeads = batches.reduce((sum, batch) => sum + (batch.totalLeads || 0), 0);
  const batchIds = batches.map(b => b.id);

  const handleConfirm = () => {
    onConfirm(batchIds, deletionType);
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Smart Batch Deletion
          </AlertDialogTitle>
          <AlertDialogDescription>
            You're about to delete {batches.length} batch{batches.length > 1 ? 'es' : ''} containing {totalLeads} leads total.
            Choose how you want to handle this deletion:
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          {/* Batch Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Batches to Delete</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {batches.slice(0, 3).map((batch) => (
                <div key={batch.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{batch.name}</span>
                  <Badge variant="secondary">{batch.totalLeads || 0} leads</Badge>
                </div>
              ))}
              {batches.length > 3 && (
                <div className="text-sm text-muted-foreground">
                  ...and {batches.length - 3} more batches
                </div>
              )}
            </CardContent>
          </Card>

          {/* Deletion Options */}
          <RadioGroup value={deletionType} onValueChange={(value: 'cascade' | 'preserve' | 'soft') => setDeletionType(value)}>
            <Card className={`cursor-pointer transition-colors ${deletionType === 'soft' ? 'ring-2 ring-primary' : ''}`}>
              <CardContent className="pt-4">
                <div className="flex items-start space-x-3">
                  <RadioGroupItem value="soft" id="soft" className="mt-1" />
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="soft" className="cursor-pointer flex items-center gap-2">
                      <Archive className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Soft Delete (Recommended)</span>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Mark batches as deleted but keep data for 30 days. You can restore them if needed.
                      Leads remain accessible but batch is hidden from normal views.
                    </p>
                    <Badge variant="outline" className="text-green-600 border-green-600">Safe & Reversible</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`cursor-pointer transition-colors ${deletionType === 'preserve' ? 'ring-2 ring-primary' : ''}`}>
              <CardContent className="pt-4">
                <div className="flex items-start space-x-3">
                  <RadioGroupItem value="preserve" id="preserve" className="mt-1" />
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="preserve" className="cursor-pointer flex items-center gap-2">
                      <MoveRight className="h-4 w-4 text-orange-500" />
                      <span className="font-medium">Delete Batch, Preserve Leads</span>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Remove the batch organization but move all leads to "Unassigned" category.
                      Leads and their data remain fully accessible.
                    </p>
                    <Badge variant="outline" className="text-blue-600 border-blue-600">Keeps Lead Data</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`cursor-pointer transition-colors ${deletionType === 'cascade' ? 'ring-2 ring-primary' : ''}`}>
              <CardContent className="pt-4">
                <div className="flex items-start space-x-3">
                  <RadioGroupItem value="cascade" id="cascade" className="mt-1" />
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="cascade" className="cursor-pointer flex items-center gap-2">
                      <Trash2 className="h-4 w-4 text-red-500" />
                      <span className="font-medium">Permanent Deletion</span>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete batches and all associated leads. This action cannot be undone.
                      Use only when you're certain you no longer need this data.
                    </p>
                    <Badge variant="destructive">Permanent & Irreversible</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </RadioGroup>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            className={deletionType === 'cascade' ? 'bg-destructive hover:bg-destructive/90' : ''}
          >
            {deletionType === 'soft' && 'Archive Batches'}
            {deletionType === 'preserve' && 'Delete Batches Only'}
            {deletionType === 'cascade' && 'Permanently Delete All'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
