#!/usr/bin/env python
"""
Django's command-line utility for administrative tasks.
"""

import os
import sys


def main() -> None:
    """
    Main entry point for Django's manage.py.
    Sets the default settings module and executes command line tasks.
    """
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'turbo_ai.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Ensure it's installed, "
            "available on your PYTHONPATH, and that you've activated a virtual environment."
        ) from exc

    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
