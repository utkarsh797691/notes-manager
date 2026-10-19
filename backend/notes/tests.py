from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework.authtoken.models import Token

from .models import Note


class NoteSecurityTests(APITestCase):

    def setUp(self):
        User = get_user_model()

        self.alice = User.objects.create_user(
            username="alice",
            password="TestPassword123!"
        )

        self.bob = User.objects.create_user(
            username="bob",
            password="TestPassword456!"
        )

        self.bob_note = Note.objects.create(
            owner=self.bob,
            title="Bob Private Note",
            content="Only Bob should access this."
        )

        alice_token = Token.objects.create(
            user=self.alice
        )

        self.client.credentials(
            HTTP_AUTHORIZATION=f"Token {alice_token.key}"
        )

    def test_alice_cannot_read_bob_note(self):
        response = self.client.get(
            f"/api/notes/{self.bob_note.id}/"
        )

        self.assertEqual(response.status_code, 404)

    def test_alice_cannot_delete_bob_note(self):
        response = self.client.delete(
            f"/api/notes/{self.bob_note.id}/"
        )

        self.assertEqual(response.status_code, 404)

        self.assertTrue(
            Note.objects.filter(
                id=self.bob_note.id
            ).exists()
        )

    def test_anonymous_user_is_rejected(self):
        self.client.credentials()

        response = self.client.get("/api/notes/")

        self.assertEqual(response.status_code, 401)

    def test_new_note_belongs_to_creator(self):
        response = self.client.post(
            "/api/notes/",
            {
                "title": "Alice New Note",
                "content": "Private content",
                "owner": self.bob.id
            },
            format="json"
        )

        self.assertEqual(response.status_code, 201)

        note = Note.objects.get(
            id=response.data["id"]
        )

        self.assertEqual(note.owner, self.alice)