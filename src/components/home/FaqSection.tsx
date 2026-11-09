import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      question: 'Is Easy Travels an official government embassy or private concierge?',
      answer:
        'Easy Travels is a registered private travel visa logistics provider and concierge agency headquartered in Riffa, Kingdom of Bahrain. We assist travelers with document pre-checks, certified translation, edge OCR scanning, and automated application submission to official government visa portals. Final approval decisions are made solely by destination government immigration authorities.',
      category: 'Legal & Agency',
    },
    {
      question: 'How does the in-browser OCR scanner protect my passport privacy?',
      answer:
        'Our computer vision and ICAO Doc 9303 MRZ parsing engine executes entirely inside your client browser via WebAssembly. Your passport scan is never transmitted to unverified third-party OCR vendors. Data is processed locally in RAM and only transmitted to encrypted consular filing servers once you explicitly verify and confirm the form.',
      category: 'Security & OCR',
    },
    {
      question: 'What is the "6-month passport validity rule"?',
      answer:
        'Most destination countries (including Saudi Arabia, Japan, Schengen countries, Turkey, and Egypt) require your passport to remain valid for at least 6 months beyond your scheduled entry or departure date. Our dynamic engine warns you if your passport expires sooner.',
      category: 'Immigration Rules',
    },
    {
      question: 'Can I visit your physical office in Bahrain for in-person support?',
      answer:
        'Yes! You are welcome to visit our physical branch in East Riffa, located on Lulu Road (Road 2023) near IMC Hospital. Our consular specialists provide face-to-face document verification, biometric photo capture, and cash/card payment handling from Saturday to Thursday, 8:30 AM to 8:30 PM.',
      category: 'Bahrain Branch',
    },
    {
      question: 'What happens if my visa application requires additional documents?',
      answer:
        'If an immigration officer or embassy requests further evidence (such as updated bank statements or hotel booking), our administrative system triggers an instant alert via WhatsApp and Email. You can re-upload requested files directly through your Document Wallet.',
      category: 'Operations',
    },
  ];

  return (
    <section className="py-20 bg-slate-50/50 border-t border-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Everything you need to know about EasyTravel
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Clear guidelines on visa processing, security protocols, and our Bahrain service desk.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="borderless-card overflow-hidden bg-white transition-all duration-200"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-sm font-bold text-slate-900">{faq.question}</span>
                  <div
                    className={`w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-slate-900 text-white' : 'text-slate-600'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-50">
                    <p>{faq.answer}</p>
                    <span className="inline-block mt-3 px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-semibold text-slate-500">
                      Category: {faq.category}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
