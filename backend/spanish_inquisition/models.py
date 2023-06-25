from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    USER_TYPES = (
        ('teacher', 'Teacher'),
        ('student', 'Student'),
    )

    user_type = models.CharField(max_length=7, choices=USER_TYPES, default='student')
