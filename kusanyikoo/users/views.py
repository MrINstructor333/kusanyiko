from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from django.utils.crypto import get_random_string
from django.db.models import Q, Count
import uuid
from .serializers import SignupSerializer, LoginSerializer, UserSerializer, ForgotPasswordSerializer, ResetPasswordSerializer
from .models import User, AuditLog
from .utils import get_client_ip, log_audit


class SignupView(generics.CreateAPIView):
    serializer_class = SignupSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            # Create the user
            user = serializer.save()
            
            # Log the signup
            log_audit(
                user=user,
                action='create',
                resource_type='user',
                resource_id=str(user.id),
                details={'username': user.username, 'email': user.email},
                ip_address=get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
            
            # Generate JWT tokens for automatic login
            refresh = RefreshToken.for_user(user)
            
            # Log the automatic login
            log_audit(
                user=user,
                action='auto_login',
                resource_type='user',
                resource_id=str(user.id),
                details={'username': user.username, 'after_signup': True},
                ip_address=get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
            
            return Response({
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'message': 'Account created successfully! You are now logged in.'
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data.get('username')
            password = serializer.validated_data.get('password')
            remember_me = serializer.validated_data.get('remember_me', False)
            
            try:
                user = User.objects.get(username=username) if '@' not in username else User.objects.get(email=username)
                
                # Check if account is locked
                if user.is_locked():
                    log_audit(
                        user=user,
                        action='failed_login',
                        resource_type='user',
                        resource_id=str(user.id),
                        details={'reason': 'account_locked', 'username': username},
                        ip_address=get_client_ip(request),
                        user_agent=request.META.get('HTTP_USER_AGENT', '')
                    )
                    return Response({
                        'error': 'Account is temporarily locked due to multiple failed login attempts.'
                    }, status=status.HTTP_423_LOCKED)
                
                authenticated_user = authenticate(username=user.username, password=password)
                
                if authenticated_user:
                    # Reset failed login attempts on successful login
                    user.failed_login_attempts = 0
                    user.last_login_ip = get_client_ip(request)
                    user.save()
                    
                    refresh = RefreshToken.for_user(authenticated_user)
                    
                    # Set token expiry based on remember_me
                    if remember_me:
                        refresh.set_exp(lifetime=timezone.timedelta(days=30))
                    
                    log_audit(
                        user=authenticated_user,
                        action='login',
                        resource_type='user',
                        resource_id=str(authenticated_user.id),
                        details={'username': authenticated_user.username, 'remember_me': remember_me},
                        ip_address=get_client_ip(request),
                        user_agent=request.META.get('HTTP_USER_AGENT', '')
                    )
                    
                    return Response({
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                        'user': UserSerializer(authenticated_user).data
                    })
                else:
                    # Increment failed login attempts
                    user.failed_login_attempts += 1
                    if user.failed_login_attempts >= 5:
                        user.lock_account(30)  # Lock for 30 minutes
                    user.save()
                    
                    log_audit(
                        user=user,
                        action='failed_login',
                        resource_type='user',
                        resource_id=str(user.id),
                        details={'reason': 'invalid_credentials', 'username': username, 'attempts': user.failed_login_attempts},
                        ip_address=get_client_ip(request),
                        user_agent=request.META.get('HTTP_USER_AGENT', '')
                    )
                    
                    return Response({
                        'error': 'Invalid credentials'
                    }, status=status.HTTP_401_UNAUTHORIZED)
                    
            except User.DoesNotExist:
                log_audit(
                    user=None,
                    action='failed_login',
                    resource_type='user',
                    resource_id='',
                    details={'reason': 'user_not_found', 'username': username},
                    ip_address=get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', '')
                )
                return Response({
                    'error': 'Invalid credentials'
                }, status=status.HTTP_401_UNAUTHORIZED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = User.objects.get(email=email)
                
                # Generate reset token
                token = str(uuid.uuid4())
                user.password_reset_token = token
                user.password_reset_token_expires = timezone.now() + timezone.timedelta(hours=1)
                user.save()
                
                # Send email (implement your email sending logic)
                reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
                
                log_audit(
                    user=user,
                    action='password_reset',
                    resource_type='user',
                    resource_id=str(user.id),
                    details={'email': email, 'token_generated': True},
                    ip_address=get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', '')
                )
                
                return Response({
                    'message': 'Password reset link has been sent to your email.'
                })
                
            except User.DoesNotExist:
                # Don't reveal that user doesn't exist
                return Response({
                    'message': 'Password reset link has been sent to your email.'
                })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            token = serializer.validated_data['token']
            new_password = serializer.validated_data['new_password']
            
            try:
                user = User.objects.get(
                    password_reset_token=token,
                    password_reset_token_expires__gt=timezone.now()
                )
                
                user.set_password(new_password)
                user.password_reset_token = ''
                user.password_reset_token_expires = None
                user.failed_login_attempts = 0  # Reset failed attempts
                user.account_locked_until = None  # Unlock account
                user.save()
                
                log_audit(
                    user=user,
                    action='password_reset',
                    resource_type='user',
                    resource_id=str(user.id),
                    details={'password_changed': True},
                    ip_address=get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', '')
                )
                
                return Response({
                    'message': 'Password has been reset successfully.'
                })
                
            except User.DoesNotExist:
                return Response({
                    'error': 'Invalid or expired reset token.'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    
    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        if response.status_code == status.HTTP_200_OK:
            log_audit(
                user=request.user,
                action='update',
                resource_type='user',
                resource_id=str(request.user.id),
                details={'fields_updated': list(request.data.keys())},
                ip_address=get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
        return response


class UserManagementViewSet(ModelViewSet):
    """
    ViewSet for managing users with enhanced search, filtering, and role management
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Add search functionality
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        
        # Add role filtering
        role = self.request.query_params.get('role')
        if role and role != 'all':
            queryset = queryset.filter(role=role)
            
        # Add status filtering
        status_filter = self.request.query_params.get('status')
        if status_filter and status_filter != 'all':
            queryset = queryset.filter(status=status_filter)
            
        return queryset.select_related().prefetch_related('member_set')
    
    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        if response.status_code == status.HTTP_201_CREATED:
            log_audit(
                user=request.user,
                action='create',
                resource_type='user',
                resource_id=str(response.data['id']),
                details={'created_user': response.data['username']},
                ip_address=get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
        return response
    
    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        if response.status_code == status.HTTP_200_OK:
            log_audit(
                user=request.user,
                action='update',
                resource_type='user',
                resource_id=str(kwargs.get('pk')),
                details={'fields_updated': list(request.data.keys())},
                ip_address=get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
        return response
    
    def destroy(self, request, *args, **kwargs):
        user_to_delete = self.get_object()
        
        try:
            # Prevent deletion of current user
            if user_to_delete.id == request.user.id:
                return Response({
                    'error': 'You cannot delete your own account'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if user has registered members
            member_count = user_to_delete.member_set.filter(is_deleted=False).count()
            
            # Soft-delete members if they exist
            if member_count > 0:
                user_to_delete.member_set.filter(is_deleted=False).update(is_deleted=True)
            
            # Log the deletion before it happens
            try:
                log_audit(
                    user=request.user,
                    action='delete',
                    resource_type='user',
                    resource_id=str(kwargs.get('pk')),
                    details={
                        'deleted_user': user_to_delete.username,
                        'had_members': member_count,
                        'members_soft_deleted': member_count > 0
                    },
                    ip_address=get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', '')
                )
            except Exception as log_error:
                print(f"Audit log error: {log_error}")
                # Continue with deletion even if logging fails
            
            # Perform the actual deletion
            response = super().destroy(request, *args, **kwargs)
            return response
            
        except Exception as e:
            print(f"Delete error: {e}")
            import traceback
            traceback.print_exc()
            return Response({
                'error': f'Failed to delete user: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['patch'])
    def status(self, request, pk=None):
        """Update user status"""
        user = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in ['active', 'inactive', 'suspended']:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        old_status = user.status
        user.status = new_status
        user.save()
        
        log_audit(
            user=request.user,
            action='update',
            resource_type='user',
            resource_id=str(pk),
            details={'status_changed': {'from': old_status, 'to': new_status}},
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        return Response({'status': 'success', 'new_status': new_status})
    
    @action(detail=True, methods=['patch'])
    def role(self, request, pk=None):
        """Update user role"""
        user = self.get_object()
        new_role = request.data.get('role')
        is_staff = request.data.get('is_staff', False)
        is_superuser = request.data.get('is_superuser', False)
        
        if new_role not in ['admin', 'registrar', 'member']:
            return Response({'error': 'Invalid role'}, status=status.HTTP_400_BAD_REQUEST)
        
        old_role = user.role
        user.role = new_role
        user.is_staff = is_staff or (new_role == 'admin')
        user.is_superuser = is_superuser
        user.save()
        
        log_audit(
            user=request.user,
            action='update',
            resource_type='user',
            resource_id=str(pk),
            details={
                'role_changed': {'from': old_role, 'to': new_role},
                'staff_status': user.is_staff,
                'superuser_status': user.is_superuser
            },
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        return Response({
            'status': 'success', 
            'new_role': new_role,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser
        })
    
    @action(detail=True, methods=['get'])
    def activity(self, request, pk=None):
        """Get user activity log"""
        user = self.get_object()
        activities = AuditLog.objects.filter(user=user).order_by('-timestamp')[:50]
        
        activity_data = []
        for activity in activities:
            activity_data.append({
                'id': activity.id,
                'action': activity.action,
                'timestamp': activity.timestamp,
                'ip_address': activity.ip_address,
                'user_agent': activity.user_agent,
                'details': activity.details,
                'resource_type': activity.resource_type,
                'resource_id': activity.resource_id
            })
        
        return Response(activity_data)
    
    @action(detail=True, methods=['post'])
    def reset_password(self, request, pk=None):
        """Reset user password and return temporary password"""
        user = self.get_object()
        
        # Generate temporary password
        import secrets
        import string
        temp_password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(12))
        
        # Set new password
        user.set_password(temp_password)
        user.failed_login_attempts = 0
        user.account_locked_until = None
        user.save()
        
        log_audit(
            user=request.user,
            action='reset_password',
            resource_type='user',
            resource_id=str(pk),
            details={'target_user': user.username, 'password_reset': True},
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        return Response({
            'status': 'success',
            'temporary_password': temp_password,
            'message': f'Password reset for user {user.username}. New temporary password generated.'
        })
    
    @action(detail=True, methods=['post'])
    def unlock_account(self, request, pk=None):
        """Unlock user account"""
        user = self.get_object()
        
        user.unlock_account()
        
        log_audit(
            user=request.user,
            action='unlock_account',
            resource_type='user',
            resource_id=str(pk),
            details={'target_user': user.username, 'account_unlocked': True},
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        return Response({
            'status': 'success',
            'message': f'Account unlocked for user {user.username}'
        })
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get user management statistics"""
        total_users = User.objects.count()
        active_users = User.objects.filter(status='active').count()
        inactive_users = User.objects.filter(status='inactive').count()
        suspended_users = User.objects.filter(status='suspended').count()
        
        role_stats = User.objects.values('role').annotate(count=Count('id'))
        
        recent_logins = User.objects.filter(
            last_login__gte=timezone.now() - timezone.timedelta(days=7)
        ).count()
        
        return Response({
            'total_users': total_users,
            'active_users': active_users,
            'inactive_users': inactive_users,
            'suspended_users': suspended_users,
            'role_distribution': list(role_stats),
            'recent_logins_week': recent_logins
        })
