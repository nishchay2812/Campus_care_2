import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, Loader2, X } from 'lucide-react';
import { ComplaintRecord } from '../types';

export interface DeleteConfirmModalProps {
  complaint: ComplaintRecord | null;
  isOpen: boolean;
  isDeleting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  complaint,
  isOpen,
  isDeleting = false,
  onClose,
  onConfirm,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen || !complaint) return null;

  const referenceId = complaint.complaintId || complaint.id;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={() => {
        if (!isDeleting) onClose();
      }}
    >
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close Button */}
        <div className="flex items-center justify-between px-4 pt-4 sm:px-6 sm:pt-5 pb-0 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 pt-3 pb-5 sm:px-6 sm:pt-3 sm:pb-6 overflow-y-auto flex-1">
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Confirm Complaint Deletion
          </h3>

          <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
            Are you sure you want to delete this complaint? This action will permanently remove the complaint and its associated details from the system. This operation cannot be undone.
          </p>

          {/* Reference ID card */}
          <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                COMPLAINT REFERENCE ID
              </span>
              <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-xs font-bold break-all w-fit">
                {referenceId}
              </span>
            </div>
            {complaint.studentName && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                <span className="text-slate-500">Student:</span>
                <span className="font-semibold text-slate-800 truncate max-w-[200px]">{complaint.studentName}</span>
              </div>
            )}
            {complaint.category && (
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-slate-500">Category:</span>
                <span className="font-medium text-slate-700">{complaint.category}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 px-4 py-3 sm:px-6 sm:py-4 bg-slate-50 border-t border-slate-100 shrink-0">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-center"
          >
            Cancel
          </button>
          
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete Complaint</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
