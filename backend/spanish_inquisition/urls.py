from django.urls import path
from .views import register

urlpatterns = [
    path('auth/register', register, name='register'),
]
