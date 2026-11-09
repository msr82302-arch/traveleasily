import secrets
from datetime import timedelta
from django.utils import timezone
from rest_framework import viewsets, status, permissions
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import VisaApplication, PaymentRecord, ApplicationDocument
from .serializers import (
    VisaApplicationSerializer,
    CreateApplicationSerializer,
)
from notifications.services import NotificationService


class VisaApplicationViewSet(viewsets.ModelViewSet):
    queryset = VisaApplication.objects.all()
    serializer_class = VisaApplicationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = CreateApplicationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        random_suffix = secrets.randbelow(90000) + 10000
        new_id = f"ET-BH-2026-{random_suffix}"

        sla_hours = 8 if data['processing_speed'] == 'super_rush' else (24 if data['processing_speed'] == 'rush' else 72)
        sla_deadline = timezone.now() + timedelta(hours=sla_hours)

        traveler = data['traveler']
        given_names = traveler.get('givenNames', '')
        surname = traveler.get('surname', '')
        client_name = f"{given_names} {surname}".strip() or 'Valued Traveler'
        client_email = data.get('custom_recipient_email') or traveler.get('email') or 'traveler@easytravels-client.com'
        client_phone = traveler.get('phone', '+973 3900 1122')

        app = VisaApplication.objects.create(
            id=new_id,
            client_id=f"USR-{secrets.randbelow(9000) + 1000}",
            client_name=client_name,
            client_email=client_email,
            client_phone=client_phone,
            origin_country=data['origin_country'],
            destination_country=data['destination_country'],
            destination_name=data['destination_name'],
            visa_type=data['visa_type'],
            status='Ready for Review',
            processing_speed=data['processing_speed'],
            sla_deadline=sla_deadline,
            traveler_data=traveler,
            itinerary_data=data['itinerary'],
            internal_notes=[f"[{timezone.now().strftime('%H:%M:%S')}] Dossier intake authorized via borderless web portal."],
        )

        amount_usd = data['amount_usd']
        amount_bhd = round(amount_usd * 0.376, 2)
        PaymentRecord.objects.create(
            application=app,
            amount_usd=amount_usd,
            amount_bhd=amount_bhd,
            payment_method=data['payment_method'],
            status='paid',
            transaction_id=f"txn_et_{int(timezone.now().timestamp())}",
        )

        ApplicationDocument.objects.create(
            application=app,
            name='Passport Bio Page Scan',
            type='passport_scan',
            status='verified',
            confidence=95.0,
        )

        # Trigger Automated Dual Notification Dispatches
        NotificationService.dispatch_event('application_submitted', {
            'id': app.id,
            'client_name': app.client_name,
            'client_email': app.client_email,
            'destination_name': app.destination_name,
            'visa_type': app.visa_type,
            'processing_speed': app.processing_speed,
            'sla_deadline': app.sla_deadline.isoformat(),
            'traveler': app.traveler_data,
        })

        NotificationService.dispatch_event('application_confirmed', {
            'id': app.id,
            'client_name': app.client_name,
            'client_email': app.client_email,
            'destination_name': app.destination_name,
            'visa_type': app.visa_type,
            'processing_speed': app.processing_speed,
            'sla_deadline': app.sla_deadline.isoformat(),
            'traveler': app.traveler_data,
        })

        return Response(VisaApplicationSerializer(app).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        app = self.get_object()
        new_status = request.data.get('status')
        internal_note = request.data.get('internal_note')
        reason = request.data.get('reason')

        if not new_status:
            return Response({'error': 'Status is required'}, status=status.HTTP_400_BAD_REQUEST)

        app.status = new_status
        if reason:
            app.rejection_reason = reason
        if internal_note:
            app.internal_notes.append(f"[{timezone.now().strftime('%H:%M:%S')}] {internal_note}")
        app.save()

        # Map to notification event
        s_low = new_status.lower()
        event = 'ready_for_review'
        if 'under' in s_low:
            event = 'under_review'
        elif 'process' in s_low:
            event = 'processing'
        elif 'approv' in s_low or 'complete' in s_low:
            event = 'completed'
        elif 'reject' in s_low:
            event = 'rejected'
        elif 'cancel' in s_low or 'refund' in s_low:
            event = 'cancelled'

        NotificationService.dispatch_event(event, {
            'id': app.id,
            'client_name': app.client_name,
            'client_email': app.client_email,
            'destination_name': app.destination_name,
            'visa_type': app.visa_type,
            'status': app.status,
            'traveler': app.traveler_data,
        }, note=internal_note or reason)

        return Response(VisaApplicationSerializer(app).data)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        app = self.get_object()
        grant = request.data.get('grant_number') or f"EV-{secrets.randbelow(900000) + 100000}"
        expiry = timezone.now().date() + timedelta(days=365)

        app.status = 'Completed'
        app.visa_grant_number = grant
        app.visa_expiry_date = expiry
        app.government_reference = f"GOV-{app.destination_country}-{int(timezone.now().timestamp()) % 1000000}"
        app.internal_notes.append(f"[{timezone.now().strftime('%H:%M:%S')}] Visa approved: Grant {grant}")
        app.save()

        NotificationService.dispatch_event('completed', {
            'id': app.id,
            'client_name': app.client_name,
            'client_email': app.client_email,
            'destination_name': app.destination_name,
            'visa_type': app.visa_type,
            'status': 'Completed',
            'traveler': app.traveler_data,
        }, note=f"Official visa grant issued: {grant}. Valid through {expiry}")

        return Response(VisaApplicationSerializer(app).data)
