import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApplications } from '../../context/ApplicationContext';
import {
  Sparkles,
  RotateCcw,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Database,
  ExternalLink,
  Lock,
  UserPlus
} from 'lucide-react';

interface DevEnvironmentBarProps {
  onNavigate: (path: string) => void;
  currentPath: string;
}

export const DevEnvironmentBar: React.FC<DevEnvironmentBarProps> = ({ onNavigate, currentPath }) => {
  const {
    isDevelopmentFixturesActive,
    loadTestFixtures,
    resetToCleanProduction,
    currentUser,
    registrationRequests,
    staffUsers,
  } = useAuth();

  const { applications } = useApplications();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const pendingCount = registrationRequests.filter((r) => r.status === 'Pending Approval').length;

  return (
    <aside aria-label="Development environment controls" className="bg-slate-900 text-white text-xs border-b border-slate-800 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left Side: Environment Indicator */}
        <div className="flex items-center gap-2.5">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
              isDevelopmentFixturesActive
                ? 'bg-amber-400 text-slate-950 font-black'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isDevelopmentFixturesActive ? 'bg-slate-950 animate-ping' : 'bg-emerald-400'
              }`}
            />
            {isDevelopmentFixturesActive ? 'DEV FIXTURES LOADED' : 'CLEAN PRODUCTION STATE'}
          </span>

          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Apps: <strong className="text-white">{applications.length}</strong> &bull; Staff:{' '}
            <strong className="text-white">{staffUsers.length}</strong>
            {pendingCount > 0 && (
              <span className="ml-1 text-amber-300 font-bold">
                &bull; Pending Registrations: {pendingCount}
              </span>
            )}
          </span>
        </div>

        {/* Middle: Navigation shortcuts to requested routes */}
        <nav aria-label="Consular route shortcuts" className="hidden md:flex items-center gap-1 text-[11px] text-slate-300">
          <span className="text-slate-500 text-[10px] uppercase font-bold mr-1">Routes:</span>
          <button
            onClick={() => onNavigate('/admin/signup')}
            className={`px-2 py-0.5 rounded hover:bg-slate-800 transition-colors cursor-pointer ${
              currentPath === '/admin/signup' ? 'bg-indigo-600 text-white font-bold' : ''
            }`}
          >
            /signup
          </button>
          <button
            onClick={() => onNavigate('/admin/login')}
            className={`px-2 py-0.5 rounded hover:bg-slate-800 transition-colors cursor-pointer ${
              currentPath === '/admin/login' ? 'bg-indigo-600 text-white font-bold' : ''
            }`}
          >
            /login
          </button>
          <button
            onClick={() => onNavigate('/admin/dashboard')}
            className={`px-2 py-0.5 rounded hover:bg-slate-800 transition-colors cursor-pointer ${
              currentPath === '/admin/dashboard' ? 'bg-indigo-600 text-white font-bold' : ''
            }`}
          >
            /dashboard
          </button>
          <button
            onClick={() => onNavigate('/admin/staff')}
            className={`px-2 py-0.5 rounded hover:bg-slate-800 transition-colors cursor-pointer ${
              currentPath === '/admin/staff' ? 'bg-indigo-600 text-white font-bold' : ''
            }`}
          >
            /staff
          </button>
          <button
            onClick={() => onNavigate('/admin/roles')}
            className={`px-2 py-0.5 rounded hover:bg-slate-800 transition-colors cursor-pointer ${
              currentPath === '/admin/roles' ? 'bg-indigo-600 text-white font-bold' : ''
            }`}
          >
            /roles
          </button>
          <button
            onClick={() => onNavigate('/admin/permissions')}
            className={`px-2 py-0.5 rounded hover:bg-slate-800 transition-colors cursor-pointer ${
              currentPath === '/admin/permissions' ? 'bg-indigo-600 text-white font-bold' : ''
            }`}
          >
            /permissions
          </button>
          <button
            onClick={() => onNavigate('/admin/settings')}
            className={`px-2 py-0.5 rounded hover:bg-slate-800 transition-colors cursor-pointer ${
              currentPath === '/admin/settings' ? 'bg-indigo-600 text-white font-bold' : ''
            }`}
          >
            /settings
          </button>
        </nav>

        {/* Right Side: Switcher Buttons */}
        <div className="flex items-center gap-2">
          {isDevelopmentFixturesActive ? (
            <button
              onClick={resetToCleanProduction}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 border border-slate-700 text-[10px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
              title="Reset to 0 applications, 0 fabricated records, clean empty state"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to Clean State</span>
            </button>
          ) : (
            <button
              onClick={loadTestFixtures}
              className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
              title="Load realistic synthetic test applications, staff, and registration queue"
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Load Dev Test Fixtures</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
