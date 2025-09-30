# Backend API Endpoints for User Management and Data Export

This document outlines the required backend API endpoints to support the enhanced User Management and Export Data functionality.

## User Management API Endpoints

### 1. List Users (Enhanced)
```
GET /api/users/
```
**Parameters:**
- `search` (optional): Search by username, email, first_name, last_name
- `role` (optional): Filter by role (admin, registrar, member)
- `status` (optional): Filter by status (active, inactive, suspended)
- `limit` & `offset`: Pagination

**Response:**
```json
{
  "count": 25,
  "next": "...",
  "previous": null,
  "results": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@church.com",
      "first_name": "System",
      "last_name": "Administrator",
      "role": "admin",
      "status": "active",
      "date_joined": "2024-01-15T10:00:00Z",
      "last_login": "2024-12-21T14:30:00Z",
      "members_registered": 150,
      "is_staff": true,
      "is_superuser": true
    }
  ]
}
```

### 2. Update User Status
```
PATCH /api/users/{id}/status/
```
**Body:**
```json
{
  "status": "active|inactive|suspended"
}
```

### 3. Update User Role
```
PATCH /api/users/{id}/role/
```
**Body:**
```json
{
  "role": "admin|registrar|member",
  "is_staff": true,
  "is_superuser": false
}
```

### 4. User Activity Log
```
GET /api/users/{id}/activity/
```
**Response:**
```json
[
  {
    "id": 1,
    "action": "login",
    "timestamp": "2024-12-21T14:30:00Z",
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0...",
    "details": {}
  }
]
```

## Data Export API Endpoints

### 1. Export Members
```
POST /api/export/members/
```
**Body:**
```json
{
  "format": "csv|excel|pdf",
  "filters": {
    "created_by": 1,
    "region": "dar_es_salaam",
    "gender": "M",
    "date_from": "2024-01-01",
    "date_to": "2024-12-31"
  }
}
```
**Response:** Binary file download with appropriate Content-Type headers

### 2. Export Analytics
```
POST /api/export/analytics/
```
**Body:**
```json
{
  "format": "pdf|excel",
  "type": "overview|monthly",
  "date_range": {
    "start_date": "2024-01-01",
    "end_date": "2024-12-31"
  }
}
```

### 3. Export User Activity
```
POST /api/export/user-activity/
```
**Body:**
```json
{
  "format": "csv|excel",
  "date_range": {
    "start_date": "2024-01-01",
    "end_date": "2024-12-31"
  },
  "user_ids": [1, 2, 3]
}
```

### 4. Export Financial Data
```
POST /api/export/financial/
```
**Body:**
```json
{
  "format": "excel|pdf",
  "date_range": {
    "start_date": "2024-01-01",
    "end_date": "2024-12-31"
  },
  "include_donations": true,
  "include_tithes": true
}
```

### 5. Export History
```
GET /api/export/history/
```
**Response:**
```json
[
  {
    "id": 1,
    "export_type": "members",
    "format": "csv",
    "created_at": "2024-12-21T14:30:00Z",
    "file_size": "2.5 MB",
    "download_count": 3,
    "created_by": {
      "id": 1,
      "username": "admin"
    }
  }
]
```

## Required Django Views Implementation

### 1. User Management Views (users/views.py)

```python
from rest_framework import generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from .serializers import UserSerializer

User = get_user_model()

class UserManagementViewSet(ModelViewSet):
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
        if role:
            queryset = queryset.filter(role=role)
            
        # Add status filtering
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
            
        return queryset.annotate(
            members_registered=Count('registered_members')
        )
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        user = self.get_object()
        new_status = request.data.get('status')
        
        if new_status in ['active', 'inactive', 'suspended']:
            user.status = new_status
            user.save()
            return Response({'status': 'success'})
        
        return Response({'error': 'Invalid status'}, status=400)
    
    @action(detail=True, methods=['patch'])
    def update_role(self, request, pk=None):
        user = self.get_object()
        new_role = request.data.get('role')
        
        if new_role in ['admin', 'registrar', 'member']:
            user.role = new_role
            user.is_staff = new_role == 'admin'
            user.save()
            return Response({'status': 'success'})
        
        return Response({'error': 'Invalid role'}, status=400)
```

### 2. Export Views (analytics/views.py)

```python
import csv
import io
from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from members.models import Member
from users.models import User, AuditLog

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def export_members(request):
    format_type = request.data.get('format', 'csv')
    filters = request.data.get('filters', {})
    
    # Build queryset with filters
    queryset = Member.objects.all()
    
    if filters.get('created_by'):
        queryset = queryset.filter(created_by=filters['created_by'])
    
    if filters.get('region'):
        queryset = queryset.filter(region=filters['region'])
    
    if filters.get('gender'):
        queryset = queryset.filter(gender=filters['gender'])
    
    # Export based on format
    if format_type == 'csv':
        return export_members_csv(queryset)
    elif format_type == 'excel':
        return export_members_excel(queryset)
    elif format_type == 'pdf':
        return export_members_pdf(queryset)

def export_members_csv(queryset):
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="members_{datetime.now().strftime("%Y%m%d")}.csv"'
    
    writer = csv.writer(response)
    writer.writerow(['First Name', 'Last Name', 'Email', 'Phone', 'Region', 'Gender', 'Date Registered'])
    
    for member in queryset:
        writer.writerow([
            member.first_name,
            member.last_name,
            member.email,
            member.phone_number,
            member.region,
            member.gender,
            member.date_registered.strftime('%Y-%m-%d')
        ])
    
    return response
```

## Required Model Updates

### 1. User Model (users/models.py)
```python
class User(AbstractUser):
    # ... existing fields ...
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('suspended', 'Suspended'),
    ]
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    def members_registered_count(self):
        return self.registered_members.count()
```

### 2. Export History Model (analytics/models.py)
```python
class ExportHistory(models.Model):
    EXPORT_TYPES = [
        ('members', 'Members'),
        ('analytics', 'Analytics'),
        ('users', 'User Activity'),
        ('financial', 'Financial'),
    ]
    
    FORMAT_CHOICES = [
        ('csv', 'CSV'),
        ('excel', 'Excel'),
        ('pdf', 'PDF'),
    ]
    
    export_type = models.CharField(max_length=20, choices=EXPORT_TYPES)
    format = models.CharField(max_length=10, choices=FORMAT_CHOICES)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    file_size = models.CharField(max_length=50)
    download_count = models.PositiveIntegerField(default=0)
    filters_applied = models.JSONField(default=dict)
```

## Frontend Integration Notes

1. **Error Handling**: All API calls should include proper error handling with user-friendly messages
2. **Loading States**: Show loading indicators during API calls
3. **Real-time Updates**: Consider WebSocket integration for real-time user status updates
4. **File Downloads**: Handle binary responses properly for file downloads
5. **Permissions**: Ensure proper role-based access control on frontend

## Security Considerations

1. **Rate Limiting**: Implement rate limiting for export endpoints
2. **File Size Limits**: Set maximum export size limits
3. **Access Control**: Ensure users can only update roles if they have admin privileges
4. **Audit Logging**: Log all user management actions and exports
5. **Data Sanitization**: Ensure exported data doesn't contain sensitive information

This implementation will provide a robust foundation for user management and data export functionality with real database integration.