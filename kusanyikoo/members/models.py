from django.db import models
from django.conf import settings
from django.utils import timezone


class Member(models.Model):
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
    ]
    
    MARITAL_STATUS_CHOICES = [
        ('single', 'Single'),
        ('married', 'Married'),
        ('divorced', 'Divorced'),
        ('widowed', 'Widowed'),
    ]
    
    ORIGIN_CHOICES = [
        ('invited', 'Invited'),
        ('efatha', 'Efatha'),
    ]
    
    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    age = models.PositiveIntegerField()
    marital_status = models.CharField(max_length=20, choices=MARITAL_STATUS_CHOICES)
    saved = models.BooleanField(default=False, help_text="Ameokoka")
    church_registration_number = models.CharField(max_length=50, blank=True, null=True)
    country = models.CharField(max_length=100)
    region = models.CharField(max_length=100, blank=True)
    center_area = models.CharField(max_length=100, blank=True)
    zone = models.CharField(max_length=100)
    cell = models.CharField(max_length=100)
    postal_address = models.TextField(blank=True)
    mobile_no = models.CharField(max_length=20)
    email = models.EmailField(blank=True)
    church_position = models.CharField(max_length=100, blank=True)
    visitors_count = models.PositiveIntegerField(default=0)
    origin = models.CharField(max_length=20, choices=ORIGIN_CHOICES)
    residence = models.CharField(max_length=100)
    career = models.CharField(max_length=100, blank=True)
    attending_date = models.DateField()
    picture = models.ImageField(upload_to='member_pictures/', blank=True, null=True)
    
    # Audit fields
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"
    
    class Meta:
        ordering = ['-created_at']
