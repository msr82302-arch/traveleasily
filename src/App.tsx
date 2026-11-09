/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { ApplicationProvider, useApplications } from './context/ApplicationContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HeroSection } from './components/home/HeroSection';
import { WorkflowExplainer } from './components/home/WorkflowExplainer';
import { DestinationGrid } from './components/home/DestinationGrid';
import { FaqSection } from './components/home/FaqSection';
import { ApplicationWizard } from './components/apply/ApplicationWizard';
import { DocumentWallet } from './components/wallet/DocumentWallet';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminSignupView } from './components/admin/AdminSignupView';
import { AdminLoginView } from './components/admin/AdminLoginView';
import { AdminForgotPasswordView } from './components/admin/AdminForgotPasswordView';
import { DestinationsView } from './components/destinations/DestinationsView';
import { AuthModal } from './components/auth/AuthModal';
import { AiConciergeModal } from './components/ai/AiConciergeModal';
import { DevEnvironmentBar } from './components/common/DevEnvironmentBar';
import { VisaApplication } from './types/visa';
import { CheckCircle2, ArrowRight, Compass, Home } from 'lucide-react';
import { setupSecurityGuards } from './utils/security';

function AppContent() {
  // Client-side URL Routing support
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.location.pathname) {
      return window.location.pathname;
    }
    return '/';
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [successBannerApp, setSuccessBannerApp] = useState<VisaApplication | null>(null);

  const { updateDraft, setCurrentStep } = useApplications();

  // Listen for browser back / forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Setup security guards for right-click and dev tools protection preserving form accessibility
  useEffect(() => {
    const cleanup = setupSecurityGuards();
    return cleanup;
  }, []);

  // Central routing navigator
  const navigateTo = (path: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', path);
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartApplication = (origin: string, destination: string) => {
    updateDraft({ originCountry: origin, destinationCountry: destination });
    setCurrentStep(1);
    navigateTo('/apply');
  };

  const handleFinishApplication = (newApp: VisaApplication) => {
    setSuccessBannerApp(newApp);
    navigateTo('/wallet');
  };

  const handleSelectCountry = (countryCode: string) => {
    updateDraft({ destinationCountry: countryCode });
    setCurrentStep(1);
    navigateTo('/apply');
  };

  // Map path to view for Navbar highlighting
  const getNavView = (): 'home' | 'apply' | 'wallet' | 'admin' | 'destinations' | 'not-found' => {
    if (currentPath === '/' || currentPath === '/home') return 'home';
    if (currentPath.startsWith('/apply')) return 'apply';
    if (currentPath.startsWith('/wallet')) return 'wallet';
    if (currentPath.startsWith('/admin')) return 'admin';
    if (currentPath.startsWith('/destinations')) return 'destinations';
    return 'not-found';
  };

  const handleNavClick = (view: 'home' | 'apply' | 'wallet' | 'admin' | 'destinations' | 'not-found') => {
    switch (view) {
      case 'home':
        navigateTo('/');
        break;
      case 'apply':
        navigateTo('/apply');
        break;
      case 'wallet':
        navigateTo('/wallet');
        break;
      case 'admin':
        navigateTo('/admin/dashboard');
        break;
      case 'destinations':
        navigateTo('/destinations');
        break;
      default:
        navigateTo('/');
        break;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Development Environment Bar for Clean Production vs Dev Fixtures & Direct Routes */}
      <DevEnvironmentBar onNavigate={navigateTo} currentPath={currentPath} />

      {/* Top Navigation */}
      <Navbar
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenAi={() => setIsAiModalOpen(true)}
        onNavigate={handleNavClick}
        currentView={getNavView()}
      />

      {/* Success Banner if user just submitted */}
      {successBannerApp && (
        <div className="bg-emerald-600 text-white px-4 py-3 shadow-md animate-in slide-in-from-top duration-300">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-amber-300 shrink-0" />
              <span>
                <strong>Application Lodged Successfully!</strong> Reference:{' '}
                <span className="font-mono underline">{successBannerApp.id}</span> for{' '}
                {successBannerApp.destinationName}. Dossier has been added to your Document Wallet.
              </span>
            </div>
            <button
              onClick={() => setSuccessBannerApp(null)}
              className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 rounded-full text-xs font-bold transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Routed View */}
      <main className="flex-1">
        {/* Public Homepage Route */}
        {(currentPath === '/' || currentPath === '/home') && (
          <>
            <HeroSection
              onStartApplication={handleStartApplication}
              onOpenAi={() => setIsAiModalOpen(true)}
            />
            <WorkflowExplainer onStartApply={() => navigateTo('/apply')} />
            <DestinationGrid onSelectCountry={handleSelectCountry} />
            <FaqSection />
          </>
        )}

        {/* Public Application Wizard Route */}
        {currentPath === '/apply' && (
          <ApplicationWizard
            onFinish={handleFinishApplication}
            onCancel={() => navigateTo('/')}
          />
        )}

        {/* Document Wallet & Credit Management Route */}
        {currentPath === '/wallet' && (
          <DocumentWallet onNewApplication={() => navigateTo('/apply')} />
        )}

        {/* Dedicated Admin Registration Route: /admin/signup */}
        {currentPath === '/admin/signup' && (
          <AdminSignupView onNavigate={navigateTo} />
        )}

        {/* Dedicated Admin Sign-In Route: /admin/login */}
        {currentPath === '/admin/login' && (
          <AdminLoginView onNavigate={navigateTo} />
        )}

        {/* Dedicated Admin Password Recovery Route: /admin/forgot-password */}
        {currentPath === '/admin/forgot-password' && (
          <AdminForgotPasswordView onNavigate={navigateTo} />
        )}

        {/* Admin Dashboard: /admin/dashboard or /admin */}
        {(currentPath === '/admin/dashboard' || currentPath === '/admin') && (
          <AdminDashboard initialTab="tracker" />
        )}

        {/* Dedicated Admin Staff & Approvals Route: /admin/staff */}
        {currentPath === '/admin/staff' && (
          <AdminDashboard initialTab="staff" />
        )}

        {/* Dedicated Admin 8 Roles Route: /admin/roles */}
        {currentPath === '/admin/roles' && (
          <AdminDashboard initialTab="roles" />
        )}

        {/* Dedicated Admin 19 Permissions Route: /admin/permissions */}
        {currentPath === '/admin/permissions' && (
          <AdminDashboard initialTab="permissions" />
        )}

        {/* Dedicated Admin Settings Route: /admin/settings */}
        {currentPath === '/admin/settings' && (
          <AdminDashboard initialTab="settings" />
        )}

        {/* Public Destinations Directory Route */}
        {currentPath === '/destinations' && (
          <DestinationsView onApplyForCountry={handleSelectCountry} />
        )}

        {/* 404 Route Not Found */}
        {![
          '/',
          '/home',
          '/apply',
          '/wallet',
          '/destinations',
          '/admin',
          '/admin/dashboard',
          '/admin/signup',
          '/admin/login',
          '/admin/forgot-password',
          '/admin/staff',
          '/admin/roles',
          '/admin/permissions',
          '/admin/settings',
        ].includes(currentPath) && (
          <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Compass className="w-8 h-8 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                404 Error &bull; Route Not Found
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900">
                Destination Pathway Unavailable
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                The consular portal URL (<code>{currentPath}</code>) does not exist or may have been relocated.
              </p>
            </div>
            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => navigateTo('/')}
                className="px-5 py-2.5 rounded-full bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to Easy Travels Portal</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer with Bahrain agency address and clean-room disclosures */}
      <Footer onNavigate={handleNavClick} />

      {/* Floating AI Visa Concierge Trigger Button */}
      <button
        onClick={() => setIsAiModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-full bg-slate-900 text-white shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer border border-slate-800 group"
      >
        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-teal-400 flex items-center justify-center text-slate-950">
          <span className="text-xs font-black">✦</span>
        </div>
        <span className="text-xs font-bold hidden sm:inline">Ask AI Concierge</span>
      </button>

      {/* Auth & Security Lockout Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* AI Concierge Modal */}
      <AiConciergeModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ApplicationProvider>
          <AppContent />
        </ApplicationProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
