import React, { useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Mail, 
  User, 
  Calendar, 
  Tag, 
  FileText, 
  CheckCircle2, 
  RotateCw, 
  Clock,
  ShieldAlert,
  Trash2
} from 'lucide-react';
import { ComplaintRecord, ComplaintStatus } from '../types';
import { StatusBadge } from './StatusBadge';

interface ComplaintDetailsModalProps {
  complaint: ComplaintRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (id: string, newStatus: ComplaintStatus) => void;
  onDelete?: (complaint: ComplaintRecord) => void;
}

export const ComplaintDetailsModal: React.FC<ComplaintDetailsModalProps> = ({
  complaint,
  isOpen,
  onClose,
  onStatusChange,
  onDelete,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !complaint) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3.5 sm:px-6 sm:py-5 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 pr-2">
            <div className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-900 text-xs font-mono font-bold break-all max-w-[150px] sm:max-w-none truncate sm:overflow-visible">
              {complaint.id}
            </div>
            <StatusBadge status={complaint.status} size="sm" />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors shrink-0 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          
          {/* Student Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
            <div>
              <span className="text-slate-500 flex items-center gap-1.5 mb-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Student Name
              </span>
              <span className="text-sm font-semibold text-slate-900 block">
                {complaint.studentName}
              </span>
            </div>

            <div>
              <span className="text-slate-500 flex items-center gap-1.5 mb-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Email Address
              </span>
              <span className="text-sm font-semibold text-slate-900 block truncate">
                {complaint.email}
              </span>
            </div>

            <div>
              <span className="text-slate-500 flex items-center gap-1.5 mb-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Category
              </span>
              <span className="text-sm font-semibold text-slate-900 block">
                {complaint.category}
              </span>
            </div>

            <div>
              <span className="text-slate-500 flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Submission Date
              </span>
              <span className="text-sm font-semibold text-slate-900 block">
                {complaint.date}
              </span>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Campus Location
            </label>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-800">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{complaint.location}</span>
            </div>
          </div>

          {/* Full Description */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Full Description
            </label>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {complaint.description}
            </div>
          </div>

          {/* Change Status Action */}
          <div className="pt-2 border-t border-slate-100">
            <label className="text-xs font-semibold text-slate-700 block mb-2">
              Update Status:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onStatusChange(complaint.id, 'Pending')}
                className={`py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  complaint.status === 'Pending'
                    ? 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-300/40 font-bold'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Pending</span>
              </button>

              <button
                type="button"
                onClick={() => onStatusChange(complaint.id, 'In Progress')}
                className={`py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  complaint.status === 'In Progress'
                    ? 'bg-blue-100 text-blue-900 border-blue-300 ring-2 ring-blue-300/40 font-bold'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <RotateCw className="w-3.5 h-3.5 text-blue-600" />
                <span>In Progress</span>
              </button>

              <button
                type="button"
                onClick={() => onStatusChange(complaint.id, 'Resolved')}
                className={`py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  complaint.status === 'Resolved'
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300 ring-2 ring-emerald-300/40 font-bold'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Resolved</span>
              </button>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 px-4 py-3 sm:px-6 sm:py-4 bg-slate-50 border-t border-slate-100 shrink-0">
          {onDelete && complaint.status === 'Resolved' ? (
            <button
              type="button"
              onClick={() => onDelete(complaint)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red-700 hover:text-red-800 hover:bg-red-50 border border-red-200/80 rounded-xl transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600" />
              <span>Delete Complaint</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors shadow-2xs cursor-pointer text-center"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
