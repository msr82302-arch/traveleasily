import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/visa';
import {
  ShieldCheck,
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Lock,
  Key,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Clock,
  Sparkles,
  FileCheck
} from 'lucide-react';

interface AdminSignupViewProps {
  onNavigate: (path: string) => void;
}

export const AdminSignupView: React.FC<AdminSignupViewProps> = ({ onNavigate }) => {
  const {
    submitAdminRegistration,
    rolesCatalog,
    staffUsers,
    registrationRequests,
  } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    workEmail: '',
    phone: '',
    department: 'Consular Processing & Verification',
    jobDesignation: '',
    password: '',
    confirmPassword: '',
    requestedRole: 'visa_officer' as UserRole,
    invitationCode: '',
    termsConsent: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submittedRequest, setSubmittedRequest] = useState<any | null>(null);

  // Departments list for easy selection
  const departments = [
    'Consular Processing & Verification',
    'Document Review & Quality Assurance',
    'Finance & Sovereign Treasury',
    'Customer Support & VIP Concierge',
    'Platform Security & Governance',
    'Executive Administration',
  ];

  // Calculate Password Strength (0 to 4)
  const calculatePasswordStrength = (pass: string): { score: number; label: string; color: string } => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score === 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 3, label: 'Good', color: 'bg-blue-500' };
    if (score === 4) return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
    return { score: 0, label: 'Weak', color: 'bg-rose-500' };
  };

  const passwordStrength = calculatePasswordStrength(formData.password);

  const validate = (): boolean => {
    const errs: { [key: string]: string } = {};

    if (!formData.fullName.trim()) {
      errs.fullName = 'Full legal name is required.';
    }

    if (!formData.workEmail.trim()) {
      errs.workEmail = 'Work email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.workEmail)) {
      errs.workEmail = 'Please provide a valid corporate or agency email address.';
    } else {
      // Check for duplicate in active staff
      const existsInStaff = staffUsers.some(
        (s) => s.email.toLowerCase() === formData.workEmail.trim().toLowerCase()
      );
      if (existsInStaff) {
        errs.workEmail = 'An active administrator profile already exists with this email.';
      }
      // Check for duplicate in pending requests
      const existsInPending = registrationRequests.some(
        (r) =>
          r.workEmail.toLowerCase() === formData.workEmail.trim().toLowerCase() &&
          r.status === 'Pending Approval'
      );
      if (existsInPending) {
        errs.workEmail = 'A pending registration request already exists for this work email.';
      }
    }

    if (!formData.phone.trim()) {
      errs.phone = 'Contact phone number is required for 2FA onboarding.';
    }

    if (!formData.jobDesignation.trim()) {
      errs.jobDesignation = 'Job designation / title is required.';
    }

    if (!formData.password) {
      errs.password = 'A secure password is required.';
    } else if (formData.password.length < 8) {
      errs.password = 'Password must be at least 8 characters long.';
    }

    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    if (!formData.termsConsent) {
      errs.termsConsent = 'You must acknowledge the Consular Privacy & Security Conduct terms.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const result = submitAdminRegistration({
      fullName: formData.fullName,
      workEmail: formData.workEmail,
      phone: formData.phone,
      department: formData.department,
      jobDesignation: formData.jobDesignation,
      requestedRole: formData.requestedRole,
      invitationCode: formData.invitationCode,
      termsConsent: formData.termsConsent,
    });

    if (result.success && result.request) {
      setSubmittedRequest(result.request);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // If successfully submitted, display the professional Pending Approval Dossier
  if (submittedRequest) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="borderless-card p-8 sm:p-10 bg-white border border-slate-200/80 shadow-xl space-y-6 animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200/60 text-amber-600 flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>

          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider">
              Registration Under Consular Review
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Staff Registration Dossier Submitted
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              Your administrative credentials request has been logged and transmitted to the Easy Travels Executive Governance board in Riffa, Bahrain.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-3 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Request Reference:</span>
              <span className="font-mono font-bold text-slate-900">{submittedRequest.id}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Applicant:</span>
              <span className="font-bold text-slate-900">{submittedRequest.fullName}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Corporate Email:</span>
              <span className="font-semibold text-slate-900">{submittedRequest.workEmail}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Assigned Department:</span>
              <span className="font-semibold text-slate-900">{submittedRequest.department}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Requested Role:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold uppercase text-[10px]">
                {submittedRequest.requestedRole.replace('_', ' ')}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Status:</span>
              <span className="flex items-center gap-1.5 text-amber-700 font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                Pending Super Admin Approval
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/60 text-xs text-blue-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              What Happens Next?
            </p>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              A platform Super Admin will review your verification credentials in the Admin Staff Management interface. Once approved, you will receive activation notification and your role permissions will be activated automatically.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigate('/admin/login')}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Go to Admin Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/admin/staff')}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/60 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Simulate Admin Approval in Staff Queue &rarr;</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Top Header Card */}
      <div className="borderless-card p-6 sm:p-8 bg-white border border-slate-200/80 shadow-md mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  Staff & Consular Officer Registration
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                  Official Portal
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Easy Travels Document Clearance HQ &bull; Riffa, Kingdom of Bahrain
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('/admin/login')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Already have access? Sign In</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Security & Clean-Room Notice */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-3 text-xs text-slate-600">
          <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <strong>Internal Enterprise System Notice:</strong> Access to the Easy Travels consular administration engine is restricted to authorized operations personnel. All account requests require verification and supervisory authorization before portal capabilities are provisioned.
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Section 1: Personal & Corporate Contact */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-500" />
              <span>1. Officer Identity & Corporate Contact</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Full Legal Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Mariam Al-Hassan"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.fullName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 bg-slate-50/40'
                    }`}
                  />
                </div>
                {errors.fullName && (
                  <span className="text-[11px] font-semibold text-rose-600 mt-1 block">
                    {errors.fullName}
                  </span>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Work / Agency Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={formData.workEmail}
                    onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
                    placeholder="e.g. m.alhassan@easytravels.bh"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.workEmail ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 bg-slate-50/40'
                    }`}
                  />
                </div>
                {errors.workEmail && (
                  <span className="text-[11px] font-semibold text-rose-600 mt-1 block">
                    {errors.workEmail}
                  </span>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Contact Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+973 3922 4411"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.phone ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 bg-slate-50/40'
                    }`}
                  />
                </div>
                {errors.phone && (
                  <span className="text-[11px] font-semibold text-rose-600 mt-1 block">
                    {errors.phone}
                  </span>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Job Title / Designation <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={formData.jobDesignation}
                    onChange={(e) => setFormData({ ...formData, jobDesignation: e.target.value })}
                    placeholder="e.g. Senior Consular Adjudicator"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.jobDesignation ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 bg-slate-50/40'
                    }`}
                  />
                </div>
                {errors.jobDesignation && (
                  <span className="text-[11px] font-semibold text-rose-600 mt-1 block">
                    {errors.jobDesignation}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Department & Requested Role */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>2. Department & Requested Governance Role</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Operational Department <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/40 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Requested System Role (8 Configurable Roles) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.requestedRole}
                  onChange={(e) => setFormData({ ...formData, requestedRole: e.target.value as UserRole })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/40 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {rolesCatalog.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name} — {role.description.substring(0, 48)}...
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Invitation or Access Code <span className="text-slate-400 font-normal">(Optional — speeds up auto-approval)</span>
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={formData.invitationCode}
                    onChange={(e) => setFormData({ ...formData, invitationCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. ET-INV-9902 or leave blank for supervisory approval"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/40 font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                  />
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Staff onboarding invitation codes are issued by Super Admins via the Staff Invitations console.
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Password & Security */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-500" />
              <span>3. Administrative Password & Credentials</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••••••"
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.password ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 bg-slate-50/40'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <span className="text-[11px] font-semibold text-rose-600 mt-1 block">
                    {errors.password}
                  </span>
                )}

                {/* Password Strength Indicator */}
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Strength:</span>
                    <span className="font-bold text-slate-700">{passwordStrength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`flex-1 transition-all duration-300 ${
                          passwordStrength.score >= level ? passwordStrength.color : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••••••"
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.confirmPassword ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 bg-slate-50/40'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="text-[11px] font-semibold text-rose-600 mt-1 block">
                    {errors.confirmPassword}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Terms & Consent Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.termsConsent}
                onChange={(e) => setFormData({ ...formData, termsConsent: e.target.checked })}
                className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs text-slate-600 leading-snug">
                I agree to the <strong>Easy Travels Consular Data Privacy & Operational Code of Conduct</strong>. I acknowledge that unauthorized disclosure of traveler passports or PII violates Kingdom of Bahrain data protection regulations and will result in immediate credential revocation.
              </span>
            </label>
            {errors.termsConsent && (
              <span className="text-[11px] font-semibold text-rose-600 mt-1.5 block">
                {errors.termsConsent}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onNavigate('/admin/login')}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Submit Registration Dossier</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
