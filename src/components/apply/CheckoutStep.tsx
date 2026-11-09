import React, { useState } from 'react';
import { useApplications } from '../../context/ApplicationContext';
import { useLanguage } from '../../context/LanguageContext';
import { getVisaRequirement } from '../../data/destinations';
import { ProcessingSpeed, VisaApplication } from '../../types/visa';
import confetti from 'canvas-confetti';
import {
  CreditCard,
  ShieldCheck,
  Zap,
  Clock,
  Lock,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Building,
  Check,
  Wallet,
  Coins,
  Percent,
  HelpCircle,
  FileCheck,
  Mail,
} from 'lucide-react';

interface CheckoutStepProps {
  onBack: () => void;
  onSuccess: (newApp: VisaApplication) => void;
}

export const CheckoutStep: React.FC<CheckoutStepProps> = ({ onBack, onSuccess }) => {
  const { draft, updateDraft, submitDraftApplication } = useApplications();
  const { formatPrice, currency } = useLanguage();

  const req = getVisaRequirement(draft.destinationCountry);
  const [speed, setSpeed] = useState<ProcessingSpeed>(draft.processingSpeed || 'standard');
  const [paymentMethod, setPaymentMethod] = useState<
    'credit_card' | 'apple_pay' | 'paypal' | 'afs_gateway' | 'wallet_credit'
  >('credit_card');

  // Wallet Credit toggle
  const [applyWalletCredit, setApplyWalletCredit] = useState(false);
  const availableWalletCreditUSD = 25.0; // Simulated user wallet credit balance

  // Notification delivery recipient
  const [notificationEmail, setNotificationEmail] = useState(
    draft.traveler.email || 'traveler@easytravels-client.com'
  );

  // Card form states
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardHolder, setCardHolder] = useState(
    `${draft.traveler.givenNames} ${draft.traveler.surname}`.trim() || 'Ahmed Al-Khalifa'
  );
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('•••');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Speed costs & 15% Platform Service Charge calculation
  const speedCost =
    speed === 'super_rush' ? req.superRushFeeUSD : speed === 'rush' ? req.rushFeeUSD : 0;
  const govFee = req.governmentFeeUSD;
  
  // 15% Transparent Platform Service Charge (minimum $18 for low-fee visas)
  const platformRatePercent = 15;
  const platformFeeUSD = Math.max(18, Math.round(govFee * 0.15));
  
  const subtotalUSD = govFee + platformFeeUSD + speedCost;
  const walletDiscountUSD = applyWalletCredit ? Math.min(availableWalletCreditUSD, subtotalUSD) : 0;
  const finalTotalUSD = Math.max(0, subtotalUSD - walletDiscountUSD);

  const handleSpeedSelect = (selectedSpeed: ProcessingSpeed) => {
    setSpeed(selectedSpeed);
    updateDraft({ processingSpeed: selectedSpeed });
  };

  const handleFillTestCard = () => {
    setCardNumber('4242 4242 4242 4242');
    setCardHolder(`${draft.traveler.givenNames} ${draft.traveler.surname}`.trim() || 'Ahmed Al-Khalifa');
    setCardExpiry('12/28');
    setCardCvv('981');
    setPaymentMethod('credit_card');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      // Trigger festive celebratory confetti
      confetti({
        particleCount: 110,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#0d9488', '#d97706', '#0f172a', '#10b981'],
      });

      const submitted = submitDraftApplication(paymentMethod, finalTotalUSD, notificationEmail);
      setIsSubmitting(false);
      onSuccess(submitted);
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            Phase 4: Checkout & Lodgement
          </span>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1">
            <Percent className="w-3 h-3 text-teal-600" />
            Transparent 15% Service Charge
          </span>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
          Transparent Fee Breakdown & Consular Submission
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl">
          Review your itemized fee schedule. Easy Travels separates official sovereign consular fees from our fixed 15% platform processing charge with zero hidden markups.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Speed Selection & Payment Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Processing Speed Tiers */}
          <div className="borderless-card p-6 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Select Processing Speed & Consular SLA</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Guaranteed Dispatch</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Standard */}
              <button
                type="button"
                onClick={() => handleSpeedSelect('standard')}
                className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                  speed === 'standard'
                    ? 'border-teal-500 bg-teal-50/50 shadow-xs'
                    : 'border-slate-100 hover:border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900">Standard</span>
                  {speed === 'standard' && <Check className="w-4 h-4 text-teal-600" />}
                </div>
                <p className="text-[11px] text-slate-500 mb-2">3 Business Days</p>
                <span className="text-xs font-bold text-slate-700">Included</span>
              </button>

              {/* Rush */}
              <button
                type="button"
                onClick={() => handleSpeedSelect('rush')}
                className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                  speed === 'rush'
                    ? 'border-amber-500 bg-amber-50/50 shadow-xs'
                    : 'border-slate-100 hover:border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900">Rush</span>
                  {speed === 'rush' && <Check className="w-4 h-4 text-amber-600" />}
                </div>
                <p className="text-[11px] text-slate-500 mb-2">24 Hours Guaranteed</p>
                <span className="text-xs font-bold text-amber-800">+{formatPrice(req.rushFeeUSD)}</span>
              </button>

              {/* Super Rush */}
              <button
                type="button"
                onClick={() => handleSpeedSelect('super_rush')}
                className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                  speed === 'super_rush'
                    ? 'border-rose-500 bg-rose-50/50 shadow-xs'
                    : 'border-slate-100 hover:border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900">Super Rush</span>
                  {speed === 'super_rush' && <Check className="w-4 h-4 text-rose-600" />}
                </div>
                <p className="text-[11px] text-slate-500 mb-2">8 Hours Expedited</p>
                <span className="text-xs font-bold text-rose-800">+{formatPrice(req.superRushFeeUSD)}</span>
              </button>
            </div>
          </div>

          {/* Travel Wallet Balance Credit Card Integration */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-teal-900 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-teal-800/60 shadow-md">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5 text-teal-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
                    Easy Travels Document Wallet
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Active
                  </span>
                </div>
                <div className="text-sm font-extrabold text-white mt-0.5">
                  Available Travel Balance: {formatPrice(availableWalletCreditUSD)}
                </div>
                <p className="text-[11px] text-slate-300">
                  Instant credit from previous travel refunds or referral rewards.
                </p>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer bg-teal-800/50 hover:bg-teal-800/70 px-3.5 py-2 rounded-2xl border border-teal-700 transition-colors self-start sm:self-center">
              <input
                type="checkbox"
                checked={applyWalletCredit}
                onChange={(e) => setApplyWalletCredit(e.target.checked)}
                className="w-4 h-4 accent-teal-400 rounded cursor-pointer"
              />
              <span className="text-xs font-bold text-white whitespace-nowrap">
                Apply Credit (-{formatPrice(availableWalletCreditUSD)})
              </span>
            </label>
          </div>

          {/* Payment Gateway Options */}
          <div className="borderless-card p-6 bg-white space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-teal-600" />
                <span>Select Payment Method</span>
              </h3>
              <button
                type="button"
                onClick={handleFillTestCard}
                className="text-[11px] font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-full cursor-pointer transition-colors"
              >
                ⚡ Fill Test Stripe Card
              </button>
            </div>

            {/* Gateway Toggle Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('credit_card')}
                className={`p-3 rounded-2xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer border ${
                  paymentMethod === 'credit_card'
                    ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                    : 'border-slate-100 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Credit / Debit</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('apple_pay')}
                className={`p-3 rounded-2xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer border ${
                  paymentMethod === 'apple_pay'
                    ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                    : 'border-slate-100 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="text-base font-black"></span>
                <span>Apple Pay</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('afs_gateway')}
                className={`p-3 rounded-2xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer border ${
                  paymentMethod === 'afs_gateway'
                    ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                    : 'border-slate-100 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Building className="w-4 h-4 text-amber-400" />
                <span>AFS Bahrain</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('paypal')}
                className={`p-3 rounded-2xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer border ${
                  paymentMethod === 'paypal'
                    ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                    : 'border-slate-100 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="font-extrabold text-blue-500">P</span>
                <span>PayPal</span>
              </button>
            </div>

            {/* Credit Card Input Fields */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Notification Recipient Delivery Confirmation Box */}
              <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900">
                    <Mail className="w-4 h-4 text-teal-600" />
                    <span>Official Confirmation & Grant Delivery Email</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded-full">
                    Required for tracking
                  </span>
                </div>
                <p className="text-[11px] text-teal-800">
                  Your tracking reference, submission receipt, and approved eVisa authorization will be sent to this email address.
                </p>
                <input
                  type="email"
                  required
                  value={notificationEmail}
                  onChange={(e) => setNotificationEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full bg-white border border-teal-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full borderless-input px-4 py-3 text-xs font-mono font-bold text-slate-900"
                  placeholder="4242 4242 4242 4242"
                  required
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Cardholder</label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full borderless-input px-4 py-3 text-xs font-semibold text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Expiry MM/YY</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full borderless-input px-4 py-3 text-xs font-mono font-semibold text-slate-900"
                    placeholder="12/28"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">CVC / CVV</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="w-full borderless-input px-4 py-3 text-xs font-mono font-semibold text-slate-900"
                    placeholder="123"
                    required
                  />
                </div>
              </div>

              {/* PCI-DSS Security Callout */}
              <div className="p-3 rounded-xl bg-slate-50 flex items-center gap-2 text-[11px] text-slate-500 border border-slate-100">
                <Lock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>
                  256-bit SSL encrypted tokenization via Stripe / AFS Merchant Gateway. Card data processed via client-side vaulting.
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Authorizing & Lodging with Government...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Authorize & Submit Dossier ({formatPrice(finalTotalUSD)})</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Summary Order Card with 15% Platform Fee Highlight */}
        <div className="lg:col-span-5 space-y-4">
          <div className="borderless-card p-6 bg-slate-50 space-y-5 border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Application Order Summary
              </span>
              <span className="text-xs font-bold text-teal-700 bg-teal-100/60 px-2.5 py-0.5 rounded-full">
                {draft.visaType}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Destination Country:</span>
                <span className="font-bold text-slate-900">{draft.destinationName}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Traveler:</span>
                <span className="font-bold text-slate-900">
                  {draft.traveler.givenNames} {draft.traveler.surname}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Passport Number:</span>
                <span className="font-mono font-bold text-slate-900">{draft.traveler.passportNumber}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Selected Speed SLA:</span>
                <span className="font-bold text-amber-700 capitalize">
                  {speed.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Itemized Transparent Price Breakdown with 15% Platform Charge */}
            <div className="pt-4 border-t border-slate-200 space-y-2.5 text-xs">
              {/* Official Government Consular Fee */}
              <div className="flex justify-between items-center text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span>Official Government Consular Fee:</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700">
                    Direct Pass-Through
                  </span>
                </div>
                <span className="font-semibold text-slate-900">{formatPrice(govFee)}</span>
              </div>

              {/* 15% Platform Service Charge */}
              <div className="flex justify-between items-center text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span>EasyTravel Platform Service Charge:</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                    {platformRatePercent}% Transparent Rate
                  </span>
                </div>
                <span className="font-bold text-teal-700">{formatPrice(platformFeeUSD)}</span>
              </div>

              {/* Expedited SLA Surcharge */}
              {speedCost > 0 && (
                <div className="flex justify-between items-center text-amber-700 font-medium">
                  <div className="flex items-center gap-1.5">
                    <span>Expedited SLA Surcharge:</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 uppercase">
                      {speed.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="font-bold">+{formatPrice(speedCost)}</span>
                </div>
              )}

              {/* Wallet Credit Applied */}
              {walletDiscountUSD > 0 && (
                <div className="flex justify-between items-center text-emerald-700 font-bold">
                  <div className="flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Travel Wallet Balance Credit:</span>
                  </div>
                  <span>-{formatPrice(walletDiscountUSD)}</span>
                </div>
              )}

              {/* Transparency Notice */}
              <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-100 text-[11px] text-teal-900 leading-relaxed space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-teal-800">
                  <FileCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>15% Platform Fee Transparency</span>
                </div>
                <p className="text-teal-800/90 text-[10.5px]">
                  Covers in-browser ICAO Doc 9303 OCR scanning, pre-lodgement compliance audit at our Riffa HQ in Bahrain, and encrypted portal lodgement. Government fees are remitted 100% without margin.
                </p>
              </div>
            </div>

            {/* Total Highlight */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Total Payable
                </span>
                <span className="text-[10px] text-slate-400">Currency: {currency}</span>
              </div>
              <span className="text-2xl font-black text-slate-900">
                {formatPrice(finalTotalUSD)}
              </span>
            </div>

            {/* 100% Money-Back Guarantee */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% Consular Approval Guarantee</span>
              </div>
              <p className="text-[11px] text-emerald-700/90 leading-relaxed">
                If our pre-check team misses an eligibility defect resulting in consular rejection, your 15% platform fee is 100% refunded to your Travel Wallet.
              </p>
            </div>
          </div>

          <button
            onClick={onBack}
            className="w-full py-3 rounded-full text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Application Review</span>
          </button>
        </div>
      </div>
    </div>
  );
};
