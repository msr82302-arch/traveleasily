import React, { useState } from 'react';
import { VisaApplication } from '../../types/visa';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Eye,
  FileText,
  User,
  Calendar,
  Clock,
  Sparkles,
  Send
} from 'lucide-react';

interface DocumentVerifierDrawerProps {
  application: VisaApplication;
  onClose: () => void;
  onApprove: (id: string) => void;
  onRequestReUpload: (id: string, reason: string) => void;
  onReject: (id: string, reason: string) => void;
}

export const DocumentVerifierDrawer: React.FC<DocumentVerifierDrawerProps> = ({
  application,
  onClose,
  onApprove,
  onRequestReUpload,
  onReject,
}) => {
  const [reUploadReason, setReUploadReason] = useState(
    'Uploaded passport photo is blurry and does not meet official immigration resolution standards. Please re-upload a high-resolution scan.'
  );
  const [isReUploadOpen, setIsReUploadOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('Incomplete supporting documentation');
  const [activeTab, setActiveTab] = useState<'verification' | 'history' | 'audit'>('verification');

  // Predefined reason templates
  const reasonTemplates = [
    'Uploaded passport photo is blurry and does not meet official resolution standards.',
    'Passport expires in less than 6 months from planned date of arrival.',
    'Missing signature page or machine-readable zone (MRZ) is cropped.',
    'Portrait photograph has background shadow and does not meet pure white background rule.',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end animate-in fade-in">
      <div className="w-full max-w-4xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-500">{application.id}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {application.destinationName} ({application.visaType})
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                Dossier Inspection: {application.traveler.givenNames} {application.traveler.surname}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body: Dual-Pane Image vs Form Fields */}
        <div className="p-6 space-y-6 flex-1">
          {/* Top Verification Alert Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="text-slate-700">
                OCR Confidence: <strong>{application.ocrData?.overallConfidence || 96}%</strong> • ICAO 7-3-1 Checksum: <strong>Verified</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 font-mono">SLA Target: {application.slaDeadline.split('T')[0]}</span>
            </div>
          </div>

          {/* Dual-Pane Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left Pane: Document Scan Image */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>Uploaded Document Scan</span>
                </span>
                <span className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-full">
                  Primary Bio-Page
                </span>
              </div>

              <div className="borderless-card-flat overflow-hidden rounded-2xl bg-slate-900 aspect-[4/3] flex items-center justify-center relative group">
                <img
                  src={
                    application.passportScanUrl ||
                    'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80'
                  }
                  alt="Client Passport"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-2 left-2 right-2 bg-slate-950/80 backdrop-blur-xs p-2 rounded-xl text-[10px] font-mono text-teal-300 flex justify-between items-center">
                  <span>P&lt;BHRAL&lt;KHALIFA&lt;&lt;AHMED...</span>
                  <span className="text-emerald-400">ICAO TD3 OK</span>
                </div>
              </div>

              {/* Supporting Attachments Pill list */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-bold text-slate-500 block">Supporting Attachments</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="truncate">Passport Photo</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">Hotel Voucher</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Pane: Extracted Data Fields Inspection */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Extracted Fields & Consular Validation
              </span>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 flex justify-between items-center">
                  <span className="text-slate-500">Legal Given Names:</span>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 block">{application.traveler.givenNames}</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">98% Match</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 flex justify-between items-center">
                  <span className="text-slate-500">Surname / Family:</span>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 block">{application.traveler.surname}</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">97% Match</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 flex justify-between items-center">
                  <span className="text-slate-500">Passport Number:</span>
                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-900 block">{application.traveler.passportNumber}</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">Checksum OK</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 flex justify-between items-center">
                  <span className="text-slate-500">Nationality:</span>
                  <span className="font-bold text-slate-900">{application.traveler.nationality}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 flex justify-between items-center">
                  <span className="text-slate-500">Date of Birth:</span>
                  <span className="font-bold text-slate-900">{application.traveler.dateOfBirth}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 flex justify-between items-center">
                  <span className="text-slate-500">Passport Expiry Date:</span>
                  <span className="font-bold text-slate-900">{application.traveler.passportExpiryDate}</span>
                </div>
              </div>

              {/* Internal Notes / Audit History */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-500 block mb-1.5">Internal Audit Notes</span>
                <div className="p-3 rounded-xl bg-slate-100 text-[11px] text-slate-600 space-y-1 font-mono">
                  {application.internalNotes && application.internalNotes.length > 0 ? (
                    application.internalNotes.map((note, i) => <p key={i}>• {note}</p>)
                  ) : (
                    <p>• Initial file created by client web intake portal.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Re-Upload Sub-Form if expanded */}
          {isReUploadOpen && (
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-3 animate-in fade-in">
              <h4 className="font-bold text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Specify Document Re-Upload Reason to Traveler</span>
              </h4>

              {/* Template shortcuts */}
              <div className="flex flex-wrap gap-1.5">
                {reasonTemplates.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setReUploadReason(tmpl)}
                    className="text-[10px] px-2.5 py-1 rounded-full bg-white text-slate-700 hover:bg-amber-100 border border-amber-200 cursor-pointer"
                  >
                    Template {idx + 1}
                  </button>
                ))}
              </div>

              <textarea
                rows={3}
                value={reUploadReason}
                onChange={(e) => setReUploadReason(e.target.value)}
                className="w-full borderless-input px-3.5 py-2.5 text-xs text-slate-900 resize-none bg-white"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReUploadOpen(false)}
                  className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-full cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onRequestReUpload(application.id, reUploadReason);
                    onClose();
                  }}
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-full shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Re-Upload Request (WhatsApp + Email)</span>
                </button>
              </div>
            </div>
          )}

          {/* Reject Sub-Form if expanded */}
          {isRejectOpen && (
            <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-xs space-y-3 animate-in fade-in">
              <h4 className="font-bold text-rose-900 flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Reject Visa Application</span>
              </h4>
              <textarea
                rows={2}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full borderless-input px-3.5 py-2.5 text-xs text-slate-900 resize-none bg-white"
                placeholder="Reason for consular rejection..."
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRejectOpen(false)}
                  className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-full cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onReject(application.id, rejectionReason);
                    onClose();
                  }}
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-full shadow-xs cursor-pointer"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls Bar */}
        <div className="p-6 border-t border-slate-100 bg-white sticky bottom-0 z-20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                setIsReUploadOpen(!isReUploadOpen);
                setIsRejectOpen(false);
              }}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-full text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Request Re-Upload</span>
            </button>

            <button
              onClick={() => {
                setIsRejectOpen(!isRejectOpen);
                setIsReUploadOpen(false);
              }}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-full text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Reject Dossier</span>
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                onApprove(application.id);
                onClose();
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve & Issue Electronic Visa</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
