from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Count, Q
from django.utils import timezone
from django.http import HttpResponse
from datetime import timedelta, datetime
import csv
import io
import json
from members.models import Member
from users.models import User, AuditLog
from .models import ExportHistory


class AdminStatsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Unauthorized'}, status=403)
        
        # Get basic stats
        total_members = Member.objects.filter(is_deleted=False).count()
        
        # Get breakdown by country
        country_stats = Member.objects.filter(is_deleted=False)\
            .values('country')\
            .annotate(count=Count('id'))\
            .order_by('-count')
        
        # Get breakdown by region
        region_stats = Member.objects.filter(is_deleted=False)\
            .values('region')\
            .annotate(count=Count('id'))\
            .order_by('-count')
        
        # Get breakdown by gender
        gender_stats = Member.objects.filter(is_deleted=False)\
            .values('gender')\
            .annotate(count=Count('id'))
        
        # Get breakdown by marital status
        marital_stats = Member.objects.filter(is_deleted=False)\
            .values('marital_status')\
            .annotate(count=Count('id'))
        
        # Get saved vs unsaved
        saved_stats = Member.objects.filter(is_deleted=False)\
            .values('saved')\
            .annotate(count=Count('id'))
        
        # Get recent registrations (last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        recent_registrations = Member.objects.filter(
            is_deleted=False,
            created_at__gte=thirty_days_ago
        ).count()
        
        # Get weekly growth data (last 8 weeks)
        weekly_data = []
        for i in range(8):
            week_start = timezone.now() - timedelta(weeks=i+1)
            week_end = timezone.now() - timedelta(weeks=i)
            week_count = Member.objects.filter(
                is_deleted=False,
                created_at__gte=week_start,
                created_at__lt=week_end
            ).count()
            weekly_data.insert(0, {
                'week': f'Week {8-i}',
                'count': week_count
            })
        
        return Response({
            'total_members': total_members,
            'country_stats': list(country_stats),
            'region_stats': list(region_stats),
            'gender_stats': list(gender_stats),
            'marital_stats': list(marital_stats),
            'saved_stats': list(saved_stats),
            'recent_registrations': recent_registrations,
            'weekly_growth': weekly_data,
        })


class RegistrantStatsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Get basic stats for current user
        total_registered = Member.objects.filter(
            created_by=request.user,
            is_deleted=False
        ).count()
        
        # Get breakdown by gender
        gender_stats = Member.objects.filter(
            created_by=request.user,
            is_deleted=False
        ).values('gender').annotate(count=Count('id'))
        
        # Get breakdown by region
        region_stats = Member.objects.filter(
            created_by=request.user,
            is_deleted=False
        ).values('region').annotate(count=Count('id'))
        
        # Get saved vs unsaved
        saved_stats = Member.objects.filter(
            created_by=request.user,
            is_deleted=False
        ).values('saved').annotate(count=Count('id'))
        
        # Get recent registrations (last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        recent_registrations = Member.objects.filter(
            created_by=request.user,
            is_deleted=False,
            created_at__gte=thirty_days_ago
        ).count()
        
        # Get weekly performance (last 4 weeks)
        weekly_data = []
        for i in range(4):
            week_start = timezone.now() - timedelta(weeks=i+1)
            week_end = timezone.now() - timedelta(weeks=i)
            week_count = Member.objects.filter(
                created_by=request.user,
                is_deleted=False,
                created_at__gte=week_start,
                created_at__lt=week_end
            ).count()
            weekly_data.insert(0, {
                'week': f'Week {4-i}',
                'count': week_count
            })
        
        # Get recent activity (last 5 members)
        recent_members = Member.objects.filter(
            created_by=request.user,
            is_deleted=False
        ).order_by('-created_at')[:5].values(
            'first_name', 'last_name', 'created_at'
        )
        
        return Response({
            'total_registered': total_registered,
            'gender_stats': list(gender_stats),
            'region_stats': list(region_stats),
            'saved_stats': list(saved_stats),
            'recent_registrations': recent_registrations,
            'weekly_performance': weekly_data,
            'recent_activity': list(recent_members),
        })


# Export Views

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def export_members(request):
    """Export members data in various formats"""
    format_type = request.data.get('format', 'csv')
    filters = request.data.get('filters', {})
    
    # Build queryset with filters
    queryset = Member.objects.filter(is_deleted=False)
    
    if filters.get('created_by'):
        queryset = queryset.filter(created_by=filters['created_by'])
    
    if filters.get('region'):
        queryset = queryset.filter(region=filters['region'])
    
    if filters.get('gender'):
        queryset = queryset.filter(gender=filters['gender'])
    
    if filters.get('date_from'):
        queryset = queryset.filter(created_at__gte=filters['date_from'])
    
    if filters.get('date_to'):
        queryset = queryset.filter(created_at__lte=filters['date_to'])
    
    # Export based on format
    if format_type == 'csv':
        response = export_members_csv(queryset)
    elif format_type == 'excel':
        response = export_members_excel(queryset)
    elif format_type == 'pdf':
        response = export_members_pdf(queryset)
    else:
        return Response({'error': 'Unsupported format'}, status=400)
    
    # Log export activity
    file_size = f"{len(response.content) / 1024:.1f} KB"
    ExportHistory.objects.create(
        export_type='members',
        format=format_type,
        created_by=request.user,
        file_size=file_size,
        filters_applied=filters
    )
    
    return response


def export_members_csv(queryset):
    """Export members to CSV format"""
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="members_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv"'
    
    writer = csv.writer(response)
    writer.writerow([
        'First Name', 'Last Name', 'Email', 'Phone', 'Country', 'Region', 
        'Gender', 'Marital Status', 'Saved', 'Date Registered', 'Registered By'
    ])
    
    for member in queryset:
        writer.writerow([
            member.first_name,
            member.last_name,
            member.email,
            member.mobile_no,
            member.country,
            member.region,
            member.gender,
            member.marital_status,
            'Yes' if member.saved else 'No',
            member.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            member.created_by.username if member.created_by else 'N/A'
        ])
    
    return response


def export_members_excel(queryset):
    """Export members to Excel format (placeholder - requires openpyxl)"""
    # For now, return CSV with Excel MIME type
    response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response['Content-Disposition'] = f'attachment; filename="members_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx"'
    
    # This would require openpyxl library for proper Excel export
    # For now, we'll return a CSV file
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        'First Name', 'Last Name', 'Email', 'Phone', 'Country', 'Region', 
        'Gender', 'Marital Status', 'Saved', 'Date Registered', 'Registered By'
    ])
    
    for member in queryset:
        writer.writerow([
            member.first_name,
            member.last_name,
            member.email,
            member.mobile_no,
            member.country,
            member.region,
            member.gender,
            member.marital_status,
            'Yes' if member.saved else 'No',
            member.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            member.created_by.username if member.created_by else 'N/A'
        ])
    
    response.write(output.getvalue().encode('utf-8'))
    return response


def export_members_pdf(queryset):
    """Export members to PDF format (placeholder - requires reportlab)"""
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="members_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pdf"'
    
    # This would require reportlab library for proper PDF export
    # For now, we'll return a simple text representation
    content = "MEMBERS EXPORT REPORT\n"
    content += "=" * 50 + "\n\n"
    
    for member in queryset:
        content += f"Name: {member.first_name} {member.last_name}\n"
        content += f"Email: {member.email}\n"
        content += f"Phone: {member.mobile_no}\n"
        content += f"Region: {member.region}\n"
        content += f"Gender: {member.gender}\n"
        content += f"Registered: {member.created_at.strftime('%Y-%m-%d')}\n"
        content += "-" * 30 + "\n"
    
    response.write(content.encode('utf-8'))
    return response


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def export_analytics(request):
    """Export analytics data"""
    format_type = request.data.get('format', 'pdf')
    export_type = request.data.get('type', 'overview')
    date_range = request.data.get('date_range', {})
    
    if format_type == 'pdf':
        response = export_analytics_pdf(export_type, date_range)
    elif format_type == 'excel':
        response = export_analytics_excel(export_type, date_range)
    else:
        return Response({'error': 'Unsupported format'}, status=400)
    
    # Log export activity
    file_size = f"{len(response.content) / 1024:.1f} KB"
    ExportHistory.objects.create(
        export_type='analytics',
        format=format_type,
        created_by=request.user,
        file_size=file_size,
        filters_applied={'type': export_type, 'date_range': date_range}
    )
    
    return response


def export_analytics_pdf(export_type, date_range):
    """Export analytics to PDF"""
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="analytics_{export_type}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pdf"'
    
    # Generate analytics content
    total_members = Member.objects.filter(is_deleted=False).count()
    
    content = f"ANALYTICS REPORT - {export_type.upper()}\n"
    content += "=" * 50 + "\n\n"
    content += f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
    content += f"Total Members: {total_members}\n\n"
    
    # Add more analytics based on type
    if export_type == 'overview':
        gender_stats = Member.objects.filter(is_deleted=False).values('gender').annotate(count=Count('id'))
        content += "Gender Distribution:\n"
        for stat in gender_stats:
            content += f"  {stat['gender']}: {stat['count']}\n"
    
    response.write(content.encode('utf-8'))
    return response


def export_analytics_excel(export_type, date_range):
    """Export analytics to Excel"""
    response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response['Content-Disposition'] = f'attachment; filename="analytics_{export_type}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx"'
    
    # For now, return CSV format
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['Metric', 'Value'])
    
    total_members = Member.objects.filter(is_deleted=False).count()
    writer.writerow(['Total Members', total_members])
    
    response.write(output.getvalue().encode('utf-8'))
    return response


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def export_user_activity(request):
    """Export user activity logs"""
    format_type = request.data.get('format', 'csv')
    date_range = request.data.get('date_range', {})
    user_ids = request.data.get('user_ids', [])
    
    # Build queryset
    queryset = AuditLog.objects.all()
    
    if date_range.get('start_date'):
        queryset = queryset.filter(timestamp__gte=date_range['start_date'])
    
    if date_range.get('end_date'):
        queryset = queryset.filter(timestamp__lte=date_range['end_date'])
    
    if user_ids:
        queryset = queryset.filter(user_id__in=user_ids)
    
    if format_type == 'csv':
        response = export_user_activity_csv(queryset)
    elif format_type == 'excel':
        response = export_user_activity_excel(queryset)
    else:
        return Response({'error': 'Unsupported format'}, status=400)
    
    # Log export activity
    file_size = f"{len(response.content) / 1024:.1f} KB"
    ExportHistory.objects.create(
        export_type='users',
        format=format_type,
        created_by=request.user,
        file_size=file_size,
        filters_applied={'date_range': date_range, 'user_ids': user_ids}
    )
    
    return response


def export_user_activity_csv(queryset):
    """Export user activity to CSV"""
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="user_activity_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv"'
    
    writer = csv.writer(response)
    writer.writerow(['User', 'Action', 'Resource Type', 'Resource ID', 'Timestamp', 'IP Address'])
    
    for log in queryset:
        writer.writerow([
            log.user.username if log.user else 'N/A',
            log.action,
            log.resource_type,
            log.resource_id,
            log.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            log.ip_address
        ])
    
    return response


def export_user_activity_excel(queryset):
    """Export user activity to Excel"""
    response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response['Content-Disposition'] = f'attachment; filename="user_activity_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx"'
    
    # For now, return CSV format
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['User', 'Action', 'Resource Type', 'Resource ID', 'Timestamp', 'IP Address'])
    
    for log in queryset:
        writer.writerow([
            log.user.username if log.user else 'N/A',
            log.action,
            log.resource_type,
            log.resource_id,
            log.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            log.ip_address
        ])
    
    response.write(output.getvalue().encode('utf-8'))
    return response


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def export_financial(request):
    """Export financial data (placeholder)"""
    format_type = request.data.get('format', 'excel')
    date_range = request.data.get('date_range', {})
    
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="financial_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv"'
    
    writer = csv.writer(response)
    writer.writerow(['Date', 'Type', 'Amount', 'Member', 'Description'])
    writer.writerow([datetime.now().strftime('%Y-%m-%d'), 'Tithe', '100.00', 'Sample Member', 'Monthly tithe'])
    
    # Log export activity
    file_size = f"{len(response.content) / 1024:.1f} KB"
    ExportHistory.objects.create(
        export_type='financial',
        format=format_type,
        created_by=request.user,
        file_size=file_size,
        filters_applied={'date_range': date_range}
    )
    
    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_history(request):
    """Get export history"""
    exports = ExportHistory.objects.filter(created_by=request.user).order_by('-created_at')[:20]
    
    export_data = []
    for export in exports:
        export_data.append({
            'id': export.id,
            'export_type': export.export_type,
            'format': export.format,
            'created_at': export.created_at,
            'file_size': export.file_size,
            'download_count': export.download_count,
            'created_by': {
                'id': export.created_by.id,
                'username': export.created_by.username
            }
        })
    
    return Response(export_data)
