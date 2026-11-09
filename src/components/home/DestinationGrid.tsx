import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { COUNTRIES, getVisaRequirement } from '../../data/destinations';
import { Search, ArrowUpRight, Clock, ShieldCheck, MapPin } from 'lucide-react';

interface DestinationGridProps {
  onSelectCountry: (countryCode: string) => void;
}

export const DestinationGrid: React.FC<DestinationGridProps> = ({ onSelectCountry }) => {
  const { t, formatPrice, isRtl } = useLanguage();
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const regions = ['All', 'Middle East', 'Europe', 'Asia', 'Americas', 'Africa'];

  const filteredCountries = COUNTRIES.filter((country) => {
    const matchesRegion = selectedRegion === 'All' || country.region === selectedRegion;
    const matchesSearch =
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.nameAr.includes(searchQuery) ||
      country.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRegion && matchesSearch;
  });

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
              <MapPin className="w-3.5 h-3.5" />
              <span>Global Reach</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {t.popular.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Select your destination to preview consular requirements, processing times, and fees.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search 100+ countries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full borderless-input pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800"
            />
          </div>
        </div>

        {/* Region Filters Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-4 mb-8">
          {regions.map((region) => (
            <button
              key={region}
              onClick={() => setSelectedRegion(region)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedRegion === region
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {region}
            </button>
          ))}
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCountries.slice(0, 16).map((country) => {
            const req = getVisaRequirement(country.code);
            const platform15 = Math.max(18, Math.round(req.governmentFeeUSD * 0.15));
            const totalFee = req.governmentFeeUSD + platform15;

            return (
              <div
                key={country.code}
                onClick={() => onSelectCountry(country.code)}
                className="borderless-card p-5 flex flex-col justify-between group cursor-pointer bg-white hover:border-slate-200 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl shadow-xs p-1 rounded-xl bg-slate-50 inline-block">
                      {country.flag}
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700">
                      {req.visaType}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-600 transition-colors flex items-center justify-between">
                    <span>{isRtl ? country.nameAr : country.name}</span>
                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-teal-600" />
                  </h3>

                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 mb-4 leading-relaxed">
                    {req.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>~{req.standardProcessingDays}d</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block text-right">From</span>
                    <span className="font-extrabold text-slate-900">{formatPrice(totalFee)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredCountries.length === 0 && (
          <div className="text-center py-16 text-slate-400 text-sm">
            No matching destinations found for &quot;{searchQuery}&quot;. Please try another search keyword.
          </div>
        )}
      </div>
    </section>
  );
};
