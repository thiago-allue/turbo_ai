from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.authtoken.models import Token

from django.contrib.auth.models import User
from django.contrib.auth import logout, authenticate
from django.contrib.auth.hashers import check_password

from .models import Note, Category
from .serializers import NoteSerializer, CategorySerializer, UserSerializer

import os
import json
import openai

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('username')  # front-end calls this 'username' => it's actually the email
        password = request.data.get('password')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')

        if not email or not password:
            return Response({'error': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(username=email).exists():
            return Response({'error': 'Email already taken.'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=email, password=password,
                                        first_name=first_name, last_name=last_name)

        # Create default categories for the new user
        Category.objects.create(user=user, name='Random Thoughts', color='#FFCBCB')
        Category.objects.create(user=user, name='School', color='#FFF176')
        Category.objects.create(user=user, name='Personal', color='#AFC7BD')

        # Generate token
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('username')  # front-end calls this 'username' => it's actually the email
        password = request.data.get('password')

        if not email or not password:
            return Response({'error': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(username=email, password=password)
        if user is None:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        # Generate or retrieve token
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)

class LogoutView(APIView):
    def post(self, request):
        user = request.user
        Token.objects.filter(user=user).delete()
        logout(request)
        return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)

class NoteViewSet(viewsets.ModelViewSet):
    serializer_class = NoteSerializer

    def get_queryset(self):
        return Note.objects.filter(user=self.request.user).order_by('-updated_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

class ProfileView(APIView):
    """Allows the user to edit their profile (first_name, last_name, password).
        Email is read-only and not updatable."""

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)

    def put(self, request):
        user = request.user

        # Fields from request
        first_name = request.data.get('first_name', user.first_name)
        last_name = request.data.get('last_name', user.last_name)
        current_password = request.data.get('current_password', '')
        new_password = request.data.get('new_password', '')
        repeat_new_password = request.data.get('repeat_new_password', '')

        # Validate current password if user tries to set a new password
        if new_password or repeat_new_password:
            # must provide current_password
            if not current_password:
                return Response({'error': 'Current password is required to set a new password.'},
                                status=status.HTTP_400_BAD_REQUEST)

            if not check_password(current_password, user.password):
                return Response({'error': 'Current password is incorrect.'},
                                status=status.HTTP_400_BAD_REQUEST)

            if new_password != repeat_new_password:
                return Response({'error': 'New password and repeat do not match.'},
                                status=status.HTTP_400_BAD_REQUEST)

            # everything checks out, so update password
            user.set_password(new_password)

        user.first_name = first_name
        user.last_name = last_name
        user.save()

        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)

class PopulateLLMView(APIView):
    def post(self, request):
        openai.api_key = os.environ.get('NEXT_PUBLIC_OPENAI_API_KEY', '')
        if not openai.api_key:
            return Response({'error': 'OpenAI API key not found in environment variables.'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # The user-provided subject
        subject = request.data.get('subject', '').strip()

        # We'll only handle categories: Random Thoughts, School, Personal
        categories = Category.objects.filter(user=request.user, name__in=["Random Thoughts", "School", "Personal"])
        all_created = []

        for cat in categories:
            prompt = f"""Create 3 short notes with a Title and Content for category: "{cat.name}".
They should be inspired by the subject: "{subject}".
Return them as valid JSON array of objects, e.g.:
[
  {{"title":"Title A","content":"Content A"}},
  {{"title":"Title B","content":"Content B"}},
  {{"title":"Title C","content":"Content C"}}
]
Keep them brief but meaningful."""

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

        return Response({
            'message': f'Successfully created notes inspired by "{subject}" (total {len(all_created)}).',
            'count': len(all_created)
        }, status=status.HTTP_200_OK)
