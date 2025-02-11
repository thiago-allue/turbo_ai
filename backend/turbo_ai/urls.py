from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from notes.views import NoteViewSet, CategoryViewSet, RegisterView, LogoutView, LoginView, ProfileView, PopulateLLMView

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

    # The 'populate_llm' endpoint:
    path('api/v1/populate_llm/', PopulateLLMView.as_view(), name='populate-llm'),
]
