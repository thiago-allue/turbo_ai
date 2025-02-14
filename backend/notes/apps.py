"""
Configuration for the 'notes' application.
"""

from django.apps import AppConfig


class NotesConfig(AppConfig):
    """
    Configuration class for the notes app.
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'notes'

    def ready(self) -> None:
        """
        Override this method if you need to run code when Django starts.
        (E.g., to connect signals.)
        """
        # import notes.signals  # uncomment if you have signals
        pass
