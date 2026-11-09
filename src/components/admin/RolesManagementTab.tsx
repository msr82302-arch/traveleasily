import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole, RoleDefinition } from '../../types/visa';
import {
  Shield,
  ShieldCheck,
  Users,
  CheckCircle2,
  Sliders,
  Edit2,
  Lock,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Info
} from 'lucide-react';

interface RolesManagementTabProps {
  onSwitchToPermissions: (roleId: UserRole) => void;
}

export const RolesManagementTab: React.FC<RolesManagementTabProps> = ({ onSwitchToPermissions }) => {
  const { rolesCatalog, rolePermissions, staffUsers, updateRoleDefinition } = useAuth();
  const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDesc, setEditedDesc] = useState('');

  const handleStartEdit = (role: RoleDefinition) => {
    setEditingRole(role);
    setEditedTitle(role.name);
    setEditedDesc(role.description);
  };

  const handleSaveEdit = () => {
    if (!editingRole) return;
    updateRoleDefinition(editingRole.id, {
      name: editedTitle,
      description: editedDesc,
    });
    setEditingRole(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Info Banner */}
      <div className="borderless-card p-6 bg-white border border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold uppercase tracking-wider mb-1">
              <Shield className="w-3 h-3" />
              <span>Governance Architecture</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Configurable Role Directory (8 Standard Roles)
            </h2>
            <p className="text-xs text-slate-500">
              Each administrative role defines baseline authority, operational scope, and access levels for Easy Travels personnel.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">
              Granular Matrix: <strong>19 Capabilities</strong>
            </span>
          </div>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {rolesCatalog.map((role) => {
            const roleStaffCount = staffUsers.filter((s) => s.role === role.id).length;
            const perms = rolePermissions[role.id] || {};
            const enabledCount = Object.values(perms).filter(Boolean).length;

            return (
              <div
                key={role.id}
                className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/40 hover:bg-slate-50/90 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900">{role.name}</h3>
                        <span className="text-[10px] font-mono font-semibold text-slate-400">
                          {role.id}
                        </span>
                      </div>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full bg-slate-200/70 text-slate-700 text-[10px] font-bold">
                      {roleStaffCount} {roleStaffCount === 1 ? 'Officer' : 'Officers'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {role.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[11px]">Active Permissions:</span>
                    <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200/60">
                      {enabledCount} / 19
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(role)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg transition-colors cursor-pointer"
                      title="Edit role details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onSwitchToPermissions(role.id)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Sliders className="w-3 h-3" />
                      <span>Configure Matrix</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* EDIT ROLE MODAL */}
      {editingRole && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="borderless-card p-6 bg-white max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-extrabold text-slate-900">
              Edit Role Metadata & Scope
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Role Display Name
              </label>
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Scope Description
              </label>
              <textarea
                rows={3}
                value={editedDesc}
                onChange={(e) => setEditedDesc(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingRole(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
