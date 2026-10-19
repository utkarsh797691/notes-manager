from django.db import models
from django.conf import settings
from django.db import models

class Note(models.Model):
    title = models.CharField(max_length=150)

    content = models.TextField(blank=True)

    is_favorite = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return self.title

    owner = models.ForeignKey(
    settings.AUTH_USER_MODEL,
    on_delete=models.CASCADE,
    related_name="notes",
    null=True,
    blank=True,
)


