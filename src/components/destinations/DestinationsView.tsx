import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { COUNTRIES, getVisaRequirement } from '../../data/destinations';
import { useApplications } from '../../context/ApplicationContext';
import { Search, Globe, Clock, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export const DestinationsView: React.FC<{ onApplyForCountry: (countryCode: string) => void }> = ({
  onApplyForCountry,
}) => {
  const { t, formatPrice, isRtl } = useLanguage();
  const { updateDraft, setCurrentStep } = useApplications();
  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');

  const regions = ['All', 'Middle East', 'Europe', 'Asia', 'Americas', 'Africa'];

  const filtered = COUNTRIES.filter((c) => {
    const matchesRegion = selectedRegion === 'All' || c.region === selectedRegion;
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.nameAr.includes(search) ||
      c.code.toLowerCase().includes(search.toLowerCase());
    return matchesRegion && matchesSearch;
  });

  const handleStartApply = (code: string) => {
    const req = getVisaRequirement(code);
    updateDraft({
      destinationCountry: code,
      destinationName: req.destinationName,
      visaType: req.visaType,
    });
    setCurrentStep(1);
    onApplyForCountry(code);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Globe className="w-3.5 h-3.5" />
            <span>Global Coverage</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            100+ Global Visa & Entry Portals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Check real-time entry guidelines, official consular fees, and required documents.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search countries, regions, codes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full borderless-input pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900"
          />
        </div>
      </div>

      {/* Region Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        {regions.map((region) => (
          <button
            key={region}
            onClick={() => setSelectedRegion(region)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedRegion === region
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {region}
          </button>
        ))}
      </div>

      {/* Destinations Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((country) => {
          const req = getVisaRequirement(country.code);
          const platform15 = Math.max(18, Math.round(req.governmentFeeUSD * 0.15));
          const totalFee = req.governmentFeeUSD + platform15;

          return (
            <div
              key={country.code}
              className="borderless-card p-6 flex flex-col justify-between bg-white space-y-4 hover:border-slate-200 transition-all"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl shadow-xs p-1.5 rounded-2xl bg-slate-50">{country.flag}</span>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {isRtl ? country.nameAr : country.name}
                      </h3>
                      <span className="text-[10px] text-slate-400 font-mono">ISO: {country.code} • {country.region}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700">
                    {req.visaType}
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  {req.description}
                </p>

                {/* Requirements list */}
                <div className="p-3 rounded-2xl bg-slate-50 space-y-1.5 text-[11px] text-slate-600 mb-4">
                  <span className="font-bold text-slate-700 block">Checklist:</span>
                  {req.requiredDocuments.slice(0, 2).map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-slate-500">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="truncate">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Starting Total
                  </span>
                  <span className="text-sm font-black text-slate-900">{formatPrice(totalFee)}</span>
                </div>

                <button
                  onClick={() => handleStartApply(country.code)}
                  className="px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
