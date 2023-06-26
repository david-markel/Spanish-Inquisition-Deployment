from django.urls import include, path
from .views import register, login
from rest_framework.routers import DefaultRouter
from .views import QuizViewSet

router = DefaultRouter()
router.register(r'quizzes', QuizViewSet)

urlpatterns = [
    path('auth/register/', register, name='register'),
    path('auth/login/', login, name='login'),
    path('', include(router.urls)),
]
