from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Quiz, CustomUser, Question

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



class QuestionSerializer(serializers.ModelSerializer):
    correctChoice = serializers.ChoiceField(choices=Question.CHOICE, source='correct_choice')
    promptDisplayTime = serializers.IntegerField(source='prompt_display_time')
    timeLimit = serializers.IntegerField(source='time_limit')
    quizId = serializers.IntegerField(write_only=True)

    class Meta:
        model = Question
        fields = ['id', 'prompt', 'choiceA', 'choiceB', 'choiceC', 'choiceD', 'correctChoice', 'promptDisplayTime', 'timeLimit', 'quizId', 'sequence']
        
    def create(self, validated_data):
        quiz_id = validated_data.pop('quizId')
        quiz = Quiz.objects.get(id=quiz_id)
        validated_data['quiz'] = quiz
        question = Question.objects.create(**validated_data)
        return question




class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(read_only=True, many=True)

    class Meta:
        model = Quiz
        fields = ['id', 'title', 'is_active', 'join_code', 'owning_teacher', 'first_place', 'second_place', 'third_place', 'questions']
        extra_kwargs = {'owning_teacher': {'required': False}}





