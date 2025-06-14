
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus, ChevronRight } from 'lucide-react';
import { QuickRemarksModal } from './remarks/QuickRemarksModal';
import type { RemarkEntry } from '@/types/lead';

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
  const [isEditing, setIsEditing] = useState(false);

  const handleOpenModal = (editing = false) => {
    setIsEditing(editing);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditing(false);
  };

  // Clean, minimal design
  if (!remarks) {
    return (
      <>
        <div className={`flex items-center ${className}`}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenModal(true)}
            className="h-8 px-3 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="text-sm">Add remark</span>
          </Button>
        </div>
        
        <QuickRemarksModal
          open={showModal}
          onOpenChange={handleCloseModal}
          initialRemarks={remarks}
          initialRemarksHistory={remarksHistory}
          onUpdate={onUpdate}
          initialIsEditing={isEditing}
        />
      </>
    );
  }

  // When remarks exist, show a clean preview
  const truncatedRemarks = remarks.length > 40 ? `${remarks.slice(0, 40)}...` : remarks;
  
  return (
    <>
      <div className={`flex items-center gap-2 ${className}`}>
        <div 
          className="flex-1 min-w-0 cursor-pointer group"
          onClick={() => handleOpenModal(false)}
        >
          <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
            <MessageSquare className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className="text-sm text-gray-700 truncate flex-1" title={remarks}>
              {truncatedRemarks}
            </span>
            <ChevronRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
      
      <QuickRemarksModal
        open={showModal}
        onOpenChange={handleCloseModal}
        initialRemarks={remarks}
        initialRemarksHistory={remarksHistory}
        onUpdate={onUpdate}
        initialIsEditing={isEditing}
      />
    </>
  );
};
