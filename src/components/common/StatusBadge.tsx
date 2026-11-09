import React from 'react';
import { ApplicationStatus } from '../../types/visa';
import { CheckCircle2, Clock, AlertTriangle, FileText, Send, RotateCcw, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: ApplicationStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'Completed':
      case 'Approved':
        return {
          bg: 'bg-emerald-50 text-emerald-700',
          dot: 'bg-emerald-500',
          icon: CheckCircle2,
          label: 'Completed / Granted',
        };
      case 'Delivered':
        return {
          bg: 'bg-teal-50 text-teal-700',
          dot: 'bg-teal-500',
          icon: Send,
          label: 'Delivered to Wallet',
        };
      case 'Processing':
      case 'Processing with Government':
        return {
          bg: 'bg-blue-50 text-blue-700',
          dot: 'bg-blue-500',
          icon: Clock,
          label: 'Processing with Government',
        };
      case 'Under Review':
        return {
          bg: 'bg-indigo-50 text-indigo-700',
          dot: 'bg-indigo-500',
          icon: FileText,
          label: 'Under Consular Review',
        };
      case 'Ready for Review':
      case 'Pending Review':
        return {
          bg: 'bg-sky-50 text-sky-700',
          dot: 'bg-sky-500',
          icon: Clock,
          label: 'Ready for Review',
        };
      case 'Additional Information Requested':
      case 'Action Required':
        return {
          bg: 'bg-amber-50 text-amber-800',
          dot: 'bg-amber-500',
          icon: AlertTriangle,
          label: 'Additional Info Required',
        };
      case 'Information Required':
        return {
          bg: 'bg-amber-50 text-amber-800',
          dot: 'bg-amber-500',
          icon: AlertTriangle,
          label: 'Information Required',
        };
      case 'Documents Pending':
        return {
          bg: 'bg-orange-50 text-orange-700',
          dot: 'bg-orange-500',
          icon: FileText,
          label: 'Documents Pending',
        };
      case 'Rejected':
        return {
          bg: 'bg-rose-50 text-rose-700',
          dot: 'bg-rose-500',
          icon: XCircle,
          label: 'Application Rejected',
        };
      case 'Cancelled':
      case 'Refunded':
        return {
          bg: 'bg-slate-100 text-slate-700',
          dot: 'bg-slate-500',
          icon: RotateCcw,
          label: 'Cancelled / Refunded',
        };
      case 'Draft':
      default:
        return {
          bg: 'bg-slate-100 text-slate-600',
          dot: 'bg-slate-400',
          icon: Clock,
          label: 'Draft Application',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-xs font-semibold px-3 py-1.5 gap-2',
    lg: 'text-sm font-semibold px-4 py-2 gap-2.5',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full transition-all duration-200 ${config.bg} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
      <Icon className="w-3.5 h-3.5 stroke-[2.2]" />
      <span>{config.label}</span>
    </span>
  );
};
