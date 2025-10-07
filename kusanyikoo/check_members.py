#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kusanyikoo.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from members.models import Member

print(f"Total members: {Member.objects.filter(is_deleted=False).count()}")
print("Sample members:")
for m in Member.objects.filter(is_deleted=False)[:3]:
    print(f"  {m.first_name} {m.last_name} - created_at: {m.created_at}")