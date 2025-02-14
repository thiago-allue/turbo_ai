"""
Data models for the 'notes' application.
"""

from django.db import models
from django.contrib.auth.models import User


class Category(models.Model):
    """
    Represents a logical grouping or category of notes.
    Each user can have multiple categories.
    """

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='categories'
    )
    name = models.CharField(
        max_length=100
    )
    color = models.CharField(
        max_length=50,
        default='#FFFFFF'
    )

    def __str__(self) -> str:
        """
        Returns a string representation of Category.
        Includes the category name and associated username.
        """
        return f"{self.name} ({self.user.username})"


class Note(models.Model):
    """
    Represents a note with title, content, timestamps, and a category.
    Belongs to a specific user.
    """

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notes'
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notes'
    )
    title = models.CharField(
        max_length=200,
        blank=True
    )
    content = models.TextField(
        blank=True
    )
    created_at = models.DateTimeField(
        auto_now_add=True
    )
    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self) -> str:
        """
        Returns the title if present, otherwise 'Untitled Note'.
        """
        return self.title or 'Untitled Note'
