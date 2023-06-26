from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Quiz, CustomUser

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'password', 'first_name', 'last_name', 'user_type')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class QuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = ['id', 'title', 'is_active', 'join_code', 'owning_teacher', 'first_place', 'second_place', 'third_place']
        extra_kwargs = {'owning_teacher': {'required': False}}
