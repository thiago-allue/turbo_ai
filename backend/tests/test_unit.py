"""
Unit tests for the 'notes' application and related functionalities.
"""

import json
import os
from unittest.mock import patch, MagicMock

from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APITestCase

from notes.models import Category, Note


class ModelTests(TestCase):
    """
    Tests for the models: Category, Note.
    """

    def setUp(self) -> None:
        """
        Creates a user, a category, and a note for testing.
        """
        self.user = User.objects.create_user(username='test@example.com', password='password123')
        self.category = Category.objects.create(user=self.user, name='Personal', color='#AFC7BD')
        self.note = Note.objects.create(
            user=self.user,
            category=self.category,
            title='Test Note',
            content='Some content'
        )

    def test_category_str(self) -> None:
        """
        Category.__str__ should return "CategoryName (username)".
        """
        self.assertEqual(
            str(self.category),
            f"Personal ({self.user.username})"
        )

    def test_note_str(self) -> None:
        """
        Note.__str__ returns the note title if present.
        """
        self.assertEqual(str(self.note), 'Test Note')

    def test_note_str_untitled(self) -> None:
        """
        If a note has no title, __str__ should return 'Untitled Note'.
        """
        note = Note.objects.create(
            user=self.user,
            category=self.category,
            title='',
            content='Untitled content'
        )
        self.assertEqual(str(note), 'Untitled Note')


class RegisterViewTests(APITestCase):
    """
    Tests for user registration endpoint.
    """

    def test_register_success(self) -> None:
        """
        Should create a new user and default categories.
        """
        url = '/api/v1/register/'
        data = {
            'username': 'newuser@example.com',
            'password': 'newpassword123',
            'first_name': 'New',
            'last_name': 'User'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        self.assertIn('user', response.data)

        user_id = response.data['user']['id']
        user_obj = User.objects.get(pk=user_id)

        # Default categories
        self.assertTrue(Category.objects.filter(user=user_obj, name='Random Thoughts').exists())
        self.assertTrue(Category.objects.filter(user=user_obj, name='School').exists())
        self.assertTrue(Category.objects.filter(user=user_obj, name='Personal').exists())

    def test_register_missing_fields(self) -> None:
        """
        Should return 400 if email or password is missing.
        """
        url = '/api/v1/register/'
        data = {}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_register_email_already_taken(self) -> None:
        """
        Should return 400 if email is already taken.
        """
        User.objects.create_user(username='existing@example.com', password='somepass')
        url = '/api/v1/register/'
        data = {
            'username': 'existing@example.com',
            'password': 'anotherpass'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)


class LoginViewTests(APITestCase):
    """
    Tests for user login endpoint.
    """

    def setUp(self) -> None:
        """
        Creates a test user for login attempts.
        """
        self.user = User.objects.create_user(username='test@example.com', password='password123')

    def test_login_success(self) -> None:
        """
        Should return a token and user data for valid credentials.
        """
        url = '/api/v1/login/'
        data = {
            'username': 'test@example.com',
            'password': 'password123'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['username'], 'test@example.com')

    def test_login_invalid_credentials(self) -> None:
        """
        Should return 401 for invalid credentials.
        """
        url = '/api/v1/login/'
        data = {
            'username': 'test@example.com',
            'password': 'wrongpassword'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.data)

    def test_login_missing_fields(self) -> None:
        """
        Should return 400 if credentials are missing.
        """
        url = '/api/v1/login/'
        data = {
            'username': '',
            'password': ''
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)


class LogoutViewTests(APITestCase):
    """
    Tests for user logout endpoint.
    """

    def setUp(self) -> None:
        """
        Logs in a user and stores the token for logout test.
        """
        self.user = User.objects.create_user(username='test@example.com', password='password123')
        url = '/api/v1/login/'
        data = {
            'username': 'test@example.com',
            'password': 'password123'
        }
        response = self.client.post(url, data, format='json')
        self.token = response.data['token']
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token)

    def test_logout_success(self) -> None:
        """
        Should successfully log out the user by deleting token.
        """
        url = '/api/v1/logout/'
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)

    def test_logout_no_auth(self) -> None:
        """
        Should return 401 if no token is provided.
        """
        self.client.credentials()  # remove token
        url = '/api/v1/logout/'
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ProfileViewTests(APITestCase):
    """
    Tests for fetching/updating the user profile.
    """

    def setUp(self) -> None:
        """
        Logs in a test user for profile updates.
        """
        self.user = User.objects.create_user(
            username='test@example.com',
            password='password123',
            first_name='Test',
            last_name='User'
        )
        url = '/api/v1/login/'
        data = {
            'username': 'test@example.com',
            'password': 'password123'
        }
        response = self.client.post(url, data, format='json')
        self.token = response.data['token']
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token)

    def test_get_profile(self) -> None:
        """
        Should return current user profile info.
        """
        url = '/api/v1/profile/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'test@example.com')
        self.assertEqual(response.data['first_name'], 'Test')
        self.assertEqual(response.data['last_name'], 'User')

    def test_put_profile_update_names(self) -> None:
        """
        Should allow updating first_name and last_name.
        """
        url = '/api/v1/profile/'
        data = {
            'first_name': 'NewTest',
            'last_name': 'NewUser'
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['first_name'], 'NewTest')
        self.assertEqual(response.data['last_name'], 'NewUser')

    def test_put_profile_change_password_success(self) -> None:
        """
        Should allow password change when current password is correct.
        """
        url = '/api/v1/profile/'
        data = {
            'current_password': 'password123',
            'new_password': 'anotherpass',
            'repeat_new_password': 'anotherpass'
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Confirm we can login with the new password
        login_data = {
            'username': 'test@example.com',
            'password': 'anotherpass'
        }
        login_resp = self.client.post('/api/v1/login/', login_data, format='json')
        self.assertEqual(login_resp.status_code, status.HTTP_200_OK)

    def test_put_profile_change_password_wrong_current(self) -> None:
        """
        Should return 400 if current password is wrong.
        """
        url = '/api/v1/profile/'
        data = {
            'current_password': 'wrongpassword',
            'new_password': 'anotherpass',
            'repeat_new_password': 'anotherpass'
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_put_profile_mismatched_new_passwords(self) -> None:
        """
        Should return 400 if new passwords do not match.
        """
        url = '/api/v1/profile/'
        data = {
            'current_password': 'password123',
            'new_password': 'pass1',
            'repeat_new_password': 'pass2'
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_put_profile_no_current_password(self) -> None:
        """
        Should return 400 if attempting to set new password without providing current password.
        """
        url = '/api/v1/profile/'
        data = {
            'new_password': 'pass1',
            'repeat_new_password': 'pass1'
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)


class NoteViewSetTests(APITestCase):
    """
    Tests for the NoteViewSet (CRUD on notes).
    """

    def setUp(self) -> None:
        """
        Creates two users and some notes to test listing, retrieval, etc.
        """
        self.user = User.objects.create_user(username='test@example.com', password='password123')
        self.cat1 = Category.objects.create(user=self.user, name='Cat1', color='#FF0000')
        self.note1 = Note.objects.create(user=self.user, category=self.cat1, title='Note1', content='Content1')
        self.note2 = Note.objects.create(user=self.user, category=self.cat1, title='Note2', content='Content2')

        self.user2 = User.objects.create_user(username='other@example.com', password='password456')
        self.cat_other = Category.objects.create(user=self.user2, name='OtherCat', color='#123456')
        self.note_other = Note.objects.create(
            user=self.user2,
            category=self.cat_other,
            title='OtherNote',
            content='OtherContent'
        )

        # Login test user
        url = '/api/v1/login/'
        data = {'username': 'test@example.com', 'password': 'password123'}
        response = self.client.post(url, data, format='json')
        self.token = response.data['token']
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token)

    def test_list_notes(self) -> None:
        """
        Should list notes only for the authenticated user.
        """
        url = '/api/v1/notes/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_create_note(self) -> None:
        """
        Should create a new note for the authenticated user.
        """
        url = '/api/v1/notes/'
        data = {
            'title': 'New Note',
            'content': 'New Content',
            'category_id': self.cat1.id
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'New Note')
        self.assertEqual(response.data['content'], 'New Content')

    def test_retrieve_note(self) -> None:
        """
        Should retrieve the note by ID if it belongs to the user.
        """
        url = f'/api/v1/notes/{self.note1.id}/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Note1')

    def test_retrieve_other_users_note(self) -> None:
        """
        Should return 404 if the note does not belong to the user.
        """
        url = f'/api/v1/notes/{self.note_other.id}/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_note(self) -> None:
        """
        Should allow updating a user's own note.
        """
        url = f'/api/v1/notes/{self.note1.id}/'
        data = {
            'title': 'Updated Note1',
            'content': 'Updated Content1',
            'category_id': self.cat1.id
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Updated Note1')
        self.assertEqual(response.data['content'], 'Updated Content1')

    def test_delete_note(self) -> None:
        """
        Should allow deleting a user's own note.
        """
        url = f'/api/v1/notes/{self.note1.id}/'
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Note.objects.filter(id=self.note1.id).exists())


class PopulateLLMViewTests(APITestCase):
    """
    Tests for the PopulateLLMView endpoint.
    """

    def setUp(self) -> None:
        """
        Creates a user and default categories to test LLM population.
        """
        self.user = User.objects.create_user(username='test@example.com', password='password123')
        self.cat1 = Category.objects.create(user=self.user, name='Random Thoughts', color='#FFCBCB')
        self.cat2 = Category.objects.create(user=self.user, name='School', color='#FFF176')
        self.cat3 = Category.objects.create(user=self.user, name='Personal', color='#AFC7BD')

        url = '/api/v1/login/'
        data = {'username': 'test@example.com', 'password': 'password123'}
        response = self.client.post(url, data, format='json')
        self.token = response.data['token']
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token)

    @patch.dict(os.environ, {}, clear=True)
    def test_populate_llm_no_api_key(self) -> None:
        """
        Should return 500 if OpenAI API key is missing.
        """
        url = '/api/v1/populate_llm/'
        data = {'subject': 'Test subject'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertIn('error', response.data)

    @patch.dict(os.environ, {'NEXT_PUBLIC_OPENAI_API_KEY': 'dummy_key'}, clear=True)
    @patch('openai.ChatCompletion.create')
    def test_populate_llm_success(self, mock_create: MagicMock) -> None:
        """
        Should create notes from the mocked OpenAI response.
        """
        mock_create.return_value = MagicMock(
            choices=[
                MagicMock(
                    message=MagicMock(content=json.dumps([
                        {"title": "TitleA", "content": "ContentA"},
                        {"title": "TitleB", "content": "ContentB"},
                        {"title": "TitleC", "content": "ContentC"}
                    ]))
                )
            ]
        )

        url = '/api/v1/populate_llm/'
        data = {'subject': 'AI Testing'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 9)

        all_notes = Note.objects.filter(user=self.user)
        self.assertEqual(len(all_notes), 9)

    @patch.dict(os.environ, {'NEXT_PUBLIC_OPENAI_API_KEY': 'dummy_key'}, clear=True)
    @patch('openai.ChatCompletion.create')
    def test_populate_llm_error_in_openai_response(self, mock_create: MagicMock) -> None:
        """
        Should handle malformed JSON from OpenAI gracefully.
        """
        mock_create.return_value = MagicMock(
            choices=[
                MagicMock(message=MagicMock(content='{"bad": "response"'))
            ]
        )
        url = '/api/v1/populate_llm/'
        data = {'subject': 'Weird JSON'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 0)
        self.assertIn('Successfully created notes inspired by "Weird JSON"', response.data['message'])
