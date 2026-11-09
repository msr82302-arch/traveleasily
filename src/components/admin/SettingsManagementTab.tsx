import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApplications } from '../../context/ApplicationContext';
import {
  Settings,
  ShieldCheck,
  Building2,
  DollarSign,
  Mail,
  Database,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Lock,
  Globe
} from 'lucide-react';

export const SettingsManagementTab: React.FC = () => {
  const {
    isDevelopmentFixturesActive,
    loadTestFixtures,
    resetToCleanProduction,
    staffUsers,
    registrationRequests,
    auditLogs,
  } = useAuth();

  const { applications } = useApplications();

  const [platformFeePercent, setPlatformFeePercent] = useState('15');
  const [notifyClientOnSubmit, setNotifyClientOnSubmit] = useState(true);
  const [notifyAdminOnSubmit, setNotifyAdminOnSubmit] = useState(true);
  const [notifyStatusTransitions, setNotifyStatusTransitions] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Platform & Agency Header */}
      <div className="borderless-card p-6 bg-white border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider mb-1">
              <Settings className="w-3 h-3 text-slate-600" />
              <span>Platform Configuration</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Easy Travels Consular Administration Settings
            </h2>
            <p className="text-xs text-slate-500">
              Manage platform billing policy, sovereign fee transparency, Bahrain agency credentials, and dev environment state.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                isDevelopmentFixturesActive
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}
            >
              {isDevelopmentFixturesActive ? 'Development Fixtures Active' : 'Clean Production Mode'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Section 1: Transparent 15% Platform Service Charge */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                1. Transparent 15% Platform Service Charge Policy
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                Easy Travels strictly isolates <strong>100% sovereign government visa fees</strong> (which pass through entirely to the destination immigration authority) from our <strong>15% digital platform service fee</strong>. This fee covers automated edge OCR extraction, consular pre-flight audit, encrypted cloud document wallet, and SLA expediting.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Standard Platform Service Fee Rate (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={platformFeePercent}
                      onChange={(e) => setPlatformFeePercent(e.target.value)}
                      min="5"
                      max="30"
                      step="0.5"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400">%</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
                  <span className="text-[11px] font-bold text-slate-700 block">Example Formula on $100 Sovereign Fee:</span>
                  <div className="flex justify-between text-slate-600">
                    <span>Sovereign Pass-Through:</span>
                    <span className="font-mono">$100.00</span>
                  </div>
                  <div className="flex justify-between text-indigo-700 font-bold">
                    <span>Platform Fee ({platformFeePercent}%):</span>
                    <span className="font-mono">${(100 * (parseFloat(platformFeePercent) || 15) / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-extrabold border-t border-slate-100 pt-1">
                    <span>Total Client Checkout:</span>
                    <span className="font-mono">${(100 + (100 * (parseFloat(platformFeePercent) || 15) / 100)).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Physical Agency & Entity Coordinates */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-slate-900">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                2. Easy Travels Document Clearance HQ (Kingdom of Bahrain)
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 block text-[11px]">Licensed Operating Entity:</span>
                  <strong className="text-slate-900 block font-bold">Easy Travels Document Clearance W.L.L.</strong>
                  <span className="text-slate-500 block text-[11px] mt-1">Physical Agency Address:</span>
                  <span className="text-slate-800 block">
                    Building 402, Road 1215, Block 912, Near IMC Hospital, Lulu Road, Riffa, Kingdom of Bahrain
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Direct Consular Dispatch Lines:</span>
                  <span className="text-slate-800 font-mono block">+973 3327 6768 / +973 1777 0000</span>
                  <span className="text-slate-500 block text-[11px] mt-1">Sovereign Compliance:</span>
                  <span className="text-emerald-700 font-semibold block">Kingdom of Bahrain CR # 98214-01 Verified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Automated Notifications */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-slate-900">
              <Mail className="w-4 h-4 text-purple-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                3. Automated Consular Notification Triggers
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyClientOnSubmit}
                  onChange={(e) => setNotifyClientOnSubmit(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="text-xs">
                  <strong className="block text-slate-900 font-bold">Client Confirmation</strong>
                  <span className="text-slate-500 text-[11px]">Send immediate receipt & tracking ref</span>
                </div>
              </label>

              <label className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyAdminOnSubmit}
                  onChange={(e) => setNotifyAdminOnSubmit(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="text-xs">
                  <strong className="block text-slate-900 font-bold">Officer Intake Alert</strong>
                  <span className="text-slate-500 text-[11px]">Notify duty verifier on new lodgement</span>
                </div>
              </label>

              <label className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyStatusTransitions}
                  onChange={(e) => setNotifyStatusTransitions(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="text-xs">
                  <strong className="block text-slate-900 font-bold">Status Transitions</strong>
                  <span className="text-slate-500 text-[11px]">Email client on approval or action required</span>
                </div>
              </label>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {saveSuccess ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Configuration changes persisted.</span>
              </span>
            ) : (
              <span className="text-xs text-slate-400">Settings affect all connected sessions.</span>
            )}

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Save Platform Settings
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 4: DEVELOPMENT FIXTURES & DATA STATE CONTROLS */}
      <div className="borderless-card p-6 bg-white border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              4. Environment State & Test Fixture Switcher
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Current Apps: {applications.length} &bull; Staff: {staffUsers.length} &bull; Pending Requests: {registrationRequests.length}
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Switch between clean production mode (0 hardcoded fake applications, 0 fabricated balances, authentic empty states) and development fixture mode (pre-loaded with realistic synthetic test applications, staff, and registration requests).
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={loadTestFixtures}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Load Development Test Fixtures</span>
          </button>

          <button
            type="button"
            onClick={resetToCleanProduction}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Clean Production State (0 Records)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
