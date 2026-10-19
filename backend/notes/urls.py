from django.urls import path
from .views import LoginView, logout_view
from .views import (
    health_check,
    NoteListCreateView,
    NoteDetailView,
)

urlpatterns = [
    path(
        "health/",
        health_check,
        name="health-check"
    ),

    path(
        "notes/",
        NoteListCreateView.as_view(),
        name="note-list-create"
    ),

    path(
        "notes/<int:pk>/",
        NoteDetailView.as_view(),
        name="note-detail"
    ),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", logout_view, name="logout"),
]