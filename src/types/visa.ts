export type VisaType = 'eVisa' | 'ETA' | 'Visa on Arrival' | 'Embassy Appointment' | 'Tourist Card';

export type ApplicationStatus =
  | 'Draft'
  | 'Information Required'
  | 'Documents Pending'
  | 'Ready for Review'
  | 'Under Review'
  | 'Additional Information Requested'
  | 'Processing'
  | 'Completed'
  | 'Rejected'
  | 'Cancelled'
  // Legacy aliases supported for backward compatibility
  | 'Pending Review'
  | 'Processing with Government'
  | 'Action Required'
  | 'Approved'
  | 'Delivered'
  | 'Refunded';

export type ProcessingSpeed = 'standard' | 'rush' | 'super_rush';

export interface CountryInfo {
  code: string; // ISO 2-letter
  name: string;
  nameAr: string;
  flag: string;
  region: 'Middle East' | 'Europe' | 'Asia' | 'Americas' | 'Africa' | 'Oceania';
  popular?: boolean;
}

export interface VisaRequirement {
  destinationCode: string;
  destinationName: string;
  visaType: VisaType;
  eligibleNationalities: string[]; // ISO codes or 'ALL'
  validityDays: number;
  maxStayDays: number;
  entries: 'Single' | 'Double' | 'Multiple';
  standardProcessingDays: number;
  governmentFeeUSD: number;
  serviceFeeUSD: number;
  rushFeeUSD: number;
  superRushFeeUSD: number;
  description: string;
  requiredDocuments: string[];
}

export interface MRZExtractedData {
  documentType: 'P' | 'I' | 'V';
  documentNumber: string;
  documentNumberConfidence: number;
  surname: string;
  surnameConfidence: number;
  givenNames: string;
  givenNamesConfidence: number;
  fullName: string;
  nationality: string;
  nationalityConfidence: number;
  dateOfBirth: string; // YYYY-MM-DD
  dobConfidence: number;
  gender: 'M' | 'F' | 'X';
  genderConfidence: number;
  expirationDate: string; // YYYY-MM-DD
  expiryConfidence: number;
  issuingCountry: string;
  rawMRZLines: string[];
  overallConfidence: number;
  checksumValid: boolean;
  warnings: string[];
}

export interface CardExtractedData {
  cardHolderName: string;
  cardNumberMasked: string;
  expiryMonth: string;
  expiryYear: string;
  cardBrand: 'visa' | 'mastercard' | 'amex' | 'unknown';
  confidence: number;
}

export interface ApplicationDocument {
  id: string;
  name: string;
  type: 'passport_scan' | 'photograph' | 'flight_ticket' | 'hotel_voucher' | 'bank_statement';
  fileUrl?: string;
  uploadedAt: string;
  status: 'verified' | 'flagged' | 'pending';
  ocrExtracted?: boolean;
  confidence?: number;
}

export interface VisaApplication {
  id: string; // e.g. ET-BH-2026-98421
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  originCountry: string; // ISO code
  destinationCountry: string; // ISO code
  destinationName: string;
  visaType: VisaType;
  status: ApplicationStatus;
  processingSpeed: ProcessingSpeed;
  submittedAt: string;
  updatedAt: string;
  slaDeadline: string; // ISO timestamp
  
  // Extracted and verified traveler details
  traveler: {
    givenNames: string;
    surname: string;
    passportNumber: string;
    nationality: string;
    dateOfBirth: string;
    gender: 'M' | 'F' | 'X';
    passportIssueDate: string;
    passportExpiryDate: string;
    issuingCountry: string;
    occupation?: string;
    maritalStatus?: string;
  };

  // Trip details
  itinerary: {
    arrivalDate: string;
    departureDate: string;
    portOfEntry: string;
    accommodationAddress: string;
    emergencyContact: string;
  };

  // OCR Verification status
  ocrData?: MRZExtractedData;
  passportScanUrl?: string;
  documents: ApplicationDocument[];

  // Payment info
  payment: {
    amountUSD: number;
    amountBHD: number;
    currency: string;
    paymentMethod: 'credit_card' | 'apple_pay' | 'paypal' | 'afs_gateway' | 'wallet_credit';
    status: 'paid' | 'pending' | 'refunded';
    transactionId: string;
    paidAt: string;
  };

  // Administrative
  assignedAgent?: string;
  internalNotes?: string[];
  rejectionReason?: string;
  reUploadRequestedReason?: string;
  governmentReference?: string;
  visaGrantNumber?: string;
  visaExpiryDate?: string;
}

export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'operations_manager'
  | 'application_manager'
  | 'visa_officer'
  | 'visa_processing_officer'
  | 'document_verifier'
  | 'document_reviewer'
  | 'finance_officer'
  | 'support_specialist'
  | 'customer_support'
  | 'readonly_auditor'
  | 'auditor'
  | 'customer';

export interface StaffInvitation {
  id: string;
  inviteeName: string;
  inviteeEmail: string;
  department: string;
  role: UserRole;
  token: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  invitedBy: string;
  createdAt: string;
  expiresAt: string;
  acceptedAt?: string;
}

export type RegistrationStatus =
  | 'Pending Approval'
  | 'Approved'
  | 'Rejected'
  | 'Suspended'
  | 'Deactivated';

export interface StaffRegistrationRequest {
  id: string;
  fullName: string;
  workEmail: string;
  phone: string;
  department: string;
  jobDesignation: string;
  requestedRole: UserRole;
  assignedRole?: UserRole;
  invitationCode?: string;
  status: RegistrationStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  termsConsent: boolean;
}

export interface RoleDefinition {
  id: UserRole;
  name: string;
  description: string;
  department: string;
  isSystemRole: boolean;
  badgeClass: string;
  userCount?: number;
}

export type PermissionKey =
  | 'view_dashboard'
  | 'view_customers'
  | 'create_customers'
  | 'edit_customers'
  | 'deactivate_customers'
  | 'view_applications'
  | 'assign_applications'
  | 'review_documents'
  | 'update_application_status'
  | 'view_payments'
  | 'view_financial_reports'
  | 'manage_destinations'
  | 'manage_visa_categories'
  | 'manage_pricing'
  | 'manage_staff'
  | 'approve_registration_requests'
  | 'manage_roles'
  | 'manage_permissions'
  | 'view_audit_logs'
  | 'manage_platform_settings';

export interface PermissionDefinition {
  key: PermissionKey;
  label: string;
  description: string;
  category: 'General' | 'Customers' | 'Applications' | 'Finance' | 'Administration' | 'System';
}

export interface AdminAuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorEmail: string;
  actorRole: UserRole;
  actionType:
    | 'SIGNUP_SUBMITTED'
    | 'SIGNUP_APPROVED'
    | 'SIGNUP_REJECTED'
    | 'ROLE_ASSIGNED'
    | 'STAFF_STATUS_CHANGED'
    | 'PERMISSIONS_UPDATED'
    | 'APPLICATION_TRANSITION'
    | 'SETTINGS_UPDATED'
    | 'TEST_FIXTURES_LOADED'
    | 'PRODUCTION_STATE_RESET';
  description: string;
  targetId?: string;
  targetType?: string;
}

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  jobDesignation?: string;
  role: UserRole;
  avatar: string;
  status: 'active' | 'suspended' | 'deactivated' | 'away' | 'offline';
  department: string;
  casesProcessed?: number;
  joinedAt?: string;
  createdAt?: string;
}

export type GranularPermissionMatrix = Partial<Record<UserRole, Record<PermissionKey, boolean>>>;

