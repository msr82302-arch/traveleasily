import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Route, Scan, FileEdit, FolderCheck, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';

export const WorkflowExplainer: React.FC<{ onStartApply: () => void }> = ({ onStartApply }) => {
  const { t } = useLanguage();

  const steps = [
    {
      num: '01',
      title: t.phases.phase1,
      desc: t.phases.phase1Desc,
      icon: Route,
      color: 'from-amber-500/10 to-amber-500/5 text-amber-700',
      badge: 'Step 1: Routing',
    },
    {
      num: '02',
      title: t.phases.phase2,
      desc: t.phases.phase2Desc,
      icon: Scan,
      color: 'from-teal-500/10 to-teal-500/5 text-teal-700',
      badge: 'Step 2: Edge OCR',
    },
    {
      num: '03',
      title: t.phases.phase3,
      desc: t.phases.phase3Desc,
      icon: FileEdit,
      color: 'from-blue-500/10 to-blue-500/5 text-blue-700',
      badge: 'Step 3: Autofill Form',
    },
    {
      num: '04',
      title: t.phases.phase4,
      desc: t.phases.phase4Desc,
      icon: FolderCheck,
      color: 'from-emerald-500/10 to-emerald-500/5 text-emerald-700',
      badge: 'Step 4: Live Delivery',
    },
  ];

  return (
    <section className="py-20 bg-slate-50/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-wider">
            <Cpu className="w-3.5 h-3.5" />
            <span>Architecture Specification</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t.phases.title}
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            {t.phases.subtitle}
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="borderless-card p-6 flex flex-col justify-between group relative overflow-hidden bg-white"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                      {step.badge}
                    </span>
                    <span className="text-2xl font-black text-slate-200 group-hover:text-slate-900 transition-colors">
                      {step.num}
                    </span>
                  </div>

                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${step.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 stroke-[2]" />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-50 flex items-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-teal-600 transition-colors">
                  <span>Learn more</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
