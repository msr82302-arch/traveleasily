import uuid
from django.db import models
from django.utils import timezone


class VisaTypeChoices(models.TextChoices):
    E_VISA = 'eVisa', 'Electronic Visa (eVisa)'
    ETA = 'ETA', 'Electronic Travel Authorization (ETA)'
    VISA_ON_ARRIVAL = 'Visa on Arrival', 'Visa on Arrival Assistance'
    EMBASSY_APPOINTMENT = 'Embassy Appointment', 'Embassy Appointment & Dossier'
    TOURIST_CARD = 'Tourist Card', 'Tourist Card'


class ApplicationStatusChoices(models.TextChoices):
    DRAFT = 'Draft', 'Draft'
    INFORMATION_REQUIRED = 'Information Required', 'Information Required'
    DOCUMENTS_PENDING = 'Documents Pending', 'Documents Pending'
    READY_FOR_REVIEW = 'Ready for Review', 'Ready for Review'
    UNDER_REVIEW = 'Under Review', 'Under Review'
    ADDITIONAL_INFO_REQUESTED = 'Additional Information Requested', 'Additional Information Requested'
    PROCESSING = 'Processing', 'Processing with Government'
    COMPLETED = 'Completed', 'Completed & Approved'
    REJECTED = 'Rejected', 'Rejected'
    CANCELLED = 'Cancelled', 'Cancelled & Refunded'
    # Aliases
    PENDING_REVIEW = 'Pending Review', 'Pending Review'
    APPROVED = 'Approved', 'Approved'
    REFUNDED = 'Refunded', 'Refunded'


class ProcessingSpeedChoices(models.TextChoices):
    STANDARD = 'standard', 'Standard Processing (72 Hours)'
    RUSH = 'rush', 'Rush Processing (24 Hours)'
    SUPER_RUSH = 'super_rush', 'Super Rush Processing (8 Hours)'


class VisaApplication(models.Model):
    id = models.CharField(primary_key=True, max_length=64, help_text="e.g. ET-BH-2026-98421")
    client_id = models.CharField(max_length=64, default='USR-1001')
    client_name = models.CharField(max_length=255)
    client_email = models.EmailField()
    client_phone = models.CharField(max_length=32, blank=True)

    origin_country = models.CharField(max_length=8, default='BH')
    destination_country = models.CharField(max_length=8, default='SA')
    destination_name = models.CharField(max_length=128, default='Saudi Arabia')
    visa_type = models.CharField(max_length=64, choices=VisaTypeChoices.choices, default=VisaTypeChoices.E_VISA)

    status = models.CharField(max_length=64, choices=ApplicationStatusChoices.choices, default=ApplicationStatusChoices.READY_FOR_REVIEW, db_index=True)
    processing_speed = models.CharField(max_length=32, choices=ProcessingSpeedChoices.choices, default=ProcessingSpeedChoices.STANDARD)

    submitted_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    sla_deadline = models.DateTimeField(null=True, blank=True)

    assigned_agent = models.CharField(max_length=255, default='Yousif Mansoor (Senior Visa Officer)')
    visa_grant_number = models.CharField(max_length=64, blank=True, null=True)
    visa_expiry_date = models.DateField(null=True, blank=True)
    government_reference = models.CharField(max_length=64, blank=True, null=True)

    internal_notes = models.JSONField(default=list, blank=True)
    rejection_reason = models.TextField(blank=True, null=True)

    # Embedded structured data
    traveler_data = models.JSONField(default=dict, blank=True)
    itinerary_data = models.JSONField(default=dict, blank=True)
    ocr_data = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = 'easytravels_applications'
        ordering = ['-submitted_at']

    def __str__(self):
        return f"{self.id} - {self.client_name} ({self.destination_name})"


class PaymentRecord(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application = models.OneToOneField(VisaApplication, on_delete=models.CASCADE, related_name='payment')
    amount_usd = models.DecimalField(max_digits=10, decimal_places=2)
    amount_bhd = models.DecimalField(max_digits=10, decimal_places=3)
    currency = models.CharField(max_length=8, default='USD')
    payment_method = models.CharField(max_length=32, default='credit_card')
    status = models.CharField(
        max_length=32,
        choices=[('paid', 'Paid'), ('refunded', 'Refunded'), ('pending', 'Pending')],
        default='paid',
    )
    transaction_id = models.CharField(max_length=128, unique=True)
    paid_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.transaction_id} - ${self.amount_usd} ({self.status})"


class ApplicationDocument(models.Model):
    id = models.CharField(primary_key=True, max_length=64, default=uuid.uuid4)
    application = models.ForeignKey(VisaApplication, on_delete=models.CASCADE, related_name='documents')
    name = models.CharField(max_length=255)
    type = models.CharField(
        max_length=64,
        choices=[
            ('passport_scan', 'Passport Scan'),
            ('photograph', 'Photograph'),
            ('flight_ticket', 'Flight Ticket'),
            ('hotel_voucher', 'Hotel Voucher'),
            ('bank_statement', 'Bank Statement'),
        ],
        default='passport_scan',
    )
    file = models.FileField(upload_to='documents/%Y/%m/%d/', blank=True, null=True)
    file_url = models.URLField(blank=True, null=True)
    uploaded_at = models.DateTimeField(default=timezone.now)
    status = models.CharField(
        max_length=32,
        choices=[('verified', 'Verified'), ('flagged', 'Flagged'), ('pending', 'Pending')],
        default='verified',
    )
    ocr_extracted = models.BooleanField(default=False)
    confidence = models.FloatField(default=95.0)

    def __str__(self):
        return f"{self.name} for {self.application_id}"
