import React from 'react';
import { VisaApplication } from '../../types/visa';
import { Printer, Download, ShieldCheck, X, Globe, Stamp, Calendar, CheckCircle } from 'lucide-react';

interface PdfVisaViewerProps {
  application: VisaApplication;
  onClose: () => void;
}

export const PdfVisaViewer: React.FC<PdfVisaViewerProps> = ({ application, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl p-6 sm:p-10 flex flex-col">
        {/* Top Controls Bar */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Official Electronic Travel Authorization</h3>
              <p className="text-xs text-slate-500">ICAO Doc 9303 Compliant Travel Document Record</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Document</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-full transition-colors shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors ml-2 cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div id="printable-visa" className="borderless-card-flat p-8 relative overflow-hidden bg-white border border-slate-200/60 rounded-3xl">
          {/* Subtle Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
            <Globe className="w-96 h-96 text-slate-900" />
          </div>

          {/* Visa Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 relative z-10">
            <div className="flex items-center gap-4">
              <img
                src="/assets/aistudio/is_a096d245.png"
                alt="Easy Travels - Document Clearance"
                className="h-12 w-auto object-contain rounded-xl shadow-xs"
              />
              <div>
                <span className="text-[11px] font-bold tracking-widest uppercase text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full">
                  Verified Electronic Visa (e-Visa)
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">
                  GOVERNMENT OF {application.destinationName.toUpperCase()}
                </h2>
                <p className="text-xs text-slate-500">Consular Logistics Record &bull; Easy Travels Clearing Agency</p>
              </div>
            </div>

            {/* QR Code and Grant Badge */}
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              {/* Simulated QR Code Canvas */}
              <div className="w-16 h-16 bg-white p-1 rounded-xl shadow-xs border border-slate-200 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="w-4 h-4 bg-slate-900 rounded-xs" />
                  <div className="w-4 h-4 bg-slate-900 rounded-xs" />
                </div>
                <div className="flex justify-center gap-1">
                  <div className="w-1.5 h-1.5 bg-slate-800" />
                  <div className="w-1.5 h-1.5 bg-slate-800" />
                </div>
                <div className="flex justify-between">
                  <div className="w-4 h-4 bg-slate-900 rounded-xs" />
                  <div className="w-2 h-2 bg-emerald-600 rounded-full" />
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Grant Number</span>
                <span className="text-sm font-mono font-black text-slate-900 block">
                  {application.visaGrantNumber || 'EV-GR-9941029'}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                  <CheckCircle className="w-3 h-3" /> Validated
                </span>
              </div>
            </div>
          </div>

          {/* Traveler Bio Details Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-6 border-b border-slate-100 text-xs relative z-10">
            <div>
              <span className="text-slate-400 block mb-1">Full Legal Name</span>
              <p className="font-bold text-slate-900 text-sm">
                {application.traveler.givenNames} {application.traveler.surname}
              </p>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Passport Number</span>
              <p className="font-mono font-bold text-slate-900 text-sm">{application.traveler.passportNumber}</p>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Nationality</span>
              <p className="font-bold text-slate-900 text-sm">{application.traveler.nationality}</p>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Date of Birth / Sex</span>
              <p className="font-bold text-slate-900 text-sm">
                {application.traveler.dateOfBirth} / {application.traveler.gender}
              </p>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Visa Category</span>
              <p className="font-bold text-teal-700 text-sm">Tourist / Short Stay (Class B)</p>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Number of Entries</span>
              <p className="font-bold text-slate-900 text-sm">Multiple Entries</p>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Date of Issue</span>
              <p className="font-bold text-slate-900 text-sm">
                {application.submittedAt ? application.submittedAt.split('T')[0] : '2026-11-08'}
              </p>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Valid Until</span>
              <p className="font-bold text-rose-600 text-sm">
                {application.visaExpiryDate || '2027-11-08'}
              </p>
            </div>
          </div>

          {/* Logistics & Security Barcode */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
            <div className="space-y-1 text-left w-full sm:w-auto">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <Stamp className="w-4 h-4 text-amber-600" />
                <span>Facilitated by Easy Travels Bahrain Consular Desk</span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Gov Ref: {application.governmentReference || 'GOV-REF-8849201'} | Ref: {application.id}
              </p>
            </div>

            {/* Simulated ICAO Barcode */}
            <div className="flex flex-col items-center">
              <div className="flex items-center h-8 gap-0.5 opacity-80">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-slate-900 h-full"
                    style={{ width: i % 4 === 0 ? '3px' : i % 2 === 0 ? '1px' : '2px' }}
                  />
                ))}
              </div>
              <span className="text-[9px] font-mono text-slate-400 mt-1 tracking-widest">
                *{application.id}*
              </span>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-xs text-slate-400">
          This digital visa is linked directly to your passport in the destination country&apos;s border control system.
          Carrying a printed or offline digital copy on your mobile device is recommended at boarding.
        </div>
      </div>
    </div>
  );
};
