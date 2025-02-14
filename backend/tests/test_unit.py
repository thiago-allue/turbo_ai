from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from unittest.mock import patch, MagicMock
import json
import os

from notes.models import Category, Note

class ModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='test@example.com', password='password123')
        self.category = Category.objects.create(user=self.user, name='Personal', color='#AFC7BD')
        self.note = Note.objects.create(user=self.user, category=self.category, title='Test Note', content='Some content')

    def test_category_str(self):
        self.assertEqual(str(self.category), f"Personal ({self.user.username})")

    def test_note_str(self):
        self.assertEqual(str(self.note), 'Test Note')

    def test_note_str_untitled(self):
        note = Note.objects.create(user=self.user, category=self.category, title='', content='Untitled content')
        self.assertEqual(str(note), 'Untitled Note')


class RegisterViewTests(APITestCase):
    def test_register_success(self):
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
        # Check default categories created
        user_obj = User.objects.get(pk=user_id)
        self.assertTrue(Category.objects.filter(user=user_obj, name='Random Thoughts').exists())
        self.assertTrue(Category.objects.filter(user=user_obj, name='School').exists())
        self.assertTrue(Category.objects.filter(user=user_obj, name='Personal').exists())

    def test_register_missing_fields(self):
        url = '/api/v1/register/'
        data = {
            # missing username, password
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_register_email_already_taken(self):
        user = User.objects.create_user(username='existing@example.com', password='somepass')
        url = '/api/v1/register/'
        data = {
            'username': 'existing@example.com',
            'password': 'anotherpass'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)


class LoginViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='test@example.com', password='password123')

    def test_login_success(self):
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

    def test_login_invalid_credentials(self):
        url = '/api/v1/login/'
        data = {
            'username': 'test@example.com',
            'password': 'wrongpassword'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.data)

    def test_login_missing_fields(self):
        url = '/api/v1/login/'
        data = {
            'username': '',
            'password': ''
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)


class LogoutViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='test@example.com', password='password123')
        # Login to get the token
        url = '/api/v1/login/'
        data = {
            'username': 'test@example.com',
            'password': 'password123'
        }
        response = self.client.post(url, data, format='json')
        self.token = response.data['token']
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token)

    def test_logout_success(self):
        url = '/api/v1/logout/'
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)

    def test_logout_no_auth(self):
        # Remove token
        self.client.credentials()
        url = '/api/v1/logout/'
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ProfileViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='test@example.com', password='password123', first_name='Test', last_name='User')
        url = '/api/v1/login/'
        data = {
            'username': 'test@example.com',
            'password': 'password123'
        }
        response = self.client.post(url, data, format='json')
        self.token = response.data['token']
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token)

    def test_get_profile(self):
        url = '/api/v1/profile/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'test@example.com')
        self.assertEqual(response.data['first_name'], 'Test')
        self.assertEqual(response.data['last_name'], 'User')

    def test_put_profile_update_names(self):
        url = '/api/v1/profile/'
        data = {
            'first_name': 'NewTest',
            'last_name': 'NewUser'
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['first_name'], 'NewTest')
        self.assertEqual(response.data['last_name'], 'NewUser')

    def test_put_profile_change_password_success(self):
        url = '/api/v1/profile/'
        data = {
            'current_password': 'password123',
            'new_password': 'anotherpass',
            'repeat_new_password': 'anotherpass'
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Now confirm we can login with the new password
        login_data = {
            'username': 'test@example.com',
            'password': 'anotherpass'
        }
        login_resp = self.client.post('/api/v1/login/', login_data, format='json')
        self.assertEqual(login_resp.status_code, status.HTTP_200_OK)

    def test_put_profile_change_password_wrong_current(self):
        url = '/api/v1/profile/'
        data = {
            'current_password': 'wrongpassword',
            'new_password': 'anotherpass',
            'repeat_new_password': 'anotherpass'
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_put_profile_mismatched_new_passwords(self):
        url = '/api/v1/profile/'
        data = {
            'current_password': 'password123',
            'new_password': 'pass1',
            'repeat_new_password': 'pass2'
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_put_profile_no_current_password(self):
        url = '/api/v1/profile/'
        data = {
            'new_password': 'pass1',
            'repeat_new_password': 'pass1'
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)


class NoteViewSetTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='test@example.com', password='password123')
        self.cat1 = Category.objects.create(user=self.user, name='Cat1', color='#FF0000')
        self.note1 = Note.objects.create(user=self.user, category=self.cat1, title='Note1', content='Content1')
        self.note2 = Note.objects.create(user=self.user, category=self.cat1, title='Note2', content='Content2')

        # Another user
        self.user2 = User.objects.create_user(username='other@example.com', password='password456')
        self.cat_other = Category.objects.create(user=self.user2, name='OtherCat', color='#123456')
        self.note_other = Note.objects.create(user=self.user2, category=self.cat_other, title='OtherNote', content='OtherContent')

        # Login user
        url = '/api/v1/login/'
        data = {
            'username': 'test@example.com',
            'password': 'password123'
        }
        response = self.client.post(url, data, format='json')
        self.token = response.data['token']
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token)

    def test_list_notes(self):
        url = '/api/v1/notes/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)  # only self.user's notes

    def test_create_note(self):
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

    def test_retrieve_note(self):
        url = f'/api/v1/notes/{self.note1.id}/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Note1')

    def test_retrieve_other_users_note(self):
        url = f'/api/v1/notes/{self.note_other.id}/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_note(self):
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

    def test_delete_note(self):
        url = f'/api/v1/notes/{self.note1.id}/'
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Note.objects.filter(id=self.note1.id).exists())


class PopulateLLMViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='test@example.com', password='password123')
        self.cat1 = Category.objects.create(user=self.user, name='Random Thoughts', color='#FFCBCB')
        self.cat2 = Category.objects.create(user=self.user, name='School', color='#FFF176')
        self.cat3 = Category.objects.create(user=self.user, name='Personal', color='#AFC7BD')

        url = '/api/v1/login/'
        data = {
            'username': 'test@example.com',
            'password': 'password123'
        }
        response = self.client.post(url, data, format='json')
        self.token = response.data['token']
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token)

    @patch.dict(os.environ, {}, clear=True)
    def test_populate_llm_no_api_key(self):
        url = '/api/v1/populate_llm/'
        data = {
            'subject': 'Test subject'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertIn('error', response.data)

    @patch.dict(os.environ, {'NEXT_PUBLIC_OPENAI_API_KEY': 'dummy_key'}, clear=True)
    @patch('openai.ChatCompletion.create')
    def test_populate_llm_success(self, mock_create):
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
        data = {
            'subject': 'AI Testing'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 9)

        all_notes = Note.objects.filter(user=self.user)
        self.assertEqual(len(all_notes), 9)

    @patch.dict(os.environ, {'NEXT_PUBLIC_OPENAI_API_KEY': 'dummy_key'}, clear=True)
    @patch('openai.ChatCompletion.create')
    def test_populate_llm_error_in_openai_response(self, mock_create):
        mock_create.return_value = MagicMock(
            choices=[
                MagicMock(
                    message=MagicMock(content='{"bad": "response"')
                )
            ]
        )
        url = '/api/v1/populate_llm/'
        data = {
            'subject': 'Weird JSON'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 0)
        self.assertIn('Successfully created notes inspired by "Weird JSON"', response.data['message'])
