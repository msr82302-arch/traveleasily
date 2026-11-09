import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth, PRESET_STAFF_USERS } from '../../context/AuthContext';
import { useApplications } from '../../context/ApplicationContext';
import { UserRole } from '../../types/visa';
import {
  Compass,
  Briefcase,
  ShieldAlert,
  Sparkles,
  Globe,
  Coins,
  ChevronDown,
  User,
  LogOut,
  Layers,
  Menu,
  X,
  Plane,
  FolderLock
} from 'lucide-react';

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenAi: () => void;
  onNavigate: (view: any) => void;
  currentView: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onOpenAi,
  onNavigate,
  currentView,
}) => {
  const { language, setLanguage, currency, setCurrency, t, supportedLanguages } = useLanguage();
  const { currentUser, switchRole, logout, activeRole } = useAuth();
  const { applications } = useApplications();

  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isCurrencyMenuOpen, setIsCurrencyMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Count active / approved items in wallet
  const approvedCount = applications.filter((a) => a.status === 'Approved' || a.status === 'Delivered').length;

  const rolesList: { role: UserRole; label: string; desc: string }[] = [
    { role: 'super_admin', label: 'Super Admin', desc: 'Full root command & security' },
    { role: 'admin', label: 'Administrator', desc: 'Operational supervision & invitations' },
    { role: 'operations_manager', label: 'Application Manager', desc: 'Queue triage & SLA enforcement' },
    { role: 'visa_officer', label: 'Visa Officer', desc: 'Approve & lodge with government' },
    { role: 'document_verifier', label: 'Document Reviewer', desc: 'Inspect OCR & passport scans' },
    { role: 'finance_officer', label: 'Finance Officer', desc: 'Pricing & refund management' },
    { role: 'support_specialist', label: 'Customer Support', desc: 'Client live chat & alerts' },
    { role: 'readonly_auditor', label: 'Read-Only Auditor', desc: 'Compliance & audit log review' },
    { role: 'customer', label: 'Client / Traveler', desc: 'Consumer portal & wallet' },
  ];

  const handleRoleSelect = (role: UserRole) => {
    switchRole(role);
    setIsRoleMenuOpen(false);
    if (role === 'customer') {
      onNavigate('wallet');
    } else {
      onNavigate('admin');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-nav border-b border-slate-100 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Emblem */}
          <div
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
            title="Easy Travels - Document Clearance & Consular Services"
          >
            <img
              src="/assets/aistudio/is_a096d245.png"
              alt="Easy Travels - Document Clearance"
              className="h-10 sm:h-12 w-auto object-contain rounded-xl shadow-xs group-hover:scale-[1.02] transition-transform duration-200"
            />
            <div className="hidden lg:block border-l border-slate-200 pl-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-tight text-slate-900 uppercase">
                  Consular Clearance
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                  Riffa, Bahrain
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Official Visa Logistics
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => onNavigate('home')}
              className={`px-3 py-2 text-xs font-semibold rounded-full transition-colors cursor-pointer ${
                currentView === 'home'
                  ? 'text-teal-700 bg-teal-50/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {t.nav.findVisa}
            </button>

            <button
              onClick={() => onNavigate('destinations')}
              className={`px-3 py-2 text-xs font-semibold rounded-full transition-colors cursor-pointer ${
                currentView === 'destinations'
                  ? 'text-teal-700 bg-teal-50/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {t.nav.destinations}
            </button>

            <button
              onClick={() => onNavigate('apply')}
              className={`px-3 py-2 text-xs font-semibold rounded-full transition-colors cursor-pointer ${
                currentView === 'apply'
                  ? 'text-teal-700 bg-teal-50/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              New Application
            </button>

            <button
              onClick={() => onNavigate('wallet')}
              className={`relative px-3 py-2 text-xs font-semibold rounded-full transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentView === 'wallet'
                  ? 'text-teal-700 bg-teal-50/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>{t.nav.myWallet}</span>
              {approvedCount > 0 && (
                <span className="w-4 h-4 text-[10px] bg-teal-600 text-white rounded-full flex items-center justify-center font-bold">
                  {approvedCount}
                </span>
              )}
            </button>

            {/* Admin Command Portal link */}
            <button
              onClick={() => onNavigate('admin')}
              className={`px-3 py-2 text-xs font-semibold rounded-full transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentView === 'admin'
                  ? 'text-indigo-700 bg-indigo-50 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>{t.nav.adminPortal}</span>
            </button>
          </nav>

          {/* Right Action Icons & Switches */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* AI Concierge Trigger */}
            <button
              onClick={onOpenAi}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-full transition-all border border-amber-200/50 shadow-xs cursor-pointer group"
              title="EasyTravel AI Visa Concierge"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline">AI Concierge</span>
            </button>

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsLangMenuOpen(!isLangMenuOpen);
                  setIsCurrencyMenuOpen(false);
                  setIsRoleMenuOpen(false);
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span className="uppercase">{language}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl p-1.5 border border-slate-100 z-50">
                  {supportedLanguages.map((langOpt) => (
                    <button
                      key={langOpt.code}
                      onClick={() => {
                        setLanguage(langOpt.code);
                        setIsLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                        language === langOpt.code ? 'bg-teal-50 font-bold text-teal-800' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{langOpt.flag}</span>
                        <span>{langOpt.nativeName}</span>
                        {langOpt.isRtl && (
                          <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-slate-100 text-slate-500 font-mono">
                            RTL
                          </span>
                        )}
                      </div>
                      {language === langOpt.code && <span className="text-teal-600 font-bold text-xs">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Currency Switcher */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => {
                  setIsCurrencyMenuOpen(!isCurrencyMenuOpen);
                  setIsLangMenuOpen(false);
                  setIsRoleMenuOpen(false);
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <Coins className="w-3.5 h-3.5 text-slate-500" />
                <span>{currency}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isCurrencyMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-xl p-1.5 border border-slate-100 z-50">
                  {(['USD', 'BHD', 'EUR', 'GBP', 'SAR'] as const).map((curr) => (
                    <button
                      key={curr}
                      onClick={() => {
                        setCurrency(curr);
                        setIsCurrencyMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs rounded-xl flex items-center justify-between cursor-pointer ${
                        currency === curr ? 'bg-teal-50 font-bold text-teal-700' : 'hover:bg-slate-50'
                      }`}
                    >
                      <span>{curr}</span>
                      {currency === curr && <span className="text-[10px]">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Interactive Role Switcher Pill */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsRoleMenuOpen(!isRoleMenuOpen);
                  setIsLangMenuOpen(false);
                  setIsCurrencyMenuOpen(false);
                }}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-slate-900 text-white rounded-full text-xs font-semibold shadow-xs hover:bg-slate-800 transition-colors cursor-pointer"
                title="Switch active role / persona"
              >
                <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-700 flex items-center justify-center">
                  {currentUser?.avatar ? (
                    <img src={currentUser.avatar} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-3 h-3 text-white" />
                  )}
                </div>
                <span className="capitalize hidden sm:inline">
                  {activeRole.replace('_', ' ')}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isRoleMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl p-2 border border-slate-100 z-50">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Role-Based Access Control
                    </span>
                    <p className="text-xs font-bold text-slate-800">
                      Current: {currentUser?.name || 'Guest'}
                    </p>
                  </div>

                  <div className="space-y-1">
                    {rolesList.map((item) => (
                      <button
                        key={item.role}
                        onClick={() => handleRoleSelect(item.role)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex flex-col transition-colors cursor-pointer ${
                          activeRole === item.role
                            ? 'bg-indigo-50 text-indigo-900 font-bold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{item.label}</span>
                          {activeRole === item.role && (
                            <span className="text-[10px] text-indigo-600">Active</span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-normal">{item.desc}</span>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-100 space-y-1">
                    <button
                      onClick={() => {
                        setIsRoleMenuOpen(false);
                        window.history.pushState(null, '', '/admin/signup');
                        window.dispatchEvent(new PopStateEvent('popstate'));
                      }}
                      className="w-full px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 rounded-xl flex items-center gap-2 cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Register Staff Account (/admin/signup)</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsRoleMenuOpen(false);
                        window.history.pushState(null, '', '/admin/login');
                        window.dispatchEvent(new PopStateEvent('popstate'));
                      }}
                      className="w-full px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2 cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Admin Sign In (/admin/login)</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsRoleMenuOpen(false);
                        onOpenAuth();
                      }}
                      className="w-full px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 rounded-xl flex items-center gap-2 cursor-pointer"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                      <span>Security & Lockout Demo</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 md:hidden text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                onNavigate('home');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl cursor-pointer"
            >
              {t.nav.findVisa}
            </button>
            <button
              onClick={() => {
                onNavigate('destinations');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl cursor-pointer"
            >
              {t.nav.destinations}
            </button>
            <button
              onClick={() => {
                onNavigate('apply');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-sm font-semibold text-teal-700 bg-teal-50 rounded-xl cursor-pointer"
            >
              New Application
            </button>
            <button
              onClick={() => {
                onNavigate('wallet');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center justify-between cursor-pointer"
            >
              <span>{t.nav.myWallet}</span>
              {approvedCount > 0 && (
                <span className="px-2 py-0.5 text-xs bg-teal-600 text-white rounded-full font-bold">
                  {approvedCount}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                onNavigate('admin');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-sm font-bold text-indigo-700 bg-indigo-50 rounded-xl cursor-pointer"
            >
              {t.nav.adminPortal}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
