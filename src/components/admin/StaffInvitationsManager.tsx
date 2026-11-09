import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole, StaffInvitation } from '../../types/visa';
import { dispatchApplicationEmail } from '../../services/emailService';
import {
  UserPlus,
  KeyRound,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Trash2,
  Send,
  Building,
  Mail,
  User,
  ShieldAlert,
  Code,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

export const StaffInvitationsManager: React.FC = () => {
  const {
    currentUser,
    activeRole,
    hasPermission,
    invitations,
    generateInvitation,
    revokeInvitation,
    acceptInvitation,
    failedAttempts,
    isLockedOut,
    lockoutRemainingSeconds,
    resetFailedAttempts
  } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteeName, setInviteeName] = useState('');
  const [inviteeEmail, setInviteeEmail] = useState('');
  const [department, setDepartment] = useState('Government Lodgement Desk');
  const [selectedRole, setSelectedRole] = useState<UserRole>('visa_officer');
  const [expiresInHours, setExpiresInHours] = useState(48);

  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [showDrfContracts, setShowDrfContracts] = useState(false);

  const canManageStaff = hasPermission('manage_staff');

  const roleLabels: Partial<Record<UserRole, { title: string; badge: string }>> = {
    super_admin: { title: 'Super Admin', badge: 'bg-rose-100 text-rose-800' },
    admin: { title: 'Administrator', badge: 'bg-purple-100 text-purple-800' },
    operations_manager: { title: 'Application Manager', badge: 'bg-blue-100 text-blue-800' },
    visa_officer: { title: 'Visa Processing Officer', badge: 'bg-teal-100 text-teal-800' },
    document_verifier: { title: 'Document Reviewer', badge: 'bg-indigo-100 text-indigo-800' },
    finance_officer: { title: 'Finance Officer', badge: 'bg-emerald-100 text-emerald-800' },
    support_specialist: { title: 'Customer Support', badge: 'bg-amber-100 text-amber-800' },
    readonly_auditor: { title: 'Read-Only Auditor', badge: 'bg-slate-100 text-slate-800' },
    customer: { title: 'Traveler Client', badge: 'bg-slate-100 text-slate-600' },
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteeName || !inviteeEmail) return;

    const newInv = generateInvitation({
      inviteeName,
      inviteeEmail,
      department,
      role: selectedRole,
      expiresInHours,
    });

    // Send mock email alert
    dispatchApplicationEmail({
      type: 'admin_alert',
      recipientEmail: inviteeEmail,
      recipientName: inviteeName,
      applicationId: newInv.token,
      subject: `Confidential Invitation to Easy Travels Staff: ${roleLabels[selectedRole]?.title || selectedRole}`,
      headline: `You have been invited to join the Easy Travels Consular Team`,
      bodyParagraphs: [
        `Dear ${inviteeName},`,
        `You have been provisioned access to Easy Travels as ${roleLabels[selectedRole]?.title || selectedRole} in the ${department} division.`,
        `Your single-use secure onboarding token is: ${newInv.token}`,
        `This token will expire in ${expiresInHours} hours. Complete your onboarding at your earliest convenience.`,
      ],
      actionUrl: `https://easytravels.bh/admin/onboard?token=${newInv.token}`,
      actionText: 'Complete Staff Onboarding',
    });

    setActionSuccess(`Invitation generated for ${inviteeName} (${inviteeEmail}). Dispatch email logged.`);
    setIsModalOpen(false);
    setInviteeName('');
    setInviteeEmail('');
    setTimeout(() => setActionSuccess(null), 5000);
  };

  const copyToClipboard = (token: string) => {
    navigator.clipboard.writeText(`https://easytravels.bh/admin/onboard?token=${token}`);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const handleQuickRedeem = (token: string) => {
    const res = acceptInvitation(token);
    if (res) {
      setActionSuccess(`Token ${token} activated and staff added to active directory.`);
    } else {
      setActionSuccess(`Invalid, already used, or expired token.`);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header with Security Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
              Enterprise Governance
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              No Public Signup
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-2">
            Secure Staff Onboarding & Single-Use Invitations
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Strict clean-room credential provisioning. Administrator accounts cannot be self-registered publicly. All staff accounts require cryptographic single-use invitation tokens with configurable expiration and granular RBAC roles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDrfContracts(!showDrfContracts)}
            className="px-3.5 py-2 text-xs font-bold rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Code className="w-3.5 h-3.5 text-slate-500" />
            <span>DRF Schema Contracts</span>
          </button>

          {canManageStaff && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 text-xs font-bold rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Staff Invitation</span>
            </button>
          )}
        </div>
      </div>

      {/* Action Notification */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center justify-between animate-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
          <button
            onClick={() => setActionSuccess(null)}
            className="text-emerald-700 hover:text-emerald-900"
          >
            ✕
          </button>
        </div>
      )}

      {/* Security Shield & Brute-Force Lockout Inspector Card */}
      <div className="p-5 rounded-3xl bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">
                Brute-Force Lockout Protection Engine
              </h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isLockedOut
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {isLockedOut ? `LOCKED OUT (${lockoutRemainingSeconds}s)` : 'ACTIVE & SECURE'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Enforces a strict 5-consecutive-attempt threshold before a 300-second lockout timer triggers.
              Failed attempts recorded in session: <strong className="text-amber-400">{failedAttempts} / 5</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {failedAttempts > 0 && (
            <button
              onClick={resetFailedAttempts}
              className="px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset Counter (Demo)</span>
            </button>
          )}
        </div>
      </div>

      {/* DRF Schema Contracts Modal / Viewer */}
      {showDrfContracts && (
        <div className="p-6 rounded-3xl bg-slate-950 text-slate-200 border border-slate-800 space-y-4 font-mono text-xs animate-in fade-in">
          <div className="flex items-center justify-between text-slate-400 pb-3 border-b border-slate-800">
            <span className="font-bold text-slate-200">
              Django REST Framework (DRF) Production Hand-off Spec
            </span>
            <button
              onClick={() => setShowDrfContracts(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕ Close
            </button>
          </div>
          <div className="text-[11px] leading-relaxed text-slate-300 overflow-x-auto space-y-3">
            <p className="text-teal-400 font-bold"># Endpoint 1: Generate Staff Invitation (Admin / Super Admin only)</p>
            <pre className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-slate-300">
{`POST /api/v1/auth/invitations/
Authorization: Bearer <super_admin_jwt>
Content-Type: application/json

{
  "invitee_name": "Fatima Al-Jowder",
  "invitee_email": "fatima.jowder@easytravels.bh",
  "role": "document_verifier",
  "department": "Verification & Compliance",
  "expires_in_hours": 48
}

Response (201 Created):
{
  "invitation_token": "ET-INV-7F91-9921",
  "expires_at": "2026-11-10T22:30:00Z",
  "dispatch_status": "sent"
}`}
            </pre>

            <p className="text-teal-400 font-bold"># Endpoint 2: Single-Use Redemption & Account Activation</p>
            <pre className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-slate-300">
{`POST /api/v1/auth/invitations/redeem/
Content-Type: application/json

{
  "invitation_token": "ET-INV-7F91-9921",
  "password": "<secure_pbkdf2_hash>",
  "mfa_phone": "+97333276768"
}`}
            </pre>
          </div>
        </div>
      )}

      {/* Invitations Table */}
      <div className="borderless-card p-6 bg-white space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-slate-500" />
              <span>Staff Invitation Ledger ({invitations.length})</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Single-use tokens generated by executive administrators.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3 pl-2">Invited Personnel</th>
                <th className="pb-3">Department</th>
                <th className="pb-3">Assigned Role</th>
                <th className="pb-3">Token & Status</th>
                <th className="pb-3">Expires At</th>
                <th className="pb-3 pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {invitations.map((inv) => {
                const isExpired = new Date(inv.expiresAt).getTime() < Date.now();
                return (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 pl-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
                          {inv.inviteeName.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{inv.inviteeName}</span>
                          <span className="text-[11px] text-slate-400 font-mono">{inv.inviteeEmail}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 text-slate-700 font-medium">
                      {inv.department}
                    </td>

                    <td className="py-3.5">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          roleLabels[inv.role]?.badge || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {roleLabels[inv.role]?.title || inv.role}
                      </span>
                    </td>

                    <td className="py-3.5 font-mono">
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] text-slate-800">
                          {inv.token}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            inv.status === 'accepted'
                              ? 'bg-emerald-100 text-emerald-800'
                              : inv.status === 'revoked'
                              ? 'bg-rose-100 text-rose-800'
                              : isExpired
                              ? 'bg-slate-100 text-slate-500'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isExpired && inv.status === 'pending' ? 'Expired' : inv.status}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 text-slate-500 text-[11px]">
                      {new Date(inv.expiresAt).toLocaleDateString()} at{' '}
                      {new Date(inv.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td className="py-3.5 pr-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {inv.status === 'pending' && !isExpired && (
                          <>
                            <button
                              onClick={() => copyToClipboard(inv.token)}
                              className="px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1"
                              title="Copy Secure Link"
                            >
                              {copiedToken === inv.token ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                              <span className="text-[11px]">Copy Link</span>
                            </button>

                            <button
                              onClick={() => handleQuickRedeem(inv.token)}
                              className="px-2.5 py-1.5 rounded-lg bg-teal-50 text-teal-800 hover:bg-teal-100 text-[11px] font-semibold transition-colors cursor-pointer"
                              title="Simulate Accept in Browser"
                            >
                              Test Accept
                            </button>

                            {canManageStaff && (
                              <button
                                onClick={() => revokeInvitation(inv.id)}
                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Revoke Token"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </>
                        )}

                        {inv.status === 'accepted' && (
                          <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Redeemed</span>
                          </span>
                        )}

                        {inv.status === 'revoked' && (
                          <span className="text-[11px] font-bold text-rose-600">Revoked</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Staff Invitation */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 space-y-5 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Provision Staff Invitation</h3>
                  <p className="text-xs text-slate-400">Generate single-use access credential</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Staff Member Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={inviteeName}
                    onChange={(e) => setInviteeName(e.target.value)}
                    placeholder="e.g. Layla Al-Kooheji"
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Corporate Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={inviteeEmail}
                    onChange={(e) => setInviteeEmail(e.target.value)}
                    placeholder="e.g. layla.kooheji@easytravels.bh"
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white"
                  >
                    <option value="Government Lodgement Desk">Government Lodgement Desk</option>
                    <option value="Verification & Compliance">Verification & Compliance</option>
                    <option value="Operations & Intake">Operations & Intake</option>
                    <option value="Finance & Settlements">Finance & Settlements</option>
                    <option value="Client Concierge">Client Concierge</option>
                    <option value="Internal Audit & Risk">Internal Audit & Risk</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Enterprise Role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white font-bold"
                  >
                    <option value="visa_officer">Visa Processing Officer</option>
                    <option value="document_verifier">Document Reviewer</option>
                    <option value="operations_manager">Application Manager</option>
                    <option value="finance_officer">Finance Officer</option>
                    <option value="support_specialist">Customer Support</option>
                    <option value="readonly_auditor">Read-Only Auditor</option>
                    <option value="admin">Administrator</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Token Expiration Window</label>
                <div className="grid grid-cols-3 gap-2">
                  {[24, 48, 168].map((hours) => (
                    <button
                      key={hours}
                      type="button"
                      onClick={() => setExpiresInHours(hours)}
                      className={`py-2 rounded-xl font-bold border transition-colors cursor-pointer ${
                        expiresInHours === hours
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {hours === 168 ? '7 Days' : `${hours} Hours`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Generate & Dispatch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
