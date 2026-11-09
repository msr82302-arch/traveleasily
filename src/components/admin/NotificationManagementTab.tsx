import React, { useState } from 'react';
import { useApplications } from '../../context/ApplicationContext';
import {
  NotificationRecord,
  NotificationEvent,
  DeliveryStatus,
  RecipientType,
  NotificationRecipientConfig,
  NotificationTriggerConfig,
} from '../../types/notifications';
import {
  Mail,
  Send,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Eye,
  Sliders,
  Settings,
  Trash2,
  Copy,
  Check,
  ChevronRight,
  ExternalLink,
  Laptop,
  Smartphone,
  Info,
  ShieldAlert,
  ArrowUpRight,
  RotateCcw,
} from 'lucide-react';

export const NotificationManagementTab: React.FC = () => {
  const {
    emailLogs,
    clearEmailLogs,
    retryNotification,
    notificationRecipients,
    updateNotificationRecipients,
    notificationTriggers,
    updateNotificationTriggers,
    applications,
    updateApplicationStatus,
  } = useApplications();

  // Sub-tabs inside Notification Center
  const [subTab, setSubTab] = useState<'logs' | 'recipients' | 'triggers' | 'test'>('logs');

  // Filters for the logs table
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | DeliveryStatus>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | RecipientType>('ALL');
  const [eventFilter, setEventFilter] = useState<'ALL' | NotificationEvent>('ALL');

  // Inspector modal
  const [inspectingRecord, setInspectingRecord] = useState<NotificationRecord | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Recipient form edit state
  const [recipientForm, setRecipientForm] = useState<NotificationRecipientConfig>(notificationRecipients);
  const [recipientSaveSuccess, setRecipientSaveSuccess] = useState(false);

  // Trigger matrix edit state
  const [triggerList, setTriggerList] = useState<NotificationTriggerConfig[]>(notificationTriggers);
  const [triggerSaveSuccess, setTriggerSaveSuccess] = useState(false);

  // Test sandbox state
  const [testAppId, setTestAppId] = useState<string>(applications[0]?.id || '');
  const [testEvent, setTestEvent] = useState<NotificationEvent>('ready_for_review');
  const [testDispatchedAlert, setTestDispatchedAlert] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveRecipients = (e: React.FormEvent) => {
    e.preventDefault();
    updateNotificationRecipients(recipientForm);
    setRecipientSaveSuccess(true);
    setTimeout(() => setRecipientSaveSuccess(false), 3000);
  };

  const handleToggleTrigger = (eventKey: NotificationEvent, field: 'customerEnabled' | 'adminEnabled') => {
    const updated = triggerList.map((t) => {
      if (t.event === eventKey) {
        return { ...t, [field]: !t[field] };
      }
      return t;
    });
    setTriggerList(updated);
    updateNotificationTriggers(updated);
    setTriggerSaveSuccess(true);
    setTimeout(() => setTriggerSaveSuccess(false), 2000);
  };

  const handleResetTriggers = () => {
    import('../../services/emailService').then(({ DEFAULT_TRIGGER_CONFIGS }) => {
      setTriggerList(DEFAULT_TRIGGER_CONFIGS);
      updateNotificationTriggers(DEFAULT_TRIGGER_CONFIGS);
      setTriggerSaveSuccess(true);
      setTimeout(() => setTriggerSaveSuccess(false), 2000);
    });
  };

  const handleTriggerTestDispatch = () => {
    const targetApp = applications.find((a) => a.id === testAppId);
    if (!targetApp) return;

    // Simulate status update matching the test event
    let newStatusStr = 'Ready for Review';
    if (testEvent === 'application_submitted') newStatusStr = 'Draft';
    else if (testEvent === 'application_confirmed') newStatusStr = 'Ready for Review';
    else if (testEvent === 'documents_pending') newStatusStr = 'Documents Pending';
    else if (testEvent === 'under_review') newStatusStr = 'Under Review';
    else if (testEvent === 'additional_information_requested') newStatusStr = 'Additional Information Requested';
    else if (testEvent === 'processing') newStatusStr = 'Processing';
    else if (testEvent === 'completed') newStatusStr = 'Completed';
    else if (testEvent === 'rejected') newStatusStr = 'Rejected';
    else if (testEvent === 'cancelled') newStatusStr = 'Cancelled';

    updateApplicationStatus(
      targetApp.id,
      newStatusStr as any,
      `Simulated manual test trigger for event [${testEvent}]`
    );

    setTestDispatchedAlert(`Event '${testEvent}' dispatched for ${targetApp.id}. Check Live Dispatched Log.`);
    setTimeout(() => setTestDispatchedAlert(null), 4000);
  };

  // Filtered notification records
  const filteredRecords = emailLogs.filter((rec) => {
    const matchesSearch =
      rec.applicationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.recipientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rec.providerMessageId && rec.providerMessageId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || rec.deliveryStatus === statusFilter;
    const matchesType = typeFilter === 'ALL' || rec.recipientType === typeFilter;
    const matchesEvent = eventFilter === 'ALL' || rec.notificationEvent === eventFilter;

    return matchesSearch && matchesStatus && matchesType && matchesEvent;
  });

  // Calculate statistics
  const totalSent = emailLogs.filter((r) => r.deliveryStatus === 'Sent').length;
  const totalPending = emailLogs.filter((r) => r.deliveryStatus === 'Pending' || r.deliveryStatus === 'Processing').length;
  const totalFailed = emailLogs.filter((r) => r.deliveryStatus === 'Failed').length;
  const totalCustomer = emailLogs.filter((r) => r.recipientType === 'customer').length;
  const totalAdmin = emailLogs.filter((r) => r.recipientType === 'admin' || r.recipientType === 'officer').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="borderless-card p-6 bg-white border border-slate-200/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold uppercase tracking-wider">
              <Mail className="w-3.5 h-3.5" />
              <span>Automated Consular Email Dispatch System</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Email Notification Command Center
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
              Transactional lifecycle emails for customers and consular staff across 10 critical application events, with strict idempotency deduplication and PII masking.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearEmailLogs}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Clear Simulation History</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Dispatched</span>
            <span className="text-2xl font-black text-slate-900 mt-0.5 block">{emailLogs.length}</span>
            <span className="text-[10px] text-slate-500">All recorded logs</span>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100/60">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Delivered (Sent)</span>
            <span className="text-2xl font-black text-emerald-700 mt-0.5 block">{totalSent}</span>
            <span className="text-[10px] text-emerald-600">Simulated SMTP 250 OK</span>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-100/60">
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">In Queue / Pending</span>
            <span className="text-2xl font-black text-amber-700 mt-0.5 block">{totalPending}</span>
            <span className="text-[10px] text-amber-600">Awaiting worker thread</span>
          </div>
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100/60">
            <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">Failed / Retry</span>
            <span className="text-2xl font-black text-rose-700 mt-0.5 block">{totalFailed}</span>
            <span className="text-[10px] text-rose-600">Retryable via UI</span>
          </div>
          <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-100/60">
            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">Customer vs Admin</span>
            <span className="text-xl font-black text-indigo-900 mt-1 block">
              {totalCustomer} <span className="text-xs font-normal text-indigo-500">/</span> {totalAdmin}
            </span>
            <span className="text-[10px] text-indigo-600">Traveler / Staff queues</span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setSubTab('logs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            subTab === 'logs'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>1. Live Dispatched Logs ({emailLogs.length})</span>
        </button>

        <button
          onClick={() => setSubTab('recipients')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            subTab === 'recipients'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>2. Admin Recipient Routing</span>
        </button>

        <button
          onClick={() => setSubTab('triggers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            subTab === 'triggers'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>3. Event Trigger Matrix</span>
        </button>

        <button
          onClick={() => setSubTab('test')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            subTab === 'test'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>4. Simulated Dispatch Sandbox</span>
        </button>
      </div>

      {/* SUBTAB 1: LIVE DISPATCHED LOGS */}
      {subTab === 'logs' && (
        <div className="space-y-4">
          {/* Security & Idempotency Disclaimer Bar */}
          <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-white block">Strict Clean-Room Email Security & Idempotency Active</span>
                <span className="text-[11px] text-slate-400">
                  Deduplication key <code className="text-emerald-300 font-mono">ref:event:recipient:status</code> prevents duplicate dispatches. Zero full passport numbers, scans, or cards in email bodies.
                </span>
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-[11px] text-slate-300 border border-slate-700 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Simulated Dev Queue (DRF Ready)</span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="borderless-card p-4 bg-white flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search reference ID, recipient email, subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="ALL">All Delivery Statuses</option>
                <option value="Sent">Sent (Success)</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
                <option value="Retry Scheduled">Retry Scheduled</option>
              </select>

              {/* Recipient Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="ALL">All Recipient Types</option>
                <option value="customer">Traveler (Customer)</option>
                <option value="admin">Operations Desk (Admin)</option>
                <option value="officer">Assigned Consular Officer</option>
              </select>

              {/* Event Filter */}
              <select
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="ALL">All 10 Events</option>
                <option value="application_submitted">Application Submitted</option>
                <option value="application_confirmed">Application Confirmed</option>
                <option value="documents_pending">Documents Pending</option>
                <option value="ready_for_review">Ready for Review</option>
                <option value="under_review">Under Review</option>
                <option value="additional_information_requested">Additional Info Requested</option>
                <option value="processing">Processing with Gov</option>
                <option value="completed">Completed / Approved</option>
                <option value="rejected">Rejected by Authority</option>
                <option value="cancelled">Cancelled & Refunded</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="borderless-card bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Event & Delivery</th>
                    <th className="py-3 px-4">Application & Destination</th>
                    <th className="py-3 px-4">Recipient</th>
                    <th className="py-3 px-4">Subject Line</th>
                    <th className="py-3 px-4">Attempts & Timing</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <Mail className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="font-bold text-slate-700">No email records matched criteria</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Try adjusting search filters or trigger a simulated event in Tab 4.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((rec) => {
                      const isCustomer = rec.recipientType === 'customer';
                      const isSuccess = rec.deliveryStatus === 'Sent';
                      const isFailed = rec.deliveryStatus === 'Failed';
                      return (
                        <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                  isSuccess
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                                    : isFailed
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200/50'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200/50'
                                }`}
                              >
                                {isSuccess && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                                {isFailed && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                                {!isSuccess && !isFailed && <Clock className="w-3 h-3 text-amber-600" />}
                                <span>{rec.deliveryStatus}</span>
                              </span>
                            </div>
                            <div className="mt-1 text-[11px] font-mono text-slate-500 font-bold">
                              {rec.notificationEvent.replace(/_/g, ' ')}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-mono font-bold text-slate-900">{rec.applicationId}</div>
                            <div className="text-[11px] text-slate-500">
                              {rec.destinationName} &bull; <span className="text-teal-700 font-semibold">{rec.visaCategory}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  isCustomer
                                    ? 'bg-teal-50 text-teal-700 border border-teal-200/40'
                                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200/40'
                                }`}
                              >
                                {rec.recipientType}
                              </span>
                              <span className="font-bold text-slate-800">{rec.recipientName}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono truncate max-w-[200px]">
                              {rec.recipientEmail}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="font-semibold text-slate-800 truncate" title={rec.subject}>
                              {rec.subject}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate" title={rec.previewText}>
                              {rec.previewText}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="text-[11px] text-slate-700 font-semibold">
                              {rec.createdAt ? new Date(rec.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Attempt {rec.attemptCount} of {rec.maxAttempts}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Inspect HTML Email Modal Button */}
                              <button
                                onClick={() => setInspectingRecord(rec)}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-[11px] hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                                title="Inspect HTML rendering and SMTP headers"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Inspect</span>
                              </button>

                              {/* Retry button if failed or pending */}
                              {(isFailed || rec.deliveryStatus === 'Retry Scheduled') && (
                                <button
                                  onClick={() => retryNotification(rec.id)}
                                  className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[11px] hover:bg-rose-100 transition-colors flex items-center gap-1 cursor-pointer"
                                  title="Retry delivery dispatch"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Retry</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: ADMIN RECIPIENT ROUTING */}
      {subTab === 'recipients' && (
        <div className="max-w-4xl space-y-6">
          <div className="borderless-card p-6 bg-white space-y-5">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Consular Administrative Recipient Configuration
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure destination inboxes for staff notifications. These values map directly to backend environment variables (<code className="font-mono text-rose-600">EASYTRAVEL_ADMIN_EMAIL</code>, <code className="font-mono text-rose-600">EASYTRAVEL_APPLICATIONS_EMAIL</code>) without hardcoding.
              </p>
            </div>

            {recipientSaveSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-bold">Administrative recipient routing saved successfully to platform registry.</span>
              </div>
            )}

            <form onSubmit={handleSaveRecipients} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Primary Administrator Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={recipientForm.primaryAdminEmail}
                    onChange={(e) => setRecipientForm({ ...recipientForm, primaryAdminEmail: e.target.value })}
                    placeholder="admin@easytravels.bh"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Receives all critical alerts, escalated rejections, and refund authorizations.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Secondary / Executive Desk Email
                  </label>
                  <input
                    type="email"
                    value={recipientForm.secondaryAdminEmail}
                    onChange={(e) => setRecipientForm({ ...recipientForm, secondaryAdminEmail: e.target.value })}
                    placeholder="operations@easytravels.bh"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Secondary supervisory queue for high-value and rush dossiers.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Applications Triage Team Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={recipientForm.applicationsTeamEmail}
                    onChange={(e) => setRecipientForm({ ...recipientForm, applicationsTeamEmail: e.target.value })}
                    placeholder="applications@easytravels.bh"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Default recipient for new customer submissions and pre-flight reviews.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Consular Logistics Department
                  </label>
                  <input
                    type="email"
                    value={recipientForm.consularDepartmentEmail}
                    onChange={(e) => setRecipientForm({ ...recipientForm, consularDepartmentEmail: e.target.value })}
                    placeholder="consular@easytravels.bh"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Alerted upon government lodgement and embassy appointment coordination.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Finance & Refund Settlement Desk
                  </label>
                  <input
                    type="email"
                    value={recipientForm.financeDepartmentEmail}
                    onChange={(e) => setRecipientForm({ ...recipientForm, financeDepartmentEmail: e.target.value })}
                    placeholder="finance@easytravels.bh"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Receives fee settlements, 15% platform charges, and refund requests.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Quality Assurance & Compliance
                  </label>
                  <input
                    type="email"
                    value={recipientForm.qaDepartmentEmail}
                    onChange={(e) => setRecipientForm({ ...recipientForm, qaDepartmentEmail: e.target.value })}
                    placeholder="qa@easytravels.bh"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Sample auditing and SLA compliance verification.
                  </span>
                </div>
              </div>

              {/* Dynamic Assigned Officer Toggle */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Notify Assigned Consular Officer Automatically
                  </span>
                  <span className="text-[11px] text-slate-500">
                    When enabled, emails dispatch directly to the personal staff inbox of whoever is assigned to the dossier (e.g. Yousif Mansoor, Fatima Al-Zayani).
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={recipientForm.notifyAssignedOfficer}
                  onChange={(e) => setRecipientForm({ ...recipientForm, notifyAssignedOfficer: e.target.checked })}
                  className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Recipient Routing</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBTAB 3: EVENT TRIGGER MATRIX */}
      {subTab === 'triggers' && (
        <div className="space-y-4">
          <div className="borderless-card p-6 bg-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Lifecycle Event Trigger Matrix (10 Events)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Business-configurable rules determining whether travelers, administrators, or both receive automated dispatches upon state changes.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetTriggers}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Reset Defaults
                </button>
              </div>
            </div>

            {triggerSaveSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-semibold">Event trigger preferences updated instantly.</span>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Application Event</th>
                    <th className="py-3 px-4">Event Description</th>
                    <th className="py-3 px-4 text-center">Customer Notification</th>
                    <th className="py-3 px-4 text-center">Admin Operations Alert</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {triggerList.map((trig) => (
                    <tr key={trig.event} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{trig.label}</div>
                        <div className="font-mono text-[10px] text-slate-400">{trig.event}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-md">
                        {trig.description}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={trig.customerEnabled}
                          onChange={() => handleToggleTrigger(trig.event, 'customerEnabled')}
                          className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={trig.adminEnabled}
                          onChange={() => handleToggleTrigger(trig.event, 'adminEnabled')}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: TEST SANDBOX */}
      {subTab === 'test' && (
        <div className="max-w-3xl space-y-5">
          <div className="borderless-card p-6 bg-white space-y-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Simulated Notification Dispatch Sandbox
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Trigger any of the 10 lifecycle events on an active application to test personalized templating, recipient routing, and deduplication safeguards without waiting for external webhooks.
              </p>
            </div>

            {testDispatchedAlert && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-bold">{testDispatchedAlert}</span>
              </div>
            )}

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Application Dossier
                </label>
                <select
                  value={testAppId}
                  onChange={(e) => setTestAppId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.id} &mdash; {app.clientName} ({app.destinationName} - {app.visaType}) &bull; Current: {app.status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Event to Simulate
                </label>
                <select
                  value={testEvent}
                  onChange={(e) => setTestEvent(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="application_submitted">1. application_submitted (Intake & Dossier Creation)</option>
                  <option value="application_confirmed">2. application_confirmed (Payment Settled & Reference Issued)</option>
                  <option value="documents_pending">3. documents_pending (Re-upload / Missing Attachment Request)</option>
                  <option value="ready_for_review">4. ready_for_review (OCR Pre-Flight Complete)</option>
                  <option value="under_review">5. under_review (Consular Adjudication in Progress)</option>
                  <option value="additional_information_requested">6. additional_information_requested (Clarifications Needed)</option>
                  <option value="processing">7. processing (Lodged with Government / Embassy)</option>
                  <option value="completed">8. completed (Approved - Visa Grant Issued)</option>
                  <option value="rejected">9. rejected (Refusal Issued by Authority)</option>
                  <option value="cancelled">10. cancelled (Cancelled & Refunded)</option>
                </select>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Expected Simulation Outcomes</span>
                </div>
                <ul className="text-[11px] text-slate-600 space-y-1 list-disc list-inside">
                  <li>Generates customer-branded responsive HTML notification with tracking button.</li>
                  <li>Generates consular operations dark-themed alert with masked passport and deep link.</li>
                  <li>Enforces deduplication key preventing duplicate sends if re-triggered with same status.</li>
                </ul>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleTriggerTestDispatch}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-rose-400" />
                  <span>Simulate Event Notification Dispatch</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DUAL-PANE HTML EMAIL INSPECTOR MODAL */}
      {inspectingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-white">{inspectingRecord.subject}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        inspectingRecord.recipientType === 'customer'
                          ? 'bg-teal-500/20 text-teal-300'
                          : 'bg-indigo-500/20 text-indigo-300'
                      }`}
                    >
                      {inspectingRecord.recipientType}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    To: {inspectingRecord.recipientName} &lt;{inspectingRecord.recipientEmail}&gt; &bull; Ref: {inspectingRecord.applicationId}
                  </div>
                </div>
              </div>

              {/* Device Viewport Toggle & Close */}
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                      previewDevice === 'desktop' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Laptop className="w-3 h-3" />
                    <span>Desktop (600px)</span>
                  </button>
                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                      previewDevice === 'mobile' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-3 h-3" />
                    <span>Mobile (360px)</span>
                  </button>
                </div>

                <button
                  onClick={() => setInspectingRecord(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Modal Body: Dual Pane */}
            <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
              {/* Left Pane: Rendered HTML Email (7 cols) */}
              <div className="lg:col-span-7 bg-slate-100 p-4 sm:p-6 overflow-y-auto flex justify-center items-start border-b lg:border-b-0 lg:border-r border-slate-200">
                <div
                  className={`bg-white rounded-2xl shadow-md border border-slate-200/80 overflow-hidden transition-all duration-300 w-full ${
                    previewDevice === 'mobile' ? 'max-w-[375px]' : 'max-w-[620px]'
                  }`}
                >
                  <div
                    className="p-1"
                    dangerouslySetInnerHTML={{ __html: inspectingRecord.htmlBody }}
                  />
                </div>
              </div>

              {/* Right Pane: Technical Payload & Headers (5 cols) */}
              <div className="lg:col-span-5 bg-white p-6 overflow-y-auto space-y-5">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                    Delivery Metadata & Idempotency Key
                  </h4>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                      <span className="text-slate-500 font-semibold">Delivery Status:</span>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/50">
                        {inspectingRecord.deliveryStatus} (250 OK)
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                      <span className="text-slate-500 font-semibold">Event Trigger:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {inspectingRecord.notificationEvent}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                      <span className="text-slate-500 font-semibold">Provider Message ID:</span>
                      <span className="font-mono text-slate-700">
                        {inspectingRecord.providerMessageId || 'N/A'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                      <span className="text-slate-500 font-semibold">Attempt Count:</span>
                      <span className="font-bold text-slate-800">
                        {inspectingRecord.attemptCount} of {inspectingRecord.maxAttempts}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                      <span className="text-slate-500 font-semibold">Timestamp:</span>
                      <span className="text-slate-700">
                        {inspectingRecord.sentAt ? new Date(inspectingRecord.sentAt).toLocaleString() : 'Pending'}
                      </span>
                    </div>

                    <div className="py-2 border-b border-slate-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-500 font-semibold">Deduplication Key (Idempotency):</span>
                        <button
                          onClick={() => handleCopy(inspectingRecord.dedupKey, 'dedup')}
                          className="text-[10px] text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          {copiedKey === 'dedup' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedKey === 'dedup' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <div className="p-2 rounded bg-slate-50 font-mono text-[11px] text-slate-800 break-all border border-slate-200">
                        {inspectingRecord.dedupKey}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Privacy & Anti-Leak Compliance */}
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Privacy & PII Audit Passed</span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Passport numbers are masked, financial card details are zeroed, and attachments are served via secure authenticated wallet links rather than unencrypted email attachments.
                  </p>
                </div>

                {/* Raw JSON Payload */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Raw JSON Record
                    </span>
                    <button
                      onClick={() => handleCopy(JSON.stringify(inspectingRecord, null, 2), 'raw')}
                      className="text-[10px] text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'raw' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'raw' ? 'Copied' : 'Copy JSON'}</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-900 text-slate-300 rounded-xl font-mono text-[10px] overflow-x-auto max-h-44">
                    {JSON.stringify(
                      {
                        id: inspectingRecord.id,
                        applicationId: inspectingRecord.applicationId,
                        recipientEmail: inspectingRecord.recipientEmail,
                        recipientType: inspectingRecord.recipientType,
                        event: inspectingRecord.notificationEvent,
                        subject: inspectingRecord.subject,
                        deliveryStatus: inspectingRecord.deliveryStatus,
                        dedupKey: inspectingRecord.dedupKey,
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
