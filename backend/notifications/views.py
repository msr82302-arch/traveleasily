from rest_framework import viewsets, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import (
    NotificationRecord,
    NotificationRecipientConfig,
    NotificationTriggerConfig,
)
from .serializers import (
    NotificationRecordSerializer,
    NotificationRecipientConfigSerializer,
    NotificationTriggerConfigSerializer,
    TriggerEventSerializer,
    RetryNotificationSerializer,
)
from .services import NotificationService


class NotificationRecordViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for administrative oversight of all dispatched transactional emails.
    Supports filtering by application ID, delivery status, event type, and recipient type.
    """
    queryset = NotificationRecord.objects.all()
    serializer_class = NotificationRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = [
        'application_id',
        'recipient_email',
        'delivery_status',
        'notification_event',
        'recipient_type',
    ]
    search_fields = [
        'application_id',
        'recipient_email',
        'recipient_name',
        'subject',
        'provider_message_id',
    ]
    ordering_fields = ['created_at', 'sent_at', 'attempt_count']
    ordering = ['-created_at']

    @action(detail=True, methods=['post'])
    def retry(self, request, pk=None):
        """Action endpoint to manually retry a failed email notification."""
        try:
            record = NotificationService.retry_dispatch(pk)
            serializer = self.get_serializer(record)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except NotificationRecord.DoesNotExist:
            return Response({'error': 'Notification record not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class NotificationRecipientConfigView(APIView):
    """
    API endpoint for getting and updating the dynamic admin recipient configuration.
    Restricted to platform administrators.
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        config = NotificationRecipientConfig.get_solo()
        serializer = NotificationRecipientConfigSerializer(config)
        return Response(serializer.data)

    def put(self, request):
        config = NotificationRecipientConfig.get_solo()
        serializer = NotificationRecipientConfigSerializer(config, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class NotificationTriggerConfigViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing the 10-event trigger matrix.
    """
    queryset = NotificationTriggerConfig.objects.all()
    serializer_class = NotificationTriggerConfigSerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'event'


class TriggerEventAPIView(APIView):
    """
    API endpoint to trigger an automated notification event from internal workflows or webhooks.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = TriggerEventSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        result = NotificationService.dispatch_event(
            event=data['event'],
            application_data={
                'id': data['application_id'],
                'client_email': data.get('customer_email'),
                'client_name': data.get('customer_name', 'Valued Traveler'),
                'destination_name': data.get('destination_name', 'Saudi Arabia'),
                'visa_type': data.get('visa_category', 'eVisa'),
            },
            note=data.get('note'),
        )
        return Response(result, status=status.HTTP_201_CREATED)
