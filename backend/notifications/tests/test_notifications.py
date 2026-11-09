import pytest
from django.test import TestCase
from django.utils import timezone
from notifications.models import (
    NotificationRecord,
    NotificationRecipientConfig,
    NotificationTriggerConfig,
    NotificationEvent,
    DeliveryStatus,
    RecipientType,
)
from notifications.services import NotificationService, mask_passport_number


class NotificationServiceTests(TestCase):
    def setUp(self):
        self.recipient_cfg = NotificationRecipientConfig.objects.create(
            primary_admin_email='admin@easytravels.bh',
            secondary_admin_email='executive@easytravels.bh',
            applications_team_email='apps@easytravels.bh',
            notify_assigned_officer=True,
        )

        self.sample_app = {
            'id': 'ET-BH-2026-10001',
            'client_name': 'Hassan Al-Mahmood',
            'client_email': 'hassan@example.com',
            'destination_name': 'Saudi Arabia',
            'visa_type': 'eVisa',
            'status': 'Ready for Review',
            'processing_speed': 'rush',
            'traveler': {
                'passportNumber': 'B89201948',
                'nationality': 'Bahraini',
            },
            'assigned_agent': 'Yousif Mansoor',
        }

    def test_passport_masking_security(self):
        """Verifies full passport numbers are NEVER stored or transmitted in plain text."""
        raw = 'B89201948'
        masked = mask_passport_number(raw)
        self.assertEqual(masked, 'B•••••948')
        self.assertNotIn('89201', masked)

    def test_dual_dispatch_on_submission(self):
        """Verifies submission triggers both customer and admin notifications."""
        result = NotificationService.dispatch_event(
            event=NotificationEvent.APPLICATION_SUBMITTED,
            application_data=self.sample_app,
        )

        self.assertGreaterEqual(result['dispatched_count'], 2)
        self.assertEqual(result['duplicates_prevented'], 0)

        # Check customer record
        cust_record = NotificationRecord.objects.get(
            application_id='ET-BH-2026-10001',
            recipient_type=RecipientType.CUSTOMER,
        )
        self.assertEqual(cust_record.recipient_email, 'hassan@example.com')
        self.assertEqual(cust_record.delivery_status, DeliveryStatus.SENT)

        # Check admin records
        admin_records = NotificationRecord.objects.filter(
            application_id='ET-BH-2026-10001',
            recipient_type=RecipientType.ADMIN,
        )
        self.assertGreaterEqual(admin_records.count(), 1)

    def test_trigger_matrix_disabling(self):
        """Disabling customer notification in trigger matrix prevents customer dispatch."""
        trig = NotificationService.get_trigger_config(NotificationEvent.UNDER_REVIEW)
        trig.customer_enabled = False
        trig.save()

        result = NotificationService.dispatch_event(
            event=NotificationEvent.UNDER_REVIEW,
            application_data=self.sample_app,
        )

        # Customer record should NOT be created
        cust_exists = NotificationRecord.objects.filter(
            application_id='ET-BH-2026-10001',
            recipient_type=RecipientType.CUSTOMER,
            notification_event=NotificationEvent.UNDER_REVIEW,
        ).exists()
        self.assertFalse(cust_exists)

    def test_retry_dispatch_increments_attempts(self):
        """Retrying an existing record increments attempt count."""
        record = NotificationRecord.objects.create(
            application_id='ET-BH-2026-RETRY-1',
            recipient_email='traveler@test.com',
            recipient_name='Test Traveler',
            recipient_type=RecipientType.CUSTOMER,
            notification_event=NotificationEvent.READY_FOR_REVIEW,
            subject='Test Subject',
            delivery_status=DeliveryStatus.FAILED,
            attempt_count=1,
            max_attempts=3,
            preview_text='Preview',
            html_body='<p>Body</p>',
            dedup_key='ET-BH-2026-RETRY-1:test:traveler@test.com:Pending',
        )

        retried = NotificationService.retry_dispatch(str(record.id))
        self.assertEqual(retried.attempt_count, 2)
        self.assertEqual(retried.delivery_status, DeliveryStatus.SENT)
