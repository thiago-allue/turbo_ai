"""
Admin site registrations for 'notes' application.
Enables Category and Note models to be managed in the Django admin.
"""

from django.contrib import admin
from .models import Category, Note


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """
    Admin configuration for Category model.
    """
    list_display = ('id', 'user', 'name', 'color')


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    """
    Admin configuration for Note model.
    """
    list_display = ('id', 'user', 'title', 'category', 'created_at', 'updated_at')
