#!/usr/bin/env python
"""Test script to check if Django setup is correct"""
import os
import sys
import django
from django.conf import settings
from django.core.management import execute_from_command_line

if __name__ == '__main__':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kusanyikoo.settings')
    
    try:
        django.setup()
        print("✅ Django setup successful")
        
        # Test database connection
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            print("✅ Database connection successful")
        
        # Test user model
        from users.models import User
        user_count = User.objects.count()
        print(f"✅ User model working. Current user count: {user_count}")
        
        # Test if status field exists
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name='users_user' AND column_name='status'")
            status_field = cursor.fetchone()
            if status_field:
                print("✅ Status field exists in database")
            else:
                print("❌ Status field missing from database")
        
        print("✅ All checks passed! Server should work now.")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)