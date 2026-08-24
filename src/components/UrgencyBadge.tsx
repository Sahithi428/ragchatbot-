import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface UrgencyBadgeProps {
  deadlineStr: string;
  showIcon?: boolean;
}

export const UrgencyBadge: React.FC<UrgencyBadgeProps> = ({ deadlineStr, showIcon = true }) => {
  const calculateDaysLeft = (dateStr: string): number => {
    try {
      const deadline = new Date(dateStr);
      const today = new Date();
      const diffTime = deadline.getTime() - today.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (e) {
      return 30;
    }
  };

  const daysLeft = calculateDaysLeft(deadlineStr);

  if (daysLeft < 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
        Expired
      </span>
    );
  }

  if (daysLeft <= 7) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-rose-950/80 text-rose-300 border border-rose-600/50 shadow-sm shadow-rose-900/30 animate-pulse">
        {showIcon && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
        {daysLeft === 0 ? 'Due Today!' : `${daysLeft}d Left (Urgent)`}
      </span>
    );
  }

  if (daysLeft <= 30) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-950/80 text-amber-300 border border-amber-600/50">
        {showIcon && <Clock className="w-3.5 h-3.5 text-amber-400" />}
        {daysLeft}d Left
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-700/50">
      {showIcon && <Clock className="w-3.5 h-3.5 text-emerald-400" />}
      {daysLeft}d Left
    </span>
  );
};
