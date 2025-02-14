from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from notes.models import Category, Note

class IntegrationTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = '/api/v1/register/'
        self.login_url = '/api/v1/login/'
        self.logout_url = '/api/v1/logout/'
        self.profile_url = '/api/v1/profile/'
        self.notes_url = '/api/v1/notes/'
        self.categories_url = '/api/v1/categories/'
        self.populate_url = '/api/v1/populate_llm/'

    def test_full_user_flow(self):
        """
        End-to-end integration test:
        1. Register user
        2. Login
        3. Get profile
        4. Create note
        5. List notes
        6. Update note
        7. Delete note
        8. Logout
        """
        # 1) Register user
        register_payload = {
            'username': 'flowtest@example.com',
            'password': 'testpass123',
            'first_name': 'Flow',
            'last_name': 'Tester'
        }
        reg_resp = self.client.post(self.register_url, register_payload, format='json')
        self.assertEqual(reg_resp.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', reg_resp.data)
        self.assertIn('user', reg_resp.data)

        # 2) Login
        login_payload = {
            'username': 'flowtest@example.com',
            'password': 'testpass123'
        }
        login_resp = self.client.post(self.login_url, login_payload, format='json')
        self.assertEqual(login_resp.status_code, status.HTTP_200_OK)
        token = login_resp.data['token']
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token)

        # 3) Get profile
        profile_resp = self.client.get(self.profile_url)
        self.assertEqual(profile_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(profile_resp.data['username'], 'flowtest@example.com')

        # 4) Create note
        # Find one of the default categories -> "Random Thoughts", "School", or "Personal"
        cats = self.client.get(self.categories_url)
        self.assertEqual(cats.status_code, status.HTTP_200_OK)
        cat_list = cats.data
        self.assertTrue(len(cat_list) >= 3)  # "Random Thoughts","School","Personal"
        category_id = cat_list[0]['id']

        note_payload = {
            'title': 'Integration Note',
            'content': 'Integration Content',
            'category_id': category_id
        }
        create_note_resp = self.client.post(self.notes_url, note_payload, format='json')
        self.assertEqual(create_note_resp.status_code, status.HTTP_201_CREATED)
        note_id = create_note_resp.data['id']

        # 5) List notes
        list_notes_resp = self.client.get(self.notes_url)
        self.assertEqual(list_notes_resp.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(list_notes_resp.data), 1)

        # 6) Update note
        updated_payload = {
            'title': 'Updated Integration Note',
            'content': 'Updated Integration Content',
            'category_id': category_id
        }
        update_note_resp = self.client.put(f'{self.notes_url}{note_id}/', updated_payload, format='json')
        self.assertEqual(update_note_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(update_note_resp.data['title'], 'Updated Integration Note')
        self.assertEqual(update_note_resp.data['content'], 'Updated Integration Content')

        # 7) Delete note
        delete_note_resp = self.client.delete(f'{self.notes_url}{note_id}/')
        self.assertEqual(delete_note_resp.status_code, status.HTTP_204_NO_CONTENT)
        # Confirm it is not listed anymore
        notes_after_delete = self.client.get(self.notes_url)
        self.assertEqual(notes_after_delete.status_code, status.HTTP_200_OK)
        self.assertTrue(all(n['id'] != note_id for n in notes_after_delete.data))

        # 8) Logout
        logout_resp = self.client.post(self.logout_url)
        self.assertEqual(logout_resp.status_code, status.HTTP_200_OK)

    def test_populate_llm_integration(self):
        """
        Tests user flow to:
        1. Register
        2. Login
        3. Call populate_llm
        """
        # Register
        reg_payload = {
            'username': 'poptest@example.com',
            'password': 'pop123pass'
        }
        reg_resp = self.client.post(self.register_url, reg_payload, format='json')
        self.assertEqual(reg_resp.status_code, status.HTTP_201_CREATED)

        # Login
        login_payload = {
            'username': 'poptest@example.com',
            'password': 'pop123pass'
        }
        login_resp = self.client.post(self.login_url, login_payload, format='json')
        self.assertEqual(login_resp.status_code, status.HTTP_200_OK)
        token = login_resp.data['token']
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token)

        # Populate LLM
        llm_resp = self.client.post(self.populate_url, {'subject': 'Integration Testing'}, format='json')
        self.assertIn(llm_resp.status_code, [status.HTTP_200_OK, status.HTTP_500_INTERNAL_SERVER_ERROR])
        if llm_resp.status_code == status.HTTP_200_OK:
            self.assertIn('message', llm_resp.data)
            self.assertIn('count', llm_resp.data)
