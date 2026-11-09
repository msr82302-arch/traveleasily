from rest_framework import serializers
from .models import (
    NotificationRecord,
    NotificationRecipientConfig,
    NotificationTriggerConfig,
    NotificationEvent,
    DeliveryStatus,
    RecipientType,
)


class NotificationRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationRecord
        fields = [
            'id',
            'application_id',
            'recipient_email',
            'recipient_name',
            'recipient_type',
            'notification_event',
            'subject',
            'delivery_status',
            'provider_message_id',
            'attempt_count',
            'max_attempts',
            'created_at',
            'sent_at',
            'last_attempt_at',
            'failure_reason',
            'preview_text',
            'html_body',
            'dedup_key',
            'destination_name',
            'visa_category',
            'status_snapshot',
        ]
        read_only_fields = [
            'id',
            'created_at',
            'sent_at',
            'last_attempt_at',
            'dedup_key',
        ]


class NotificationRecipientConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationRecipientConfig
        fields = [
            'primary_admin_email',
            'secondary_admin_email',
            'applications_team_email',
            'consular_department_email',
            'finance_department_email',
            'qa_department_email',
            'notify_assigned_officer',
            'updated_at',
        ]


class NotificationTriggerConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationTriggerConfig
        fields = [
            'event',
            'label',
            'customer_enabled',
            'admin_enabled',
            'description',
            'updated_at',
        ]


class TriggerEventSerializer(serializers.Serializer):
    application_id = serializers.CharField(max_length=64, required=True)
    event = serializers.ChoiceField(choices=NotificationEvent.choices, required=True)
    customer_email = serializers.EmailField(required=False)
    customer_name = serializers.CharField(max_length=255, required=False)
    destination_name = serializers.CharField(max_length=128, required=False)
    visa_category = serializers.CharField(max_length=64, required=False)
    note = serializers.CharField(max_length=1000, required=False, allow_blank=True)


class RetryNotificationSerializer(serializers.Serializer):
    notification_id = serializers.UUIDField(required=True)
