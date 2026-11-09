from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VisaApplicationViewSet

router = DefaultRouter()
router.register(r'dossiers', VisaApplicationViewSet, basename='visa-applications')

urlpatterns = [
    path('', include(router.urls)),
]
