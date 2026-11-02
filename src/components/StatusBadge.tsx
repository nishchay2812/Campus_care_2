import React from 'react';
import { Clock, RotateCw, CheckCircle2 } from 'lucide-react';
import { ComplaintStatus } from '../types';

interface StatusBadgeProps {
  status: ComplaintStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'Pending':
        return {
          icon: Clock,
          container: 'bg-amber-50 text-amber-800 border-amber-200/80',
          dot: 'bg-amber-500',
        };
      case 'In Progress':
        return {
          icon: RotateCw,
          container: 'bg-blue-50 text-blue-700 border-blue-200/80',
          dot: 'bg-blue-500',
        };
      case 'Resolved':
        return {
          icon: CheckCircle2,
          container: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
          dot: 'bg-emerald-600',
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-lg border shadow-2xs whitespace-nowrap ${config.container} ${sizeClasses}`}
    >
      <Icon className={`w-3.5 h-3.5 ${status === 'In Progress' ? 'animate-spin-slow' : ''}`} />
      <span>{status}</span>
    </span>
  );
};
