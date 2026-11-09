export type NotificationEvent =
  | 'application_submitted'
  | 'application_confirmed'
  | 'documents_pending'
  | 'ready_for_review'
  | 'under_review'
  | 'additional_information_requested'
  | 'processing'
  | 'completed'
  | 'rejected'
  | 'cancelled';

export type DeliveryStatus =
  | 'Pending'
  | 'Processing'
  | 'Sent'
  | 'Failed'
  | 'Retry Scheduled';

export type RecipientType = 'customer' | 'admin' | 'officer';

export interface NotificationRecord {
  id: string;
  applicationId: string;
  recipientEmail: string;
  recipientName: string;
  recipientType: RecipientType;
  notificationEvent: NotificationEvent;
  subject: string;
  deliveryStatus: DeliveryStatus;
  providerMessageId?: string;
  attemptCount: number;
  maxAttempts: number;
  createdAt: string;
  sentAt?: string;
  lastAttemptAt?: string;
  failureReason?: string;
  previewText: string;
  htmlBody: string;
  dedupKey: string;
  destinationName: string;
  visaCategory: string;
  statusSnapshot: string;
}

// Backward-compatibility alias for existing components
export type DispatchedEmail = NotificationRecord;

export interface NotificationRecipientConfig {
  primaryAdminEmail: string;
  secondaryAdminEmail: string;
  applicationsTeamEmail: string;
  consularDepartmentEmail: string;
  financeDepartmentEmail: string;
  qaDepartmentEmail: string;
  notifyAssignedOfficer: boolean;
}

export interface NotificationTriggerConfig {
  event: NotificationEvent;
  label: string;
  customerEnabled: boolean;
  adminEnabled: boolean;
  description: string;
}
