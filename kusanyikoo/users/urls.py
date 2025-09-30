from django.urls import path
from .views import SignupView, LoginView, ProfileView, ForgotPasswordView, ResetPasswordView
from rest_framework.routers import DefaultRouter
from .views import UserManagementViewSet
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

router = DefaultRouter()
router.register(r'', UserManagementViewSet, basename='user-management')

urlpatterns += router.urls
