from rest_framework import serializers
from .models import Member
from django.conf import settings


class MemberSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = Member
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at', 'updated_at', 'is_deleted']
    
    def to_representation(self, instance):
        """Customize the output representation to return full picture URL"""
        data = super().to_representation(instance)
        
        if instance.picture:
            request = self.context.get('request')
            if request:
                full_url = request.build_absolute_uri(instance.picture.url)
                data['picture'] = full_url
            else:
                # Fallback for when request context is not available
                fallback_url = f"{settings.MEDIA_URL}{instance.picture}"
                data['picture'] = fallback_url
        else:
            data['picture'] = None
        
        return data
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        member = super().create(validated_data)
        return member
