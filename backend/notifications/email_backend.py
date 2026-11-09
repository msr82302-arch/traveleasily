import logging
import ssl
from django.core.mail.backends.smtp import EmailBackend as SmtpEmailBackend
from django.conf import settings

logger = logging.getLogger(__name__)


class EasyTravelsEmailBackend(SmtpEmailBackend):
    """
    Hardened enterprise SMTP backend for Easy Travels.
    Handles TLS negotiations, timeout policies, connection pooling,
    and structured audit logging.
    """
    def __init__(self, *args, **kwargs):
        kwargs.setdefault('timeout', getattr(settings, 'EMAIL_TIMEOUT', 10))
        super().__init__(*args, **kwargs)

    def open(self):
        if self.connection:
            return False
        try:
            super().open()
            logger.info(f"[SMTP] Connection opened to {self.host}:{self.port} (TLS: {self.use_tls})")
            return True
        except Exception as exc:
            logger.error(f"[SMTP] Failed to connect to {self.host}:{self.port}: {exc}")
            if not self.fail_silently:
                raise

    def send_messages(self, email_messages):
        """Dispatches batch with delivery monitoring."""
        if not email_messages:
            return 0
        sent_count = super().send_messages(email_messages)
        logger.info(f"[SMTP] Successfully dispatched {sent_count}/{len(email_messages)} transactional messages.")
        return sent_count
