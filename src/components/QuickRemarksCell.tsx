
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Eye, Edit3 } from 'lucide-react';
import type { RemarkEntry } from '@/types/lead';
import { QuickRemarksModal } from './remarks/QuickRemarksModal';

interface QuickRemarksCellProps {
  remarks: string;
  remarksHistory?: RemarkEntry[];
  onUpdate: (remarks: string, remarksHistory: RemarkEntry[]) => void;
  className?: string;
}

export const QuickRemarksCell: React.FC<QuickRemarksCellProps> = ({
  remarks,
  remarksHistory = [],
  onUpdate,
  className = "",
}) => {
  const [showModal, setShowModal] = useState(false);
  const [modalInitialEditMode, setModalInitialEditMode] = useState(false);

  const isLong = remarks.length > 50 || remarks.includes('\n');
  const showViewIcon = isLong || remarks.length > 0;

  const handleViewFull = (e: React.MouseEvent) => {
    e.stopPropagation();
    setModalInitialEditMode(false);
    setShowModal(true);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setModalInitialEditMode(true);
    setShowModal(true);
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {remarks ? (
        <>
          <div
            className="flex-1 min-w-0 cursor-pointer group"
            onClick={isLong ? handleViewFull : undefined}
            style={{ maxWidth: 260 }} 
            title={remarks}
          >
            <span className="block text-sm line-clamp-1 break-all truncate pr-7 transition-colors">
              {remarks}
            </span>
          </div>
          {showViewIcon && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0 ml-[-1.5rem] opacity-70 hover:opacity-100 transition-opacity"
              onClick={handleViewFull}
              aria-label="View full remark"
              tabIndex={0}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-0 opacity-70 hover:opacity-100 transition-opacity"
            onClick={handleEditClick}
            aria-label="Edit remarks"
            tabIndex={0}
          >
            <Edit3 className="h-3 w-3" />
          </Button>
        </>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-left opacity-70 hover:opacity-100"
          onClick={handleEditClick}
        >
          <span className="text-muted-foreground text-sm flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> Add remarks...
          </span>
        </Button>
      )}

      {showModal && (
        <QuickRemarksModal
          open={showModal}
          onOpenChange={setShowModal}
          initialRemarks={remarks}
          initialRemarksHistory={remarksHistory}
          onUpdate={onUpdate}
          initialIsEditing={modalInitialEditMode}
        />
      )}
    </div>
  );
};
