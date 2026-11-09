from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LoginView,
    LogoutView,
    CurrentUserView,
    StaffInvitationViewSet,
    RedeemInvitationView,
    RegistrationRequestViewSet,
)

router = DefaultRouter()
router.register(r'invitations', StaffInvitationViewSet, basename='staff-invitations')
router.register(r'registrations', RegistrationRequestViewSet, basename='staff-registrations')

urlpatterns = [
    path('login/', LoginView.as_view(), name='auth-login'),
    path('logout/', LogoutView.as_view(), name='auth-logout'),
    path('me/', CurrentUserView.as_view(), name='auth-me'),
    path('invitations/redeem/', RedeemInvitationView.as_view(), name='auth-invitations-redeem'),
    path('', include(router.urls)),
]
