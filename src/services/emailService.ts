import type {
  NotificationEvent,
  DeliveryStatus,
  RecipientType,
  NotificationRecord,
  NotificationRecipientConfig,
  NotificationTriggerConfig,
  DispatchedEmail,
} from '../types/notifications';

export type { DispatchedEmail };

// Default Recipient Configuration (Simulated environment variables / settings)
export const DEFAULT_RECIPIENT_CONFIG: NotificationRecipientConfig = {
  primaryAdminEmail: 'admin@easytravels.bh',
  secondaryAdminEmail: 'operations@easytravels.bh',
  applicationsTeamEmail: 'applications@easytravels.bh',
  consularDepartmentEmail: 'consular@easytravels.bh',
  financeDepartmentEmail: 'finance@easytravels.bh',
  qaDepartmentEmail: 'qa@easytravels.bh',
  notifyAssignedOfficer: true,
};

// Default Trigger Configurations across the 10 Required Events
export const DEFAULT_TRIGGER_CONFIGS: NotificationTriggerConfig[] = [
  {
    event: 'application_submitted',
    label: 'Application Submitted',
    customerEnabled: true,
    adminEnabled: true,
    description: 'Initial submission receipt to customer & new dossier intake alert to admin.',
  },
  {
    event: 'application_confirmed',
    label: 'Application Confirmed',
    customerEnabled: true,
    adminEnabled: true,
    description: 'Payment settled & formal tracking reference issuance notice.',
  },
  {
    event: 'documents_pending',
    label: 'Documents Pending',
    customerEnabled: true,
    adminEnabled: true,
    description: 'Missing or illegible document upload instructions & queue alert.',
  },
  {
    event: 'ready_for_review',
    label: 'Ready for Review',
    customerEnabled: true,
    adminEnabled: true,
    description: 'Automated pre-flight OCR passed and awaiting consular officer inspection.',
  },
  {
    event: 'under_review',
    label: 'Under Review',
    customerEnabled: true,
    adminEnabled: true,
    description: 'Consular adjudicator is actively inspecting passport bio-page and attachments.',
  },
  {
    event: 'additional_information_requested',
    label: 'Additional Information Requested',
    customerEnabled: true,
    adminEnabled: true,
    description: 'Consular officer requires clarifying itinerary or declaration data.',
  },
  {
    event: 'processing',
    label: 'Processing with Government',
    customerEnabled: true,
    adminEnabled: true,
    description: 'Dossier successfully lodged with destination ministry/embassy immigration API.',
  },
  {
    event: 'completed',
    label: 'Completed & Approved',
    customerEnabled: true,
    adminEnabled: true,
    description: 'Official eVisa grant issued, PDF travel authorization ready in wallet.',
  },
  {
    event: 'rejected',
    label: 'Rejected by Authority',
    customerEnabled: true,
    adminEnabled: true,
    description: 'Immigration refusal notice with formal consular instructions and next steps.',
  },
  {
    event: 'cancelled',
    label: 'Cancelled & Refunded',
    customerEnabled: true,
    adminEnabled: true,
    description: 'Application cancellation confirmation and fee settlement statement.',
  },
];

// Recipient Config Storage Helpers
export function loadRecipientConfig(): NotificationRecipientConfig {
  const saved = localStorage.getItem('et_notification_recipients');
  if (saved) {
    try {
      return { ...DEFAULT_RECIPIENT_CONFIG, ...JSON.parse(saved) };
    } catch {
      return DEFAULT_RECIPIENT_CONFIG;
    }
  }
  return DEFAULT_RECIPIENT_CONFIG;
}

export function saveRecipientConfig(cfg: NotificationRecipientConfig): void {
  localStorage.setItem('et_notification_recipients', JSON.stringify(cfg));
}

// Trigger Config Storage Helpers
export function loadTriggerConfigs(): NotificationTriggerConfig[] {
  const saved = localStorage.getItem('et_notification_triggers');
  if (saved) {
    try {
      const parsed: NotificationTriggerConfig[] = JSON.parse(saved);
      // Merge with default list in case new events were introduced
      return DEFAULT_TRIGGER_CONFIGS.map((def) => {
        const found = parsed.find((p) => p.event === def.event);
        return found ? { ...def, ...found } : def;
      });
    } catch {
      return DEFAULT_TRIGGER_CONFIGS;
    }
  }
  return DEFAULT_TRIGGER_CONFIGS;
}

export function saveTriggerConfigs(configs: NotificationTriggerConfig[]): void {
  localStorage.setItem('et_notification_triggers', JSON.stringify(configs));
}

// Mask sensitive passport numbers for notifications: "B82910471" -> "B•••••471"
export function maskPassportNumber(num?: string): string {
  if (!num) return '••••••••';
  const clean = num.trim();
  if (clean.length <= 4) return '••••' + clean;
  return clean.charAt(0) + '•••••' + clean.slice(-3);
}

// Duplicate Detection Helper (Idempotency Key validation)
export function isDuplicateNotification(
  existingRecords: NotificationRecord[],
  dedupKey: string
): boolean {
  return existingRecords.some((rec) => rec.dedupKey === dedupKey);
}

// Common HTML Email Shell (Customer-facing, responsive & branded)
function wrapCustomerEmailHtml(title: string, subtitle: string, bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; -webkit-font-smoothing: antialiased; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .header { background: #CF3126; padding: 28px 32px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { color: #fee2e2; margin: 6px 0 0 0; font-size: 13px; font-weight: 500; }
    .content { padding: 32px; font-size: 13px; line-height: 1.6; color: #334155; }
    .dossier-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 20px 0; }
    .row { display: flex; justify-content: space-between; padding: 7px 0; font-size: 13px; border-bottom: 1px dashed #e2e8f0; }
    .row:last-child { border-bottom: none; }
    .label { color: #64748b; font-weight: 500; }
    .val { font-weight: 700; color: #0f172a; }
    .cta-button { display: inline-block; text-align: center; background: #0f172a; color: #ffffff !important; text-decoration: none; padding: 13px 28px; border-radius: 10px; font-weight: 700; font-size: 13px; margin: 20px 0; }
    .cta-button:hover { background: #1e293b; }
    .notice-box { background: #fef2f2; border-left: 4px solid #CF3126; padding: 14px 16px; border-radius: 8px; margin: 18px 0; font-size: 12px; color: #991b1b; line-height: 1.5; }
    .info-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 14px 16px; border-radius: 8px; margin: 18px 0; font-size: 12px; color: #1e40af; line-height: 1.5; }
    .warning-box { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 14px 16px; border-radius: 8px; margin: 18px 0; font-size: 12px; color: #92400e; line-height: 1.5; }
    .footer { background: #f1f5f9; padding: 22px 32px; text-align: center; font-size: 11px; color: #64748b; line-height: 1.6; }
    .badge { display: inline-block; padding: 4px 12px; background: #eff6ff; color: #1d4ed8; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>EASY TRAVELS</h1>
      <p>DOCUMENT CLEARANCE & CONSULAR SERVICES &bull; BAHRAIN</p>
    </div>
    <div class="content">
      <div style="text-align: center; margin-bottom: 20px;">
        <span class="badge">${subtitle}</span>
      </div>
      ${bodyContent}
    </div>
    <div class="footer">
      <strong>Easy Travels Document Clearance W.L.L.</strong> &bull; CR #98214-01<br/>
      Building 402, Road 1215, Block 912, Near IMC Hospital, Lulu Road, Riffa, Kingdom of Bahrain<br/>
      Consular Hotline: <strong>+973 33276768</strong> &bull; Email: <strong>concierge@easytravels.bh</strong><br/>
      <em>This is an automated operational notification. Government visa grants are subject to sovereign immigration authority discretion.</em>
    </div>
  </div>
</body>
</html>`;
}

// Common HTML Email Shell (Admin-facing, high security dark theme)
function wrapAdminEmailHtml(title: string, badge: string, bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0b0f17; color: #f1f5f9; padding: 24px; margin: 0; }
    .card { max-width: 620px; margin: 0 auto; background: #131b2e; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b; box-shadow: 0 10px 30px rgba(0,0,0,0.4); }
    .header { background: #0f172a; padding: 22px 28px; border-bottom: 2px solid #CF3126; display: flex; justify-content: space-between; align-items: center; }
    .brand { color: #ffffff; font-size: 15px; font-weight: 800; letter-spacing: -0.3px; }
    .badge { background: #CF3126; color: #ffffff; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
    .content { padding: 28px; font-size: 13px; line-height: 1.6; color: #cbd5e1; }
    .box { background: #0b1120; border: 1px solid #1e293b; border-radius: 12px; padding: 16px; margin: 18px 0; }
    .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #1e293b; font-size: 12px; }
    .row:last-child { border-bottom: none; }
    .lbl { color: #94a3b8; font-weight: 500; }
    .val { color: #38bdf8; font-weight: 700; font-family: monospace; }
    .cta-btn { display: inline-block; background: #3b82f6; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 12px; margin: 18px 0; }
    .footer { background: #0a0e17; padding: 16px 28px; font-size: 11px; color: #64748b; text-align: center; border-top: 1px solid #1e293b; }
    .sec-notice { font-size: 11px; color: #94a3b8; background: #1e293b/60; padding: 10px 14px; border-radius: 8px; margin-top: 14px; border: 1px dashed #334155; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <span class="brand">EASY TRAVELS &bull; OPERATIONS COMMAND</span>
      <span class="badge">${badge}</span>
    </div>
    <div class="content">
      ${bodyContent}
      <div class="sec-notice">
        <strong>Security & Privacy Protocol:</strong> In compliance with Kingdom of Bahrain Personal Data Protection Law (PDPL), sensitive passport bio-page scans and payment card numbers are never transmitted in cleartext email bodies. Access the secured dashboard via authenticated session to view verified files.
      </div>
    </div>
    <div class="footer">
      Easy Travels Consular Administration Engine &bull; Host: <code>secure.easytravels.bh</code>
    </div>
  </div>
</body>
</html>`;
}

// -------------------------------------------------------------
// EVENT TEMPLATE FACTORIES (10 SPECIFIED APPLICATION EVENTS)
// -------------------------------------------------------------

export function buildCustomerEmailContent(
  event: NotificationEvent,
  app: any,
  extraNote?: string
): { subject: string; subtitle: string; previewText: string; htmlBody: string } {
  const ref = app.id || 'ET-REF';
  const name = app.clientName || 'Valued Traveler';
  const dest = app.destinationName || 'Destination Country';
  const visa = app.visaType || 'e-Visa';
  const submitDate = app.submittedAt ? new Date(app.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString();
  const maskedPassport = maskPassportNumber(app.traveler?.passportNumber);
  const portalUrl = 'https://easytravels.bh/wallet';

  let subject = `EasyTravel | Application Update — ${ref}`;
  let subtitle = 'Status Update';
  let previewText = '';
  let bodyContent = '';

  switch (event) {
    case 'application_submitted':
      subject = `EasyTravel | Your Application Has Been Successfully Submitted — ${ref}`;
      subtitle = 'Application Registered &bull; Pending Review';
      previewText = `Thank you ${name}. Your application ${ref} for ${dest} has been registered and is under initial review.`;
      bodyContent = `
        <h2 style="font-size: 17px; color: #0f172a; margin-top: 0;">Dear ${name},</h2>
        <p>Thank you for choosing EasyTravel.</p>
        <p>Your application has been successfully submitted and registered in our system. Our certified consular document verifiers have initiated pre-flight compliance checks.</p>
        
        <div class="dossier-box">
          <div class="row"><span class="label">Application Reference:</span><span class="val">${ref}</span></div>
          <div class="row"><span class="label">Destination:</span><span class="val">${dest}</span></div>
          <div class="row"><span class="label">Visa Category:</span><span class="val">${visa}</span></div>
          <div class="row"><span class="label">Submission Date:</span><span class="val">${submitDate}</span></div>
          <div class="row"><span class="label">Current Status:</span><span class="val" style="color: #0284c7;">Ready for Review</span></div>
          <div class="row"><span class="label">Masked Passport:</span><span class="val font-mono">${maskedPassport}</span></div>
          ${app.payment?.amountUSD ? `<div class="row"><span class="label">Consular & Platform Fee:</span><span class="val">$${app.payment.amountUSD.toFixed(2)} (Settled)</span></div>` : ''}
        </div>

        <p>You can monitor your application progress through your EasyTravel customer portal at any time.</p>
        <p style="text-align: center;">
          <a href="${portalUrl}" class="cta-button">Open Customer Tracking Portal &rarr;</a>
        </p>

        <p>Our team will review your application and notify you when further action is required.</p>
        <p>Regards,<br/><strong>EasyTravel Customer Support Team</strong></p>
      `;
      break;

    case 'application_confirmed':
      subject = `EasyTravel | Application Confirmed & Tracking Active — ${ref}`;
      subtitle = 'Application Confirmed';
      previewText = `Your application ${ref} for ${dest} is fully confirmed. Government lodgement queue target assigned.`;
      bodyContent = `
        <h2 style="font-size: 17px; color: #0f172a; margin-top: 0;">Dear ${name},</h2>
        <p>We are pleased to confirm that your visa application dossier and payment have been fully verified and locked for processing.</p>
        
        <div class="dossier-box">
          <div class="row"><span class="label">Confirmed Reference:</span><span class="val">${ref}</span></div>
          <div class="row"><span class="label">Destination:</span><span class="val">${dest} (${visa})</span></div>
          <div class="row"><span class="label">Confirmation Date:</span><span class="val">${submitDate}</span></div>
          <div class="row"><span class="label">Processing Tier:</span><span class="val">${(app.processingSpeed || 'Standard').toUpperCase()}</span></div>
          <div class="row"><span class="label">Current Status:</span><span class="val" style="color: #059669;">Confirmed & Queued</span></div>
        </div>

        <div class="info-box">
          <strong>Next Expected Steps:</strong> Your files are now with our designated consular officer who is preparing the formal transmission to the destination immigration portal.
        </div>

        <p style="text-align: center;">
          <a href="${portalUrl}" class="cta-button">Track Live Status in Wallet &rarr;</a>
        </p>

        <p>Regards,<br/><strong>EasyTravel Consular Logistics Desk</strong></p>
      `;
      break;

    case 'documents_pending':
      subject = `Action Required | Missing Document Instructions for Your EasyTravel Application — ${ref}`;
      subtitle = 'Documents Pending';
      previewText = `Action required: Please provide the missing or updated documents for application ${ref}.`;
      bodyContent = `
        <h2 style="font-size: 17px; color: #0f172a; margin-top: 0;">Dear ${name},</h2>
        <p>During our initial document verification for your <strong>${dest}</strong> visa dossier (Reference: <strong>${ref}</strong>), our compliance officer noted that one or more required documents require your attention before government submission.</p>

        <div class="warning-box">
          <strong>Required Action:</strong> ${extraNote || 'Please provide a clearer, glare-free color scan of your passport bio-data page showing all four corners and the Machine Readable Zone (MRZ).'}
        </div>

        <div class="dossier-box">
          <div class="row"><span class="label">Application Reference:</span><span class="val">${ref}</span></div>
          <div class="row"><span class="label">Destination:</span><span class="val">${dest}</span></div>
          <div class="row"><span class="label">Status:</span><span class="val" style="color: #d97706;">Documents Pending</span></div>
        </div>

        <p>Please log in to your secure portal to upload the required file(s) so processing can resume without delay.</p>
        <p style="text-align: center;">
          <a href="${portalUrl}" class="cta-button">Upload Pending Documents &rarr;</a>
        </p>

        <p>Regards,<br/><strong>EasyTravel Verification Team</strong></p>
      `;
      break;

    case 'ready_for_review':
      subject = `EasyTravel | Application Ready for Consular Review — ${ref}`;
      subtitle = 'Ready for Review';
      previewText = `Your application ${ref} has passed edge verification and is assigned to the review queue.`;
      bodyContent = `
        <h2 style="font-size: 17px; color: #0f172a; margin-top: 0;">Dear ${name},</h2>
        <p>Good news! Your application dossier for <strong>${dest}</strong> has passed our automated compliance checks and has been placed in the consular adjudicator queue for final review.</p>

        <div class="dossier-box">
          <div class="row"><span class="label">Application Reference:</span><span class="val">${ref}</span></div>
          <div class="row"><span class="label">Destination:</span><span class="val">${dest}</span></div>
          <div class="row"><span class="label">Status:</span><span class="val" style="color: #0284c7;">Ready for Review</span></div>
          <div class="row"><span class="label">Next Milestone:</span><span class="val">Officer Sign-Off & Ministry Lodgement</span></div>
        </div>

        <p>No action is required from you at this stage. We will notify you once the dossier is transmitted to the government system.</p>
        <p style="text-align: center;">
          <a href="${portalUrl}" class="cta-button">View Live Dossier in Portal &rarr;</a>
        </p>

        <p>Regards,<br/><strong>EasyTravel Customer Support Team</strong></p>
      `;
      break;

    case 'under_review':
      subject = `EasyTravel | Your Application Is Being Reviewed — ${ref}`;
      subtitle = 'Under Consular Review';
      previewText = `A certified EasyTravel officer is currently conducting manual review of dossier ${ref}.`;
      bodyContent = `
        <h2 style="font-size: 17px; color: #0f172a; margin-top: 0;">Dear ${name},</h2>
        <p>Your visa application dossier (Reference: <strong>${ref}</strong>) is currently undergoing manual consular review by an EasyTravel operations officer.</p>

        <div class="dossier-box">
          <div class="row"><span class="label">Application Reference:</span><span class="val">${ref}</span></div>
          <div class="row"><span class="label">Destination:</span><span class="val">${dest} (${visa})</span></div>
          <div class="row"><span class="label">Status:</span><span class="val" style="color: #6366f1;">Under Review</span></div>
          ${extraNote ? `<div class="row"><span class="label">Officer Note:</span><span class="val">${extraNote}</span></div>` : ''}
        </div>

        <p>We are cross-referencing your travel details with current destination immigration guidelines to ensure maximum lodgement accuracy.</p>
        <p style="text-align: center;">
          <a href="${portalUrl}" class="cta-button">Check Live Progress &rarr;</a>
        </p>

        <p>Regards,<br/><strong>EasyTravel Operations Desk</strong></p>
      `;
      break;

    case 'additional_information_requested':
      subject = `Action Required | Additional Information Needed for Your EasyTravel Application — ${ref}`;
      subtitle = 'Action Required';
      previewText = `Action needed: Additional information is requested to complete your application ${ref}.`;
      bodyContent = `
        <h2 style="font-size: 17px; color: #0f172a; margin-top: 0;">Dear ${name},</h2>
        <p>Our consular officer requires additional information to finalize your <strong>${dest}</strong> visa application (Reference: <strong>${ref}</strong>).</p>

        <div class="warning-box">
          <strong>Information Required:</strong> ${extraNote || 'Please verify your port of entry and provide your confirmed hotel accommodation address in destination.'}
        </div>

        <div class="dossier-box">
          <div class="row"><span class="label">Application Reference:</span><span class="val">${ref}</span></div>
          <div class="row"><span class="label">Destination:</span><span class="val">${dest}</span></div>
          <div class="row"><span class="label">Status:</span><span class="val" style="color: #dc2626; font-weight: bold;">Additional Information Requested</span></div>
        </div>

        <p>Please submit this information via your customer portal at your earliest convenience to avoid delays in government lodgement.</p>
        <p style="text-align: center;">
          <a href="${portalUrl}" class="cta-button">Submit Required Information &rarr;</a>
        </p>

        <p>Regards,<br/><strong>EasyTravel Consular Review Desk</strong></p>
      `;
      break;

    case 'processing':
      subject = `EasyTravel | Application Lodged & In Processing with Government — ${ref}`;
      subtitle = 'Government Processing';
      previewText = `Your application ${ref} has been officially lodged with the ${dest} immigration authority.`;
      bodyContent = `
        <h2 style="font-size: 17px; color: #0f172a; margin-top: 0;">Dear ${name},</h2>
        <p>We are pleased to inform you that your application (Reference: <strong>${ref}</strong>) has been successfully lodged with the immigration authority of <strong>${dest}</strong>.</p>

        <div class="dossier-box">
          <div class="row"><span class="label">Application Reference:</span><span class="val">${ref}</span></div>
          <div class="row"><span class="label">Destination Authority:</span><span class="val">${dest} Immigration Department</span></div>
          <div class="row"><span class="label">Category:</span><span class="val">${visa}</span></div>
          <div class="row"><span class="label">Status:</span><span class="val" style="color: #2563eb;">Processing with Government</span></div>
          ${app.governmentReference ? `<div class="row"><span class="label">Government Tracking:</span><span class="val">${app.governmentReference}</span></div>` : ''}
        </div>

        <p>The sovereign authorities are now reviewing your application. As processing times depend entirely on the issuing government, we will alert you the moment your official travel grant is issued.</p>
        <p style="text-align: center;">
          <a href="${portalUrl}" class="cta-button">Track Application in Wallet &rarr;</a>
        </p>

        <p>Regards,<br/><strong>EasyTravel Global Dispatch Team</strong></p>
      `;
      break;

    case 'completed':
      subject = `EasyTravel | Congratulations! Your Visa Application Is Completed — ${ref}`;
      subtitle = 'Application Completed &bull; e-Visa Issued';
      previewText = `Great news ${name}! Your visa for ${dest} has been approved and issued. Download your clearance from your wallet.`;
      bodyContent = `
        <h2 style="font-size: 17px; color: #0f172a; margin-top: 0;">Dear ${name},</h2>
        <p>We are delighted to inform you that your visa application for <strong>${dest}</strong> has been officially <strong>completed and issued</strong>!</p>

        <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 12px; padding: 18px; margin: 18px 0;">
          <div style="font-size: 14px; font-weight: bold; color: #065f46; margin-bottom: 8px;">🎉 Official Travel Clearance Ready</div>
          <div class="row"><span class="label">Application Reference:</span><span class="val">${ref}</span></div>
          <div class="row"><span class="label">Destination:</span><span class="val">${dest}</span></div>
          <div class="row"><span class="label">Visa Type:</span><span class="val">${visa}</span></div>
          ${app.visaGrantNumber ? `<div class="row"><span class="label">Visa Grant Number:</span><span class="val" style="color: #059669; font-family: monospace;">${app.visaGrantNumber}</span></div>` : ''}
          ${app.visaExpiryDate ? `<div class="row"><span class="label">Visa Validity Until:</span><span class="val">${app.visaExpiryDate}</span></div>` : ''}
          <div class="row"><span class="label">Status:</span><span class="val" style="color: #059669;">Completed & Delivered</span></div>
        </div>

        <p><strong>Next Steps:</strong> Please download and print a hard copy of your official PDF travel clearance from your EasyTravel Document Wallet, and carry it alongside your original passport when traveling.</p>
        <p style="text-align: center;">
          <a href="${portalUrl}" class="cta-button" style="background: #059669;">Download e-Visa Clearance PDF &rarr;</a>
        </p>

        <p>Safe travels,<br/><strong>EasyTravel Concierge Team</strong></p>
      `;
      break;

    case 'rejected':
      subject = `EasyTravel | Update Regarding Your Visa Application — ${ref}`;
      subtitle = 'Refusal Notice';
      previewText = `Important update regarding your visa application ${ref} for ${dest}.`;
      bodyContent = `
        <h2 style="font-size: 17px; color: #0f172a; margin-top: 0;">Dear ${name},</h2>
        <p>We regret to inform you that the immigration authority of <strong>${dest}</strong> has decided not to approve your visa application (Reference: <strong>${ref}</strong>).</p>

        <div class="notice-box">
          <strong>Authority Decision:</strong> ${extraNote || app.rejectionReason || 'The destination immigration authority was unable to validate required travel documentation or eligibility criteria.'}
        </div>

        <div class="dossier-box">
          <div class="row"><span class="label">Application Reference:</span><span class="val">${ref}</span></div>
          <div class="row"><span class="label">Destination:</span><span class="val">${dest}</span></div>
          <div class="row"><span class="label">Status:</span><span class="val" style="color: #dc2626;">Rejected by Immigration</span></div>
        </div>

        <p><strong>Next Steps:</strong> Sovereign visa decisions are determined exclusively by destination immigration ministries. You may consult with our Bahrain concierge desk regarding reapplication options or alternative pathways.</p>
        <p style="text-align: center;">
          <a href="${portalUrl}" class="cta-button">View Refusal Dossier & Statement &rarr;</a>
        </p>

        <p>Regards,<br/><strong>EasyTravel Consular Appeals & Advisory Desk</strong></p>
      `;
      break;

    case 'cancelled':
      subject = `EasyTravel | Application Cancellation Notice — ${ref}`;
      subtitle = 'Application Cancelled';
      previewText = `Your application ${ref} has been cancelled in accordance with your request.`;
      bodyContent = `
        <h2 style="font-size: 17px; color: #0f172a; margin-top: 0;">Dear ${name},</h2>
        <p>This email confirms that your visa application for <strong>${dest}</strong> (Reference: <strong>${ref}</strong>) has been cancelled.</p>

        <div class="dossier-box">
          <div class="row"><span class="label">Application Reference:</span><span class="val">${ref}</span></div>
          <div class="row"><span class="label">Destination:</span><span class="val">${dest}</span></div>
          <div class="row"><span class="label">Status:</span><span class="val" style="color: #64748b;">Cancelled</span></div>
          ${extraNote ? `<div class="row"><span class="label">Cancellation Reason:</span><span class="val">${extraNote}</span></div>` : ''}
          ${app.payment?.amountUSD ? `<div class="row"><span class="label">Settlement / Refund:</span><span class="val">Processed in accordance with refund policy</span></div>` : ''}
        </div>

        <p>If you did not request this cancellation or have further questions, please contact our support team immediately.</p>
        <p style="text-align: center;">
          <a href="${portalUrl}" class="cta-button">View Cancellation Statement &rarr;</a>
        </p>

        <p>Regards,<br/><strong>EasyTravel Support Team</strong></p>
      `;
      break;

    default:
      subject = `EasyTravel | Status Update: ${ref}`;
      subtitle = 'Status Update';
      previewText = `Status update for your application ${ref}.`;
      bodyContent = `<p>Dear ${name}, your application ${ref} status has been updated to ${app.status}.</p>`;
  }

  const htmlBody = wrapCustomerEmailHtml(subject, subtitle, bodyContent);
  return { subject, subtitle, previewText, htmlBody };
}

export function buildAdminEmailContent(
  event: NotificationEvent,
  app: any,
  extraNote?: string
): { subject: string; badge: string; previewText: string; htmlBody: string } {
  const ref = app.id || 'ET-REF';
  const name = app.clientName || 'Traveler';
  const email = app.clientEmail || 'traveler@client.com';
  const phone = app.clientPhone || '+973 3900 0000';
  const dest = app.destinationName || 'Destination';
  const visa = app.visaType || 'e-Visa';
  const speed = (app.processingSpeed || 'Standard').toUpperCase();
  const submitDate = app.submittedAt ? new Date(app.submittedAt).toLocaleString('en-GB') : new Date().toLocaleString();
  const maskedPassport = maskPassportNumber(app.traveler?.passportNumber);
  const assignedAgent = app.assignedAgent || 'Intake Queue (Unassigned)';

  let subject = `EasyTravel Admin | Notification Alert — ${ref}`;
  let badge = 'ADMIN ALERT';
  let previewText = '';
  let bodyContent = '';

  switch (event) {
    case 'application_submitted':
      subject = `EasyTravel Admin | New Application Received — ${ref} [${dest}]`;
      badge = 'NEW APPLICATION';
      previewText = `New application ${ref} received from ${name} for ${dest}. Speed: ${speed}.`;
      bodyContent = `
        <p>A new electronic visa dossier has been submitted and registered through the borderless web portal.</p>
        <div class="box">
          <div class="row"><span class="lbl">Application Reference:</span><span class="val">${ref}</span></div>
          <div class="row"><span class="lbl">Customer:</span><span class="val">${name}</span></div>
          <div class="row"><span class="lbl">Customer Email:</span><span class="val">${email}</span></div>
          <div class="row"><span class="lbl">Contact Phone:</span><span class="val">${phone}</span></div>
          <div class="row"><span class="lbl">Destination:</span><span class="val">${dest} [${visa}]</span></div>
          <div class="row"><span class="lbl">SLA Tier:</span><span class="val" style="color: #f59e0b;">${speed}</span></div>
          <div class="row"><span class="lbl">Masked Passport:</span><span class="val">${maskedPassport} (${app.traveler?.nationality || 'N/A'})</span></div>
          <div class="row"><span class="lbl">Submission Timestamp:</span><span class="val">${submitDate}</span></div>
          <div class="row"><span class="lbl">Current Status:</span><span class="val" style="color: #38bdf8;">Ready for Review</span></div>
          <div class="row"><span class="lbl">Assigned Officer:</span><span class="val">${assignedAgent}</span></div>
        </div>
        <p><strong>Required Administrative Action:</strong> Access the EasyTravel Admin Dashboard to conduct the side-by-side OCR passport verification and assign to consular lodgement queue.</p>
        <p style="text-align: center;">
          <a href="https://easytravels.bh/admin/dashboard" class="cta-btn">Open Consular Command Center &rarr;</a>
        </p>
      `;
      break;

    case 'application_confirmed':
      subject = `EasyTravel Admin | Application Confirmed Alert — ${ref}`;
      badge = 'CONFIRMED';
      previewText = `Application ${ref} confirmed. Payment settled, awaiting lodgement review.`;
      bodyContent = `
        <p>Payment settlement confirmed for dossier <strong>${ref}</strong>.</p>
        <div class="box">
          <div class="row"><span class="lbl">Reference:</span><span class="val">${ref}</span></div>
          <div class="row"><span class="lbl">Customer:</span><span class="val">${name} (${email})</span></div>
          <div class="row"><span class="lbl">Destination:</span><span class="val">${dest}</span></div>
          <div class="row"><span class="lbl">Paid Amount:</span><span class="val" style="color: #10b981;">$${app.payment?.amountUSD || 0} (Txn: ${app.payment?.transactionId || 'N/A'})</span></div>
          <div class="row"><span class="lbl">Assigned Queue:</span><span class="val">${assignedAgent}</span></div>
        </div>
        <p>Please ensure document verification SLA is met.</p>
        <p style="text-align: center;"><a href="https://easytravels.bh/admin/dashboard" class="cta-btn">Review in Admin Portal &rarr;</a></p>
      `;
      break;

    case 'documents_pending':
      subject = `EasyTravel Admin | Pending Documents Alert — ${ref}`;
      badge = 'DOCS PENDING';
      previewText = `Dossier ${ref} placed on hold: awaiting customer document re-upload.`;
      bodyContent = `
        <p>Dossier <strong>${ref}</strong> has been tagged as requiring customer document re-upload.</p>
        <div class="box">
          <div class="row"><span class="lbl">Reference:</span><span class="val">${ref}</span></div>
          <div class="row"><span class="lbl">Applicant:</span><span class="val">${name}</span></div>
          <div class="row"><span class="lbl">Pending Requirement:</span><span class="val" style="color: #f59e0b;">${extraNote || 'Missing/Illegible Document'}</span></div>
          <div class="row"><span class="lbl">Handling Officer:</span><span class="val">${assignedAgent}</span></div>
        </div>
        <p>Automated instructions have been dispatched to the customer.</p>
      `;
      break;

    case 'ready_for_review':
      subject = `EasyTravel Admin | Review Queue Notification — ${ref}`;
      badge = 'QUEUE ALERT';
      previewText = `Dossier ${ref} is queued and ready for adjudicator review.`;
      bodyContent = `
        <p>Application <strong>${ref}</strong> is queued in the Verifier Inbox.</p>
        <div class="box">
          <div class="row"><span class="lbl">Dossier:</span><span class="val">${ref}</span></div>
          <div class="row"><span class="lbl">Applicant:</span><span class="val">${name}</span></div>
          <div class="row"><span class="lbl">Destination:</span><span class="val">${dest}</span></div>
          <div class="row"><span class="lbl">OCR Status:</span><span class="val" style="color: #10b981;">Edge Verified (${app.ocrData?.overallConfidence || 95}%)</span></div>
        </div>
        <p style="text-align: center;"><a href="https://easytravels.bh/admin/dashboard" class="cta-btn">Inspect in Verifier Queue &rarr;</a></p>
      `;
      break;

    case 'under_review':
      subject = `EasyTravel Admin | Processing Notification: Under Review — ${ref}`;
      badge = 'UNDER REVIEW';
      previewText = `Dossier ${ref} status transitioned to Under Review by ${assignedAgent}.`;
      bodyContent = `
        <p>Dossier <strong>${ref}</strong> has been assigned and is actively under review.</p>
        <div class="box">
          <div class="row"><span class="lbl">Reference:</span><span class="val">${ref}</span></div>
          <div class="row"><span class="lbl">Client:</span><span class="val">${name}</span></div>
          <div class="row"><span class="lbl">Reviewing Officer:</span><span class="val">${assignedAgent}</span></div>
          ${extraNote ? `<div class="row"><span class="lbl">Internal Note:</span><span class="val">${extraNote}</span></div>` : ''}
        </div>
      `;
      break;

    case 'additional_information_requested':
      subject = `EasyTravel Admin | Action Required Alert: Info Requested — ${ref}`;
      badge = 'ACTION REQUIRED';
      previewText = `Additional information requested from ${name} on application ${ref}.`;
      bodyContent = `
        <p>Consular officer flagged application <strong>${ref}</strong> for additional client details.</p>
        <div class="box">
          <div class="row"><span class="lbl">Reference:</span><span class="val">${ref}</span></div>
          <div class="row"><span class="lbl">Applicant:</span><span class="val">${name}</span></div>
          <div class="row"><span class="lbl">Information Requested:</span><span class="val" style="color: #ef4444;">${extraNote || 'Itinerary / Accommodation details'}</span></div>
        </div>
      `;
      break;

    case 'processing':
      subject = `EasyTravel Admin | Processing Status Update: Gov Lodged — ${ref}`;
      badge = 'GOV LODGED';
      previewText = `Dossier ${ref} has been lodged with the ${dest} government portal.`;
      bodyContent = `
        <p>Application <strong>${ref}</strong> has been transmitted to destination immigration authority.</p>
        <div class="box">
          <div class="row"><span class="lbl">Reference:</span><span class="val">${ref}</span></div>
          <div class="row"><span class="lbl">Destination:</span><span class="val">${dest}</span></div>
          <div class="row"><span class="lbl">Gov Ref:</span><span class="val">${app.governmentReference || 'Awaiting API Receipt'}</span></div>
          <div class="row"><span class="lbl">Officer:</span><span class="val">${assignedAgent}</span></div>
        </div>
      `;
      break;

    case 'completed':
      subject = `EasyTravel Admin | Application Completed Alert — ${ref}`;
      badge = 'COMPLETED';
      previewText = `Visa grant issued for dossier ${ref} (${name}). Application completed.`;
      bodyContent = `
        <p>Application <strong>${ref}</strong> has been successfully completed and approved!</p>
        <div class="box">
          <div class="row"><span class="lbl">Reference:</span><span class="val">${ref}</span></div>
          <div class="row"><span class="lbl">Applicant:</span><span class="val">${name}</span></div>
          <div class="row"><span class="lbl">Destination:</span><span class="val">${dest}</span></div>
          <div class="row"><span class="lbl">Visa Grant ID:</span><span class="val" style="color: #10b981;">${app.visaGrantNumber || 'GRANT-ISSUED'}</span></div>
        </div>
      `;
      break;

    case 'rejected':
      subject = `EasyTravel Admin | Rejection Notification — ${ref}`;
      badge = 'REJECTED';
      previewText = `Application ${ref} was rejected by authority. Audit log updated.`;
      bodyContent = `
        <p>Notice of immigration refusal logged for application <strong>${ref}</strong>.</p>
        <div class="box">
          <div class="row"><span class="lbl">Reference:</span><span class="val">${ref}</span></div>
          <div class="row"><span class="lbl">Applicant:</span><span class="val">${name}</span></div>
          <div class="row"><span class="lbl">Refusal Reason:</span><span class="val" style="color: #ef4444;">${extraNote || app.rejectionReason || 'Authority discretion'}</span></div>
          <div class="row"><span class="lbl">Closing Officer:</span><span class="val">${assignedAgent}</span></div>
        </div>
      `;
      break;

    case 'cancelled':
      subject = `EasyTravel Admin | Cancellation Alert — ${ref}`;
      badge = 'CANCELLED';
      previewText = `Application ${ref} has been cancelled.`;
      bodyContent = `
        <p>Application <strong>${ref}</strong> was marked as cancelled.</p>
        <div class="box">
          <div class="row"><span class="lbl">Reference:</span><span class="val">${ref}</span></div>
          <div class="row"><span class="lbl">Applicant:</span><span class="val">${name}</span></div>
          <div class="row"><span class="lbl">Reason:</span><span class="val">${extraNote || 'Client request'}</span></div>
        </div>
      `;
      break;

    default:
      subject = `EasyTravel Admin | Status Transition: ${ref}`;
      badge = 'AUDIT';
      previewText = `Application ${ref} moved to ${app.status}.`;
      bodyContent = `<p>Application ${ref} status transitioned to ${app.status}.</p>`;
  }

  const htmlBody = wrapAdminEmailHtml(subject, badge, bodyContent);
  return { subject, badge, previewText, htmlBody };
}

// -------------------------------------------------------------
// CORE EVENT NOTIFICATION ORCHESTRATOR WITH DEDUPLICATION
// -------------------------------------------------------------

export function generateEventNotifications(
  event: NotificationEvent,
  app: any,
  existingHistory: NotificationRecord[] = [],
  options?: {
    recipients?: NotificationRecipientConfig;
    triggers?: NotificationTriggerConfig[];
    note?: string;
  }
): {
  customerNotification?: NotificationRecord;
  adminNotifications: NotificationRecord[];
  duplicatesPrevented: number;
} {
  const recipients = options?.recipients || loadRecipientConfig();
  const triggers = options?.triggers || loadTriggerConfigs();
  const triggerSetting = triggers.find((t) => t.event === event);

  let duplicatesPrevented = 0;
  let customerNotification: NotificationRecord | undefined;
  const adminNotifications: NotificationRecord[] = [];

  const now = new Date().toISOString();
  const ref = app.id || `ET-${Date.now()}`;
  const statusSnapshot = app.status || event;

  // 1. Customer Notification (if enabled for this event)
  if (triggerSetting?.customerEnabled !== false && app.clientEmail) {
    const dedupKey = `${ref}:${event}:${app.clientEmail.toLowerCase()}:${statusSnapshot}`;
    if (isDuplicateNotification(existingHistory, dedupKey)) {
      duplicatesPrevented += 1;
    } else {
      const { subject, previewText, htmlBody } = buildCustomerEmailContent(event, app, options?.note);
      customerNotification = {
        id: `notif-cust-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        applicationId: ref,
        recipientEmail: app.clientEmail,
        recipientName: app.clientName || 'Valued Traveler',
        recipientType: 'customer',
        notificationEvent: event,
        subject,
        deliveryStatus: 'Sent', // In dev mode, marked simulated Sent
        providerMessageId: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        attemptCount: 1,
        maxAttempts: 3,
        createdAt: now,
        sentAt: now,
        lastAttemptAt: now,
        previewText,
        htmlBody,
        dedupKey,
        destinationName: app.destinationName || 'Destination',
        visaCategory: app.visaType || 'eVisa',
        statusSnapshot,
      };
    }
  }

  // 2. Administrator Notification(s) (if enabled for this event)
  if (triggerSetting?.adminEnabled !== false) {
    // Gather intended admin recipients
    const adminTargets: { email: string; name: string }[] = [];

    // Primary admin
    if (recipients.primaryAdminEmail) {
      adminTargets.push({
        email: recipients.primaryAdminEmail,
        name: 'Easy Travels Operations Queue',
      });
    }

    // Applications team for intake events
    if (recipients.applicationsTeamEmail && (event === 'application_submitted' || event === 'application_confirmed' || event === 'ready_for_review')) {
      adminTargets.push({
        email: recipients.applicationsTeamEmail,
        name: 'Easy Travels Applications Triage',
      });
    }

    // Secondary admin if configured
    if (recipients.secondaryAdminEmail && event === 'application_submitted') {
      adminTargets.push({
        email: recipients.secondaryAdminEmail,
        name: 'Easy Travels Executive Desk',
      });
    }

    // Dispatch to unique admin targets
    const uniqueTargets = adminTargets.filter(
      (tgt, idx, self) => idx === self.findIndex((t) => t.email.toLowerCase() === tgt.email.toLowerCase())
    );

    for (const target of uniqueTargets) {
      const dedupKey = `${ref}:${event}:${target.email.toLowerCase()}:${statusSnapshot}`;
      if (isDuplicateNotification(existingHistory, dedupKey)) {
        duplicatesPrevented += 1;
      } else {
        const { subject, previewText, htmlBody } = buildAdminEmailContent(event, app, options?.note);
        adminNotifications.push({
          id: `notif-adm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          applicationId: ref,
          recipientEmail: target.email,
          recipientName: target.name,
          recipientType: 'admin',
          notificationEvent: event,
          subject,
          deliveryStatus: 'Sent',
          providerMessageId: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          attemptCount: 1,
          maxAttempts: 3,
          createdAt: now,
          sentAt: now,
          lastAttemptAt: now,
          previewText,
          htmlBody,
          dedupKey,
          destinationName: app.destinationName || 'Destination',
          visaCategory: app.visaType || 'eVisa',
          statusSnapshot,
        });
      }
    }
  }

  return { customerNotification, adminNotifications, duplicatesPrevented };
}

// -------------------------------------------------------------
// RETRY FAILED NOTIFICATION HELPER
// -------------------------------------------------------------

export function retryNotificationRecord(record: NotificationRecord): NotificationRecord {
  const nextAttempts = record.attemptCount + 1;
  const now = new Date().toISOString();
  
  // Simulate retry success if under max attempts
  const isSuccess = nextAttempts <= record.maxAttempts;

  return {
    ...record,
    attemptCount: nextAttempts,
    lastAttemptAt: now,
    sentAt: isSuccess ? now : record.sentAt,
    deliveryStatus: isSuccess ? 'Sent' : 'Failed',
    failureReason: isSuccess ? undefined : 'Maximum delivery attempts exceeded. SMTP connection timed out.',
    providerMessageId: isSuccess ? `msg_retry_${Date.now()}_${Math.random().toString(36).substring(7)}` : undefined,
  };
}

// -------------------------------------------------------------
// BACKWARD-COMPATIBILITY EXPORTS (Preserves existing imports)
// -------------------------------------------------------------

export function generateCustomerSubmissionEmail(app: any): DispatchedEmail {
  const { customerNotification } = generateEventNotifications('application_submitted', app);
  return customerNotification || ({} as any);
}

export function generateAdminSubmissionNotificationEmail(app: any): DispatchedEmail {
  const { adminNotifications } = generateEventNotifications('application_submitted', app);
  return adminNotifications[0] || ({} as any);
}

export function generateStatusUpdateEmail(
  app: any,
  newStatus: string,
  extraNote?: string
): { customerEmail: DispatchedEmail; adminEmail: DispatchedEmail } {
  // Map status string to NotificationEvent
  let event: NotificationEvent = 'ready_for_review';
  const s = newStatus.toLowerCase();
  if (s.includes('submit')) event = 'application_submitted';
  else if (s.includes('confirm')) event = 'application_confirmed';
  else if (s.includes('doc') || s.includes('pending doc')) event = 'documents_pending';
  else if (s.includes('ready')) event = 'ready_for_review';
  else if (s.includes('under review')) event = 'under_review';
  else if (s.includes('action') || s.includes('information')) event = 'additional_information_requested';
  else if (s.includes('processing') || s.includes('government')) event = 'processing';
  else if (s.includes('approved') || s.includes('delivered') || s.includes('completed')) event = 'completed';
  else if (s.includes('reject')) event = 'rejected';
  else if (s.includes('cancel') || s.includes('refund')) event = 'cancelled';

  const { customerNotification, adminNotifications } = generateEventNotifications(
    event,
    { ...app, status: newStatus },
    [],
    { note: extraNote }
  );

  return {
    customerEmail: customerNotification || ({} as any),
    adminEmail: adminNotifications[0] || ({} as any),
  };
}

export function dispatchApplicationEmail(params: {
  type: 'customer' | 'admin' | 'admin_alert';
  recipientEmail: string;
  recipientName: string;
  applicationId: string;
  subject: string;
  headline: string;
  bodyParagraphs: string[];
  actionUrl?: string;
  actionText?: string;
}): DispatchedEmail {
  const now = new Date().toISOString();
  const htmlBody = `
    <!DOCTYPE html>
    <html><head><meta charset="utf-8"></head>
    <body style="font-family: sans-serif; background: #f8fafc; color: #1e293b; padding: 24px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0;">
        <h2 style="color: #CF3126; margin-top: 0;">${params.headline}</h2>
        ${params.bodyParagraphs.map((p) => `<p style="line-height: 1.6; font-size: 13px; color: #334155;">${p}</p>`).join('')}
        ${params.actionUrl ? `<p style="margin-top: 24px;"><a href="${params.actionUrl}" style="background: #0f172a; color: white; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px;">${params.actionText || 'View Details'}</a></p>` : ''}
        <p style="font-size: 11px; color: #94a3b8; margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 12px;">Easy Travels (Bahrain) W.L.L. &bull; Consular Logistics Service</p>
      </div>
    </body>
    </html>
  `;

  return {
    id: `notif-disp-${Date.now()}`,
    applicationId: params.applicationId,
    recipientEmail: params.recipientEmail,
    recipientName: params.recipientName,
    recipientType: params.type === 'customer' ? 'customer' : 'admin',
    notificationEvent: 'application_submitted',
    subject: params.subject,
    deliveryStatus: 'Sent',
    providerMessageId: `msg_${Date.now()}`,
    attemptCount: 1,
    maxAttempts: 3,
    createdAt: now,
    sentAt: now,
    previewText: params.headline,
    htmlBody,
    dedupKey: `${params.applicationId}:custom:${params.recipientEmail}`,
    destinationName: 'Staff Portal',
    visaCategory: 'Internal Onboarding',
    statusSnapshot: 'Active',
  };
}
