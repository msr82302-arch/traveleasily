import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  Mail,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock
} from 'lucide-react';

interface AdminForgotPasswordViewProps {
  onNavigate: (path: string) => void;
}

export const AdminForgotPasswordView: React.FC<AdminForgotPasswordViewProps> = ({ onNavigate }) => {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please provide a valid work email address.');
      return;
    }

    const res = requestPasswordReset(email.trim());
    if (res.success) {
      setSubmitted(true);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="borderless-card p-8 bg-white border border-slate-200/80 shadow-xl space-y-6 animate-in fade-in duration-300">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center mx-auto">
            <KeyRound className="w-7 h-7" />
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
            Consular Credentials Recovery
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Reset Administrator Password
          </h1>
          <p className="text-xs text-slate-500">
            Enter your authorized Easy Travels corporate email to receive a secure credentials recovery token.
          </p>
        </div>

        {submitted ? (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-950">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Recovery Token Dispatched</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                If an active or registered administrator record exists for <strong>{email}</strong>, a one-time credential reset link with a 15-minute validity window has been logged and dispatched.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <span>For immediate assistance, contact the Riffa IT Operations desk at <strong>+973 3327 6768</strong>.</span>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('/admin/login')}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Admin Sign In</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Corporate Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer@easytravels.bh"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Send Recovery Link</span>
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => onNavigate('/admin/login')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Back to Sign In</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
