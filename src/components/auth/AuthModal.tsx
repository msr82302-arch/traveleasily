import React, { useState } from 'react';
import { useAuth, PRESET_STAFF_USERS } from '../../context/AuthContext';
import { ShieldCheck, ShieldAlert, Lock, User, Clock, AlertTriangle, Key, X, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    loginAs,
    logout,
    failedAttempts,
    isLockedOut,
    lockoutRemainingSeconds,
    attemptLoginWithCredentials,
    resetFailedAttempts,
  } = useAuth();

  const [email, setEmail] = useState('tariq.moayyed@easytravels.bh');
  const [password, setPassword] = useState('easytravel2026');
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const result = attemptLoginWithCredentials(email, password);
    if (result.success) {
      setFeedback({ type: 'success', message: result.message });
      setTimeout(() => {
        onClose();
        setFeedback(null);
      }, 1000);
    } else {
      setFeedback({ type: 'error', message: result.message });
    }
  };

  const handleTestFailAttempt = () => {
    // Intentionally trigger an invalid login to test the brute-force security counter
    const result = attemptLoginWithCredentials(email, 'wrong_password_test');
    setFeedback({ type: 'error', message: result.message });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Security & Authentication</h2>
              <p className="text-xs text-slate-500">Administrative Sign-In & Brute-Force Protection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Lockout Banner (Phase 6 Requirement) */}
        {isLockedOut ? (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-2 animate-pulse">
            <div className="flex items-center gap-2 font-bold text-rose-800">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
              <span>5-Minute Security Lockout Active!</span>
            </div>
            <p className="leading-relaxed">
              Account locked due to 5 consecutive failed login attempts. Authentication operations are currently suspended.
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-rose-200/60">
              <span className="font-mono text-sm font-black text-rose-700 flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{Math.floor(lockoutRemainingSeconds / 60)}m {lockoutRemainingSeconds % 60}s remaining</span>
              </span>
              <button
                type="button"
                onClick={resetFailedAttempts}
                className="text-[11px] font-bold text-rose-800 underline hover:text-rose-950 cursor-pointer"
              >
                Reset Counter (Admin Override)
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Consecutive Failed Attempts: <strong>{failedAttempts} / 5</strong></span>
            </div>
            {failedAttempts > 0 && (
              <span className="text-amber-700 font-bold text-[11px]">
                {5 - failedAttempts} attempts until 5m lockout
              </span>
            )}
          </div>
        )}

        {feedback && (
          <div
            className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 ${
              feedback.type === 'error'
                ? 'bg-amber-50 text-amber-900 border border-amber-200'
                : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
            }`}
          >
            {feedback.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
            <input
              type="email"
              disabled={isLockedOut}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full borderless-input px-4 py-3 text-xs font-semibold text-slate-900 disabled:opacity-50"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">Password</label>
              <span className="text-[11px] text-slate-400">Demo pass: easytravel2026</span>
            </div>
            <input
              type="password"
              disabled={isLockedOut}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full borderless-input px-4 py-3 text-xs font-semibold text-slate-900 disabled:opacity-50"
              required
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={isLockedOut}
              className="flex-1 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md disabled:opacity-50 transition-all cursor-pointer"
            >
              Sign In to EasyTravel
            </button>

            {/* Test Trigger Failed Attempt Button */}
            <button
              type="button"
              disabled={isLockedOut}
              onClick={handleTestFailAttempt}
              className="px-4 py-3 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              title="Test the 5-failure lockout counter"
            >
              Simulate Failed Attempt
            </button>
          </div>
        </form>

        {/* Quick Switch Persona Shortcuts */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Instant Persona Shortcuts
          </span>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_STAFF_USERS.slice(0, 4).map((user: any) => (
              <button
                key={user.id}
                type="button"
                onClick={() => {
                  loginAs(user);
                  setEmail(user.email);
                  setPassword('easytravel2026');
                  setFeedback({ type: 'success', message: `Signed in as ${user.name} (${user.role})` });
                  setTimeout(() => {
                    onClose();
                    setFeedback(null);
                  }, 700);
                }}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-left transition-colors cursor-pointer flex items-center gap-2"
              >
                <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
                <div className="truncate">
                  <span className="text-xs font-bold text-slate-800 block truncate">{user.name}</span>
                  <span className="text-[10px] text-slate-400 capitalize">{user.role.replace('_', ' ')}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {currentUser && (
          <div className="pt-2 flex justify-between items-center text-xs text-slate-500">
            <span>Logged in as <strong>{currentUser.name}</strong></span>
            <button
              onClick={logout}
              className="font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
            >
              Log Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
