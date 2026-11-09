import secrets
from datetime import timedelta
from django.utils import timezone
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from rest_framework import viewsets, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import StaffProfile, StaffInvitation, RegistrationRequest, UserRole
from .serializers import (
    UserSerializer,
    StaffInvitationSerializer,
    RegistrationRequestSerializer,
    LoginSerializer,
    RedeemInvitationSerializer,
)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        username = serializer.validated_data['username']
        password = serializer.validated_data['password']

        user = authenticate(request, username=username, password=password)
        if not user:
            # Check by email as well
            try:
                user_obj = User.objects.get(email=username)
                user = authenticate(request, username=user_obj.username, password=password)
            except User.DoesNotExist:
                user = None

        if user:
            login(request, user)
            return Response({
                'message': 'Login successful',
                'user': UserSerializer(user).data,
            })
        return Response({'error': 'Invalid username or password'}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({'message': 'Logged out successfully'})


class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class StaffInvitationViewSet(viewsets.ModelViewSet):
    queryset = StaffInvitation.objects.all()
    serializer_class = StaffInvitationSerializer
    permission_classes = [permissions.IsAdminUser]

    def perform_create(self, serializer):
        code = f"ET-INV-{secrets.token_hex(4).upper()}"
        expires = timezone.now() + timedelta(days=7)
        serializer.save(
            created_by=self.request.user,
            invite_code=code,
            expires_at=expires,
        )


class RedeemInvitationView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RedeemInvitationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        code = serializer.validated_data['invite_code'].strip().upper()
        try:
            invitation = StaffInvitation.objects.get(invite_code=code)
        except StaffInvitation.DoesNotExist:
            return Response({'error': 'Invalid invitation token'}, status=status.HTTP_404_NOT_FOUND)

        if invitation.is_used:
            return Response({'error': 'This invitation token has already been claimed'}, status=status.HTTP_400_BAD_REQUEST)
        if invitation.is_expired:
            return Response({'error': 'This invitation token has expired'}, status=status.HTTP_400_BAD_REQUEST)

        email = invitation.email
        name_parts = serializer.validated_data['full_name'].strip().split(' ', 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ''

        username = email.split('@')[0]
        if User.objects.filter(username=username).exists():
            username = f"{username}_{secrets.token_hex(2)}"

        user = User.objects.create_user(
            username=username,
            email=email,
            password=serializer.validated_data['password'],
            first_name=first_name,
            last_name=last_name,
            is_staff=True,
        )

        StaffProfile.objects.create(
            user=user,
            role=invitation.role,
            department=invitation.department,
            status='Active',
        )

        invitation.is_used = True
        invitation.used_at = timezone.now()
        invitation.save()

        login(request, user)
        return Response({
            'message': 'Account activated successfully',
            'user': UserSerializer(user).data,
        }, status=status.HTTP_201_CREATED)


class RegistrationRequestViewSet(viewsets.ModelViewSet):
    queryset = RegistrationRequest.objects.all()
    serializer_class = RegistrationRequestSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]
