#!/usr/bin/env python
"""Test script to verify User-Member relationship"""
import os
import sys
import django

if __name__ == '__main__':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kusanyikoo.settings')
    
    try:
        django.setup()
        
        from users.models import User
        from members.models import Member
        
        # Test if we can access the relationship
        users = User.objects.all()
        print(f"Total users: {users.count()}")
        
        for user in users[:3]:  # Test first 3 users
            try:
                count = user.members_registered_count()
                print(f"User '{user.username}' has registered {count} members")
            except Exception as e:
                print(f"Error for user '{user.username}': {e}")
                
        print("✅ User-Member relationship test completed")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)