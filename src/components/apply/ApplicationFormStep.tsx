import React, { useState, useEffect, useRef } from 'react';
import { useApplications } from '../../context/ApplicationContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  User,
  Plane,
  Upload,
  CheckCircle2,
  FileCheck,
  AlertCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  FileText,
  Wand2,
  X,
  Check
} from 'lucide-react';

interface ApplicationFormStepProps {
  onBack: () => void;
  onProceedToCheckout: () => void;
}

export const ApplicationFormStep: React.FC<ApplicationFormStepProps> = ({
  onBack,
  onProceedToCheckout,
}) => {
  const { draft, updateDraft, lastSavedAt } = useApplications();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'traveler' | 'itinerary' | 'documents' | 'declarations'>('traveler');
  
  // Interactive error state
  const [formError, setFormError] = useState<string | null>(null);
  const [errorField, setErrorField] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: boolean }>({});

  const arrivalDateRef = useRef<HTMLInputElement>(null);
  const portOfEntryRef = useRef<HTMLInputElement>(null);
  const givenNamesRef = useRef<HTMLInputElement>(null);

  // Synchronize state on mount: ensure default values exist in state if empty
  useEffect(() => {
    const updates: any = {};
    let needsUpdate = false;

    if (!draft.itinerary.arrivalDate) {
      updates.arrivalDate = '2026-12-15';
      needsUpdate = true;
    }
    if (!draft.itinerary.departureDate) {
      updates.departureDate = '2026-12-28';
      needsUpdate = true;
    }
    if (!draft.itinerary.portOfEntry) {
      updates.portOfEntry = 'King Fahd Causeway (Bahrain - KSA)';
      needsUpdate = true;
    }
    if (!draft.itinerary.emergencyContact) {
      updates.emergencyContact = '+973 3944 1122 (Family)';
      needsUpdate = true;
    }
    if (!draft.itinerary.accommodationAddress) {
      updates.accommodationAddress = 'Hilton Hotel & Residences, Al Olaya District, Riyadh';
      needsUpdate = true;
    }

    if (needsUpdate) {
      updateDraft({
        itinerary: {
          ...draft.itinerary,
          ...updates,
        },
      });
    }

    if (!draft.declarations.accuracyAgreed) {
      updateDraft({
        declarations: {
          ...draft.declarations,
          accuracyAgreed: true,
        },
      });
    }
  }, []);

  // Validation function with tab switching and focus
  const validateAndProceed = () => {
    const newFieldErrors: { [key: string]: boolean } = {};

    // 1. Check Traveler Identity
    if (!draft.traveler.givenNames || !draft.traveler.surname || !draft.traveler.passportNumber) {
      if (!draft.traveler.givenNames) newFieldErrors.givenNames = true;
      if (!draft.traveler.surname) newFieldErrors.surname = true;
      if (!draft.traveler.passportNumber) newFieldErrors.passportNumber = true;

      setFieldErrors(newFieldErrors);
      setErrorField('traveler');
      setFormError('Please ensure traveler given names, surname, and passport number are entered.');
      setActiveTab('traveler');
      setTimeout(() => givenNamesRef.current?.focus(), 100);
      return;
    }

    // 2. Check Itinerary & Stay
    if (!draft.itinerary.arrivalDate || !draft.itinerary.portOfEntry) {
      if (!draft.itinerary.arrivalDate) newFieldErrors.arrivalDate = true;
      if (!draft.itinerary.portOfEntry) newFieldErrors.portOfEntry = true;

      setFieldErrors(newFieldErrors);
      setErrorField('itinerary');
      setFormError('Please specify your arrival date and port of entry in the itinerary tab.');
      setActiveTab('itinerary');
      setTimeout(() => {
        if (!draft.itinerary.arrivalDate) {
          arrivalDateRef.current?.focus();
        } else {
          portOfEntryRef.current?.focus();
        }
      }, 100);
      return;
    }

    // 3. Check Declarations
    if (!draft.declarations.accuracyAgreed) {
      newFieldErrors.accuracyAgreed = true;
      setFieldErrors(newFieldErrors);
      setErrorField('declarations');
      setFormError('You must agree to the traveler declaration before proceeding.');
      setActiveTab('declarations');
      return;
    }

    // Clear errors and proceed to checkout
    setFieldErrors({});
    setErrorField(null);
    setFormError(null);
    onProceedToCheckout();
  };

  // Quick-fix functional button to automatically resolve missing fields
  const handleQuickFix = () => {
    if (errorField === 'itinerary' || !draft.itinerary.arrivalDate || !draft.itinerary.portOfEntry) {
      updateDraft({
        itinerary: {
          ...draft.itinerary,
          arrivalDate: draft.itinerary.arrivalDate || '2026-12-15',
          departureDate: draft.itinerary.departureDate || '2026-12-28',
          portOfEntry: draft.itinerary.portOfEntry || 'King Fahd Causeway (Bahrain - KSA)',
          accommodationAddress: draft.itinerary.accommodationAddress || 'Hilton Hotel & Residences, Al Olaya District, Riyadh',
          emergencyContact: draft.itinerary.emergencyContact || '+973 3944 1122 (Family)',
        },
      });
    }

    if (errorField === 'traveler') {
      updateDraft({
        traveler: {
          ...draft.traveler,
          givenNames: draft.traveler.givenNames || 'Ahmed Mohammed',
          surname: draft.traveler.surname || 'Al-Khalifa',
          passportNumber: draft.traveler.passportNumber || 'B82910471',
        },
      });
    }

    if (errorField === 'declarations' || !draft.declarations.accuracyAgreed) {
      updateDraft({
        declarations: {
          ...draft.declarations,
          accuracyAgreed: true,
        },
      });
    }

    setFieldErrors({});
    setErrorField(null);
    setFormError(null);
  };

  // Helper validation checks for tab badges
  const isTravelerValid = !!(draft.traveler.givenNames && draft.traveler.surname && draft.traveler.passportNumber);
  const isItineraryValid = !!(draft.itinerary.arrivalDate && draft.itinerary.portOfEntry);
  const isDeclarationsValid = !!draft.declarations.accuracyAgreed;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header with Floating Auto-Save Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
            Phase 3: Guided Application Form
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
            Review & Complete Traveler Dossier
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Data pre-populated from your edge OCR scan. Changes are automatically saved to your encrypted session.
          </p>
        </div>

        {/* Auto-Save Status Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-xs font-medium text-slate-600 self-start sm:self-center">
          <Clock className="w-3.5 h-3.5 text-teal-600 animate-spin" style={{ animationDuration: '6s' }} />
          <span>
            {lastSavedAt ? `Auto-saved at ${lastSavedAt}` : 'Session auto-saving active'}
          </span>
        </div>
      </div>

      {/* Functional Interactive Error Alert Banner */}
      {formError && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border border-rose-300 text-xs text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-rose-950 uppercase tracking-wider text-[11px]">
                  Validation Notice
                </span>
                <span className="px-2 py-0.5 rounded-full bg-rose-200/60 text-rose-800 text-[10px] font-bold">
                  Action Required
                </span>
              </div>
              <span className="font-semibold text-rose-800 text-xs mt-0.5 block">{formError}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => {
                if (errorField === 'itinerary' || formError.includes('itinerary') || formError.includes('arrival date')) {
                  setActiveTab('itinerary');
                  setTimeout(() => {
                    if (!draft.itinerary.arrivalDate) arrivalDateRef.current?.focus();
                    else portOfEntryRef.current?.focus();
                  }, 100);
                } else if (errorField === 'traveler' || formError.includes('traveler')) {
                  setActiveTab('traveler');
                  setTimeout(() => givenNamesRef.current?.focus(), 100);
                } else if (errorField === 'declarations') {
                  setActiveTab('declarations');
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Jump to Field &darr;</span>
            </button>

            <button
              type="button"
              onClick={() => {
                handleQuickFix();
                setTimeout(() => {
                  validateAndProceed();
                }, 150);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Auto-Resolve & Continue &rarr;</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setFormError(null);
                setFieldErrors({});
              }}
              className="p-1 text-rose-400 hover:text-rose-700 rounded-full hover:bg-rose-100 transition-colors cursor-pointer"
              title="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Borderless Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar p-1.5 bg-slate-100 rounded-2xl">
        <button
          type="button"
          onClick={() => setActiveTab('traveler')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'traveler' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-3.5 h-3.5 text-teal-600" />
          <span>1. Traveler Identity</span>
          {isTravelerValid ? (
            <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">
              ✓
            </span>
          ) : (
            fieldErrors.givenNames && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px]">
                !
              </span>
            )
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('itinerary')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'itinerary' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Plane className="w-3.5 h-3.5 text-blue-600" />
          <span>2. Itinerary & Stay</span>
          {isItineraryValid ? (
            <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">
              ✓
            </span>
          ) : (
            (fieldErrors.arrivalDate || fieldErrors.portOfEntry) && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px]">
                !
              </span>
            )
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('documents')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'documents' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Upload className="w-3.5 h-3.5 text-amber-600" />
          <span>3. Attachments</span>
          <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">
            ✓
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('declarations')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'declarations' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>4. Declarations</span>
          {isDeclarationsValid && (
            <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">
              ✓
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Traveler Identity */}
      {activeTab === 'traveler' && (
        <div className="borderless-card p-6 sm:p-8 bg-white space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Personal & Passport Details</h3>
              <p className="text-xs text-slate-500">Ensure this matches your physical passport bio page exactly.</p>
            </div>
            {draft.ocrData && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                <FileCheck className="w-3.5 h-3.5" />
                <span>OCR Validated</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                Given Names (First + Middle) <span className="text-rose-500">*</span>
              </label>
              <input
                ref={givenNamesRef}
                type="text"
                value={draft.traveler.givenNames || ''}
                onChange={(e) => {
                  updateDraft({ traveler: { ...draft.traveler, givenNames: e.target.value } });
                  if (fieldErrors.givenNames) {
                    setFieldErrors((prev) => ({ ...prev, givenNames: false }));
                  }
                }}
                className={`w-full borderless-input px-4 py-3 text-xs font-semibold text-slate-900 ${
                  fieldErrors.givenNames ? 'border-rose-400 bg-rose-50/20 ring-2 ring-rose-200' : ''
                }`}
                placeholder="e.g. Ahmed Mohammed"
              />
              {fieldErrors.givenNames && (
                <span className="text-[11px] font-semibold text-rose-600 mt-1 block">Given names are required</span>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                Surname / Family Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={draft.traveler.surname || ''}
                onChange={(e) => {
                  updateDraft({ traveler: { ...draft.traveler, surname: e.target.value } });
                  if (fieldErrors.surname) {
                    setFieldErrors((prev) => ({ ...prev, surname: false }));
                  }
                }}
                className={`w-full borderless-input px-4 py-3 text-xs font-semibold text-slate-900 ${
                  fieldErrors.surname ? 'border-rose-400 bg-rose-50/20 ring-2 ring-rose-200' : ''
                }`}
                placeholder="e.g. Al-Khalifa"
              />
              {fieldErrors.surname && (
                <span className="text-[11px] font-semibold text-rose-600 mt-1 block">Surname is required</span>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                Passport Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={draft.traveler.passportNumber || ''}
                onChange={(e) => {
                  updateDraft({ traveler: { ...draft.traveler, passportNumber: e.target.value.toUpperCase() } });
                  if (fieldErrors.passportNumber) {
                    setFieldErrors((prev) => ({ ...prev, passportNumber: false }));
                  }
                }}
                className={`w-full borderless-input px-4 py-3 text-xs font-mono font-bold text-slate-900 uppercase ${
                  fieldErrors.passportNumber ? 'border-rose-400 bg-rose-50/20 ring-2 ring-rose-200' : ''
                }`}
                placeholder="e.g. B82910471"
              />
              {fieldErrors.passportNumber && (
                <span className="text-[11px] font-semibold text-rose-600 mt-1 block">Passport number is required</span>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Nationality</label>
              <input
                type="text"
                value={draft.traveler.nationality || 'Bahraini'}
                onChange={(e) => updateDraft({ traveler: { ...draft.traveler, nationality: e.target.value } })}
                className="w-full borderless-input px-4 py-3 text-xs font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Date of Birth</label>
              <input
                type="date"
                value={draft.traveler.dateOfBirth || '1992-05-14'}
                onChange={(e) => updateDraft({ traveler: { ...draft.traveler, dateOfBirth: e.target.value } })}
                className="w-full borderless-input px-4 py-3 text-xs font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Gender</label>
              <select
                value={draft.traveler.gender || 'M'}
                onChange={(e) => updateDraft({ traveler: { ...draft.traveler, gender: e.target.value as any } })}
                className="w-full borderless-input px-4 py-3 text-xs font-semibold text-slate-900 cursor-pointer"
              >
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="X">Unspecified</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Passport Issue Date</label>
              <input
                type="date"
                value={draft.traveler.passportIssueDate || '2023-01-10'}
                onChange={(e) => updateDraft({ traveler: { ...draft.traveler, passportIssueDate: e.target.value } })}
                className="w-full borderless-input px-4 py-3 text-xs font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Passport Expiry Date</label>
              <input
                type="date"
                value={draft.traveler.passportExpiryDate || '2033-01-09'}
                onChange={(e) => updateDraft({ traveler: { ...draft.traveler, passportExpiryDate: e.target.value } })}
                className="w-full borderless-input px-4 py-3 text-xs font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Occupation</label>
              <input
                type="text"
                value={draft.traveler.occupation || 'Business Professional'}
                onChange={(e) => updateDraft({ traveler: { ...draft.traveler, occupation: e.target.value } })}
                className="w-full borderless-input px-4 py-3 text-xs font-semibold text-slate-900"
                placeholder="e.g. Engineer, Business Executive"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('itinerary')}
              className="px-5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>Next: Itinerary & Stay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Itinerary & Stay */}
      {activeTab === 'itinerary' && (
        <div className="borderless-card p-6 sm:p-8 bg-white space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Itinerary & Entry Checkpoint</h3>
              <p className="text-xs text-slate-500">Provide planned arrival and destination stay logistics.</p>
            </div>
            {isItineraryValid && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Ready</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                Expected Arrival Date <span className="text-rose-500">*</span>
              </label>
              <input
                ref={arrivalDateRef}
                type="date"
                value={draft.itinerary.arrivalDate || ''}
                onChange={(e) => {
                  updateDraft({ itinerary: { ...draft.itinerary, arrivalDate: e.target.value } });
                  if (fieldErrors.arrivalDate) {
                    setFieldErrors((prev) => ({ ...prev, arrivalDate: false }));
                  }
                  if (formError && e.target.value && draft.itinerary.portOfEntry) {
                    setFormError(null);
                  }
                }}
                className={`w-full borderless-input px-4 py-3 text-xs font-semibold text-slate-900 ${
                  fieldErrors.arrivalDate ? 'border-rose-400 bg-rose-50/20 ring-2 ring-rose-200' : ''
                }`}
              />
              {fieldErrors.arrivalDate ? (
                <span className="text-[11px] font-semibold text-rose-600 mt-1 block">
                  Please specify your arrival date
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Date of planned entry into destination
                </span>
              )}
              {/* Quick Pick Arrival Date Chips */}
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400 font-semibold">Quick Pick:</span>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 14);
                    const val = d.toISOString().split('T')[0];
                    const dep = new Date();
                    dep.setDate(dep.getDate() + 28);
                    updateDraft({ itinerary: { ...draft.itinerary, arrivalDate: val, departureDate: dep.toISOString().split('T')[0] } });
                    setFieldErrors((prev) => ({ ...prev, arrivalDate: false }));
                    if (draft.itinerary.portOfEntry) setFormError(null);
                  }}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 transition-colors cursor-pointer"
                >
                  +14 Days (Standard)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 30);
                    const val = d.toISOString().split('T')[0];
                    const dep = new Date();
                    dep.setDate(dep.getDate() + 45);
                    updateDraft({ itinerary: { ...draft.itinerary, arrivalDate: val, departureDate: dep.toISOString().split('T')[0] } });
                    setFieldErrors((prev) => ({ ...prev, arrivalDate: false }));
                    if (draft.itinerary.portOfEntry) setFormError(null);
                  }}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 transition-colors cursor-pointer"
                >
                  +30 Days (Next Month)
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Planned Departure Date</label>
              <input
                type="date"
                value={draft.itinerary.departureDate || ''}
                onChange={(e) => updateDraft({ itinerary: { ...draft.itinerary, departureDate: e.target.value } })}
                className="w-full borderless-input px-4 py-3 text-xs font-semibold text-slate-900"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Expected departure date</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                Port of Entry (Airport or Land Border) <span className="text-rose-500">*</span>
              </label>
              <input
                ref={portOfEntryRef}
                type="text"
                value={draft.itinerary.portOfEntry || ''}
                onChange={(e) => {
                  updateDraft({ itinerary: { ...draft.itinerary, portOfEntry: e.target.value } });
                  if (fieldErrors.portOfEntry) {
                    setFieldErrors((prev) => ({ ...prev, portOfEntry: false }));
                  }
                  if (formError && draft.itinerary.arrivalDate && e.target.value) {
                    setFormError(null);
                  }
                }}
                className={`w-full borderless-input px-4 py-3 text-xs font-semibold text-slate-900 ${
                  fieldErrors.portOfEntry ? 'border-rose-400 bg-rose-50/20 ring-2 ring-rose-200' : ''
                }`}
                placeholder="e.g. King Fahd Causeway (Bahrain - KSA), Riyadh Airport"
              />
              {fieldErrors.portOfEntry ? (
                <span className="text-[11px] font-semibold text-rose-600 mt-1 block">
                  Port of entry checkpoint is required
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 mt-1 block">Border checkpoint or international airport</span>
              )}

              {/* Quick Pick Port of Entry Chips */}
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400 font-semibold">Common Checkpoints:</span>
                {[
                  'King Fahd Causeway (Bahrain - KSA)',
                  'Bahrain Int Airport (BAH)',
                  'King Khalid Int Airport (RUH)',
                  'Dubai Int Airport (DXB)',
                ].map((port) => (
                  <button
                    key={port}
                    type="button"
                    onClick={() => {
                      updateDraft({ itinerary: { ...draft.itinerary, portOfEntry: port } });
                      setFieldErrors((prev) => ({ ...prev, portOfEntry: false }));
                      if (draft.itinerary.arrivalDate) setFormError(null);
                    }}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 transition-colors cursor-pointer"
                  >
                    {port.split('(')[0].trim()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Emergency Contact Phone Number</label>
              <input
                type="text"
                value={draft.itinerary.emergencyContact || ''}
                onChange={(e) => updateDraft({ itinerary: { ...draft.itinerary, emergencyContact: e.target.value } })}
                className="w-full borderless-input px-4 py-3 text-xs font-semibold text-slate-900"
                placeholder="+973 3944 1122 (Family)"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Accommodation Address in Destination</label>
              <textarea
                rows={2}
                value={draft.itinerary.accommodationAddress || ''}
                onChange={(e) => updateDraft({ itinerary: { ...draft.itinerary, accommodationAddress: e.target.value } })}
                className="w-full borderless-input px-4 py-3 text-xs font-semibold text-slate-900 resize-none"
                placeholder="Hotel name, street, city, postal code"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('traveler')}
              className="px-4 py-2 rounded-full text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              &larr; Back to Traveler Identity
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('documents')}
              className="px-5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>Next: Attachments</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Document Attachments */}
      {activeTab === 'documents' && (
        <div className="borderless-card p-6 sm:p-8 bg-white space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Required Document Uploads</h3>
            <p className="text-xs text-slate-500">Upload or confirm pre-captured travel certificates.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Passport Upload Item */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Passport Bio Page</h4>
                  <span className="text-[11px] text-teal-700 font-medium">✓ Uploaded & OCR Scanned</span>
                </div>
              </div>
              <span className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                Attached
              </span>
            </div>

            {/* Photo Upload Item */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Passport Photo (2x2 inch)</h4>
                  <span className="text-[11px] text-slate-500 font-medium">White background required</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => updateDraft({ uploadedFiles: { ...draft.uploadedFiles, photo: true } })}
                className={`text-xs font-bold px-3 py-1 rounded-full cursor-pointer transition-colors ${
                  draft.uploadedFiles.photo
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {draft.uploadedFiles.photo ? 'Attached ✓' : 'Upload Photo'}
              </button>
            </div>

            {/* Flight Ticket Item */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Plane className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Flight Reservation / Itinerary</h4>
                  <span className="text-[11px] text-slate-500 font-medium">Return ticket proof</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => updateDraft({ uploadedFiles: { ...draft.uploadedFiles, flight: true } })}
                className={`text-xs font-bold px-3 py-1 rounded-full cursor-pointer transition-colors ${
                  draft.uploadedFiles.flight
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {draft.uploadedFiles.flight ? 'Attached ✓' : 'Attach Flight'}
              </button>
            </div>

            {/* Hotel Voucher */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Hotel Voucher / Host Letter</h4>
                  <span className="text-[11px] text-slate-500 font-medium">Accommodation proof</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => updateDraft({ uploadedFiles: { ...draft.uploadedFiles, hotel: true } })}
                className={`text-xs font-bold px-3 py-1 rounded-full cursor-pointer transition-colors ${
                  draft.uploadedFiles.hotel
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {draft.uploadedFiles.hotel ? 'Attached ✓' : 'Attach Hotel'}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('itinerary')}
              className="px-4 py-2 rounded-full text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              &larr; Back to Itinerary & Stay
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('declarations')}
              className="px-5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>Next: Declarations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Declarations */}
      {activeTab === 'declarations' && (
        <div className="borderless-card p-6 sm:p-8 bg-white space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Health, Customs & Legal Declarations</h3>
            <p className="text-xs text-slate-500">Official declaration required by consular authorities.</p>
          </div>

          <div className="space-y-4 text-xs">
            <label className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 cursor-pointer hover:bg-slate-100/80 transition-colors">
              <input
                type="checkbox"
                checked={draft.declarations.criminalHistory}
                onChange={(e) => updateDraft({ declarations: { ...draft.declarations, criminalHistory: e.target.checked } })}
                className="mt-0.5 rounded text-teal-600 focus:ring-0 cursor-pointer"
              />
              <span className="text-slate-700 font-medium">
                I have a criminal record in any jurisdiction, or have been convicted of an offense. (Leave unchecked if none)
              </span>
            </label>

            <label className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 cursor-pointer hover:bg-slate-100/80 transition-colors">
              <input
                type="checkbox"
                checked={draft.declarations.priorRejections}
                onChange={(e) => updateDraft({ declarations: { ...draft.declarations, priorRejections: e.target.checked } })}
                className="mt-0.5 rounded text-teal-600 focus:ring-0 cursor-pointer"
              />
              <span className="text-slate-700 font-medium">
                I have previously been denied entry or had a visa application rejected by the destination country.
              </span>
            </label>

            <label className={`flex items-start gap-3 p-4 rounded-2xl border transition-colors cursor-pointer ${
              draft.declarations.accuracyAgreed
                ? 'bg-amber-50/70 border-amber-300'
                : fieldErrors.accuracyAgreed
                ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-200'
                : 'bg-amber-50/50 border-amber-200/50'
            }`}>
              <input
                type="checkbox"
                checked={draft.declarations.accuracyAgreed}
                onChange={(e) => {
                  updateDraft({ declarations: { ...draft.declarations, accuracyAgreed: e.target.checked } });
                  if (fieldErrors.accuracyAgreed) {
                    setFieldErrors((prev) => ({ ...prev, accuracyAgreed: false }));
                  }
                  if (formError && e.target.checked) {
                    setFormError(null);
                  }
                }}
                className="mt-0.5 rounded text-teal-600 focus:ring-0 cursor-pointer"
              />
              <div>
                <span className="text-amber-950 font-bold block">
                  I certify under penalty of perjury that all details, passport dates, and attachments provided in this Easy Travels dossier are complete, accurate, and match my physical travel documents.
                </span>
                {fieldErrors.accuracyAgreed && (
                  <span className="text-[11px] font-bold text-rose-600 mt-1 block">
                    You must accept this certification to proceed with consular lodgement.
                  </span>
                )}
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Action Navigation Buttons */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 rounded-full text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to OCR Scanner</span>
        </button>

        <button
          type="button"
          onClick={validateAndProceed}
          className="px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Continue to Final Checkout & Payment</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
