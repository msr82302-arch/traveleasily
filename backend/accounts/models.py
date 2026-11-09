import uuid
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class UserRole(models.TextChoices):
    SUPER_ADMIN = 'super_admin', 'Super Administrator'
    ADMIN = 'admin', 'Administrator'
    CONSULAR_AGENT = 'consular_agent', 'Consular Agent'
    DOCUMENT_VERIFIER = 'document_verifier', 'Document Verifier'
    FINANCE_MANAGER = 'finance_manager', 'Finance Manager'
    CUSTOMER_SUPPORT = 'customer_support', 'Customer Support'
    QA_COMPLIANCE = 'qa_compliance', 'QA & Compliance'
    TRAVELER = 'traveler', 'Traveler / Client'


class StaffProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='staff_profile')
    role = models.CharField(max_length=32, choices=UserRole.choices, default=UserRole.CONSULAR_AGENT)
    department = models.CharField(max_length=64, default='Consular Operations')
    phone = models.CharField(max_length=32, blank=True)
    status = models.CharField(
        max_length=32,
        choices=[
            ('Active', 'Active'),
            ('Suspended', 'Suspended'),
            ('Pending Approval', 'Pending Approval'),
        ],
        default='Active',
    )
    assigned_dossiers_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} ({self.get_role_display()})"


class StaffInvitation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invite_code = models.CharField(max_length=32, unique=True)
    email = models.EmailField()
    role = models.CharField(max_length=32, choices=UserRole.choices, default=UserRole.CONSULAR_AGENT)
    department = models.CharField(max_length=64, default='Consular Operations')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_invitations')
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    used_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Invite for {self.email} ({self.role}) - Code: {self.invite_code}"

    @property
    def is_expired(self):
        return timezone.now() > self.expires_at


class RegistrationRequest(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    full_name = models.CharField(max_length=128)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=32)
    department = models.CharField(max_length=64)
    requested_role = models.CharField(max_length=32, choices=UserRole.choices)
    reason = models.TextField()
    status = models.CharField(
        max_length=32,
        choices=[
            ('Pending Approval', 'Pending Approval'),
            ('Approved', 'Approved'),
            ('Rejected', 'Rejected'),
        ],
        default='Pending Approval',
    )
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_registrations')

    class Meta:
        ordering = ['-submitted_at']

    def __str__(self):
        return f"{self.full_name} ({self.email}) - {self.status}"
