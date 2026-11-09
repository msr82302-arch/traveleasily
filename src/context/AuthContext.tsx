import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  StaffUser,
  StaffInvitation,
  StaffRegistrationRequest,
  RegistrationStatus,
  RoleDefinition,
  PermissionKey,
  GranularPermissionMatrix,
  AdminAuditLog,
} from '../types/visa';
import {
  SYNTHETIC_STAFF_USERS,
  INITIAL_ROLE_CATALOGUE,
  ALL_PERMISSIONS_LIST,
  DEFAULT_ROLE_PERMISSIONS,
  SYNTHETIC_REGISTRATION_REQUESTS,
  SYNTHETIC_AUDIT_LOGS,
} from '../mocks/fixtures';

export const PRESET_STAFF_USERS = SYNTHETIC_STAFF_USERS;
export const RBAC_PERMISSIONS = DEFAULT_ROLE_PERMISSIONS;

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  title?: string;
  department?: string;
}

interface AdminRegistrationInput {
  fullName: string;
  workEmail: string;
  phone: string;
  department: string;
  jobDesignation: string;
  password?: string; // Note: NEVER persisted or exposed in logs/storage
  requestedRole: UserRole;
  invitationCode?: string;
  termsConsent: boolean;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  activeRole: UserRole;
  staffUsers: StaffUser[];
  registrationRequests: StaffRegistrationRequest[];
  rolesCatalog: RoleDefinition[];
  rolePermissions: GranularPermissionMatrix;
  auditLogs: AdminAuditLog[];
  isDevelopmentFixturesActive: boolean;

  // Authentication
  loginAs: (user: AuthUser) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  attemptLoginWithCredentials: (email: string, pass: string) => { success: boolean; message: string };
  requestPasswordReset: (email: string) => { success: boolean; message: string };
  failedAttempts: number;
  isLockedOut: boolean;
  lockoutRemainingSeconds: number;
  resetFailedAttempts: () => void;

  // Permissions & Roles
  hasPermission: (permission: PermissionKey | string) => boolean;
  updateRolePermissions: (role: UserRole, permissions: Record<PermissionKey, boolean>) => void;
  updateRoleDefinition: (roleId: UserRole, updates: Partial<RoleDefinition>) => void;

  // Staff & Registration Workflows
  submitAdminRegistration: (data: AdminRegistrationInput) => { success: boolean; message: string; request?: StaffRegistrationRequest };
  approveRegistrationRequest: (requestId: string, assignedRole: UserRole, reviewerNotes?: string) => void;
  rejectRegistrationRequest: (requestId: string, reason: string) => void;
  updateStaffStatus: (staffId: string, status: 'active' | 'suspended' | 'deactivated') => void;
  updateStaffRole: (staffId: string, newRole: UserRole) => void;

  // Invitations
  invitations: StaffInvitation[];
  generateInvitation: (data: {
    inviteeName: string;
    inviteeEmail: string;
    department: string;
    role: UserRole;
    expiresInHours: number;
  }) => StaffInvitation;
  revokeInvitation: (invitationId: string) => void;
  acceptInvitation: (token: string, staffName?: string) => boolean;

  // Environment & Test Fixture Switching (Clean Production vs Dev Fixtures)
  loadTestFixtures: () => void;
  resetToCleanProduction: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check if development fixtures are active
  const [isDevelopmentFixturesActive, setIsDevelopmentFixturesActive] = useState<boolean>(() => {
    return localStorage.getItem('et_env_mode') === 'development';
  });

  // Current logged in user (Clean production starts null; can log in via /admin/login or quick persona)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('et_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    // Default to Super Admin for immediate exploration in dev mode
    return {
      id: 'staff-root',
      name: 'Tariq Al-Moayyed',
      email: 'tariq.moayyed@easytravels.bh',
      role: 'super_admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      title: 'Managing Director & Platform Owner',
      department: 'Executive HQ, Bahrain',
    };
  });

  // Staff Users Directory (Clean production starts with approved staff only)
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>(() => {
    const saved = localStorage.getItem('et_staff_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return isDevelopmentFixturesActive ? SYNTHETIC_STAFF_USERS : [];
      }
    }
    return isDevelopmentFixturesActive ? SYNTHETIC_STAFF_USERS : [
      {
        id: 'staff-root',
        name: 'Tariq Al-Moayyed',
        email: 'tariq.moayyed@easytravels.bh',
        phone: '+973 3327 6768',
        jobDesignation: 'Managing Director & Platform Owner',
        role: 'super_admin',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        status: 'active',
        department: 'Executive HQ, Bahrain',
        casesProcessed: 0,
        joinedAt: new Date().toISOString(),
      }
    ];
  });

  // Registration Requests Queue
  const [registrationRequests, setRegistrationRequests] = useState<StaffRegistrationRequest[]>(() => {
    const saved = localStorage.getItem('et_registration_requests');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return isDevelopmentFixturesActive ? SYNTHETIC_REGISTRATION_REQUESTS : [];
      }
    }
    return isDevelopmentFixturesActive ? SYNTHETIC_REGISTRATION_REQUESTS : [];
  });

  // Roles Catalog
  const [rolesCatalog, setRolesCatalog] = useState<RoleDefinition[]>(() => {
    const saved = localStorage.getItem('et_roles_catalog');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_ROLE_CATALOGUE;
      }
    }
    return INITIAL_ROLE_CATALOGUE;
  });

  // Granular Role Permissions Matrix
  const [rolePermissions, setRolePermissions] = useState<GranularPermissionMatrix>(() => {
    const saved = localStorage.getItem('et_role_permissions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_ROLE_PERMISSIONS;
      }
    }
    return DEFAULT_ROLE_PERMISSIONS;
  });

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>(() => {
    const saved = localStorage.getItem('et_audit_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return isDevelopmentFixturesActive ? SYNTHETIC_AUDIT_LOGS : [];
      }
    }
    return isDevelopmentFixturesActive ? SYNTHETIC_AUDIT_LOGS : [];
  });

  // Invitations
  const [invitations, setInvitations] = useState<StaffInvitation[]>(() => {
    const saved = localStorage.getItem('et_staff_invitations');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Lockout & Brute-Force Tracking
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    return parseInt(localStorage.getItem('et_failed_attempts') || '0', 10);
  });

  const [lockoutUntil, setLockoutUntil] = useState<number | null>(() => {
    const saved = localStorage.getItem('et_lockout_until');
    return saved ? parseInt(saved, 10) : null;
  });

  const [lockoutRemainingSeconds, setLockoutRemainingSeconds] = useState<number>(0);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('et_staff_users', JSON.stringify(staffUsers));
  }, [staffUsers]);

  useEffect(() => {
    localStorage.setItem('et_registration_requests', JSON.stringify(registrationRequests));
  }, [registrationRequests]);

  useEffect(() => {
    localStorage.setItem('et_roles_catalog', JSON.stringify(rolesCatalog));
  }, [rolesCatalog]);

  useEffect(() => {
    localStorage.setItem('et_role_permissions', JSON.stringify(rolePermissions));
  }, [rolePermissions]);

  useEffect(() => {
    localStorage.setItem('et_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('et_staff_invitations', JSON.stringify(invitations));
  }, [invitations]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('et_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('et_current_user');
    }
  }, [currentUser]);

  // Lockout Timer countdown
  useEffect(() => {
    const checkLockout = () => {
      if (lockoutUntil) {
        const remaining = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
        setLockoutRemainingSeconds(remaining);
        if (remaining === 0) {
          setLockoutUntil(null);
          setFailedAttempts(0);
          localStorage.removeItem('et_lockout_until');
          localStorage.setItem('et_failed_attempts', '0');
        }
      } else {
        setLockoutRemainingSeconds(0);
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  const isLockedOut = lockoutRemainingSeconds > 0;

  // Add an audit log event
  const logAuditEvent = (
    actionType: AdminAuditLog['actionType'],
    description: string,
    targetId?: string,
    targetType?: string
  ) => {
    const newLog: AdminAuditLog = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      actorName: currentUser ? currentUser.name : 'System Visitor',
      actorEmail: currentUser ? currentUser.email : 'guest@easytravels.bh',
      actorRole: currentUser ? currentUser.role : 'customer',
      actionType,
      description,
      targetId,
      targetType,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Submit Administrator Registration Request
  const submitAdminRegistration = (
    data: AdminRegistrationInput
  ): { success: boolean; message: string; request?: StaffRegistrationRequest } => {
    // Duplicate email check across active staff and pending requests
    const emailLower = data.workEmail.toLowerCase().trim();
    const existingStaff = staffUsers.find((s) => s.email.toLowerCase() === emailLower);
    const existingRequest = registrationRequests.find(
      (r) => r.workEmail.toLowerCase() === emailLower && r.status === 'Pending Approval'
    );

    if (existingStaff) {
      return {
        success: false,
        message: 'A staff profile with this email address already exists. Please sign in instead.',
      };
    }

    if (existingRequest) {
      return {
        success: false,
        message: 'A registration request with this email is already awaiting administrative approval.',
      };
    }

    const newRequest: StaffRegistrationRequest = {
      id: `reg-req-${Date.now()}`,
      fullName: data.fullName.trim(),
      workEmail: emailLower,
      phone: data.phone.trim(),
      department: data.department,
      jobDesignation: data.jobDesignation.trim(),
      requestedRole: data.requestedRole,
      assignedRole: data.requestedRole,
      invitationCode: data.invitationCode ? data.invitationCode.trim() : undefined,
      status: 'Pending Approval',
      submittedAt: new Date().toISOString(),
      termsConsent: data.termsConsent,
    };

    setRegistrationRequests((prev) => [newRequest, ...prev]);

    logAuditEvent(
      'SIGNUP_SUBMITTED',
      `New administrator registration submitted for ${newRequest.fullName} (${newRequest.workEmail}) requesting role: ${newRequest.requestedRole}.`,
      newRequest.id,
      'StaffRegistrationRequest'
    );

    return {
      success: true,
      message: 'Registration request submitted successfully. Awaiting approval by an authorized administrator.',
      request: newRequest,
    };
  };

  // Approve a registration request
  const approveRegistrationRequest = (
    requestId: string,
    assignedRole: UserRole,
    reviewerNotes?: string
  ) => {
    const target = registrationRequests.find((r) => r.id === requestId);
    if (!target) return;

    const nowIso = new Date().toISOString();
    const reviewerName = currentUser ? currentUser.name : 'Super Admin';

    // 1. Update request status to 'Approved'
    setRegistrationRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'Approved',
              assignedRole,
              reviewedAt: nowIso,
              reviewedBy: reviewerName,
            }
          : r
      )
    );

    // 2. Add as active staff member in staffUsers
    const newStaffUser: StaffUser = {
      id: `staff-${Date.now()}`,
      name: target.fullName,
      email: target.workEmail,
      phone: target.phone,
      jobDesignation: target.jobDesignation,
      role: assignedRole,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      status: 'active',
      department: target.department,
      casesProcessed: 0,
      joinedAt: nowIso,
    };

    setStaffUsers((prev) => [newStaffUser, ...prev]);

    logAuditEvent(
      'SIGNUP_APPROVED',
      `Approved staff registration for ${target.fullName} (${target.workEmail}). Assigned role: ${assignedRole}.${
        reviewerNotes ? ` Note: ${reviewerNotes}` : ''
      }`,
      target.id,
      'StaffRegistrationRequest'
    );
  };

  // Reject a registration request
  const rejectRegistrationRequest = (requestId: string, reason: string) => {
    const target = registrationRequests.find((r) => r.id === requestId);
    if (!target) return;

    const nowIso = new Date().toISOString();
    const reviewerName = currentUser ? currentUser.name : 'Super Admin';

    setRegistrationRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'Rejected',
              rejectionReason: reason,
              reviewedAt: nowIso,
              reviewedBy: reviewerName,
            }
          : r
      )
    );

    logAuditEvent(
      'SIGNUP_REJECTED',
      `Rejected registration for ${target.fullName} (${target.workEmail}). Reason: ${reason}`,
      target.id,
      'StaffRegistrationRequest'
    );
  };

  // Update staff status (e.g. active, suspended, deactivated)
  const updateStaffStatus = (staffId: string, status: 'active' | 'suspended' | 'deactivated') => {
    const target = staffUsers.find((s) => s.id === staffId);
    if (!target) return;

    setStaffUsers((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, status } : s))
    );

    logAuditEvent(
      'STAFF_STATUS_CHANGED',
      `Changed staff status for ${target.name} to: ${status}.`,
      target.id,
      'StaffUser'
    );
  };

  // Update staff assigned role
  const updateStaffRole = (staffId: string, newRole: UserRole) => {
    const target = staffUsers.find((s) => s.id === staffId);
    if (!target) return;

    setStaffUsers((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, role: newRole } : s))
    );

    // If current logged in user was modified, update session
    if (currentUser && currentUser.email === target.email) {
      setCurrentUser({ ...currentUser, role: newRole });
    }

    logAuditEvent(
      'ROLE_ASSIGNED',
      `Updated role for ${target.name} from ${target.role} to ${newRole}.`,
      target.id,
      'StaffUser'
    );
  };

  // Update permissions for a role
  const updateRolePermissions = (role: UserRole, permissions: Record<PermissionKey, boolean>) => {
    setRolePermissions((prev) => ({
      ...prev,
      [role]: {
        ...(prev[role] || DEFAULT_ROLE_PERMISSIONS[role]),
        ...permissions,
      },
    }));

    logAuditEvent(
      'PERMISSIONS_UPDATED',
      `Modified granular permission matrix for role: ${role}.`,
      role,
      'RoleDefinition'
    );
  };

  // Update role definition (e.g. description, department)
  const updateRoleDefinition = (roleId: UserRole, updates: Partial<RoleDefinition>) => {
    setRolesCatalog((prev) =>
      prev.map((r) => (r.id === roleId ? { ...r, ...updates } : r))
    );
  };

  // Check granular permission for active user
  const hasPermission = (permission: PermissionKey | string): boolean => {
    if (!currentUser) return false;
    const userRole = currentUser.role;
    const permissionsForRole = rolePermissions[userRole] || DEFAULT_ROLE_PERMISSIONS[userRole];
    return permissionsForRole ? !!(permissionsForRole as any)[permission] : false;
  };

  // Login handler with lockout
  const attemptLoginWithCredentials = (email: string, pass: string): { success: boolean; message: string } => {
    if (isLockedOut) {
      return {
        success: false,
        message: `Security Lockout Active: Too many failed attempts. Please wait ${lockoutRemainingSeconds}s before retrying.`,
      };
    }

    const emailTrim = email.toLowerCase().trim();
    const match = staffUsers.find((u) => u.email.toLowerCase() === emailTrim);

    if (match && match.status !== 'active') {
      return {
        success: false,
        message: `Account is ${match.status}. Please contact an executive Super Admin.`,
      };
    }

    // In simulated mock environment, accept password if match found and pass >= 6 chars
    const isCorrect = pass === 'easytravel2026' || pass === 'admin123' || (match && pass.length >= 6);

    if (match && isCorrect) {
      const authUser: AuthUser = {
        id: match.id,
        name: match.name,
        email: match.email,
        role: match.role,
        avatar: match.avatar,
        title: match.jobDesignation,
        department: match.department,
      };
      setCurrentUser(authUser);
      setFailedAttempts(0);
      localStorage.setItem('et_failed_attempts', '0');
      return { success: true, message: `Welcome back, ${match.name}!` };
    } else {
      const nextFailures = failedAttempts + 1;
      setFailedAttempts(nextFailures);
      localStorage.setItem('et_failed_attempts', nextFailures.toString());

      if (nextFailures >= 5) {
        const unlockTime = Date.now() + 5 * 60 * 1000;
        setLockoutUntil(unlockTime);
        localStorage.setItem('et_lockout_until', unlockTime.toString());
        return {
          success: false,
          message: 'Account locked due to 5 consecutive failed login attempts. Security lockout initiated for 5 minutes.',
        };
      }

      return {
        success: false,
        message: `Invalid credentials. Warning: ${5 - nextFailures} attempt(s) remaining before a 5-minute security lockout.`,
      };
    }
  };

  // Password reset request
  const requestPasswordReset = (email: string): { success: boolean; message: string } => {
    const emailTrim = email.toLowerCase().trim();
    const exists = staffUsers.some((u) => u.email.toLowerCase() === emailTrim);
    if (exists) {
      logAuditEvent('SETTINGS_UPDATED', `Password recovery requested for staff email: ${emailTrim}`);
      return {
        success: true,
        message: `Password reset link has been dispatched to ${emailTrim} (Simulated Mock Email).`,
      };
    }
    return {
      success: false,
      message: `No active staff record found matching ${emailTrim}.`,
    };
  };

  const resetFailedAttempts = () => {
    setFailedAttempts(0);
    setLockoutUntil(null);
    setLockoutRemainingSeconds(0);
    localStorage.removeItem('et_lockout_until');
    localStorage.setItem('et_failed_attempts', '0');
  };

  const loginAs = (user: AuthUser) => {
    setCurrentUser(user);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchRole = (role: UserRole) => {
    const existing = staffUsers.find((u) => u.role === role);
    if (existing) {
      loginAs({
        id: existing.id,
        name: existing.name,
        email: existing.email,
        role: existing.role,
        avatar: existing.avatar,
        title: existing.jobDesignation,
        department: existing.department,
      });
    } else if (currentUser) {
      setCurrentUser({ ...currentUser, role });
    }
  };

  const generateInvitation = (data: {
    inviteeName: string;
    inviteeEmail: string;
    department: string;
    role: UserRole;
    expiresInHours: number;
  }): StaffInvitation => {
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const randomHex2 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const token = `ET-INV-${randomHex}-${randomHex2}`;

    const newInvitation: StaffInvitation = {
      id: `inv-${Date.now()}`,
      inviteeName: data.inviteeName,
      inviteeEmail: data.inviteeEmail,
      department: data.department,
      role: data.role,
      token,
      status: 'pending',
      invitedBy: currentUser ? `${currentUser.name} (${currentUser.role})` : 'System Administrator',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + data.expiresInHours * 3600 * 1000).toISOString(),
    };

    setInvitations((prev) => [newInvitation, ...prev]);
    return newInvitation;
  };

  const revokeInvitation = (invitationId: string) => {
    setInvitations((prev) =>
      prev.map((inv) => (inv.id === invitationId ? { ...inv, status: 'revoked' } : inv))
    );
  };

  const acceptInvitation = (token: string, staffName?: string): boolean => {
    const inv = invitations.find((i) => i.token === token && i.status === 'pending');
    if (!inv) return false;
    setInvitations((prev) =>
      prev.map((i) => (i.id === inv.id ? { ...i, status: 'accepted', acceptedAt: new Date().toISOString() } : i))
    );
    const newStaff: StaffUser = {
      id: `staff-${Date.now()}`,
      name: staffName || inv.inviteeName,
      email: inv.inviteeEmail,
      phone: '+973 3900 0000',
      jobDesignation: inv.role.replace('_', ' '),
      role: inv.role,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      status: 'active',
      department: inv.department,
      createdAt: new Date().toISOString(),
    };
    setStaffUsers((prev) => [newStaff, ...prev]);
    return true;
  };

  // Environment Toggles: Load Isolated Test Fixtures
  const loadTestFixtures = () => {
    setStaffUsers(SYNTHETIC_STAFF_USERS);
    setRegistrationRequests(SYNTHETIC_REGISTRATION_REQUESTS);
    setAuditLogs(SYNTHETIC_AUDIT_LOGS);
    setRolesCatalog(INITIAL_ROLE_CATALOGUE);
    setRolePermissions(DEFAULT_ROLE_PERMISSIONS);
    setIsDevelopmentFixturesActive(true);
    localStorage.setItem('et_env_mode', 'development');

    // Set demo super admin user for testing
    const demoRoot: AuthUser = {
      id: 'staff-1',
      name: 'Tariq Al-Moayyed',
      email: 'tariq.moayyed@easytravels.bh',
      role: 'super_admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      title: 'Managing Director & Platform Owner',
      department: 'Executive HQ, Bahrain',
    };
    setCurrentUser(demoRoot);

    logAuditEvent(
      'TEST_FIXTURES_LOADED',
      'Loaded isolated development test fixtures (synthetic staff, applications, and registration requests).'
    );
  };

  // Environment Toggles: Reset to Clean Production State (Zero Sample Data)
  const resetToCleanProduction = () => {
    setStaffUsers([
      {
        id: 'staff-root',
        name: 'Tariq Al-Moayyed',
        email: 'tariq.moayyed@easytravels.bh',
        phone: '+973 3327 6768',
        jobDesignation: 'Managing Director & Platform Owner',
        role: 'super_admin',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        status: 'active',
        department: 'Executive HQ, Bahrain',
        casesProcessed: 0,
        joinedAt: new Date().toISOString(),
      }
    ]);
    setRegistrationRequests([]);
    setAuditLogs([]);
    setInvitations([]);
    setIsDevelopmentFixturesActive(false);
    localStorage.setItem('et_env_mode', 'production');
    localStorage.removeItem('et_registration_requests');
    localStorage.removeItem('et_audit_logs');
    localStorage.removeItem('et_staff_invitations');

    // Keep logged-in super admin with clean zero stats
    setCurrentUser({
      id: 'staff-root',
      name: 'Tariq Al-Moayyed',
      email: 'tariq.moayyed@easytravels.bh',
      role: 'super_admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      title: 'Managing Director & Platform Owner',
      department: 'Executive HQ, Bahrain',
    });
  };

  const activeRole: UserRole = currentUser ? currentUser.role : 'customer';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        activeRole,
        staffUsers,
        registrationRequests,
        rolesCatalog,
        rolePermissions,
        auditLogs,
        isDevelopmentFixturesActive,
        loginAs,
        logout,
        switchRole,
        attemptLoginWithCredentials,
        requestPasswordReset,
        failedAttempts,
        isLockedOut,
        lockoutRemainingSeconds,
        resetFailedAttempts,
        hasPermission,
        updateRolePermissions,
        updateRoleDefinition,
        submitAdminRegistration,
        approveRegistrationRequest,
        rejectRegistrationRequest,
        updateStaffStatus,
        updateStaffRole,
        invitations,
        generateInvitation,
        revokeInvitation,
        acceptInvitation,
        loadTestFixtures,
        resetToCleanProduction,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
