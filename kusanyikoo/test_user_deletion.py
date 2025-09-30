#!/usr/bin/env python
"""Test script to check user deletion functionality"""
import os
import sys
import django

if __name__ == '__main__':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kusanyikoo.settings')
    
    try:
        django.setup()
        
        from users.models import User
        from members.models import Member
        from django.contrib.auth.hashers import make_password
        
        print("🔧 Testing User Deletion...")
        
        # Create a test user
        test_user, created = User.objects.get_or_create(
            username='test_delete_user',
            defaults={
                'email': 'delete@test.com',
                'first_name': 'Test',
                'last_name': 'Delete',
                'role': 'registrar',
                'password': make_password('testpass123')
            }
        )
        
        print(f"✅ Test user created/found: {test_user.username}")
        
        # Check if user has any members
        member_count = test_user.member_set.filter(is_deleted=False).count()
        print(f"📊 User has {member_count} registered members")
        
        # Test deletion logic
        if member_count > 0:
            print("⚠️  User has members - testing soft deletion of members...")
            test_user.member_set.update(is_deleted=True)
            print("✅ Members soft-deleted")
        
        # Now test user deletion
        user_id = test_user.id
        test_user.delete()
        print(f"✅ User {user_id} deleted successfully")
        
        # Verify deletion
        try:
            User.objects.get(id=user_id)
            print("❌ User still exists!")
        except User.DoesNotExist:
            print("✅ User deletion confirmed")
        
        print("\n🎉 User deletion test completed successfully!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)