from rest_framework import serializers
from .models import VisaApplication, PaymentRecord, ApplicationDocument


class PaymentRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentRecord
        fields = ['amount_usd', 'amount_bhd', 'currency', 'payment_method', 'status', 'transaction_id', 'paid_at']


class ApplicationDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicationDocument
        fields = ['id', 'name', 'type', 'file_url', 'uploaded_at', 'status', 'ocr_extracted', 'confidence']


class VisaApplicationSerializer(serializers.ModelSerializer):
    payment = PaymentRecordSerializer(read_only=True)
    documents = ApplicationDocumentSerializer(many=True, read_only=True)

    class Meta:
        model = VisaApplication
        fields = [
            'id',
            'client_id',
            'client_name',
            'client_email',
            'client_phone',
            'origin_country',
            'destination_country',
            'destination_name',
            'visa_type',
            'status',
            'processing_speed',
            'submitted_at',
            'updated_at',
            'sla_deadline',
            'assigned_agent',
            'visa_grant_number',
            'visa_expiry_date',
            'government_reference',
            'internal_notes',
            'rejection_reason',
            'traveler_data',
            'itinerary_data',
            'ocr_data',
            'payment',
            'documents',
        ]


class CreateApplicationSerializer(serializers.Serializer):
    origin_country = serializers.CharField(max_length=8)
    destination_country = serializers.CharField(max_length=8)
    destination_name = serializers.CharField(max_length=128)
    visa_type = serializers.CharField(max_length=64)
    processing_speed = serializers.CharField(max_length=32)
    traveler = serializers.DictField()
    itinerary = serializers.DictField()
    payment_method = serializers.CharField(max_length=32)
    amount_usd = serializers.DecimalField(max_digits=10, decimal_places=2)
    custom_recipient_email = serializers.EmailField(required=False)
