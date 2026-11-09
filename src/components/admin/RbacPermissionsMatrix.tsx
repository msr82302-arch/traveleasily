import React from 'react';
import { useAuth, PRESET_STAFF_USERS, RBAC_PERMISSIONS } from '../../context/AuthContext';
import { UserRole } from '../../types/visa';
import { ShieldCheck, Check, X, User, Sparkles, Lock } from 'lucide-react';

export const RbacPermissionsMatrix: React.FC = () => {
  const { switchRole, activeRole, currentUser } = useAuth();

  const capabilities = [
    { key: 'canViewApplications', label: 'View Application Dossiers' },
    { key: 'canVerifyDocuments', label: 'Inspect OCR & Verify Docs' },
    { key: 'canEditApplications', label: 'Modify Form Fields' },
    { key: 'canApproveVisa', label: 'Approve & Issue e-Visa' },
    { key: 'canRejectVisa', label: 'Reject Application' },
    { key: 'canManagePricing', label: 'Configure Country Pricing & Fees' },
    { key: 'canProcessRefunds', label: 'Authorize Financial Refunds' },
    { key: 'canManageStaff', label: 'Manage Staff & Roles' },
    { key: 'canViewAnalytics', label: 'View Operational KPIs & Reports' },
    { key: 'canConfigureSecurity', label: 'Root Security & Lockout Config' },
  ] as const;

  const roles: { role: UserRole; name: string }[] = [
    { role: 'super_admin', name: 'Super Admin' },
    { role: 'admin', name: 'Admin' },
    { role: 'operations_manager', name: 'App Mgr' },
    { role: 'visa_officer', name: 'Visa Officer' },
    { role: 'document_verifier', name: 'Doc Reviewer' },
    { role: 'finance_officer', name: 'Finance Lead' },
    { role: 'support_specialist', name: 'Support Rep' },
    { role: 'readonly_auditor', name: 'Auditor' },
    { role: 'customer', name: 'Client' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">
            Security Specification
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 mt-2">
            Role-Based Access Control (RBAC) Architecture
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Fine-grained permission evaluation designed for synchronization with future Django REST Framework permissions.
          </p>
        </div>

        <div className="p-2.5 rounded-2xl bg-indigo-50/80 text-xs text-indigo-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>Active Persona: <strong>{activeRole.replace('_', ' ').toUpperCase()}</strong></span>
        </div>
      </div>

      {/* Staff Directory Table */}
      <div className="borderless-card p-6 bg-white space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <User className="w-4 h-4 text-slate-500" />
          <span>Consular Staff Directory & Assigned Roles</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3 pl-2">Staff Member</th>
                <th className="pb-3">Department</th>
                <th className="pb-3">Assigned Role</th>
                <th className="pb-3">Cases Handled</th>
                <th className="pb-3 pr-2 text-right">Switch Active Persona</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {PRESET_STAFF_USERS.map((staff: any) => (
                <tr key={staff.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 pl-2">
                    <div className="flex items-center gap-2.5">
                      <img src={staff.avatar} alt={staff.name} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <span className="font-bold text-slate-900 block">{staff.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{staff.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-slate-600 font-medium">{staff.department || 'Consular Desk'}</td>
                  <td className="py-3">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 capitalize">
                      {staff.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 font-mono font-semibold text-slate-700">142 cases</td>
                  <td className="py-3 pr-2 text-right">
                    <button
                      onClick={() => switchRole(staff.role)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                        currentUser?.email === staff.email
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {currentUser?.email === staff.email ? 'Current User' : 'Assume Persona'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Matrix Grid */}
      <div className="borderless-card p-6 bg-white space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Configurable Permission Matrix</h3>
            <p className="text-xs text-slate-500">Matrix maps operations against each system role.</p>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">10 granular privileges</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">System Permission</th>
                {roles.map((r) => (
                  <th
                    key={r.role}
                    className={`py-3 px-2 text-center whitespace-nowrap ${
                      activeRole === r.role ? 'text-indigo-600 font-black' : ''
                    }`}
                  >
                    {r.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {capabilities.map((cap) => (
                <tr key={cap.key} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{cap.label}</td>
                  {roles.map((r) => {
                    const permitted = !!(RBAC_PERMISSIONS[r.role] as any)?.[cap.key];
                    const isActiveCol = activeRole === r.role;
                    return (
                      <td
                        key={r.role}
                        className={`py-2.5 px-2 text-center ${
                          isActiveCol ? 'bg-indigo-50/50' : ''
                        }`}
                      >
                        {permitted ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                            <Check className="w-3 h-3 stroke-[2.5]" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-300 flex items-center justify-center mx-auto">
                            <X className="w-3 h-3" />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
