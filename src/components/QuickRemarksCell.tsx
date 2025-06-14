
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

  // Truncate with ellipsis and a tooltip for overflow
  const TRUNCATE_LENGTH = 50;
  const isLong = remarks.length > TRUNCATE_LENGTH || remarks.includes('\n');
  const truncated = remarks.length > TRUNCATE_LENGTH
    ? `${remarks.slice(0, TRUNCATE_LENGTH)}...`
    : remarks;
  const showViewIcon = isLong || !!remarks;

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
      {/* Preview or Add button */}
      {remarks ? (
        <>
          <div
            className="flex-1 min-w-0 cursor-pointer group"
            onClick={isLong ? handleViewFull : handleEditClick}
            style={{ maxWidth: 240 }}
            title={remarks}
          >
            <span className="block text-sm line-clamp-1 break-all truncate pr-6 transition-colors">
              {isLong ? truncated : remarks}
            </span>
          </div>
          {/* Eye icon for full view if truncated/long */}
          {showViewIcon && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 p-0 ml-[-1.5rem] opacity-80 hover:opacity-100 transition-opacity"
              onClick={handleViewFull}
              aria-label="View full remark"
              tabIndex={0}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {/* Always show edit icon at end */}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 p-0 opacity-80 hover:opacity-100 transition-opacity"
            onClick={handleEditClick}
            aria-label="Edit remarks"
            tabIndex={0}
          >
            <Edit3 className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-left opacity-90 hover:opacity-100"
          onClick={handleEditClick}
        >
          <span className="text-muted-foreground text-sm flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> Add remarks...
          </span>
        </Button>
      )}

      {/* Modal for full editing/view */}
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
