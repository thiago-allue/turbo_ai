"""
Serializers define how model instances are converted to and from JSON representations.
"""

from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Category, Note


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for Django's built-in User model.
    Exposes limited fields.
    """

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name']


class CategorySerializer(serializers.ModelSerializer):
    """
    Serializer for Category model.
    """

    class Meta:
        model = Category
        fields = ['id', 'name', 'color', 'user']
        read_only_fields = ['user']


class NoteSerializer(serializers.ModelSerializer):
    """
    Serializer for Note model.
    Exposes category in read-only form and category_id in write-only form.
    """

    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Note
        fields = [
            'id',
            'title',
            'content',
            'category',
            'category_id',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def update(self, instance, validated_data):
        category_id = validated_data.pop('category_id', None)

        if category_id is not None:
            try:
                category = Category.objects.get(id=category_id, user=instance.user)
                instance.category = category
            except Category.DoesNotExist:
                instance.category = None

        return super().update(instance, validated_data)
