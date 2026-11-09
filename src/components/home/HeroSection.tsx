import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { COUNTRIES, getVisaRequirement } from '../../data/destinations';
import { useApplications } from '../../context/ApplicationContext';
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Plane,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface HeroSectionProps {
  onStartApplication: (origin: string, destination: string) => void;
  onOpenAi: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartApplication,
  onOpenAi,
}) => {
  const { t, formatPrice } = useLanguage();
  const { updateDraft, setCurrentStep } = useApplications();

  const [originCode, setOriginCode] = useState<string>('BH');
  const [destinationCode, setDestinationCode] = useState<string>('SA');
  const [purpose, setPurpose] = useState<string>('tourism');

  // Dynamic lookup for currently selected route
  const currentRequirement = getVisaRequirement(destinationCode);
  const platformCharge = Math.max(18, Math.round(currentRequirement.governmentFeeUSD * 0.15));
  const totalStartingCost = currentRequirement.governmentFeeUSD + platformCharge;

  const handleProceed = () => {
    updateDraft({
      originCountry: originCode,
      destinationCountry: destinationCode,
      destinationName: currentRequirement.destinationName,
      visaType: currentRequirement.visaType,
    });
    setCurrentStep(1);
    onStartApplication(originCode, destinationCode);
  };

  return (
    <section className="relative pt-8 pb-20 overflow-hidden">
      {/* Ambient background glows for borderless depth */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-amber-200/20 via-teal-100/30 to-blue-200/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Announcement Pill */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white shadow-xs text-xs font-semibold text-slate-700 border border-slate-100">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{t.badgeAgency}</span>
            <span className="text-slate-300">•</span>
            <span className="text-teal-700">99.4% Verified Approval</span>
          </div>
        </div>

        {/* Hero Headings */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
            {t.hero.titlePrefix}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-teal-600 to-slate-900">
              {t.hero.titleHighlight}
            </span>
            <br />
            {t.hero.titleSuffix}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            {t.hero.subtitle}
          </p>
        </div>

        {/* Central Borderless Smart Route Matcher Card */}
        <div className="max-w-4xl mx-auto borderless-card p-6 sm:p-8 relative bg-white/95 backdrop-blur-xl">
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                <Compass className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-slate-900">
                Dynamic Eligibility & Requirements Engine
              </span>
            </div>
            <button
              onClick={onOpenAi}
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Ask AI Rule Specialist</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {/* Origin Citizen Selector */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-slate-500 block">
                {t.hero.originPlaceholder}
              </label>
              <select
                value={originCode}
                onChange={(e) => setOriginCode(e.target.value)}
                className="w-full borderless-input px-4 py-3 text-sm font-semibold text-slate-800 cursor-pointer"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Destination Selector */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-slate-500 block">
                {t.hero.destinationPlaceholder}
              </label>
              <select
                value={destinationCode}
                onChange={(e) => setDestinationCode(e.target.value)}
                className="w-full borderless-input px-4 py-3 text-sm font-semibold text-slate-800 cursor-pointer"
              >
                {COUNTRIES.filter((c) => c.code !== originCode).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Purpose */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-slate-500 block">
                {t.hero.purpose}
              </label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full borderless-input px-4 py-3 text-sm font-semibold text-slate-800 cursor-pointer"
              >
                <option value="tourism">{t.hero.tourism}</option>
                <option value="business">{t.hero.business}</option>
                <option value="transit">{t.hero.transit}</option>
              </select>
            </div>
          </div>

          {/* Dynamic Match Output Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">
                    {currentRequirement.visaType} Available
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                    {currentRequirement.entries} Entry
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Valid for {currentRequirement.validityDays} days • Max stay {currentRequirement.maxStayDays} days • Processing in ~{currentRequirement.standardProcessingDays} business day(s)
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Gov Fee + 15% Platform Charge
              </span>
              <span className="text-lg font-black text-slate-900">
                {formatPrice(totalStartingCost)}
              </span>
            </div>
          </div>

          {/* Action CTA Button */}
          <button
            onClick={handleProceed}
            className="w-full py-4 px-6 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <span>{t.hero.checkBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Live Trust Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-12 text-center">
          <div className="p-4 rounded-2xl bg-white/70 shadow-xs">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 block">{t.trust.stat1}</span>
            <span className="text-xs font-semibold text-slate-500 mt-1 block">{t.trust.stat1Label}</span>
          </div>
          <div className="p-4 rounded-2xl bg-white/70 shadow-xs">
            <span className="text-2xl sm:text-3xl font-black text-teal-600 block">{t.trust.stat2}</span>
            <span className="text-xs font-semibold text-slate-500 mt-1 block">{t.trust.stat2Label}</span>
          </div>
          <div className="p-4 rounded-2xl bg-white/70 shadow-xs">
            <span className="text-2xl sm:text-3xl font-black text-amber-600 block">{t.trust.stat3}</span>
            <span className="text-xs font-semibold text-slate-500 mt-1 block">{t.trust.stat3Label}</span>
          </div>
          <div className="p-4 rounded-2xl bg-white/70 shadow-xs">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 block">{t.trust.stat4}</span>
            <span className="text-xs font-semibold text-slate-500 mt-1 block">{t.trust.stat4Label}</span>
          </div>
        </div>
      </div>
    </section>
  );
};
