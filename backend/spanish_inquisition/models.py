from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    USER_TYPES = (
        ('teacher', 'Teacher'),
        ('student', 'Student'),
    )

    user_type = models.CharField(max_length=7, choices=USER_TYPES, default='student')

class Quiz(models.Model):
    title = models.CharField(max_length=200)
    is_active = models.BooleanField(default=False)
    join_code = models.CharField(max_length=100, null=True, blank=True)
    owning_teacher = models.ForeignKey(CustomUser, related_name='quizzes', on_delete=models.CASCADE)
    first_place = models.ForeignKey(CustomUser, related_name='first_place_quizzes', null=True, blank=True, on_delete=models.SET_NULL)
    second_place = models.ForeignKey(CustomUser, related_name='second_place_quizzes', null=True, blank=True, on_delete=models.SET_NULL)
    third_place = models.ForeignKey(CustomUser, related_name='third_place_quizzes', null=True, blank=True, on_delete=models.SET_NULL)

    def __str__(self):
        return self.title

class Question(models.Model):
    CHOICE = [
        ('a', 'Choice A'),
        ('b', 'Choice B'),
        ('c', 'Choice C'),
        ('d', 'Choice D'),
    ]
    quiz = models.ForeignKey(Quiz, related_name='questions', on_delete=models.CASCADE)
    prompt = models.CharField(max_length=500)
    choiceA = models.CharField(max_length=200)
    choiceB = models.CharField(max_length=200)
    choiceC = models.CharField(max_length=200)
    choiceD = models.CharField(max_length=200)
    correct_choice = models.CharField(max_length=1, choices=CHOICE)
    prompt_display_time = models.IntegerField()
    time_limit = models.IntegerField()
    sequence = models.IntegerField()

    def __str__(self):
        return self.prompt