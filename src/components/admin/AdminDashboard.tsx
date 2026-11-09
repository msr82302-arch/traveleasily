import React, { useState } from 'react';
import { useApplications } from '../../context/ApplicationContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { VisaApplication, ApplicationStatus } from '../../types/visa';
import { StatusBadge } from '../common/StatusBadge';
import { DocumentVerifierDrawer } from './DocumentVerifierDrawer';
import { RbacPermissionsMatrix } from './RbacPermissionsMatrix';
import { StaffInvitationsManager } from './StaffInvitationsManager';
import { VISA_REQUIREMENTS_DATABASE } from '../../data/destinations';
import { DispatchedEmail } from '../../services/emailService';
import { StaffManagementTab } from './StaffManagementTab';
import { RolesManagementTab } from './RolesManagementTab';
import { PermissionsManagementTab } from './PermissionsManagementTab';
import { SettingsManagementTab } from './SettingsManagementTab';
import { NotificationManagementTab } from './NotificationManagementTab';
import {
  Layers,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Eye,
  Sliders,
  DollarSign,
  TrendingUp,
  ShieldAlert,
  Send,
  MessageSquare,
  Phone,
  Mail,
  UserCheck,
  Check,
  Users,
  Inbox,
  FileText,
  RefreshCw,
  ExternalLink,
  X,
  KeyRound,
  Shield,
  Settings,
  Sparkles
} from 'lucide-react';

interface AdminDashboardProps {
  initialTab?: 'tracker' | 'verifier' | 'staff' | 'roles' | 'permissions' | 'invitations' | 'rules' | 'refunds' | 'support' | 'settings' | 'emails';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ initialTab }) => {
  const {
    applications,
    updateApplicationStatus,
    approveApplication,
    rejectApplication,
    requestReUpload,
    refundApplication,
    emailLogs,
    clearEmailLogs,
  } = useApplications();
  const { hasPermission, currentUser, activeRole, registrationRequests, loadTestFixtures, isDevelopmentFixturesActive } = useAuth();
  const { formatPrice } = useLanguage();

  const [activeTab, setActiveTab] = useState<
    'tracker' | 'verifier' | 'staff' | 'roles' | 'permissions' | 'invitations' | 'rules' | 'refunds' | 'support' | 'settings' | 'emails'
  >(initialTab || 'tracker');

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [inspectingApp, setInspectingApp] = useState<VisaApplication | null>(null);

  // Refund modal state
  const [refundModalApp, setRefundModalApp] = useState<VisaApplication | null>(null);
  const [refundReason, setRefundReason] = useState('Traveler requested cancellation before lodgement');

  // Support alerts state
  const [alertSuccessMessage, setAlertSuccessMessage] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<
    { sender: 'agent' | 'client'; text: string; time: string }[]
  >([
    {
      sender: 'client',
      text: 'Hello, I submitted my Saudi eVisa dossier. When will it be lodged with the ministry?',
      time: '10:14 AM',
    },
    {
      sender: 'agent',
      text: 'Good morning! Our verification officer is conducting the OCR check. It will be submitted within 2 hours.',
      time: '10:16 AM',
    },
  ]);

  // Pricing rules state for inline tweaking
  const [countryRules, setCountryRules] = useState(VISA_REQUIREMENTS_DATABASE);

  // Filtered applications
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.traveler.passportNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.destinationName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      app.status === statusFilter ||
      (statusFilter === 'Ready for Review' && (app.status as string) === 'Pending Review') ||
      (statusFilter === 'Processing' && (app.status as string) === 'Processing with Government') ||
      (statusFilter === 'Additional Information Requested' && (app.status as string) === 'Action Required') ||
      (statusFilter === 'Completed' && (app.status === 'Approved' || app.status === 'Delivered')) ||
      (statusFilter === 'Cancelled' && (app.status as string) === 'Refunded');
    return matchesSearch && matchesStatus;
  });

  const totalApps = applications.length;
  const approvedCount = applications.filter(
    (a) => a.status === 'Approved' || a.status === 'Delivered'
  ).length;
  const pendingCount = applications.filter(
    (a) => a.status === 'Pending Review' || a.status === 'Under Review'
  ).length;
  const actionReqCount = applications.filter((a) => a.status === 'Action Required').length;
  const totalGrossUSD = applications.reduce((acc, a) => acc + (a.payment?.amountUSD || 0), 0);

  // Derived Customer Insights
  const customerDossiers = React.useMemo(() => {
    const map = new Map<string, {
      clientId: string;
      clientName: string;
      clientEmail: string;
      clientPhone: string;
      passportNumber: string;
      nationality: string;
      totalApps: number;
      totalSpendUSD: number;
      destinations: string[];
      lastActive: string;
    }>();

    applications.forEach((app) => {
      const key = (app.clientEmail || app.clientName).toLowerCase();
      const existing = map.get(key);
      if (!existing) {
        map.set(key, {
          clientId: app.clientId || `CLI-${Math.floor(1000 + Math.random() * 9000)}`,
          clientName: app.clientName,
          clientEmail: app.clientEmail,
          clientPhone: app.clientPhone,
          passportNumber: app.traveler.passportNumber,
          nationality: app.traveler.nationality,
          totalApps: 1,
          totalSpendUSD: app.payment?.amountUSD || 0,
          destinations: [app.destinationName],
          lastActive: app.updatedAt || app.submittedAt,
        });
      } else {
        existing.totalApps += 1;
        existing.totalSpendUSD += app.payment?.amountUSD || 0;
        if (!existing.destinations.includes(app.destinationName)) {
          existing.destinations.push(app.destinationName);
        }
        existing.lastActive = app.updatedAt || app.submittedAt;
      }
    });

    return Array.from(map.values());
  }, [applications]);

  const handleSendNotification = (type: 'whatsapp' | 'sms' | 'email', app: VisaApplication) => {
    setAlertSuccessMessage(
      `Dispatched automated ${type.toUpperCase()} alert to ${app.clientName} (${app.clientPhone || app.clientEmail}) for application ${app.id}`
    );
    setTimeout(() => setAlertSuccessMessage(null), 4000);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const now = new Date();
    setChatMessages((prev) => [
      ...prev,
      {
        sender: 'agent',
        text: chatInput,
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setChatInput('');
  };

  const handleProcessRefund = () => {
    if (!refundModalApp) return;
    refundApplication(refundModalApp.id, refundReason);
    setRefundModalApp(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Administrative Command Center</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Consular Operations & Client Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time pipeline oversight, side-by-side OCR audit drawer, and multi-gateway management.
          </p>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-100 text-xs text-slate-700">
          <UserCheck className="w-4 h-4 text-teal-600" />
          <span>
            Signed in as: <strong>{currentUser?.name || 'Administrator'}</strong> (
            <span className="capitalize">{activeRole.replace('_', ' ')}</span>)
          </span>
        </div>
      </div>

      {/* Operational KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="borderless-card p-5 bg-white">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Dossiers</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{totalApps}</span>
          <span className="text-[11px] text-teal-600 font-semibold mt-1 block">Live synced</span>
        </div>

        <div className="borderless-card p-5 bg-white">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Approval Rate</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">99.4%</span>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">Government Verified</span>
        </div>

        <div className="borderless-card p-5 bg-white">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Pending Queue</span>
          <span className="text-2xl font-black text-blue-600 mt-1 block">{pendingCount}</span>
          <span className="text-[11px] text-blue-700 font-semibold mt-1 block">Awaiting Verification</span>
        </div>

        <div className="borderless-card p-5 bg-white">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Action Required</span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">{actionReqCount}</span>
          <span className="text-[11px] text-amber-700 font-semibold mt-1 block">Client follow-up</span>
        </div>

        <div className="borderless-card p-5 bg-white col-span-2 lg:col-span-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Gross Intake</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{formatPrice(totalGrossUSD)}</span>
          <span className="text-[11px] text-slate-400 font-mono mt-1 block">BD {(totalGrossUSD * 0.376).toFixed(0)}</span>
        </div>
      </div>

      {alertSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/60 text-xs text-emerald-900 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{alertSuccessMessage}</span>
        </div>
      )}

      {/* Main Admin Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar p-1.5 bg-slate-100 rounded-2xl">
        <button
          onClick={() => setActiveTab('tracker')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'tracker' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          1. Live Application Tracker ({applications.length})
        </button>

        <button
          onClick={() => setActiveTab('verifier')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'verifier' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          2. Document Verifier Queue ({pendingCount})
        </button>

        <button
          onClick={() => setActiveTab('staff')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'staff' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-indigo-600" />
          <span>
            3. Staff & Approvals
            {registrationRequests.filter((r) => r.status === 'Pending Approval').length > 0 && (
              <span className="ml-1.5 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px]">
                {registrationRequests.filter((r) => r.status === 'Pending Approval').length} new
              </span>
            )}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'roles' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-purple-600" />
          <span>4. 8 Role Catalogue</span>
        </button>

        <button
          onClick={() => setActiveTab('permissions')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'permissions' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-teal-600" />
          <span>5. 19 Permissions Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('invitations')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'invitations' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5 text-purple-600" />
          <span>6. Staff Invitations</span>
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'rules' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          7. Visa Pricing & Rules
        </button>

        <button
          onClick={() => setActiveTab('refunds')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'refunds' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          8. Payments & 15% Fees
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'settings' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Settings className="w-3.5 h-3.5 text-slate-600" />
          <span>9. System Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('emails')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'emails' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Mail className="w-3.5 h-3.5 text-rose-600" />
          <span>10. Email Logs ({emailLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: Live Application Tracker Table */}
      {activeTab === 'tracker' && (
        <div className="borderless-card p-6 bg-white space-y-5">
          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search ID, traveler, passport, destination..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full borderless-input pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
              {['ALL', 'Ready for Review', 'Under Review', 'Processing', 'Additional Information Requested', 'Completed', 'Rejected', 'Cancelled'].map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      statusFilter === status
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {status}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Applications Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 pl-2">Reference ID</th>
                  <th className="pb-3">Applicant & Passport</th>
                  <th className="pb-3">Destination</th>
                  <th className="pb-3">Current Status</th>
                  <th className="pb-3">Speed SLA</th>
                  <th className="pb-3">Fee Paid</th>
                  <th className="pb-3 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 pl-2">
                      <span className="font-mono font-bold text-slate-900 block">{app.id}</span>
                      <span className="text-[10px] text-slate-400">{app.submittedAt?.split('T')[0]}</span>
                    </td>
                    <td className="py-3.5">
                      <span className="font-bold text-slate-800 block">{app.clientName}</span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {app.traveler.passportNumber} ({app.traveler.nationality})
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className="font-bold text-slate-900 block">{app.destinationName}</span>
                      <span className="text-[11px] text-teal-700 font-semibold">{app.visaType}</span>
                    </td>
                    <td className="py-3.5">
                      <StatusBadge status={app.status} size="sm" />
                    </td>
                    <td className="py-3.5">
                      <span className="font-semibold text-slate-700 capitalize block">
                        {app.processingSpeed.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Target: {app.slaDeadline ? app.slaDeadline.split('T')[0] : 'Standard'}
                      </span>
                    </td>
                    <td className="py-3.5 font-bold text-slate-800">
                      {formatPrice(app.payment.amountUSD)}
                    </td>
                    <td className="py-3.5 text-right pr-2">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setInspectingApp(app)}
                          className="px-3 py-1.5 rounded-full bg-slate-900 text-white font-bold text-[11px] hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect</span>
                        </button>

                        {/* Quick Status Dropdown */}
                        <select
                          value={app.status}
                          onChange={(e) =>
                            updateApplicationStatus(
                              app.id,
                              e.target.value as ApplicationStatus,
                              `Agent manually updated status to ${e.target.value}`
                            )
                          }
                          className="text-[11px] font-semibold bg-slate-100 rounded-full px-2 py-1 border-none cursor-pointer text-slate-700"
                        >
                          <option value="Draft">Draft</option>
                          <option value="Pending Review">Pending</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Processing with Government">Gov Lodged</option>
                          <option value="Action Required">Action Req</option>
                          <option value="Approved">Approved</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Refunded">Refunded</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {applications.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Inbox className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-slate-900">
                  Clean Production State: 0 Applications Lodged
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No traveler visa applications have been submitted to this consular environment yet. Dossiers submitted via the public portal will appear here in real time.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={loadTestFixtures}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Load Development Test Fixtures</span>
                </button>
              </div>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No applications match your filter criteria.
            </div>
          ) : null}
        </div>
      )}

      {/* TAB 2: Document Verifier Queue Cards */}
      {activeTab === 'verifier' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Verification Inspection Queue</h3>
              <p className="text-xs text-slate-500">
                Click any dossier below to launch the side-by-side OCR audit drawer.
              </p>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
              {pendingCount} Dossiers in queue
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map((app) => (
              <div
                key={app.id}
                className="borderless-card p-5 bg-white space-y-4 hover:border-teal-500 transition-all cursor-pointer"
                onClick={() => setInspectingApp(app)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400">{app.id}</span>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">{app.clientName}</h4>
                  </div>
                  <StatusBadge status={app.status} size="sm" />
                </div>

                <div className="aspect-[16/9] rounded-xl overflow-hidden bg-slate-900 relative">
                  <img
                    src={
                      app.passportScanUrl ||
                      'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80'
                    }
                    alt="Passport Scan"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-slate-900/80 text-[10px] text-teal-300 font-mono">
                    OCR: {app.ocrData?.overallConfidence || 96}%
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  <p>Destination: <strong>{app.destinationName}</strong></p>
                  <p>Passport: <span className="font-mono">{app.traveler.passportNumber}</span></p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setInspectingApp(app);
                  }}
                  className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Launch Dual-Pane Verifier</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Staff Management & Registration Approvals */}
      {activeTab === 'staff' && <StaffManagementTab />}

      {/* TAB 4: 8 Role Catalogue */}
      {activeTab === 'roles' && (
        <RolesManagementTab onSwitchToPermissions={() => setActiveTab('permissions')} />
      )}

      {/* TAB 5: 19 Granular Permissions Matrix */}
      {activeTab === 'permissions' && <PermissionsManagementTab />}

      {/* TAB 6: Staff Invitations & Onboarding */}
      {activeTab === 'invitations' && <StaffInvitationsManager />}

      {/* TAB 5: Visa Pricing & Rules Engine */}
      {activeTab === 'rules' && (
        <div className="borderless-card p-6 bg-white space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Destination Visa Rules & Consular Tariffs</h3>
              <p className="text-xs text-slate-500">
                Adjust government fees, concierge service margins, and validity rules.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-400">14 Active Rule Profiles</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.values(countryRules).map((rule) => (
              <div key={rule.destinationCode} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold">{rule.destinationName}</span>
                    <span className="text-xs font-mono text-slate-400">({rule.destinationCode})</span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800">
                    {rule.visaType}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Gov Fee (USD)</label>
                    <input
                      type="number"
                      value={rule.governmentFeeUSD}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        setCountryRules((prev) => ({
                          ...prev,
                          [rule.destinationCode]: { ...rule, governmentFeeUSD: val },
                        }));
                      }}
                      className="w-full borderless-input px-3 py-1.5 text-xs font-bold text-slate-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">EasyTravel Margin</label>
                    <input
                      type="number"
                      value={rule.serviceFeeUSD}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        setCountryRules((prev) => ({
                          ...prev,
                          [rule.destinationCode]: { ...rule, serviceFeeUSD: val },
                        }));
                      }}
                      className="w-full borderless-input px-3 py-1.5 text-xs font-bold text-slate-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Standard SLA</label>
                    <div className="py-2 text-xs font-bold text-slate-700">
                      {rule.standardProcessingDays} Days
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500">
                  Total client fee: <strong>{formatPrice(rule.governmentFeeUSD + rule.serviceFeeUSD)}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: Payments & Refunds */}
      {activeTab === 'refunds' && (
        <div className="borderless-card p-6 bg-white space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Payment Settlements & Refund Authorization</h3>
              <p className="text-xs text-slate-500">
                Stripe & AFS Merchant gateway transactions with 1-click refund authorization interface.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 uppercase tracking-wider block">Total Processed</span>
              <span className="text-lg font-black text-slate-900">{formatPrice(totalGrossUSD)}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 pl-2">Transaction ID</th>
                  <th className="pb-3">Client / Dossier</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Gateway</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 pl-2 font-mono font-bold text-slate-800">
                      {app.payment.transactionId}
                    </td>
                    <td className="py-3.5">
                      <span className="font-bold text-slate-800 block">{app.clientName}</span>
                      <span className="text-[10px] text-slate-400">{app.id}</span>
                    </td>
                    <td className="py-3.5 font-bold text-slate-900">
                      {formatPrice(app.payment.amountUSD)}
                    </td>
                    <td className="py-3.5 uppercase font-mono text-[11px] text-slate-600">
                      {app.payment.paymentMethod.replace('_', ' ')}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                          app.payment.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {app.payment.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right pr-2">
                      {app.payment.status === 'paid' ? (
                        <button
                          onClick={() => setRefundModalApp(app)}
                          className="px-3 py-1 rounded-full text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
                        >
                          Issue Refund
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">Refunded</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: Client Support & Omnichannel Alerts */}
      {activeTab === 'support' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Quick Dispatch Omnichannel Alerts */}
          <div className="lg:col-span-6 borderless-card p-6 bg-white space-y-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-teal-600" />
              <span>Omnichannel Notification Dispatcher</span>
            </h3>
            <p className="text-xs text-slate-500">
              Trigger real-time WhatsApp, SMS, or Email alerts directly to applicants regarding status changes.
            </p>

            <div className="space-y-3">
              {applications.slice(0, 4).map((app) => (
                <div key={app.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">{app.clientName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{app.id} • {app.destinationName}</span>
                    </div>
                    <StatusBadge status={app.status} size="sm" />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleSendNotification('whatsapp', app)}
                      className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Phone className="w-3 h-3 text-emerald-600" />
                      <span>WhatsApp Alert</span>
                    </button>

                    <button
                      onClick={() => handleSendNotification('sms', app)}
                      className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 hover:bg-blue-100 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <MessageSquare className="w-3 h-3 text-blue-600" />
                      <span>SMS Dispatch</span>
                    </button>

                    <button
                      onClick={() => handleSendNotification('email', app)}
                      className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-slate-200 text-slate-800 hover:bg-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Mail className="w-3 h-3 text-slate-600" />
                      <span>Email PDF</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Simulated Live Support Chat */}
          <div className="lg:col-span-6 borderless-card p-6 bg-white space-y-4 flex flex-col h-[520px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-900">Direct Client Support Channel</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Channel: Ahmed Al-Khalifa</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 p-2">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${msg.sender === 'agent' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'agent'
                        ? 'bg-slate-900 text-white rounded-tr-xs'
                        : 'bg-slate-100 text-slate-800 rounded-tl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.time}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChatMessage} className="pt-2 border-t border-slate-100 flex gap-2">
              <input
                type="text"
                placeholder="Type consular response to client..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 borderless-input px-4 py-2.5 text-xs text-slate-900 font-semibold"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 7: Customer Insights & Automated Dual Email Dispatch */}
      {activeTab === 'emails' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Top KPI Metrics for Communications & Clients */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="borderless-card p-5 bg-white">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Registered Clients</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{customerDossiers.length}</span>
              <span className="text-[11px] text-teal-600 font-semibold mt-1 block">Active Profiles</span>
            </div>

            <div className="borderless-card p-5 bg-white">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Dispatches</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{emailLogs.length}</span>
              <span className="text-[11px] text-slate-400 font-medium mt-1 block">Dual Transactional Alerts</span>
            </div>

            <div className="borderless-card p-5 bg-white">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Customer Emails</span>
              <span className="text-2xl font-black text-blue-600 mt-1 block">
                {emailLogs.filter((e) => e.recipientType === 'customer').length}
              </span>
              <span className="text-[11px] text-blue-700 font-semibold mt-1 block">Branded Client Updates</span>
            </div>

            <div className="borderless-card p-5 bg-white">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Admin Process Alerts</span>
              <span className="text-2xl font-black text-rose-600 mt-1 block">
                {emailLogs.filter((e) => e.recipientType === 'admin').length}
              </span>
              <span className="text-[11px] text-rose-700 font-semibold mt-1 block">To admin@easytravels.bh</span>
            </div>
          </div>

          {/* Section 1: Customer Dossier Insights */}
          <div className="borderless-card p-6 bg-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-600" />
                  <span>Customer Insights & Traveler Dossiers</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Aggregated traveler client profiles automatically updated upon each application lodgement.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                {customerDossiers.length} Distinct Profiles
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 pl-2">Client ID</th>
                    <th className="pb-3">Traveler Name</th>
                    <th className="pb-3">Contact Email & Phone</th>
                    <th className="pb-3">Passport & Nationality</th>
                    <th className="pb-3">Destinations</th>
                    <th className="pb-3">Dossiers</th>
                    <th className="pb-3 text-right pr-2">Total Spend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {customerDossiers.map((client) => (
                    <tr key={client.clientId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 pl-2 font-mono font-bold text-slate-700 text-[11px]">
                        {client.clientId}
                      </td>
                      <td className="py-3 font-bold text-slate-900">
                        {client.clientName}
                      </td>
                      <td className="py-3">
                        <span className="text-slate-800 block">{client.clientEmail}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{client.clientPhone}</span>
                      </td>
                      <td className="py-3">
                        <span className="font-mono text-slate-700 block">{client.passportNumber}</span>
                        <span className="text-[11px] text-slate-400">{client.nationality}</span>
                      </td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-1">
                          {client.destinations.map((d, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold">
                              {d}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 font-semibold text-slate-800">
                        {client.totalApps} {client.totalApps === 1 ? 'dossier' : 'dossiers'}
                      </td>
                      <td className="py-3 text-right pr-2 font-black text-slate-900">
                        {formatPrice(client.totalSpendUSD)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Automated Email Notification Command Center */}
          <NotificationManagementTab />
        </div>
      )}

      {/* TAB 9: Consular System Settings & Governance */}
      {activeTab === 'settings' && <SettingsManagementTab />}

      {/* Side-by-Side Dual-Pane Document Verifier Drawer */}
      {inspectingApp && (
        <DocumentVerifierDrawer
          application={inspectingApp}
          onClose={() => setInspectingApp(null)}
          onApprove={(id) => approveApplication(id)}
          onRequestReUpload={(id, reason) => requestReUpload(id, reason)}
          onReject={(id, reason) => rejectApplication(id, reason)}
        />
      )}

      {/* Financial Refund Modal */}
      {refundModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Authorize Refund</h3>
              <button
                onClick={() => setRefundModalApp(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 text-xs text-rose-900 space-y-1">
              <p>
                Authorizing refund for <strong>{refundModalApp.clientName}</strong> ({refundModalApp.id}).
              </p>
              <p className="font-bold">
                Refund Amount: {formatPrice(refundModalApp.payment.amountUSD)}
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Refund Reason / Audit Note
              </label>
              <input
                type="text"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full borderless-input px-3.5 py-2.5 text-xs text-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setRefundModalApp(null)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessRefund}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs cursor-pointer"
              >
                Authorize Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
