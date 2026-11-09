from rest_framework import serializers
from django.contrib.auth.models import User
from .models import StaffProfile, StaffInvitation, RegistrationRequest, UserRole


class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='staff_profile.role', read_only=True)
    department = serializers.CharField(source='staff_profile.department', read_only=True)
    phone = serializers.CharField(source='staff_profile.phone', read_only=True)
    status = serializers.CharField(source='staff_profile.status', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'department', 'phone', 'status', 'is_staff', 'is_superuser']


class StaffInvitationSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    is_expired = serializers.BooleanField(read_only=True)

    class Meta:
        model = StaffInvitation
        fields = ['id', 'invite_code', 'email', 'role', 'department', 'created_by_name', 'created_at', 'expires_at', 'is_used', 'used_at', 'is_expired']
        read_only_fields = ['id', 'created_at', 'is_used', 'used_at']


class RegistrationRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistrationRequest
        fields = '__all__'
        read_only_fields = ['id', 'status', 'submitted_at', 'reviewed_at', 'reviewed_by']


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class RedeemInvitationSerializer(serializers.Serializer):
    invite_code = serializers.CharField()
    full_name = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=8)
