import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole, PermissionKey, PermissionDefinition } from '../../types/visa';
import { ALL_PERMISSIONS_LIST, DEFAULT_ROLE_PERMISSIONS } from '../../mocks/fixtures';
import {
  ShieldAlert,
  ShieldCheck,
  Check,
  X,
  RotateCcw,
  Save,
  CheckCircle2,
  FileCheck,
  Sliders,
  DollarSign,
  Settings,
  Lock,
  Layers
} from 'lucide-react';

interface PermissionsManagementTabProps {
  initialRoleId?: UserRole;
}

export const PermissionsManagementTab: React.FC<PermissionsManagementTabProps> = ({ initialRoleId }) => {
  const {
    rolesCatalog,
    rolePermissions,
    updateRolePermissions,
    currentUser,
    activeRole,
  } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRoleId || 'visa_officer');
  const [localPermissions, setLocalPermissions] = useState<Record<string, boolean>>(() => {
    return { ...((rolePermissions[selectedRole] || DEFAULT_ROLE_PERMISSIONS[selectedRole]) as any) };
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Update local state when selected role changes
  useEffect(() => {
    setLocalPermissions({ ...((rolePermissions[selectedRole] || DEFAULT_ROLE_PERMISSIONS[selectedRole]) as any) });
    setSaveSuccess(false);
  }, [selectedRole, rolePermissions]);

  // Group permissions by category (matching PermissionDefinition['category'])
  const categories: { id: string; label: string; icon: any; perms: PermissionDefinition[] }[] = [
    {
      id: 'general_system',
      label: 'Platform Command & Oversight',
      icon: Layers,
      perms: ALL_PERMISSIONS_LIST.filter((p) => p.category === 'General' || p.category === 'System'),
    },
    {
      id: 'applications',
      label: 'Application & Dossier Operations',
      icon: FileCheck,
      perms: ALL_PERMISSIONS_LIST.filter((p) => p.category === 'Applications' || p.category === 'Customers'),
    },
    {
      id: 'finance',
      label: 'Financial & Billing Operations',
      icon: DollarSign,
      perms: ALL_PERMISSIONS_LIST.filter((p) => p.category === 'Finance'),
    },
    {
      id: 'administration',
      label: 'System Governance & Staff Administration',
      icon: Settings,
      perms: ALL_PERMISSIONS_LIST.filter((p) => p.category === 'Administration'),
    },
  ];

  const handleToggle = (key: PermissionKey) => {
    setLocalPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setSaveSuccess(false);
  };

  const handleSelectAllCategory = (perms: PermissionDefinition[], enable: boolean) => {
    setLocalPermissions((prev) => {
      const next = { ...prev };
      perms.forEach((p) => {
        next[p.key] = enable;
      });
      return next;
    });
    setSaveSuccess(false);
  };

  const handleSelectAllGlobal = (enable: boolean) => {
    const next: any = {};
    ALL_PERMISSIONS_LIST.forEach((p) => {
      next[p.key] = enable;
    });
    setLocalPermissions(next);
    setSaveSuccess(false);
  };

  const handleResetToDefaults = () => {
    const def = (DEFAULT_ROLE_PERMISSIONS[selectedRole] || {}) as Record<string, boolean>;
    setLocalPermissions({ ...def });
    setSaveSuccess(false);
  };

  const handleSave = () => {
    updateRolePermissions(selectedRole, localPermissions as any);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const activeCount = Object.values(localPermissions).filter(Boolean).length;
  const targetRoleDef = rolesCatalog.find((r) => r.id === selectedRole);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Controller Bar */}
      <div className="borderless-card p-6 bg-white border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider mb-1">
              <Sliders className="w-3 h-3" />
              <span>Granular Access Matrix (19 Capabilities)</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Role Permission Matrix & Live Authorization
            </h2>
            <p className="text-xs text-slate-500">
              Configure fine-grained capabilities per role. Modifications update runtime UI features and action access instantly.
            </p>
          </div>

          {/* Role Selector */}
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-slate-600 whitespace-nowrap">
              Configuring Role:
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="px-3.5 py-2 rounded-xl border border-indigo-200 bg-indigo-50/50 text-xs font-bold text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-xs"
            >
              {rolesCatalog.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Role Scope Summary */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">{targetRoleDef?.name}</span>
              <span className="font-mono text-[10px] text-slate-400">({selectedRole})</span>
            </div>
            <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
              {targetRoleDef?.description}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-500 font-semibold">Enabled Capabilities:</span>
            <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 font-mono font-bold text-xs">
              {activeCount} / 19
            </span>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSelectAllGlobal(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Select All (19)
            </button>
            <button
              type="button"
              onClick={() => handleSelectAllGlobal(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Deselect All
            </button>
            <button
              type="button"
              onClick={handleResetToDefaults}
              className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Defaults</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>Permissions Saved & Enforced!</span>
              </span>
            )}

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save & Apply Permissions</span>
            </button>
          </div>
        </div>
      </div>

      {/* Permissions Matrix by Domain */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const catActiveCount = cat.perms.filter((p) => localPermissions[p.key]).length;

          return (
            <div
              key={cat.id}
              className="borderless-card p-6 bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{cat.label}</h3>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {catActiveCount} of {cat.perms.length} enabled
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => handleSelectAllCategory(cat.perms, true)}
                      className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectAllCategory(cat.perms, false)}
                      className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                    >
                      None
                    </button>
                  </div>
                </div>

                {/* Checkbox Rows */}
                <div className="space-y-2.5">
                  {cat.perms.map((p) => {
                    const isChecked = !!localPermissions[p.key];

                    return (
                      <label
                        key={p.key}
                        className={`p-3 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                          isChecked
                            ? 'border-indigo-200/80 bg-indigo-50/20 text-slate-900'
                            : 'border-slate-100 bg-slate-50/40 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggle(p.key)}
                          className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold">{p.label}</span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {p.key}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-snug">
                            {p.description}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
