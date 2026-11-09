import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole, StaffUser, StaffRegistrationRequest } from '../../types/visa';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  ShieldCheck,
  Search,
  Filter,
  Check,
  X,
  AlertCircle,
  Mail,
  Phone,
  Building2,
  Briefcase,
  UserPlus,
  ChevronDown,
  Sparkles,
  KeyRound
} from 'lucide-react';

export const StaffManagementTab: React.FC = () => {
  const {
    staffUsers,
    registrationRequests,
    rolesCatalog,
    approveRegistrationRequest,
    rejectRegistrationRequest,
    updateStaffStatus,
    updateStaffRole,
    currentUser,
  } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Approval modal state
  const [approvingReq, setApprovingReq] = useState<StaffRegistrationRequest | null>(null);
  const [assignedRole, setAssignedRole] = useState<UserRole>('visa_officer');
  const [approvalNotes, setApprovalNotes] = useState('Authorized by Super Admin review board.');

  // Rejection modal state
  const [rejectingReq, setRejectingReq] = useState<StaffRegistrationRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Incomplete corporate credentials verification.');

  // Filter pending registrations
  const pendingRequests = registrationRequests.filter((r) => r.status === 'Pending Approval');

  // Filter active staff directory
  const filteredStaff = staffUsers.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (staff.jobDesignation || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = departmentFilter === 'ALL' || staff.department === departmentFilter;
    const matchesStatus = statusFilter === 'ALL' || staff.status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const departments = Array.from(new Set(staffUsers.map((s) => s.department)));

  const handleOpenApproveModal = (req: StaffRegistrationRequest) => {
    setApprovingReq(req);
    setAssignedRole(req.requestedRole);
    setApprovalNotes(`Approved for consular operations duty by ${currentUser?.name || 'Super Admin'}.`);
  };

  const handleConfirmApproval = () => {
    if (!approvingReq) return;
    approveRegistrationRequest(approvingReq.id, assignedRole, approvalNotes);
    setApprovingReq(null);
  };

  const handleConfirmRejection = () => {
    if (!rejectingReq) return;
    rejectRegistrationRequest(rejectingReq.id, rejectionReason);
    setRejectingReq(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* SECTION 1: PENDING REGISTRATION APPROVALS QUEUE */}
      <div className="borderless-card p-6 bg-white border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wider mb-1">
              <Clock className="w-3 h-3" />
              <span>Authorization Gatekeeper</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <span>Pending Staff Registration Requests</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                {pendingRequests.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              New administrator dossiers submitted via <code>/admin/signup</code> awaiting Super Admin supervisory validation.
            </p>
          </div>

          <div className="text-xs text-slate-500">
            Auto-refreshing &bull; Real-time approval workflow
          </div>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 space-y-2">
            <UserCheck className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-xs font-bold text-slate-700">No Pending Registration Requests</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              All staff applications have been reviewed or no new requests have been submitted yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="p-5 rounded-2xl border border-amber-200/80 bg-amber-50/20 hover:bg-amber-50/40 transition-colors space-y-3 relative group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                      {req.fullName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{req.fullName}</h4>
                      <span className="text-[11px] text-slate-500 block">{req.jobDesignation}</span>
                      <span className="text-[10px] font-mono text-slate-400">{req.id}</span>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                    {req.status}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-800">{req.workEmail}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{req.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{req.department}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                    <span className="text-slate-500">Requested Role:</span>
                    <span className="font-bold text-indigo-700 uppercase">{req.requestedRole.replace('_', ' ')}</span>
                  </div>
                  {req.invitationCode && (
                    <div className="flex items-center justify-between text-[11px] text-emerald-700 font-medium">
                      <span>Invitation Code:</span>
                      <span className="font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {req.invitationCode}
                      </span>
                    </div>
                  )}
                </div>

                {/* Approve / Reject Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleOpenApproveModal(req)}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve & Provision</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRejectingReq(req)}
                    className="py-2 px-3 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: ACTIVE STAFF DIRECTORY */}
      <div className="borderless-card p-6 bg-white border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider mb-1">
              <Users className="w-3 h-3" />
              <span>Consular Personnel Directory</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Active Staff Directory & Role Assignments
            </h2>
            <p className="text-xs text-slate-500">
              View active personnel, dynamically update assigned governance roles, or manage credential status.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">
              Total Staff: <strong>{staffUsers.length}</strong>
            </span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search officer name, email, designation..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Departments ({departments.length})</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="active">Active (Permitted)</option>
            <option value="suspended">Suspended (Blocked)</option>
            <option value="deactivated">Deactivated (Archived)</option>
          </select>
        </div>

        {/* Staff Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200/60">
              <tr>
                <th className="px-4 py-3">Personnel / Designation</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Governance Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    No staff records match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold shrink-0">
                          {staff.name.charAt(0)}
                        </div>
                        <div>
                          <strong className="block text-slate-900 font-bold">{staff.name}</strong>
                          <span className="text-[11px] text-slate-500">{staff.jobDesignation}</span>
                          <span className="text-[10px] text-indigo-600 block">{staff.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-slate-600 font-medium">
                      {staff.department}
                    </td>

                    <td className="px-4 py-3.5">
                      <select
                        value={staff.role}
                        onChange={(e) => updateStaffRole(staff.id, e.target.value as UserRole)}
                        disabled={staff.role === 'super_admin' && currentUser?.role !== 'super_admin'}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                      >
                        {rolesCatalog.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          staff.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : staff.status === 'suspended'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            staff.status === 'active'
                              ? 'bg-emerald-500'
                              : staff.status === 'suspended'
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                        />
                        {staff.status}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      {staff.role !== 'super_admin' && (
                        <div className="inline-flex items-center gap-1.5">
                          {staff.status === 'active' ? (
                            <button
                              type="button"
                              onClick={() => updateStaffStatus(staff.id, 'suspended')}
                              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-[11px] font-bold transition-colors cursor-pointer"
                              title="Temporarily suspend access"
                            >
                              Suspend
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => updateStaffStatus(staff.id, 'active')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold transition-colors cursor-pointer"
                              title="Reactivate staff credentials"
                            >
                              Reactivate
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => updateStaffStatus(staff.id, 'deactivated')}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Deactivate account"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* APPROVAL MODAL */}
      {approvingReq && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="borderless-card p-6 bg-white max-w-lg w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Approve Administrator Dossier
                </h3>
              </div>
              <button
                onClick={() => setApprovingReq(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs space-y-1">
              <span className="font-bold text-slate-900 block">{approvingReq.fullName}</span>
              <span className="text-slate-600 block">{approvingReq.workEmail} &bull; {approvingReq.phone}</span>
              <span className="text-slate-500 block">{approvingReq.department} &bull; {approvingReq.jobDesignation}</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Assign System Governance Role (8 Configurable Roles)
              </label>
              <select
                value={assignedRole}
                onChange={(e) => setAssignedRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {rolesCatalog.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.description.substring(0, 42)}...)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Supervisory Approval Notes
              </label>
              <textarea
                rows={2}
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setApprovingReq(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmApproval}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm Approval & Provision</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION MODAL */}
      {rejectingReq && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="borderless-card p-6 bg-white max-w-lg w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertCircle className="w-5 h-5" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Reject Registration Request
                </h3>
              </div>
              <button
                onClick={() => setRejectingReq(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Specify reason for rejecting <strong>{rejectingReq.fullName}</strong> ({rejectingReq.workEmail}):
            </p>

            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="Reason for credential denial..."
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectingReq(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRejection}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Confirm Rejection</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
