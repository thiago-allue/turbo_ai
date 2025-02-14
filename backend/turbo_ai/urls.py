"""
Main URL routes for the turbo_ai Django project.
Includes the routes for notes, categories, user authentication, and LLM population.
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from notes.views import (
    NoteViewSet,
    CategoryViewSet,
    RegisterView,
    LogoutView,
    LoginView,
    ProfileView,
    PopulateLLMView
)

# Instantiate a router to automatically set up note/category endpoints
router = DefaultRouter()
router.register(r'notes', NoteViewSet, basename='note')
router.register(r'categories', CategoryViewSet, basename='category')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include(router.urls)),
    path('api/v1/register/', RegisterView.as_view(), name='register'),
    path('api/v1/login/', LoginView.as_view(), name='login'),
    path('api/v1/logout/', LogoutView.as_view(), name='logout'),
    path('api/v1/profile/', ProfileView.as_view(), name='profile'),
    path('api/v1/populate_llm/', PopulateLLMView.as_view(), name='populate-llm'),
]
