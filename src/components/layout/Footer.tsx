import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { ShieldCheck, MapPin, Phone, Mail, Clock, Lock, CheckCircle2, ExternalLink, X } from 'lucide-react';

export const Footer: React.FC<{ onNavigate: (view: any) => void }> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [modalType, setModalType] = useState<'privacy' | 'terms' | null>(null);

  return (
    <footer className="mt-24 border-t border-slate-200/80 bg-white">
      {/* Upper Footer: Physical Agency Footprint & Disclosure */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand & Mission */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/assets/aistudio/is_a096d245.png"
                alt="Easy Travels - Document Clearance"
                className="h-12 w-auto object-contain rounded-lg"
              />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Leading private consular logistics & digital visa clearing agency. Combining edge-computed ICAO OCR document parsing with high-touch concierge counters across the GCC.
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>ICAO Doc 9303 & ISO/IEC 27001 Compliant</span>
            </div>
          </div>

          {/* Physical Branch Address in Bahrain */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              Bahrain Operational Office
            </span>
            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-medium text-slate-800">
                  Near IMC Hospital, Lulu Road, Riffa, Kingdom of Bahrain
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <a
                  href="tel:+97333276768"
                  className="font-bold text-slate-800 hover:text-rose-600 transition-colors"
                >
                  +973 33276768
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <a
                  href="mailto:concierge@easytravels.bh"
                  className="text-slate-600 hover:text-slate-900 hover:underline"
                >
                  concierge@easytravels.bh
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Sat - Thu: 8:30 AM – 8:30 PM (AST)</span>
              </div>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              Platform Services
            </span>
            <ul className="space-y-2 text-xs text-slate-500">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-slate-900 transition-colors cursor-pointer text-left"
                >
                  Destination Requirements Matcher
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('apply')}
                  className="hover:text-slate-900 transition-colors cursor-pointer text-left"
                >
                  Smart Passport OCR Scanner
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('wallet')}
                  className="hover:text-slate-900 transition-colors cursor-pointer text-left"
                >
                  Client Document Wallet & PDF Visas
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('admin')}
                  className="hover:text-slate-900 transition-colors cursor-pointer text-left"
                >
                  Administrative Command Center
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('destinations')}
                  className="hover:text-slate-900 transition-colors cursor-pointer text-left"
                >
                  100+ Global Visa Portals
                </button>
              </li>
            </ul>
          </div>

          {/* Security & Payment Standards */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              Security & Privacy
            </span>
            <div className="p-4 rounded-2xl bg-slate-50 space-y-2.5 text-[11px] text-slate-600 border border-slate-100">
              <div className="flex items-center gap-2 font-semibold text-slate-800">
                <Lock className="w-3.5 h-3.5 text-teal-600" />
                <span>Zero-Retention Edge OCR</span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Passport Machine Readable Zones are processed client-side inside your browser runtime. No unencrypted scans are retained.
              </p>
              <div className="flex items-center gap-1.5 text-slate-400 pt-1 border-t border-slate-200/60">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>PCI-DSS Level 1 Encrypted Payments</span>
              </div>
            </div>
          </div>
        </div>

        {/* Regulatory Disclosure Banner */}
        <div className="mt-12 p-5 rounded-2xl bg-amber-50/70 border border-amber-200/50 text-xs text-amber-900 leading-relaxed">
          <div className="flex items-center gap-2 font-bold mb-1 text-amber-900">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            {t.disclaimer.badge}
          </div>
          <p className="text-amber-900/90">{t.disclaimer.text}</p>
        </div>

        {/* Bottom Credits & Developer Attribution */}
        <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <p>© {new Date().getFullYear()} Easy Travels (Bahrain) W.L.L. All rights reserved.</p>
            <span className="hidden sm:inline text-slate-300">•</span>
            <p className="font-medium text-slate-700">
              Developed by{' '}
              <a
                href="https://www.xerotechtechnologies.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-slate-900 hover:text-rose-600 underline underline-offset-4 decoration-rose-500/40 transition-colors inline-flex items-center gap-1"
              >
                <span>XEROTECH TECHNOLOGIES</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => setModalType('privacy')}
              className="hover:text-slate-900 cursor-pointer underline-offset-2 hover:underline"
            >
              Privacy Policy
            </button>
            <span className="text-slate-300">•</span>
            <button
              onClick={() => setModalType('terms')}
              className="hover:text-slate-900 cursor-pointer underline-offset-2 hover:underline"
            >
              Terms & Conditions
            </button>
            <span className="text-slate-300">•</span>
            <span className="text-slate-400 font-mono text-[11px]">CR #88291-B</span>
          </div>
        </div>
      </div>

      {/* Privacy Policy & Terms Modal */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-extrabold text-slate-900">
                {modalType === 'privacy' ? 'Easy Travels Privacy Policy & Data Charter' : 'Terms of Service & Consular Logistics Agreement'}
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 text-xs text-slate-600 leading-relaxed pr-2">
              {modalType === 'privacy' ? (
                <>
                  <p className="font-semibold text-slate-800">
                    Effective Date: January 1, {new Date().getFullYear()} &bull; Easy Travels (Bahrain) W.L.L.
                  </p>
                  <p>
                    Easy Travels operates a private travel document clearance and visa logistics service headquartered near IMC Hospital, Lulu Road, Riffa, Kingdom of Bahrain. We are committed to safeguarding personal, passport, and biometric data in accordance with Bahrain Personal Data Protection Law (PDPL) and international ICAO standards.
                  </p>
                  <h4 className="font-bold text-slate-900 pt-2">1. Client-Side Edge Computing & Zero Biometric Retention</h4>
                  <p>
                    All passport machine-readable zone (MRZ) extractions occur directly within your client browser using client-side WebAssembly computer vision. We never persist unencrypted biometric passport scans on third-party servers.
                  </p>
                  <h4 className="font-bold text-slate-900 pt-2">2. Data Collected For Government Lodgement</h4>
                  <p>
                    Information collected (full legal name, passport number, expiration date, nationality, itinerary) is utilized strictly to formulate official government electronic visa submissions and communicate live processing milestones to the applicant.
                  </p>
                  <h4 className="font-bold text-slate-900 pt-2">3. Payment Encryption</h4>
                  <p>
                    Credit card and financial transactions are routed directly via PCI-DSS Level 1 compliant gateways (Arab Financial Services / Stripe). Easy Travels never stores raw CVV numbers or card magnetic data.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-slate-800">
                    Agreement & Consular Terms &bull; Easy Travels (Bahrain) W.L.L.
                  </p>
                  <p>
                    By lodging an application through Easy Travels, you acknowledge that Easy Travels is a private visa concierge service and document clearance provider operating from Riffa, Kingdom of Bahrain, and is not a diplomatic mission or government embassy.
                  </p>
                  <h4 className="font-bold text-slate-900 pt-2">1. Sovereign Authority & Decision Discretion</h4>
                  <p>
                    Final visa issuance decisions, validity periods, and entry approvals rest solely with the immigration departments and sovereign governments of destination countries. Easy Travels guarantees accurate preparation, document verification, and expedited lodgement within our stated SLA.
                  </p>
                  <h4 className="font-bold text-slate-900 pt-2">2. Processing Speeds & Service Level Agreements</h4>
                  <p>
                    SLA targets (Super Rush: 8 hours; Rush: 24 hours; Standard: 3 business days) begin upon successful completion of client document verification. If a government portal experiences unforeseen downtime, our consular desk will immediately communicate updates via email and SMS.
                  </p>
                  <h4 className="font-bold text-slate-900 pt-2">3. Cancellation & Refund Policy</h4>
                  <p>
                    If an application is cancelled prior to formal government submission, service fees may be refunded upon review by our Finance Department via the Administrative Portal. Government statutory fees already disbursed to sovereign portals are non-refundable.
                  </p>
                </>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setModalType(null)}
                className="px-5 py-2 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
