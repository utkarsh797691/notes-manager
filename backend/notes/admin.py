from django.contrib import admin
from .models import Note


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "is_favorite",
        "created_at",
        "updated_at",
    )

    search_fields = ("title", "content")

    list_filter = ("is_favorite",)