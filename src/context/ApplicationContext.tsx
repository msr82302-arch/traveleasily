import React, { createContext, useContext, useState, useEffect } from 'react';
import { VisaApplication, ApplicationStatus, ProcessingSpeed, MRZExtractedData } from '../types/visa';
import { INITIAL_APPLICATIONS } from '../data/sampleApplications';
import {
  NotificationRecord,
  NotificationRecipientConfig,
  NotificationTriggerConfig,
  DispatchedEmail,
} from '../types/notifications';
import {
  loadRecipientConfig,
  saveRecipientConfig,
  loadTriggerConfigs,
  saveTriggerConfigs,
  generateEventNotifications,
  retryNotificationRecord,
  generateCustomerSubmissionEmail,
  generateAdminSubmissionNotificationEmail,
  generateStatusUpdateEmail,
} from '../services/emailService';

export interface ApplicationDraft {
  originCountry: string;
  destinationCountry: string;
  destinationName: string;
  visaType: string;
  processingSpeed: ProcessingSpeed;
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
    occupation: string;
    maritalStatus: string;
    email?: string;
    phone?: string;
  };
  itinerary: {
    arrivalDate: string;
    departureDate: string;
    portOfEntry: string;
    accommodationAddress: string;
    emergencyContact: string;
  };
  declarations: {
    priorRejections: boolean;
    criminalHistory: boolean;
    yellowFeverEndorsed: boolean;
    accuracyAgreed: boolean;
  };
  ocrData?: MRZExtractedData;
  passportScanUrl?: string;
  uploadedFiles: {
    passport: boolean;
    photo: boolean;
    flight: boolean;
    hotel: boolean;
  };
}

const DEFAULT_DRAFT: ApplicationDraft = {
  originCountry: 'BH',
  destinationCountry: 'SA',
  destinationName: 'Saudi Arabia',
  visaType: 'eVisa',
  processingSpeed: 'standard',
  traveler: {
    givenNames: '',
    surname: '',
    passportNumber: '',
    nationality: 'Bahraini',
    dateOfBirth: '1992-05-14',
    gender: 'M',
    passportIssueDate: '2023-01-10',
    passportExpiryDate: '2033-01-09',
    issuingCountry: 'Bahrain',
    occupation: 'Business Professional',
    maritalStatus: 'Single',
    email: 'traveler@easytravels-client.com',
    phone: '+973 3900 1122',
  },
  itinerary: {
    arrivalDate: '2026-12-15',
    departureDate: '2026-12-28',
    portOfEntry: 'King Fahd Causeway (Bahrain - KSA)',
    accommodationAddress: 'Hilton Hotel & Residences, Al Olaya District, Riyadh',
    emergencyContact: '+973 3944 1122 (Family)',
  },
  declarations: {
    priorRejections: false,
    criminalHistory: false,
    yellowFeverEndorsed: true,
    accuracyAgreed: true,
  },
  uploadedFiles: {
    passport: true,
    photo: true,
    flight: true,
    hotel: true,
  },
};

interface ApplicationContextType {
  applications: VisaApplication[];
  draft: ApplicationDraft;
  currentStep: number;
  lastSavedAt: string | null;
  emailLogs: NotificationRecord[];
  notificationRecipients: NotificationRecipientConfig;
  updateNotificationRecipients: (config: NotificationRecipientConfig) => void;
  notificationTriggers: NotificationTriggerConfig[];
  updateNotificationTriggers: (configs: NotificationTriggerConfig[]) => void;
  retryNotification: (id: string) => void;
  setCurrentStep: (step: number) => void;
  updateDraft: (updater: Partial<ApplicationDraft> | ((prev: ApplicationDraft) => ApplicationDraft)) => void;
  populateDraftFromOCR: (ocr: MRZExtractedData, scanUrl?: string) => void;
  submitDraftApplication: (
    paymentMethod: 'credit_card' | 'apple_pay' | 'paypal' | 'afs_gateway' | 'wallet_credit',
    totalUSD: number,
    customRecipientEmail?: string
  ) => VisaApplication;
  resetDraft: () => void;
  updateApplicationStatus: (id: string, newStatus: ApplicationStatus, internalNote?: string, reason?: string) => void;
  approveApplication: (id: string, grantNumber?: string) => void;
  rejectApplication: (id: string, reason: string) => void;
  requestReUpload: (id: string, reason: string) => void;
  refundApplication: (id: string, reason: string) => void;
  getApplicationById: (id: string) => VisaApplication | undefined;
  clearEmailLogs: () => void;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export const ApplicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [applications, setApplications] = useState<VisaApplication[]>(() => {
    const saved = localStorage.getItem('et_applications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_APPLICATIONS;
      }
    }
    return INITIAL_APPLICATIONS;
  });

  const [emailLogs, setEmailLogs] = useState<DispatchedEmail[]>(() => {
    const saved = localStorage.getItem('et_email_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    // Initialize with a realistic seeded transaction email for demonstration
    const seededApp = INITIAL_APPLICATIONS[0];
    if (seededApp) {
      const cust = generateCustomerSubmissionEmail({
        id: seededApp.id,
        clientName: seededApp.clientName,
        clientEmail: seededApp.clientEmail,
        destinationName: seededApp.destinationName,
        visaType: seededApp.visaType,
        processingSpeed: seededApp.processingSpeed,
        slaDeadline: seededApp.slaDeadline,
        payment: { amountUSD: seededApp.payment.amountUSD, amountBHD: seededApp.payment.amountBHD },
        traveler: { passportNumber: seededApp.traveler.passportNumber, nationality: seededApp.traveler.nationality },
      });
      const adm = generateAdminSubmissionNotificationEmail({
        id: seededApp.id,
        clientName: seededApp.clientName,
        clientEmail: seededApp.clientEmail,
        clientPhone: seededApp.clientPhone,
        destinationName: seededApp.destinationName,
        visaType: seededApp.visaType,
        processingSpeed: seededApp.processingSpeed,
        slaDeadline: seededApp.slaDeadline,
        payment: {
          amountUSD: seededApp.payment.amountUSD,
          amountBHD: seededApp.payment.amountBHD,
          paymentMethod: seededApp.payment.paymentMethod,
          transactionId: seededApp.payment.transactionId,
        },
        traveler: { passportNumber: seededApp.traveler.passportNumber, nationality: seededApp.traveler.nationality },
        assignedAgent: seededApp.assignedAgent,
      });
      return [cust, adm];
    }
    return [];
  });

  const [notificationRecipients, setNotificationRecipients] = useState<NotificationRecipientConfig>(
    () => loadRecipientConfig()
  );

  const [notificationTriggers, setNotificationTriggers] = useState<NotificationTriggerConfig[]>(
    () => loadTriggerConfigs()
  );

  const updateNotificationRecipients = (config: NotificationRecipientConfig) => {
    setNotificationRecipients(config);
    saveRecipientConfig(config);
  };

  const updateNotificationTriggers = (configs: NotificationTriggerConfig[]) => {
    setNotificationTriggers(configs);
    saveTriggerConfigs(configs);
  };

  const retryNotification = (id: string) => {
    setEmailLogs((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return retryNotificationRecord(item);
        }
        return item;
      })
    );
  };

  const [draft, setDraft] = useState<ApplicationDraft>(() => {
    const saved = localStorage.getItem('et_current_draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_DRAFT,
          ...parsed,
          traveler: { ...DEFAULT_DRAFT.traveler, ...(parsed.traveler || {}) },
          itinerary: {
            ...DEFAULT_DRAFT.itinerary,
            ...(parsed.itinerary || {}),
            arrivalDate: parsed.itinerary?.arrivalDate || DEFAULT_DRAFT.itinerary.arrivalDate,
            departureDate: parsed.itinerary?.departureDate || DEFAULT_DRAFT.itinerary.departureDate,
            portOfEntry: parsed.itinerary?.portOfEntry || DEFAULT_DRAFT.itinerary.portOfEntry,
            accommodationAddress: parsed.itinerary?.accommodationAddress || DEFAULT_DRAFT.itinerary.accommodationAddress,
            emergencyContact: parsed.itinerary?.emergencyContact || DEFAULT_DRAFT.itinerary.emergencyContact,
          },
          declarations: {
            ...DEFAULT_DRAFT.declarations,
            ...(parsed.declarations || {}),
            accuracyAgreed: parsed.declarations?.accuracyAgreed ?? true,
          },
        };
      } catch (e) {
        return DEFAULT_DRAFT;
      }
    }
    return DEFAULT_DRAFT;
  });

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  // Sync applications to localStorage
  useEffect(() => {
    localStorage.setItem('et_applications', JSON.stringify(applications));
  }, [applications]);

  // Debounced auto-save draft to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('et_current_draft', JSON.stringify(draft));
      const now = new Date();
      setLastSavedAt(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 600);
    return () => clearTimeout(timer);
  }, [draft]);

  const updateDraft = (updater: Partial<ApplicationDraft> | ((prev: ApplicationDraft) => ApplicationDraft)) => {
    if (typeof updater === 'function') {
      setDraft((prev) => updater(prev));
    } else {
      setDraft((prev) => ({
        ...prev,
        ...updater,
        traveler: { ...prev.traveler, ...(updater.traveler || {}) },
        itinerary: { ...prev.itinerary, ...(updater.itinerary || {}) },
        declarations: { ...prev.declarations, ...(updater.declarations || {}) },
        uploadedFiles: { ...prev.uploadedFiles, ...(updater.uploadedFiles || {}) },
      }));
    }
  };

  const populateDraftFromOCR = (ocr: MRZExtractedData, scanUrl?: string) => {
    setDraft((prev) => ({
      ...prev,
      ocrData: ocr,
      passportScanUrl: scanUrl || prev.passportScanUrl,
      traveler: {
        ...prev.traveler,
        givenNames: ocr.givenNames || prev.traveler.givenNames,
        surname: ocr.surname || prev.traveler.surname,
        passportNumber: ocr.documentNumber || prev.traveler.passportNumber,
        nationality: ocr.nationality ? `${ocr.nationality}` : prev.traveler.nationality,
        dateOfBirth: ocr.dateOfBirth || prev.traveler.dateOfBirth,
        gender: ocr.gender || prev.traveler.gender,
        passportExpiryDate: ocr.expirationDate || prev.traveler.passportExpiryDate,
        issuingCountry: ocr.issuingCountry || prev.traveler.issuingCountry,
      },
      uploadedFiles: {
        ...prev.uploadedFiles,
        passport: true,
      },
    }));
  };

  const resetDraft = () => {
    setDraft(DEFAULT_DRAFT);
    localStorage.removeItem('et_current_draft');
    setCurrentStep(1);
  };

  const submitDraftApplication = (
    paymentMethod: 'credit_card' | 'apple_pay' | 'paypal' | 'afs_gateway' | 'wallet_credit',
    totalUSD: number,
    customRecipientEmail?: string
  ): VisaApplication => {
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const newId = `ET-BH-2026-${randomSuffix}`;
    const nowIso = new Date().toISOString();

    // Calculate SLA
    const slaHours = draft.processingSpeed === 'super_rush' ? 8 : draft.processingSpeed === 'rush' ? 24 : 72;
    const slaDeadline = new Date(Date.now() + slaHours * 3600 * 1000).toISOString();

    const clientEmail = customRecipientEmail?.trim() || draft.traveler.email || 'traveler@easytravels-client.com';

    const newApp: VisaApplication = {
      id: newId,
      clientId: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
      clientName: `${draft.traveler.givenNames} ${draft.traveler.surname}`.trim() || 'Valued Traveler',
      clientEmail,
      clientPhone: draft.traveler.phone || '+973 3900 1122',
      originCountry: draft.originCountry,
      destinationCountry: draft.destinationCountry,
      destinationName: draft.destinationName,
      visaType: (draft.visaType as any) || 'eVisa',
      status: 'Ready for Review',
      processingSpeed: draft.processingSpeed,
      submittedAt: nowIso,
      updatedAt: nowIso,
      slaDeadline,
      traveler: {
        ...draft.traveler,
      },
      itinerary: {
        ...draft.itinerary,
      },
      ocrData: draft.ocrData,
      passportScanUrl: draft.passportScanUrl,
      documents: [
        {
          id: `doc-${Date.now()}-1`,
          name: 'Passport Bio Page Scan',
          type: 'passport_scan',
          uploadedAt: nowIso,
          status: 'verified',
          ocrExtracted: !!draft.ocrData,
          confidence: draft.ocrData ? draft.ocrData.overallConfidence : 90,
        },
        {
          id: `doc-${Date.now()}-2`,
          name: 'Passport Photograph',
          type: 'photograph',
          uploadedAt: nowIso,
          status: 'verified',
          confidence: 95,
        },
      ],
      payment: {
        amountUSD: totalUSD,
        amountBHD: Number((totalUSD * 0.376).toFixed(2)),
        currency: 'USD',
        paymentMethod,
        status: 'paid',
        transactionId: `txn_et_${Date.now()}`,
        paidAt: nowIso,
      },
      assignedAgent: 'Yousif Mansoor (Senior Visa Officer)',
      internalNotes: ['Application submitted via borderless web portal. Automatic pre-checks complete.'],
    };

    // Automated Dual Email Dispatches with Deduplication
    const newDispatches: NotificationRecord[] = [];

    // 1. Initial Submission Notifications
    const subResult = generateEventNotifications('application_submitted', newApp, emailLogs);
    if (subResult.customerNotification) newDispatches.push(subResult.customerNotification);
    newDispatches.push(...subResult.adminNotifications);

    // 2. Immediate Confirmation Notification (Payment settled)
    const confResult = generateEventNotifications(
      'application_confirmed',
      newApp,
      [...newDispatches, ...emailLogs]
    );
    if (confResult.customerNotification) newDispatches.push(confResult.customerNotification);
    newDispatches.push(...confResult.adminNotifications);

    setEmailLogs((prev) => [...newDispatches, ...prev]);
    setApplications((prev) => [newApp, ...prev]);
    resetDraft();
    return newApp;
  };

  // Sync emailLogs to localStorage
  useEffect(() => {
    localStorage.setItem('et_email_logs', JSON.stringify(emailLogs));
  }, [emailLogs]);

  // Map arbitrary application status string to one of the 10 NotificationEvent keys
  const mapStatusToEvent = (status: string): import('../types/notifications').NotificationEvent => {
    const s = status.toLowerCase();
    if (s.includes('submit')) return 'application_submitted';
    if (s.includes('confirm')) return 'application_confirmed';
    if (s.includes('document') || s.includes('doc')) return 'documents_pending';
    if (s.includes('ready')) return 'ready_for_review';
    if (s.includes('under review')) return 'under_review';
    if (s.includes('action') || s.includes('information')) return 'additional_information_requested';
    if (s.includes('processing') || s.includes('government')) return 'processing';
    if (s.includes('approved') || s.includes('completed') || s.includes('delivered')) return 'completed';
    if (s.includes('reject')) return 'rejected';
    if (s.includes('cancel') || s.includes('refund')) return 'cancelled';
    return 'ready_for_review';
  };

  const updateApplicationStatus = (
    id: string,
    newStatus: ApplicationStatus,
    internalNote?: string,
    reason?: string
  ) => {
    const target = applications.find((a) => a.id === id);
    if (target) {
      const event = mapStatusToEvent(newStatus);
      const updatedApp = {
        ...target,
        status: newStatus,
        rejectionReason: reason || target.rejectionReason,
      };

      const { customerNotification, adminNotifications } = generateEventNotifications(
        event,
        updatedApp,
        emailLogs,
        { note: internalNote || reason }
      );

      const toAdd: NotificationRecord[] = [];
      if (customerNotification) toAdd.push(customerNotification);
      toAdd.push(...adminNotifications);

      if (toAdd.length > 0) {
        setEmailLogs((prev) => [...toAdd, ...prev]);
      }
    }

    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === id) {
          const notes = app.internalNotes ? [...app.internalNotes] : [];
          if (internalNote) {
            notes.push(`[${new Date().toLocaleTimeString()}] ${internalNote}`);
          }
          return {
            ...app,
            status: newStatus,
            updatedAt: new Date().toISOString(),
            internalNotes: notes,
            rejectionReason: reason || app.rejectionReason,
          };
        }
        return app;
      })
    );
  };

  const approveApplication = (id: string, grantNumber?: string) => {
    const grant = grantNumber || `EV-${Math.floor(100000 + Math.random() * 900000)}`;
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);

    const target = applications.find((a) => a.id === id);
    if (target) {
      const approvedApp = {
        ...target,
        status: 'Completed' as ApplicationStatus,
        visaGrantNumber: grant,
        visaExpiryDate: expiry.toISOString().split('T')[0],
      };

      const { customerNotification, adminNotifications } = generateEventNotifications(
        'completed',
        approvedApp,
        emailLogs,
        { note: `Official visa grant issued: ${grant}` }
      );

      const toAdd: NotificationRecord[] = [];
      if (customerNotification) toAdd.push(customerNotification);
      toAdd.push(...adminNotifications);

      if (toAdd.length > 0) {
        setEmailLogs((prev) => [...toAdd, ...prev]);
      }
    }

    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === id) {
          const notes = app.internalNotes ? [...app.internalNotes] : [];
          notes.push(`[${new Date().toLocaleTimeString()}] Visa approved & grant document generated: ${grant}`);
          return {
            ...app,
            status: 'Completed',
            updatedAt: new Date().toISOString(),
            visaGrantNumber: grant,
            visaExpiryDate: expiry.toISOString().split('T')[0],
            governmentReference: `GOV-${app.destinationCountry}-${Date.now().toString().slice(-6)}`,
            internalNotes: notes,
          };
        }
        return app;
      })
    );
  };

  const rejectApplication = (id: string, reason: string) => {
    updateApplicationStatus(id, 'Rejected', `Rejected: ${reason}`, reason);
  };

  const requestReUpload = (id: string, reason: string) => {
    updateApplicationStatus(id, 'Documents Pending', `Re-upload requested: ${reason}`, reason);
  };

  const refundApplication = (id: string, reason: string) => {
    const target = applications.find((a) => a.id === id);
    if (target) {
      const refundedApp = {
        ...target,
        status: 'Cancelled' as ApplicationStatus,
      };

      const { customerNotification, adminNotifications } = generateEventNotifications(
        'cancelled',
        refundedApp,
        emailLogs,
        { note: `Refund processed: ${reason}` }
      );

      const toAdd: NotificationRecord[] = [];
      if (customerNotification) toAdd.push(customerNotification);
      toAdd.push(...adminNotifications);

      if (toAdd.length > 0) {
        setEmailLogs((prev) => [...toAdd, ...prev]);
      }
    }

    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === id) {
          const notes = app.internalNotes ? [...app.internalNotes] : [];
          notes.push(`[${new Date().toLocaleTimeString()}] Refund processed: ${reason}`);
          return {
            ...app,
            status: 'Cancelled',
            updatedAt: new Date().toISOString(),
            payment: {
              ...app.payment,
              status: 'refunded',
            },
            internalNotes: notes,
          };
        }
        return app;
      })
    );
  };

  const clearEmailLogs = () => {
    setEmailLogs([]);
    localStorage.removeItem('et_email_logs');
  };

  const getApplicationById = (id: string) => {
    return applications.find((a) => a.id.toLowerCase() === id.toLowerCase());
  };

  return (
    <ApplicationContext.Provider
      value={{
        applications,
        draft,
        currentStep,
        lastSavedAt,
        emailLogs,
        notificationRecipients,
        updateNotificationRecipients,
        notificationTriggers,
        updateNotificationTriggers,
        retryNotification,
        setCurrentStep,
        updateDraft,
        populateDraftFromOCR,
        submitDraftApplication,
        resetDraft,
        updateApplicationStatus,
        approveApplication,
        rejectApplication,
        requestReUpload,
        refundApplication,
        getApplicationById,
        clearEmailLogs,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
};

export const useApplications = () => {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error('useApplications must be used within an ApplicationProvider');
  }
  return context;
};
