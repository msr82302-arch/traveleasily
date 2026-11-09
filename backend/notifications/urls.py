from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    NotificationRecordViewSet,
    NotificationRecipientConfigView,
    NotificationTriggerConfigViewSet,
    TriggerEventAPIView,
)

router = DefaultRouter()
router.register(r'logs', NotificationRecordViewSet, basename='notification-logs')
router.register(r'triggers', NotificationTriggerConfigViewSet, basename='notification-triggers')

urlpatterns = [
    path('recipients/', NotificationRecipientConfigView.as_view(), name='notification-recipients'),
    path('trigger/', TriggerEventAPIView.as_view(), name='notification-trigger'),
    path('', include(router.urls)),
]
