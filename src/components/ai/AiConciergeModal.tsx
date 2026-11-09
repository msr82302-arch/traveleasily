import React, { useState, useRef, useEffect } from 'react';
import { useApplications } from '../../context/ApplicationContext';
import { COUNTRY_KNOWLEDGE_REGISTRY } from '../../data/countryKnowledge';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
  Phone,
  Mail,
  AlertCircle,
  Building2,
  Calendar,
  Compass
} from 'lucide-react';

interface AiConciergeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'assistant' | 'user';
  text: string;
  time: string;
  citations?: { title: string; url: string; authority: string }[];
}

export const AiConciergeModal: React.FC<AiConciergeModalProps> = ({ isOpen, onClose }) => {
  const { draft } = useApplications();

  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(() => {
    return draft.destinationCountry || 'SA';
  });

  const activeCountry = COUNTRY_KNOWLEDGE_REGISTRY[selectedCountryCode] || COUNTRY_KNOWLEDGE_REGISTRY['SA'];

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: `Welcome to the Easy Travels Global Travel Intelligence Assistant.

I am synced with the official consular knowledge base for **${activeCountry.name}** (${activeCountry.governingAuthority}).
All requirements were verified as of **${activeCountry.lastVerifiedDate}**.

How can I assist you with visa eligibility, 6-month validity, health rules, or portal submissions?`,
      time: 'Just now',
      citations: [
        {
          title: `Official ${activeCountry.name} Portal`,
          url: activeCountry.officialPortalUrl,
          authority: activeCountry.governingAuthority,
        },
      ],
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHumanSupport, setShowHumanSupport] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const quickPrompts = [
    `What is the passport validity rule for ${activeCountry.name}?`,
    `What are the health & vaccine rules for ${activeCountry.name}?`,
    `What is the difference between single and multiple entry?`,
    `Are women allowed to travel without a guardian (mahram)?`,
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleCountrySelect = (code: string) => {
    setSelectedCountryCode(code);
    const country = COUNTRY_KNOWLEDGE_REGISTRY[code];
    if (country) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `Switched focus to **${country.name}** (${country.flag}).
• **Governing Authority:** ${country.governingAuthority}
• **Official Portal:** ${country.officialPortalUrl}
• **Status:** ${country.verificationBadge}
• **Minimum Passport Validity:** ${country.passportRules.minValidityMonths} months from entry date with at least ${country.passportRules.blankPagesRequired} blank pages.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          citations: [
            {
              title: `${country.name} Government Immigration Portal`,
              url: country.officialPortalUrl,
              authority: country.governingAuthority,
            },
          ],
        },
      ]);
    }
  };

  const handleSend = async (userQuery?: string) => {
    const textToSend = userQuery || input;
    if (!textToSend.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!userQuery) setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai-concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          destination: activeCountry.name,
          originPassport: draft.traveler.nationality || 'GCC / International Traveler',
          context: `Target destination: ${activeCountry.name} (${activeCountry.code}). Authority: ${activeCountry.governingAuthority}. Official portal: ${activeCountry.officialPortalUrl}. Verified: ${activeCountry.lastVerifiedDate}. Visa types: ${activeCountry.visaCategories.map(v => v.category).join(', ')}. Rules: min ${activeCountry.passportRules.minValidityMonths} months validity. Health: ${activeCountry.healthAndVaccineRules.join('; ')}`,
        }),
      });

      const data = await response.json();
      const botReply =
        data.reply ||
        `According to official ${activeCountry.name} consular guidelines: Ensure your passport has at least ${activeCountry.passportRules.minValidityMonths} months remaining validity. Easy Travels Bahrain desk can conduct a pre-flight dossier audit.`;

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: botReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          citations: [
            {
              title: `${activeCountry.name} Official Immigration Service`,
              url: activeCountry.officialPortalUrl,
              authority: activeCountry.governingAuthority,
            },
          ],
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `Official Guidance for ${activeCountry.name}:
• **Passport Validity:** Must have at least ${activeCountry.passportRules.minValidityMonths} months remaining validity with 2 blank pages.
• **Processing SLA:** Electronic visas typically process within 24 to 72 hours.
• **Official Authority:** ${activeCountry.governingAuthority}.
Our consular staff at Riffa, Bahrain (Near IMC Hospital) are available for certified document verification.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          citations: [
            {
              title: `${activeCountry.name} Official Portal`,
              url: activeCountry.officialPortalUrl,
              authority: activeCountry.governingAuthority,
            },
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl flex flex-col h-[700px] max-h-[92vh] overflow-hidden relative border border-slate-200">
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-teal-400 text-slate-950 flex items-center justify-center shadow-lg font-bold">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-extrabold text-white">
                  Global Travel Intelligence Assistant
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-teal-400" />
                  RAG Verified
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                <span>Riffa Consular Intelligence Desk</span>
                <span>•</span>
                <span className="text-emerald-400 font-medium">Synced: {activeCountry.lastVerifiedDate}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHumanSupport(!showHumanSupport)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              title="Escalate to Human Consular Officer"
            >
              <Phone className="w-3.5 h-3.5 text-rose-400" />
              <span>Human Officer</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Knowledge Country Quick Switcher Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center gap-2 overflow-x-auto text-xs scrollbar-none">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-slate-400" />
            Registry:
          </span>
          {Object.values(COUNTRY_KNOWLEDGE_REGISTRY).map((c) => (
            <button
              key={c.code}
              onClick={() => handleCountrySelect(c.code)}
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
                selectedCountryCode === c.code
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <span>{c.flag}</span>
              <span>{c.name}</span>
            </button>
          ))}
        </div>

        {/* Human Escalation Dropdown Drawer */}
        {showHumanSupport && (
          <div className="p-4 bg-amber-50/90 border-b border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950 animate-in slide-in-from-top-2">
            <div>
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Building2 className="w-4 h-4 text-rose-600" />
                <span>Easy Travels Bahrain Consular Office Support</span>
              </div>
              <p className="text-slate-600 mt-0.5 text-[11px]">
                Near IMC Hospital, Lulu Road, Riffa • Direct Phone:{' '}
                <a href="tel:+97333276768" className="font-bold text-slate-900 hover:underline">
                  +973 33276768
                </a>
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href="tel:+97333276768"
                className="px-3 py-1.5 rounded-full bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors flex items-center gap-1"
              >
                <Phone className="w-3 h-3" />
                <span>Call Branch</span>
              </a>
              <button
                onClick={() => setShowHumanSupport(false)}
                className="px-2.5 py-1 text-slate-500 hover:text-slate-800 text-xs cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Chat Thread Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900 border border-slate-200'
                }`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-teal-700" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-xs'
                    : 'bg-white text-slate-800 shadow-xs border border-slate-200 rounded-tl-xs'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>

                {/* Citations if available */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block w-full">
                      Verified Citations & Official Portals:
                    </span>
                    {msg.citations.map((cite, cIdx) => (
                      <a
                        key={cIdx}
                        href={cite.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-semibold transition-colors"
                      >
                        <Building2 className="w-3 h-3 text-teal-600" />
                        <span>{cite.title}</span>
                        <ExternalLink className="w-2.5 h-2.5 text-teal-500" />
                      </a>
                    ))}
                  </div>
                )}

                <span className="text-[9px] opacity-60 mt-2 block text-right font-mono">
                  {msg.time}
                </span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-teal-700 border border-slate-200 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center gap-2 text-xs text-slate-500">
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                <span>Querying consular database & government directives...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Prompts */}
        <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-xs scrollbar-none">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
            Suggested:
          </span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium shrink-0 transition-colors cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input & Dispatch Bar */}
        <div className="p-3.5 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask anything about ${activeCountry.name} visas, entry rules, or required documents...`}
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
            />

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-4 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>

          {/* Legal Boundary Notice */}
          <div className="mt-2 text-[10px] text-slate-400 text-center flex items-center justify-center gap-1.5">
            <AlertCircle className="w-3 h-3 text-slate-400 shrink-0" />
            <span>
              EasyTravel AI provides logistics guidance based on verified government directives. Approvals remain at sole consular discretion.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
