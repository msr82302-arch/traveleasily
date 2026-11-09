import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _


class NotificationEvent(models.TextChoices):
    APPLICATION_SUBMITTED = 'application_submitted', _('Application Submitted')
    APPLICATION_CONFIRMED = 'application_confirmed', _('Application Confirmed')
    DOCUMENTS_PENDING = 'documents_pending', _('Documents Pending')
    READY_FOR_REVIEW = 'ready_for_review', _('Ready for Review')
    UNDER_REVIEW = 'under_review', _('Under Review')
    ADDITIONAL_INFORMATION_REQUESTED = 'additional_information_requested', _('Additional Information Requested')
    PROCESSING = 'processing', _('Processing with Government')
    COMPLETED = 'completed', _('Completed / Approved')
    REJECTED = 'rejected', _('Rejected by Authority')
    CANCELLED = 'cancelled', _('Cancelled & Refunded')


class DeliveryStatus(models.TextChoices):
    PENDING = 'Pending', _('Pending')
    PROCESSING = 'Processing', _('Processing')
    SENT = 'Sent', _('Sent (250 OK)')
    FAILED = 'Failed', _('Failed')
    RETRY_SCHEDULED = 'Retry Scheduled', _('Retry Scheduled')


class RecipientType(models.TextChoices):
    CUSTOMER = 'customer', _('Customer')
    ADMIN = 'admin', _('Administrator / Staff')
    OFFICER = 'officer', _('Assigned Consular Officer')


class NotificationRecord(models.Model):
    """
    Persistent audit ledger of all transactional emails dispatched
    by Easy Travels. Strictly adheres to PII masking and idempotency deduplication.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application_id = models.CharField(max_length=64, db_index=True, help_text=_("Application Ref ID e.g. ET-BH-2026-XXXXX"))
    recipient_email = models.EmailField(max_length=254, db_index=True)
    recipient_name = models.CharField(max_length=255)
    recipient_type = models.CharField(max_length=20, choices=RecipientType.choices, default=RecipientType.CUSTOMER)
    notification_event = models.CharField(max_length=64, choices=NotificationEvent.choices, db_index=True)
    subject = models.CharField(max_length=255)
    delivery_status = models.CharField(max_length=32, choices=DeliveryStatus.choices, default=DeliveryStatus.PENDING, db_index=True)
    provider_message_id = models.CharField(max_length=128, blank=True, null=True, help_text=_("SMTP or API provider message ID (e.g. SES/Sendgrid)"))
    attempt_count = models.PositiveSmallIntegerField(default=1)
    max_attempts = models.PositiveSmallIntegerField(default=3)
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    last_attempt_at = models.DateTimeField(null=True, blank=True)
    failure_reason = models.TextField(blank=True, null=True)

    preview_text = models.CharField(max_length=255, blank=True)
    html_body = models.TextField()
    dedup_key = models.CharField(max_length=255, unique=True, db_index=True, help_text=_("Composite key: ref:event:recipient:status to prevent duplicate dispatches"))

    destination_name = models.CharField(max_length=128, default='Saudi Arabia')
    visa_category = models.CharField(max_length=64, default='eVisa')
    status_snapshot = models.CharField(max_length=64, default='Ready for Review')

    class Meta:
        db_table = 'easytravels_notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['application_id', 'notification_event']),
            models.Index(fields=['recipient_email', 'delivery_status']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"[{self.delivery_status}] {self.application_id} - {self.notification_event} -> {self.recipient_email}"


class NotificationRecipientConfig(models.Model):
    """
    Dynamic administrative email routing configuration.
    Configured via the Easy Travels Super Admin dashboard to avoid hardcoded email addresses.
    """
    singleton_id = models.IntegerField(default=1, unique=True)
    primary_admin_email = models.EmailField(default='admin@easytravels.bh', help_text=_("Primary supervisory inbox"))
    secondary_admin_email = models.EmailField(default='operations@easytravels.bh', blank=True, help_text=_("Executive desk"))
    applications_team_email = models.EmailField(default='applications@easytravels.bh', help_text=_("Triage and intake queue"))
    consular_department_email = models.EmailField(default='consular@easytravels.bh', blank=True)
    finance_department_email = models.EmailField(default='finance@easytravels.bh', blank=True)
    qa_department_email = models.EmailField(default='qa@easytravels.bh', blank=True)
    notify_assigned_officer = models.BooleanField(default=True, help_text=_("Automatically CC or dispatch directly to assigned visa officer"))
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'easytravels_notification_recipients'

    def save(self, *args, **kwargs):
        self.singleton_id = 1
        super().save(*args, **kwargs)

    @classmethod
    def get_solo(cls):
        obj, _ = cls.objects.get_or_create(singleton_id=1)
        return obj


class NotificationTriggerConfig(models.Model):
    """
    Matrix of active triggers for each of the 10 application lifecycle events.
    Controls whether customers, admins, or both are notified on each event.
    """
    event = models.CharField(max_length=64, choices=NotificationEvent.choices, unique=True)
    label = models.CharField(max_length=128)
    customer_enabled = models.BooleanField(default=True)
    admin_enabled = models.BooleanField(default=True)
    description = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'easytravels_notification_triggers'
        ordering = ['event']

    def __str__(self):
        return f"{self.label} (Customer: {self.customer_enabled}, Admin: {self.admin_enabled})"
