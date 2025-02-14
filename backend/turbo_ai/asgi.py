"""
ASGI configuration for the turbo_ai project.
Provides an ASGI application callable.
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'turbo_ai.settings')

application = get_asgi_application()
