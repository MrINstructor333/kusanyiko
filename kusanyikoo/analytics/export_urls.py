from django.urls import path
from .views import (
    export_members,
    export_analytics,
    export_user_activity,
    export_financial,
    export_history
)

urlpatterns = [
    path('members/', export_members, name='export-members'),
    path('analytics/', export_analytics, name='export-analytics'),
    path('user-activity/', export_user_activity, name='export-user-activity'),
    path('financial/', export_financial, name='export-financial'),
    path('history/', export_history, name='export-history'),
]