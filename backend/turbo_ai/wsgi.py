"""
WSGI configuration for the turbo_ai project.
Provides a WSGI application callable, used by web servers.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'turbo_ai.settings')

application = get_wsgi_application()
