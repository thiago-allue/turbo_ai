"""
View classes for handling CRUD operations related to Notes
and user authentication (Register, Login, Logout).
Also includes a Profile endpoint and a 'populate_llm' utility endpoint.
"""

import json
import logging
import os

import openai
from django.contrib.auth import logout, authenticate
from django.contrib.auth.hashers import check_password
from django.contrib.auth.models import User
from rest_framework import viewsets, status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Note, Category
from .serializers import NoteSerializer, CategorySerializer, UserSerializer

# Create a logger for this module
logger = logging.getLogger(__name__)


class RegisterView(APIView):
    """
    Allows new users to register with an email, password, first name, and last name.
    Automatically creates default categories upon registration.
    """
    permission_classes = [AllowAny]

    def post(self, request: Request) -> Response:
        """
        Creates a new user and associated default categories. Returns an auth token.
        """
        email = request.data.get('username', '')
        password = request.data.get('password', '')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')

        # Validate required fields
        if not email or not password:
            logger.warning("Registration failed - missing email or password.")
            return Response(
                {'error': 'Email and password are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if user already exists
        if User.objects.filter(username=email).exists():
            logger.warning("Registration failed - email already taken.")
            return Response(
                {'error': 'Email already taken.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create the user
        user = User.objects.create_user(
            username=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )

        # Create default categories for the new user
        Category.objects.create(user=user, name='Random Thoughts', color='#FFCBCB')
        Category.objects.create(user=user, name='School', color='#FFF176')
        Category.objects.create(user=user, name='Personal', color='#AFC7BD')

        # Generate token
        token, _ = Token.objects.get_or_create(user=user)

        logger.info(f"New user registered: {email}")
        return Response(
            {
                'token': token.key,
                'user': UserSerializer(user).data
            },
            status=status.HTTP_201_CREATED
        )


class LoginView(APIView):
    """
    Authenticates a user with email and password. Returns a token if successful.
    """
    permission_classes = [AllowAny]

    def post(self, request: Request) -> Response:
        """
        Logs in the user with provided credentials, returning an auth token.
        """
        email = request.data.get('username', '')
        password = request.data.get('password', '')

        # Validate required fields
        if not email or not password:
            logger.warning("Login failed - missing email or password.")
            return Response(
                {'error': 'Email and password are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Authenticate user
        user = authenticate(username=email, password=password)
        if user is None:
            logger.warning(f"Login failed - invalid credentials for {email}.")
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        token, _ = Token.objects.get_or_create(user=user)

        logger.info(f"User logged in: {email}")
        return Response(
            {
                'token': token.key,
                'user': UserSerializer(user).data
            },
            status=status.HTTP_200_OK
        )


class LogoutView(APIView):
    """
    Logs out the currently authenticated user by deleting their token.
    """

    def post(self, request: Request) -> Response:
        """
        Deletes the user's token, effectively logging them out.
        """
        user = request.user
        Token.objects.filter(user=user).delete()
        logout(request)
        logger.info(f"User logged out: {user.username}")
        return Response(
            {'message': 'Logged out successfully.'},
            status=status.HTTP_200_OK
        )


class NoteViewSet(viewsets.ModelViewSet):
    """
    Provides CRUD operations for Note objects. Requires authentication.
    """
    serializer_class = NoteSerializer

    def get_queryset(self):
        """
        Returns only notes belonging to the authenticated user.
        Orders results by most recently updated.
        """
        return Note.objects.filter(user=self.request.user).order_by('-updated_at')

    def perform_create(self, serializer: NoteSerializer) -> None:
        """
        Associates the newly created note with the authenticated user.
        """
        user = self.request.user
        serializer.save(user=user)
        logger.info(f"Note created for user {user.username}")


class CategoryViewSet(viewsets.ModelViewSet):
    """
    Provides CRUD operations for Category objects. Requires authentication.
    """
    serializer_class = CategorySerializer

    def get_queryset(self):
        """
        Returns only categories belonging to the authenticated user.
        """
        return Category.objects.filter(user=self.request.user)


class ProfileView(APIView):
    """
    Allows a user to retrieve or update their profile (name, password).
    Email is read-only and not updatable.
    """

    def get(self, request: Request) -> Response:
        """
        Returns the current user's profile information.
        """
        user = request.user
        serializer = UserSerializer(user)
        logger.debug(f"Profile fetched for user: {user.username}")
        return Response(serializer.data)

    def put(self, request: Request) -> Response:
        """
        Updates the current user's first_name, last_name, or password.
        Requires current_password if new_password is provided.
        """
        user = request.user

        first_name = request.data.get('first_name', user.first_name)
        last_name = request.data.get('last_name', user.last_name)
        current_password = request.data.get('current_password', '')
        new_password = request.data.get('new_password', '')
        repeat_new_password = request.data.get('repeat_new_password', '')

        # Validate new password
        if (new_password or repeat_new_password):
            if not current_password:
                logger.warning("Password update failed - missing current password.")
                return Response(
                    {'error': 'Current password is required to set a new password.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if not check_password(current_password, user.password):
                logger.warning(f"Password update failed - incorrect current password for user {user.username}.")
                return Response(
                    {'error': 'Current password is incorrect.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if new_password != repeat_new_password:
                logger.warning(f"Password update failed - mismatch new passwords for user {user.username}.")
                return Response(
                    {'error': 'New password and repeat do not match.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            user.set_password(new_password)

        user.first_name = first_name
        user.last_name = last_name
        user.save()

        logger.info(f"Profile updated for user {user.username}")
        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)


class PopulateLLMView(APIView):
    """
    Uses OpenAI to generate short notes for each category (Random Thoughts, School, Personal)
    based on a user-provided subject. Creates them for the current user.
    """

    def post(self, request: Request) -> Response:
        """
        Calls OpenAI ChatCompletion to generate 3 short notes per category,
        then saves them to the database.
        """
        openai.api_key = os.environ.get('NEXT_PUBLIC_OPENAI_API_KEY', '')
        if not openai.api_key:
            logger.error("OpenAI API key not found in environment variables.")
            return Response(
                {'error': 'OpenAI API key not found in environment variables.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        subject = request.data.get('subject', '').strip()
        categories = Category.objects.filter(
            user=request.user,
            name__in=["Random Thoughts", "School", "Personal"]
        )

        all_created = []
        for cat in categories:
            prompt = (
                f'Create 3 short notes with a Title and Content for category: "{cat.name}". '
                f'They should be inspired by the subject: "{subject}". '
                f'Return them as valid JSON array of objects, e.g.:\n'
                f'[\n'
                f'  {{"title":"Title A","content":"Content A"}},\n'
                f'  {{"title":"Title B","content":"Content B"}},\n'
                f'  {{"title":"Title C","content":"Content C"}}\n'
                f']\n'
                f'Keep them brief but meaningful.'
            )

            try:
                response = openai.ChatCompletion.create(
                    model='gpt-4',
                    messages=[
                        {'role': 'system', 'content': 'You are a helpful assistant that creates short note data.'},
                        {'role': 'user', 'content': prompt}
                    ],
                    temperature=0.7
                )
                raw_text = response.choices[0].message.content
                notes_data = json.loads(raw_text)
            except Exception as ex:
                logger.error(f"Error during OpenAI request: {ex}")
                continue

            if isinstance(notes_data, list):
                for note_obj in notes_data:
                    title = note_obj.get('title', '').strip()
                    content = note_obj.get('content', '').strip()
                    if title and content:
                        note = Note.objects.create(
                            user=request.user,
                            category=cat,
                            title=title,
                            content=content
                        )
                        all_created.append(note.id)

        logger.info(f'LLM notes created. Subject="{subject}", Count={len(all_created)}')
        return Response(
            {
                'message': f'Successfully created notes inspired by "{subject}" (total {len(all_created)}).',
                'count': len(all_created)
            },
            status=status.HTTP_200_OK
        )
