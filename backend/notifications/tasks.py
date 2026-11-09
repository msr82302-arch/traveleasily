import logging
from celery import shared_task
from .services import NotificationService
from .models import NotificationRecord, DeliveryStatus

logger = logging.getLogger(__name__)


@shared_task(
    bind=True,
    max_retries=3,
    default_retry_delay=60,
    rate_limit='60/m',
)
def async_dispatch_notification_event(self, event: str, application_data: dict, note: str = None):
    """
    Asynchronous background task to process and dispatch lifecycle emails.
    Offloads heavy HTML compilation and SMTP latency from synchronous HTTP requests.
    """
    try:
        logger.info(f"[Celery] Processing async dispatch for {application_data.get('id')} event={event}")
        return NotificationService.dispatch_event(event, application_data, note)
    except Exception as exc:
        logger.error(f"[Celery] Notification dispatch failed: {exc}. Retrying in 60s...")
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=120)
def async_retry_failed_notification(self, record_id: str):
    """
    Asynchronous task to retry failed notifications from the dead letter queue.
    """
    try:
        logger.info(f"[Celery] Retrying notification ID: {record_id}")
        record = NotificationService.retry_dispatch(record_id)
        return {'status': record.delivery_status, 'attempt': record.attempt_count}
    except Exception as exc:
        logger.error(f"[Celery] Retry attempt failed for {record_id}: {exc}")
        raise self.retry(exc=exc)


@shared_task
def sweep_stale_pending_notifications():
    """
    Cron / Celery Beat task: Checks for notifications stuck in 'Pending' or 'Retry Scheduled'
    for longer than 15 minutes and enqueues re-attempts.
    """
    from django.utils import timezone
    from datetime import timedelta

    cutoff = timezone.now() - timedelta(minutes=15)
    stale_records = NotificationRecord.objects.filter(
        delivery_status__in=[DeliveryStatus.PENDING, DeliveryStatus.RETRY_SCHEDULED],
        created_at__lte=cutoff,
        attempt_count__lt=3,
    )

    requeued = 0
    for rec in stale_records:
        async_retry_failed_notification.delay(str(rec.id))
        requeued += 1

    logger.info(f"[Celery Beat] Requeued {requeued} stale pending notifications.")
    return {'requeued': requeued}
