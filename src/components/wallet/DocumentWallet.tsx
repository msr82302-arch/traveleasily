import React, { useState } from 'react';
import { useApplications } from '../../context/ApplicationContext';
import { useLanguage } from '../../context/LanguageContext';
import { VisaApplication } from '../../types/visa';
import { StatusBadge } from '../common/StatusBadge';
import { PdfVisaViewer } from '../common/PdfVisaViewer';
import {
  Briefcase,
  Download,
  Printer,
  QrCode,
  Calendar,
  AlertTriangle,
  UploadCloud,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Plane,
  FileText,
  Wallet,
  Receipt,
  Percent,
  PlusCircle,
  X,
  CreditCard,
  Building,
  Check,
  Mail,
  Eye,
} from 'lucide-react';
import { NotificationRecord } from '../../types/notifications';

export const DocumentWallet: React.FC<{ onNewApplication: () => void }> = ({ onNewApplication }) => {
  const { applications, requestReUpload, updateApplicationStatus, emailLogs } = useApplications();
  const { formatPrice, currency } = useLanguage();
  
  const [selectedApplication, setSelectedApplication] = useState<VisaApplication | null>(null);
  const [inspectingReceiptApp, setInspectingReceiptApp] = useState<VisaApplication | null>(null);
  const [inspectingEmail, setInspectingEmail] = useState<NotificationRecord | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'approved' | 'active' | 'ledger' | 'notifications'>('all');
  const [reUploadModalApp, setReUploadModalApp] = useState<VisaApplication | null>(null);
  const [newUploadedFile, setNewUploadedFile] = useState<string | null>(null);
  
  // Wallet balance & voucher state
  const [walletBalanceUSD, setWalletBalanceUSD] = useState<number>(() => {
    return parseFloat(localStorage.getItem('et_wallet_balance') || '150.00');
  });
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherSuccess, setVoucherSuccess] = useState<string | null>(null);

  const filteredApps = applications.filter((app) => {
    if (activeTab === 'approved') return app.status === 'Approved' || app.status === 'Delivered' || app.status === 'Completed';
    if (activeTab === 'active') return app.status !== 'Approved' && app.status !== 'Delivered' && app.status !== 'Completed' && app.status !== 'Refunded' && app.status !== 'Cancelled';
    return true;
  });

  const handleResolveReUpload = (appId: string) => {
    updateApplicationStatus(
      appId,
      'Under Review',
      'Client re-uploaded corrected document. Re-queued for consular verification.'
    );
    setReUploadModalApp(null);
    setNewUploadedFile(null);
  };

  const handleRedeemVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    const code = voucherCode.trim().toUpperCase();
    if (code === 'BAHRAIN2026' || code === 'EASYTRAVEL50') {
      const addedAmount = 50;
      const nextBal = walletBalanceUSD + addedAmount;
      setWalletBalanceUSD(nextBal);
      localStorage.setItem('et_wallet_balance', nextBal.toString());
      setVoucherSuccess(`Success! Voucher redeemed. $50.00 USD added to your travel balance.`);
      setVoucherCode('');
      setTimeout(() => {
        setVoucherSuccess(null);
        setIsVoucherModalOpen(false);
      }, 2500);
    } else {
      alert('Invalid voucher code. Try demo code: BAHRAIN2026 or EASYTRAVEL50');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-300">
      {/* Wallet Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Encrypted Document Vault & Travel Wallet</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Client Travel Document & Credit Wallet
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Access your approved eVisas, track live consular lodgements, review transparent 15% service fee receipts, and manage your travel credits.
          </p>
        </div>

        <button
          onClick={onNewApplication}
          className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer self-start sm:self-center"
        >
          <Plane className="w-3.5 h-3.5 text-amber-400" />
          <span>Start New Application</span>
        </button>
      </div>

      {/* Travel Balance Banner Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-teal-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6 text-teal-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                Easy Travels Travel Balance
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                100% Refund Custody
              </span>
            </div>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {formatPrice(walletBalanceUSD)}
              </span>
              <span className="text-xs text-slate-400">
                (~{(walletBalanceUSD * 0.376).toFixed(2)} BHD)
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Use your travel balance to instantly pay or offset the 15% platform fee and government consular costs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsVoucherModalOpen(true)}
            className="px-4 py-2.5 rounded-full bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Redeem Voucher / Top-Up</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Summary Count */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Applications ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'approved'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            Approved & Granted ({applications.filter((a) => a.status === 'Approved' || a.status === 'Delivered' || a.status === 'Completed').length})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'active'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
            }`}
          >
            In-Progress ({applications.filter((a) => a.status !== 'Approved' && a.status !== 'Delivered' && a.status !== 'Completed' && a.status !== 'Refunded' && a.status !== 'Cancelled').length})
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'ledger'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>15% Fee Receipts & Financial Ledger</span>
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'notifications'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Notification Receipts ({emailLogs.filter((e) => e.recipientType === 'customer').length})</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: Applications Cards Grid */}
      {activeTab !== 'ledger' && activeTab !== 'notifications' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApps.map((app) => {
            const isApproved = app.status === 'Approved' || app.status === 'Delivered' || app.status === 'Completed';
            const isActionReq = app.status === 'Action Required' || app.status === 'Additional Information Requested';

            // 15% Platform service calculation
            const govPart = Math.round((app.payment.amountUSD || 100) * 0.7);
            const platform15Part = Math.round((app.payment.amountUSD || 100) * 0.15);

            return (
              <div
                key={app.id}
                className={`borderless-card p-6 flex flex-col justify-between bg-white relative overflow-hidden ${
                  isActionReq ? 'ring-2 ring-amber-400' : ''
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block tracking-wider">
                        {app.id}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                        {app.destinationName}
                      </h3>
                    </div>
                    <StatusBadge status={app.status} size="sm" />
                  </div>

                  {/* Traveler Bio Snippet */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 space-y-2 text-xs mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Traveler:</span>
                      <span className="font-bold text-slate-800">
                        {app.traveler.givenNames} {app.traveler.surname}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Passport:</span>
                      <span className="font-mono font-bold text-slate-800">{app.traveler.passportNumber}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Total Paid:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">{formatPrice(app.payment.amountUSD)}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-teal-100 text-teal-800">
                          15% Fee Inc.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Required Banner if flagged */}
                  {isActionReq && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/60 mb-4 text-xs text-amber-900 space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-amber-800">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Action Required from You</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        {app.reUploadRequestedReason || 'Please upload a clearer photograph or updated passport scan.'}
                      </p>
                      <button
                        onClick={() => setReUploadModalApp(app)}
                        className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Re-Upload Document Now
                      </button>
                    </div>
                  )}

                  {/* Consular Lifecycle Status Bar */}
                  <div className="space-y-2 mb-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Consular Lifecycle Status
                    </span>
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                      <span className="text-teal-600">Submitted</span>
                      <span className={app.status !== 'Draft' ? 'text-teal-600' : ''}>Pre-Check</span>
                      <span className={isApproved || app.status === 'Processing with Government' || app.status === 'Processing' ? 'text-teal-600' : ''}>
                        Government
                      </span>
                      <span className={isApproved ? 'text-emerald-600' : ''}>Granted</span>
                    </div>

                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isApproved
                            ? 'w-full bg-emerald-500'
                            : app.status === 'Processing with Government' || app.status === 'Processing'
                            ? 'w-3/4 bg-blue-500'
                            : isActionReq
                            ? 'w-1/2 bg-amber-500'
                            : 'w-1/2 bg-teal-500'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  {isApproved ? (
                    <button
                      onClick={() => setSelectedApplication(app)}
                      className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Official PDF Visa</span>
                    </button>
                  ) : (
                    <div className="w-full flex items-center justify-between text-xs text-slate-500 py-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>SLA: ~{app.processingSpeed}</span>
                      </span>
                      <span className="font-semibold text-slate-800">
                        {app.status}
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() => setInspectingReceiptApp(app)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Receipt className="w-3.5 h-3.5 text-slate-500" />
                    <span>View Transparent 15% Receipt</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: 15% Platform Fee & Financial Transaction Ledger */}
      {activeTab === 'ledger' && (
        <div className="borderless-card p-6 bg-white space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-purple-600" />
                <span>Financial Ledger & Transparent Fee Disclosures</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Itemized breakdown showing government pass-through fees vs. the 15% Easy Travels digital platform fee.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
              15% Fixed Service Cap
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 pl-2">Transaction ID & Dossier</th>
                  <th className="pb-3">Destination</th>
                  <th className="pb-3">Government Fee (100%)</th>
                  <th className="pb-3">EasyTravel 15% Fee</th>
                  <th className="pb-3">Total Paid</th>
                  <th className="pb-3">Method</th>
                  <th className="pb-3 pr-2 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {applications.map((app) => {
                  const total = app.payment.amountUSD || 120;
                  const govPart = Math.round(total * 0.72);
                  const platform15 = Math.round(total * 0.15);
                  return (
                    <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 pl-2 font-mono">
                        <span className="font-bold text-slate-900 block">{app.payment.transactionId}</span>
                        <span className="text-[11px] text-slate-400">{app.id}</span>
                      </td>
                      <td className="py-3.5 font-bold text-slate-800">{app.destinationName}</td>
                      <td className="py-3.5 text-slate-600 font-semibold">{formatPrice(govPart)}</td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 font-bold text-[11px] border border-teal-200">
                          {formatPrice(platform15)} (15%)
                        </span>
                      </td>
                      <td className="py-3.5 font-black text-slate-900">{formatPrice(total)}</td>
                      <td className="py-3.5 capitalize text-slate-600">
                        {app.payment.paymentMethod.replace('_', ' ')}
                      </td>
                      <td className="py-3.5 pr-2 text-right">
                        <button
                          onClick={() => setInspectingReceiptApp(app)}
                          className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          View Receipt
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: Notification Receipts & Transaction Emails */}
      {activeTab === 'notifications' && (
        <div className="borderless-card p-6 bg-white space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Mail className="w-4 h-4 text-rose-600" />
                <span>Application Notification Receipts & Dispatches</span>
              </h3>
              <p className="text-xs text-slate-500">
                Personalized transaction receipts, status updates, and official travel documents dispatched to your email.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              {emailLogs.filter((e) => e.recipientType === 'customer').length} Dispatches Recorded
            </span>
          </div>

          {emailLogs.filter((e) => e.recipientType === 'customer').length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No customer notification receipts recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 pl-2">Time Sent</th>
                    <th className="pb-3">Reference & Destination</th>
                    <th className="pb-3">Subject Line</th>
                    <th className="pb-3">Delivery Status</th>
                    <th className="pb-3 text-right pr-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {emailLogs
                    .filter((e) => e.recipientType === 'customer')
                    .map((notif) => (
                      <tr key={notif.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 pl-2 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          <span className="block text-[10px] text-slate-400">
                            {new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </td>
                        <td className="py-3.5 font-bold text-slate-900">
                          <div>{notif.applicationId}</div>
                          <div className="text-[11px] text-slate-400 font-normal">
                            {notif.destinationName} &bull; {notif.visaCategory}
                          </div>
                        </td>
                        <td className="py-3.5">
                          <span className="font-semibold text-slate-800 block line-clamp-1">{notif.subject}</span>
                          <span className="text-[11px] text-slate-400 line-clamp-1">{notif.previewText}</span>
                        </td>
                        <td className="py-3.5">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200/50">
                            {notif.deliveryStatus} (250 OK)
                          </span>
                        </td>
                        <td className="py-3.5 pr-2 text-right">
                          <button
                            onClick={() => setInspectingEmail(notif)}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View Email</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: Transparent 15% Fee Receipt Inspector */}
      {inspectingReceiptApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 space-y-5 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Official Payment Receipt</h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    Ref: {inspectingReceiptApp.payment.transactionId}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setInspectingReceiptApp(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Applicant:</span>
                <span className="font-bold text-slate-900">{inspectingReceiptApp.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Destination:</span>
                <span className="font-bold text-slate-900">{inspectingReceiptApp.destinationName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Time:</span>
                <span className="text-slate-700 font-mono">
                  {new Date(inspectingReceiptApp.submittedAt).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Gateway:</span>
                <span className="font-bold text-slate-800 capitalize">
                  {inspectingReceiptApp.payment.paymentMethod.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Itemized 15% Transparent Breakdown */}
            <div className="space-y-2.5 text-xs pt-2">
              <div className="flex justify-between text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span>1. Official Government Consular Fee:</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                    100% Pass-Through
                  </span>
                </div>
                <span className="font-bold text-slate-900">
                  {formatPrice(Math.round((inspectingReceiptApp.payment.amountUSD || 100) * 0.72))}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span>2. EasyTravel Platform Service Charge:</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-teal-100 text-teal-800">
                    15% Fixed Transparent Rate
                  </span>
                </div>
                <span className="font-bold text-teal-700">
                  {formatPrice(Math.round((inspectingReceiptApp.payment.amountUSD || 100) * 0.15))}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span>3. Expedited Consular Dispatch Tier:</span>
                  <span className="text-[9px] font-bold uppercase text-amber-800">
                    {inspectingReceiptApp.processingSpeed}
                  </span>
                </div>
                <span className="font-semibold text-slate-900">
                  {formatPrice(Math.round((inspectingReceiptApp.payment.amountUSD || 100) * 0.13))}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-sm font-black">
                <span className="text-slate-900">Total Settled:</span>
                <span className="text-slate-900 text-lg">
                  {formatPrice(inspectingReceiptApp.payment.amountUSD)}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-teal-50 border border-teal-100 text-[11px] text-teal-900 leading-relaxed">
              <strong>Regulatory Notice:</strong> Easy Travels (Bahrain) W.L.L. transparently discloses its 15% platform processing charge. Consular fees are remitted directly to destination immigration ministries.
            </div>

            <button
              onClick={() => setInspectingReceiptApp(null)}
              className="w-full py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: Voucher Redemption / Balance Top-Up */}
      {isVoucherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900">Redeem Travel Credit Voucher</h3>
              </div>
              <button
                onClick={() => setIsVoucherModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-full cursor-pointer"
              >
                ✕
              </button>
            </div>

            {voucherSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{voucherSuccess}</span>
              </div>
            )}

            <form onSubmit={handleRedeemVoucher} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Enter Travel Voucher or Refund Coupon Code
                </label>
                <input
                  type="text"
                  required
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  placeholder="e.g. BAHRAIN2026 or EASYTRAVEL50"
                  className="w-full px-4 py-2.5 uppercase font-mono font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Demo valid vouchers: <strong>BAHRAIN2026</strong> (+$50.00), <strong>EASYTRAVEL50</strong> (+$50.00)
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsVoucherModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer"
                >
                  Apply to Wallet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF Visa Viewer Modal */}
      {selectedApplication && (
        <PdfVisaViewer
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
        />
      )}

      {/* Re-Upload Document Modal */}
      {reUploadModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 space-y-5 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Document Re-Upload</h3>
                  <p className="text-xs text-slate-400">Application: {reUploadModalApp.id}</p>
                </div>
              </div>
              <button
                onClick={() => setReUploadModalApp(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 text-xs text-amber-900 border border-amber-200/60 leading-relaxed">
              <strong>Consular Officer Advisory:</strong> {reUploadModalApp.reUploadRequestedReason || 'The uploaded file was blurry or had reflections on the MRZ strip. Please provide a clear, high-resolution scan.'}
            </div>

            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center space-y-2 hover:bg-slate-50 transition-colors">
              <UploadCloud className="w-8 h-8 text-teal-600 mx-auto" />
              <div className="text-xs font-bold text-slate-800">
                Drag and drop your updated file here, or browse
              </div>
              <p className="text-[11px] text-slate-400">
                Supports JPG, PNG, PDF (Max 10MB) • Client-side encrypted
              </p>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setNewUploadedFile(e.target.files[0].name);
                  }
                }}
                className="hidden"
                id="wallet-reupload-input"
              />
              <label
                htmlFor="wallet-reupload-input"
                className="inline-block mt-2 px-4 py-1.5 bg-slate-900 text-white rounded-full text-xs font-bold cursor-pointer hover:bg-slate-800"
              >
                Choose File
              </label>
              {newUploadedFile && (
                <div className="mt-2 text-xs font-bold text-emerald-700 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Selected: {newUploadedFile}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 text-xs">
              <button
                onClick={() => setReUploadModalApp(null)}
                className="px-4 py-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleResolveReUpload(reUploadModalApp.id)}
                className="px-5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer"
              >
                Submit for Re-Verification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Customer Dispatched Email Viewer */}
      {inspectingEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 px-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-teal-100 text-teal-800">
                  Official Notification Receipt
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1">
                  {inspectingEmail.subject}
                </h3>
              </div>
              <button
                onClick={() => setInspectingEmail(null)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-slate-100">
              <div
                className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden"
                dangerouslySetInnerHTML={{ __html: inspectingEmail.htmlBody }}
              />
            </div>

            <div className="p-4 px-6 bg-white border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                To: {inspectingEmail.recipientEmail} &bull; Ref: {inspectingEmail.applicationId}
              </span>
              <button
                onClick={() => setInspectingEmail(null)}
                className="px-5 py-2 rounded-full text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
