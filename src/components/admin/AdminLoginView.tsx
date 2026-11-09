import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/visa';
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  ArrowRight,
  UserPlus,
  KeyRound,
  CheckCircle2,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';

interface AdminLoginViewProps {
  onNavigate: (path: string) => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({ onNavigate }) => {
  const {
    loginAs,
    attemptLoginWithCredentials,
    failedAttempts,
    isLockedOut,
    lockoutRemainingSeconds,
    resetFailedAttempts,
    staffUsers,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (isLockedOut) {
      setErrorMessage(`Account temporarily locked due to excessive failed attempts. Try again in ${lockoutRemainingSeconds}s.`);
      return;
    }

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your work email and password.');
      return;
    }

    const result = attemptLoginWithCredentials(email.trim(), password);
    if (result.success) {
      setSuccessMessage('Credentials authenticated. Initializing Consular Command Center...');
      setTimeout(() => {
        onNavigate('/admin/dashboard');
      }, 700);
    } else {
      setErrorMessage(result.message);
    }
  };

  // Quick Persona Test Logins
  const handleQuickLogin = (role: UserRole) => {
    const matched = staffUsers.find((s) => s.role === role) || {
      id: `staff-${role}`,
      name: role === 'super_admin' ? 'Tariq Al-Moayyed' : role.replace('_', ' ').toUpperCase(),
      email: `${role}@easytravels.bh`,
      phone: '+973 3327 6768',
      department: 'Consular Processing',
      jobDesignation: role.replace('_', ' '),
      role: role,
      status: 'active' as const,
      createdAt: '2026-01-10T08:00:00Z',
    };

    loginAs({
      id: matched.id,
      name: matched.name,
      email: matched.email,
      role: matched.role,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      title: matched.jobDesignation,
      department: matched.department,
    });
    setSuccessMessage(`Switched session to ${matched.name} (${role.replace('_', ' ')}).`);
    setTimeout(() => {
      onNavigate('/admin/dashboard');
    }, 400);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="borderless-card p-8 bg-white border border-slate-200/80 shadow-xl space-y-6 animate-in fade-in duration-300">
        {/* Brand & Badge */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
            Consular Admin Engine
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Sign In to Command Center
          </h1>
          <p className="text-xs text-slate-500">
            Easy Travels Document Clearance HQ &bull; Riffa, Bahrain
          </p>
        </div>

        {/* Lockout Warning Banner */}
        {isLockedOut && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="block text-rose-950 font-bold">Brute-Force Lockout Engaged</strong>
              <p className="text-[11px] leading-relaxed">
                Too many incorrect password attempts ({failedAttempts}/5). Access temporarily blocked for security.
              </p>
              <div className="flex items-center gap-2 pt-1 font-mono font-bold text-rose-900">
                <Clock className="w-3.5 h-3.5" />
                <span>Cooldown: {lockoutRemainingSeconds}s</span>
                <button
                  type="button"
                  onClick={resetFailedAttempts}
                  className="ml-auto text-[10px] underline hover:text-rose-950 cursor-pointer"
                >
                  Clear (Dev Override)
                </button>
              </div>
            </div>
          </div>
        )}

        {errorMessage && !isLockedOut && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Work Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@easytravels.bh"
                disabled={isLockedOut}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700">Password</label>
              <button
                type="button"
                onClick={() => onNavigate('/admin/forgot-password')}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={isLockedOut}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLockedOut}
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Sign In to Admin Portal</span>
          </button>
        </form>

        {/* Quick Testing Persona Logins */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              1-Click Developer Testing Personas
            </span>
            <span className="text-[10px] text-slate-400">Mock Auth</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickLogin('super_admin')}
              className="p-2 rounded-xl border border-indigo-200/60 bg-indigo-50/60 hover:bg-indigo-100 text-indigo-900 text-[11px] font-bold text-left transition-colors cursor-pointer"
            >
              👑 Super Admin
              <span className="block text-[10px] font-normal text-indigo-600">Full platform control</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('visa_officer')}
              className="p-2 rounded-xl border border-blue-200/60 bg-blue-50/60 hover:bg-blue-100 text-blue-900 text-[11px] font-bold text-left transition-colors cursor-pointer"
            >
              ✈️ Visa Officer
              <span className="block text-[10px] font-normal text-blue-600">Dossier processing</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('document_verifier')}
              className="p-2 rounded-xl border border-teal-200/60 bg-teal-50/60 hover:bg-teal-100 text-teal-900 text-[11px] font-bold text-left transition-colors cursor-pointer"
            >
              🔍 Document QA
              <span className="block text-[10px] font-normal text-teal-600">OCR & Passport audits</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('finance_officer')}
              className="p-2 rounded-xl border border-emerald-200/60 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-900 text-[11px] font-bold text-left transition-colors cursor-pointer"
            >
              💳 Finance Officer
              <span className="block text-[10px] font-normal text-emerald-600">Wallets & 15% Fees</span>
            </button>
          </div>
        </div>

        {/* Link to Registration */}
        <div className="pt-2 text-center border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Need staff credentials?{' '}
            <button
              type="button"
              onClick={() => onNavigate('/admin/signup')}
              className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Register New Administrator</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
