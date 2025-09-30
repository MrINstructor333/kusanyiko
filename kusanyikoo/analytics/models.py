from django.db import models
from django.conf import settings

# Create your models here.

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
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='exports')
    created_at = models.DateTimeField(auto_now_add=True)
    file_size = models.CharField(max_length=50)
    download_count = models.PositiveIntegerField(default=0)
    filters_applied = models.JSONField(default=dict)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['created_by', 'created_at']),
            models.Index(fields=['export_type', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.export_type} - {self.format} - {self.created_by} - {self.created_at}"
