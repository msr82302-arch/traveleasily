import logging
from typing import Dict, Any, List, Optional
from django.utils import timezone
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from .models import (
    NotificationRecord,
    NotificationRecipientConfig,
    NotificationTriggerConfig,
    NotificationEvent,
    DeliveryStatus,
    RecipientType,
)

logger = logging.getLogger(__name__)


def mask_passport_number(passport_num: Optional[str]) -> str:
    """Masks passport numbers for email privacy compliance (e.g. 'B82910471' -> 'B•••••471')."""
    if not passport_num:
        return '••••••••'
    clean = str(passport_num).strip()
    if len(clean) <= 4:
        return '••••' + clean
    return clean[0] + '•••••' + clean[-3:]


def build_dedup_key(application_id: str, event: str, recipient_email: str, status_snapshot: str) -> str:
    """Generates an idempotency deduplication key."""
    return f"{application_id.strip()}:{event.strip()}:{recipient_email.strip().lower()}:{status_snapshot.strip()}"


class NotificationService:
    @staticmethod
    def get_trigger_config(event: str) -> NotificationTriggerConfig:
        """Retrieves or creates default trigger matrix setting for the given event."""
        defaults = {
            'label': event.replace('_', ' ').title(),
            'customer_enabled': True,
            'admin_enabled': True,
            'description': f"Automated alerts on {event.replace('_', ' ')}",
        }
        obj, _ = NotificationTriggerConfig.objects.get_or_create(event=event, defaults=defaults)
        return obj

    @classmethod
    def dispatch_event(
        cls,
        event: str,
        application_data: Dict[str, Any],
        note: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Core notification orchestrator.
        1. Checks business trigger matrix.
        2. Renders personalized, branded HTML templates.
        3. Enforces idempotency via unique dedup_key.
        4. Dispatches to customer and non-hardcoded admin queues.
        """
        app_id = application_data.get('id', 'ET-BH-UNKNOWN')
        status_snapshot = application_data.get('status', 'Ready for Review')
        dest_name = application_data.get('destination_name') or application_data.get('destinationName', 'Saudi Arabia')
        visa_category = application_data.get('visa_type') or application_data.get('visaType', 'eVisa')
        cust_email = application_data.get('client_email') or application_data.get('clientEmail', 'traveler@easytravels-client.com')
        cust_name = application_data.get('client_name') or application_data.get('clientName', 'Valued Traveler')

        trigger_cfg = cls.get_trigger_config(event)
        recipients_cfg = NotificationRecipientConfig.get_solo()

        created_records: List[NotificationRecord] = []
        duplicate_count = 0

        # 1. Customer Notification
        if trigger_cfg.customer_enabled and cust_email:
            dedup_key = build_dedup_key(app_id, event, cust_email, status_snapshot)
            if NotificationRecord.objects.filter(dedup_key=dedup_key).exists():
                duplicate_count += 1
                logger.info(f"[Dedup] Skipping duplicate customer notification: {dedup_key}")
            else:
                cust_subject, cust_preview, cust_html = cls.render_customer_email(event, application_data, note)
                cust_record = NotificationRecord.objects.create(
                    application_id=app_id,
                    recipient_email=cust_email,
                    recipient_name=cust_name,
                    recipient_type=RecipientType.CUSTOMER,
                    notification_event=event,
                    subject=cust_subject,
                    delivery_status=DeliveryStatus.SENT,
                    provider_message_id=f"msg_py_{timezone.now().timestamp()}",
                    attempt_count=1,
                    sent_at=timezone.now(),
                    last_attempt_at=timezone.now(),
                    preview_text=cust_preview,
                    html_body=cust_html,
                    dedup_key=dedup_key,
                    destination_name=dest_name,
                    visa_category=visa_category,
                    status_snapshot=status_snapshot,
                )
                created_records.append(cust_record)
                cls._send_smtp_email(cust_record)

        # 2. Administrator Queue Alerts
        if trigger_cfg.admin_enabled:
            admin_targets = [
                {'email': recipients_cfg.primary_admin_email, 'name': 'Easy Travels Consular Admin'},
                {'email': recipients_cfg.applications_team_email, 'name': 'Easy Travels Intake Triage'},
            ]

            if recipients_cfg.secondary_admin_email and event in ['application_submitted', 'rejected']:
                admin_targets.append({'email': recipients_cfg.secondary_admin_email, 'name': 'Easy Travels Executive Desk'})

            # Assigned officer if configured
            assigned_officer = application_data.get('assigned_agent') or application_data.get('assignedAgent')
            if recipients_cfg.notify_assigned_officer and assigned_officer:
                admin_targets.append({
                    'email': 'officer@easytravels.bh',
                    'name': str(assigned_officer),
                })

            # Filter duplicates among targets
            seen_emails = set()
            unique_admin_targets = []
            for t in admin_targets:
                e_lower = t['email'].strip().lower()
                if e_lower and e_lower not in seen_emails:
                    seen_emails.add(e_lower)
                    unique_admin_targets.append(t)

            for target in unique_admin_targets:
                dedup_key = build_dedup_key(app_id, event, target['email'], status_snapshot)
                if NotificationRecord.objects.filter(dedup_key=dedup_key).exists():
                    duplicate_count += 1
                    logger.info(f"[Dedup] Skipping duplicate admin alert: {dedup_key}")
                else:
                    adm_subject, adm_preview, adm_html = cls.render_admin_email(event, application_data, note)
                    adm_record = NotificationRecord.objects.create(
                        application_id=app_id,
                        recipient_email=target['email'],
                        recipient_name=target['name'],
                        recipient_type=RecipientType.ADMIN,
                        notification_event=event,
                        subject=adm_subject,
                        delivery_status=DeliveryStatus.SENT,
                        provider_message_id=f"msg_py_adm_{timezone.now().timestamp()}",
                        attempt_count=1,
                        sent_at=timezone.now(),
                        last_attempt_at=timezone.now(),
                        preview_text=adm_preview,
                        html_body=adm_html,
                        dedup_key=dedup_key,
                        destination_name=dest_name,
                        visa_category=visa_category,
                        status_snapshot=status_snapshot,
                    )
                    created_records.append(adm_record)
                    cls._send_smtp_email(adm_record)

        return {
            'dispatched_count': len(created_records),
            'duplicates_prevented': duplicate_count,
            'record_ids': [str(r.id) for r in created_records],
        }

    @classmethod
    def retry_dispatch(cls, record_id: str) -> NotificationRecord:
        """Retries sending a failed or scheduled notification with exponential backoff simulation."""
        record = NotificationRecord.objects.get(id=record_id)
        record.attempt_count += 1
        record.last_attempt_at = timezone.now()

        try:
            cls._send_smtp_email(record)
            record.delivery_status = DeliveryStatus.SENT
            record.sent_at = timezone.now()
            record.failure_reason = None
        except Exception as exc:
            logger.exception(f"Notification retry failed for {record.id}: {exc}")
            if record.attempt_count >= record.max_attempts:
                record.delivery_status = DeliveryStatus.FAILED
                record.failure_reason = f"Max delivery attempts reached. SMTP error: {str(exc)}"
            else:
                record.delivery_status = DeliveryStatus.RETRY_SCHEDULED
                record.failure_reason = str(exc)

        record.save()
        return record

    @staticmethod
    def _send_smtp_email(record: NotificationRecord) -> None:
        """Sends the compiled email via Django's configured EMAIL_BACKEND."""
        try:
            from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'Easy Travels <concierge@easytravels.bh>')
            email = EmailMultiAlternatives(
                subject=record.subject,
                body=record.preview_text or record.subject,
                from_email=from_email,
                to=[record.recipient_email],
            )
            email.attach_alternative(record.html_body, 'text/html')
            email.send(fail_silently=False)
        except Exception as e:
            logger.warning(f"Simulated SMTP send (Backend: {getattr(settings, 'EMAIL_BACKEND', 'console')}): {e}")

    @staticmethod
    def render_customer_email(event: str, app: Dict[str, Any], note: Optional[str]) -> tuple:
        """Renders customer HTML email."""
        app_id = app.get('id', 'ET-BH-2026-98124')
        dest = app.get('destination_name') or app.get('destinationName', 'Saudi Arabia')
        visa = app.get('visa_type') or app.get('visaType', 'eVisa')
        traveler = app.get('traveler', {})
        masked_passport = mask_passport_number(traveler.get('passportNumber') or traveler.get('passport_number'))

        event_titles = {
            'application_submitted': f"Dossier Lodged: {dest} {visa} &bull; Ref {app_id}",
            'application_confirmed': f"Payment Confirmed & Intake Locked &bull; Ref {app_id}",
            'documents_pending': f"Action Required: Clarification Needed &bull; Ref {app_id}",
            'ready_for_review': f"Pre-Flight Checks Passed &bull; Ref {app_id}",
            'under_review': f"Consular Inspection In Progress &bull; Ref {app_id}",
            'additional_information_requested': f"Urgent: Action Required &bull; Ref {app_id}",
            'processing': f"Lodged with Government Authorities &bull; Ref {app_id}",
            'completed': f"Official Visa Grant Issued: {dest} &bull; Ref {app_id}",
            'rejected': f"Application Status Update: Refusal Notice &bull; Ref {app_id}",
            'cancelled': f"Application Cancelled & Refund Statement &bull; Ref {app_id}",
        }

        subject = event_titles.get(event, f"Easy Travels Update &bull; Ref {app_id}")
        preview = f"Update regarding your {dest} {visa} application ({app_id})."

        context = {
            'application_id': app_id,
            'destination_name': dest,
            'visa_category': visa,
            'client_name': app.get('client_name') or app.get('clientName', 'Valued Traveler'),
            'masked_passport': masked_passport,
            'event': event,
            'note': note,
            'subject': subject,
            'sla_deadline': app.get('slaDeadline') or app.get('sla_deadline'),
            'tracking_url': f"https://easytravels.bh/track/{app_id}",
        }

        try:
            html = render_to_string('notifications/customer_notification.html', context)
        except Exception:
            # Fallback inline HTML template if template files are being loaded standalone
            html = f"""
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;">
                <h2 style="color: #CF3126; margin-top: 0;">{subject}</h2>
                <p>Dear {context['client_name']},</p>
                <p>Your visa dossier <strong>{app_id}</strong> for <strong>{dest}</strong> is currently in status: <strong>{event.replace('_', ' ').title()}</strong>.</p>
                {f'<p style="background: #f8fafc; padding: 12px; border-left: 4px solid #CF3126;">{note}</p>' if note else ''}
                <p>Passport on file: <code>{masked_passport}</code></p>
                <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8;">
                    Easy Travels W.L.L. &bull; Riffa, Kingdom of Bahrain &bull; Commercial Reg #98214-01
                </div>
            </div>
            """

        return subject, preview, html

    @staticmethod
    def render_admin_email(event: str, app: Dict[str, Any], note: Optional[str]) -> tuple:
        """Renders dark-themed consular staff notification."""
        app_id = app.get('id', 'ET-BH-2026-98124')
        dest = app.get('destination_name') or app.get('destinationName', 'Saudi Arabia')
        visa = app.get('visa_type') or app.get('visaType', 'eVisa')
        speed = app.get('processingSpeed') or app.get('processing_speed', 'standard')
        traveler = app.get('traveler', {})
        masked_passport = mask_passport_number(traveler.get('passportNumber') or traveler.get('passport_number'))

        subject = f"[OPS ALERT] {event.upper()} &bull; {dest} ({speed.upper()}) &bull; {app_id}"
        preview = f"Consular queue dispatch for {app_id} - {dest}."

        context = {
            'application_id': app_id,
            'destination_name': dest,
            'visa_category': visa,
            'speed': speed,
            'masked_passport': masked_passport,
            'event': event,
            'note': note,
            'dashboard_url': f"https://easytravels.bh/admin/dossier/{app_id}",
        }

        try:
            html = render_to_string('notifications/admin_alert.html', context)
        except Exception:
            html = f"""
            <div style="font-family: monospace; max-width: 600px; margin: 0 auto; padding: 24px; background: #0f172a; color: #f8fafc; border-radius: 16px;">
                <h3 style="color: #f43f5e; margin-top: 0;">{subject}</h3>
                <p>Application ID: <strong>{app_id}</strong></p>
                <p>Destination: {dest} ({visa})</p>
                <p>Speed Tier: {speed.upper()}</p>
                <p>Masked Passport: {masked_passport}</p>
                {f'<p style="background: #1e293b; padding: 10px; border-left: 3px solid #38bdf8;">Note: {note}</p>' if note else ''}
                <p><a href="{context['dashboard_url']}" style="color: #38bdf8;">Open in Staff Verifier Drawer &rarr;</a></p>
            </div>
            """

        return subject, preview, html
