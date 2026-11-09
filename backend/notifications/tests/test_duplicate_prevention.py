from django.test import TestCase
from notifications.models import (
    NotificationRecord,
    NotificationEvent,
    RecipientType,
)
from notifications.services import NotificationService, build_dedup_key


class DuplicatePreventionTests(TestCase):
    def setUp(self):
        self.sample_app = {
            'id': 'ET-BH-2026-DEDUP-88',
            'client_name': 'Fatima Al-Zayani',
            'client_email': 'fatima@domain.com',
            'destination_name': 'Saudi Arabia',
            'visa_type': 'eVisa',
            'status': 'Ready for Review',
            'processing_speed': 'standard',
            'traveler': {
                'passportNumber': 'B99201824',
                'nationality': 'Bahraini',
            },
        }

    def test_dedup_key_format(self):
        """Validates standard format of the idempotency dedup key."""
        key = build_dedup_key('ET-BH-123', 'ready_for_review', 'user@domain.com', 'Ready for Review')
        self.assertEqual(key, 'ET-BH-123:ready_for_review:user@domain.com:Ready for Review')

    def test_duplicate_dispatch_is_silently_prevented(self):
        """Repeated dispatch for the same event and status does not generate duplicate records."""
        # First dispatch
        res1 = NotificationService.dispatch_event(
            event=NotificationEvent.READY_FOR_REVIEW,
            application_data=self.sample_app,
        )
        self.assertGreater(res1['dispatched_count'], 0)
        self.assertEqual(res1['duplicates_prevented'], 0)

        initial_count = NotificationRecord.objects.filter(
            application_id='ET-BH-2026-DEDUP-88'
        ).count()

        # Second dispatch for identical application and event
        res2 = NotificationService.dispatch_event(
            event=NotificationEvent.READY_FOR_REVIEW,
            application_data=self.sample_app,
        )
        self.assertEqual(res2['dispatched_count'], 0)
        self.assertGreater(res2['duplicates_prevented'], 0)

        # Database record count must be strictly unchanged
        after_count = NotificationRecord.objects.filter(
            application_id='ET-BH-2026-DEDUP-88'
        ).count()
        self.assertEqual(initial_count, after_count)

    def test_status_transition_allows_new_notification(self):
        """Moving to a distinct lifecycle status generates a new notification."""
        # Initial status
        NotificationService.dispatch_event(
            event=NotificationEvent.READY_FOR_REVIEW,
            application_data=self.sample_app,
        )

        # Transition status
        updated_app = {**self.sample_app, 'status': 'Under Review'}
        res = NotificationService.dispatch_event(
            event=NotificationEvent.UNDER_REVIEW,
            application_data=updated_app,
        )

        self.assertGreater(res['dispatched_count'], 0)
        self.assertEqual(res['duplicates_prevented'], 0)
