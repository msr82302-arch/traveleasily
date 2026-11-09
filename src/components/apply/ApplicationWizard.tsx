import React, { useState } from 'react';
import { useApplications } from '../../context/ApplicationContext';
import { useLanguage } from '../../context/LanguageContext';
import { OcrScannerStep } from './OcrScannerStep';
import { ApplicationFormStep } from './ApplicationFormStep';
import { CheckoutStep } from './CheckoutStep';
import { COUNTRIES, getVisaRequirement } from '../../data/destinations';
import { MRZExtractedData, VisaApplication } from '../../types/visa';
import { Route, Scan, FileEdit, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface ApplicationWizardProps {
  onFinish: (app: VisaApplication) => void;
  onCancel: () => void;
}

export const ApplicationWizard: React.FC<ApplicationWizardProps> = ({ onFinish, onCancel }) => {
  const {
    draft,
    updateDraft,
    populateDraftFromOCR,
    currentStep,
    setCurrentStep,
  } = useApplications();
  const { formatPrice } = useLanguage();

  const req = getVisaRequirement(draft.destinationCountry);

  const handleOcrComplete = (data: MRZExtractedData, scanUrl?: string) => {
    populateDraftFromOCR(data, scanUrl);
    setCurrentStep(3); // Move to Guided Form
  };

  const steps = [
    { num: 1, label: 'Route & Eligibility', icon: Route },
    { num: 2, label: 'Edge OCR Scan', icon: Scan },
    { num: 3, label: 'Dossier Review', icon: FileEdit },
    { num: 4, label: 'Payment & Lodgement', icon: CheckCircle },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-300">
      {/* Stepper Progress Bar */}
      <div className="borderless-card p-4 sm:p-6 bg-white">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {steps.map((step) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.num;
            const isCurrent = currentStep === step.num;

            return (
              <div
                key={step.num}
                onClick={() => {
                  if (step.num < currentStep) setCurrentStep(step.num);
                }}
                className={`flex items-center gap-2.5 p-2.5 rounded-2xl transition-all ${
                  isCurrent
                    ? 'bg-slate-900 text-white shadow-xs'
                    : isCompleted
                    ? 'bg-teal-50 text-teal-800 cursor-pointer'
                    : 'bg-slate-50 text-slate-400'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                    isCurrent
                      ? 'bg-amber-400 text-slate-950'
                      : isCompleted
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted ? '✓' : step.num}
                </div>
                <div className="truncate">
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-60 block">
                    Phase {step.num}
                  </span>
                  <span className="text-xs font-bold truncate block">{step.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: Route & Country Confirmation */}
      {currentStep === 1 && (
        <div className="borderless-card p-6 sm:p-8 bg-white space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
              Phase 1: Consular Routing
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
              Confirm Travel Route & Visa Category
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select or modify your origin nationality and destination country.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                Passport Issuing Country (Citizenship)
              </label>
              <select
                value={draft.originCountry}
                onChange={(e) => updateDraft({ originCountry: e.target.value })}
                className="w-full borderless-input px-4 py-3 text-xs font-semibold text-slate-900 cursor-pointer"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                Destination Country
              </label>
              <select
                value={draft.destinationCountry}
                onChange={(e) => {
                  const newReq = getVisaRequirement(e.target.value);
                  updateDraft({
                    destinationCountry: e.target.value,
                    destinationName: newReq.destinationName,
                    visaType: newReq.visaType,
                  });
                }}
                className="w-full borderless-input px-4 py-3 text-xs font-semibold text-slate-900 cursor-pointer"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Route Overview Callout */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">{req.visaType} for {req.destinationName}</span>
              <span className="font-bold text-teal-700">{formatPrice(req.governmentFeeUSD + req.serviceFeeUSD)} total</span>
            </div>
            <p className="text-slate-600 leading-relaxed">{req.description}</p>
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200/60 text-slate-500">
              <span>• Validity: {req.validityDays} Days</span>
              <span>• Max Stay: {req.maxStayDays} Days</span>
              <span>• Entries: {req.entries}</span>
              <span>• Standard SLA: ~{req.standardProcessingDays} Days</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              onClick={onCancel}
              className="px-6 py-2.5 rounded-full text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={() => setCurrentStep(2)}
              className="px-8 py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Proceed to Edge OCR Document Scan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Edge OCR Scanning */}
      {currentStep === 2 && (
        <OcrScannerStep
          onScanComplete={handleOcrComplete}
          onSkipToManual={() => setCurrentStep(3)}
        />
      )}

      {/* STEP 3: Guided Form Review */}
      {currentStep === 3 && (
        <ApplicationFormStep
          onBack={() => setCurrentStep(2)}
          onProceedToCheckout={() => setCurrentStep(4)}
        />
      )}

      {/* STEP 4: Checkout & Payment */}
      {currentStep === 4 && (
        <CheckoutStep
          onBack={() => setCurrentStep(3)}
          onSuccess={(newApp) => {
            onFinish(newApp);
          }}
        />
      )}
    </div>
  );
};
