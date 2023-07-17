from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from rest_framework.parsers import JSONParser
from .serializers import UserSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
import json
from .serializers import QuizSerializer
from .models import Quiz
from rest_framework import views, status
from rest_framework.response import Response
from .authentication import JWTAuthentication
from rest_framework import viewsets
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Question
from .serializers import QuestionSerializer


@csrf_exempt
def register(request):
    if request.method == 'POST':
        data = JSONParser().parse(request)
        serializer = UserSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=201)
        return JsonResponse(serializer.errors, status=400)
    return JsonResponse({'error': 'Invalid method'}, status=405)

@csrf_exempt
def login(request):
    if request.method == 'POST':
        data = JSONParser().parse(request)
        username = data.get('username')
        password = data.get('password')

        user = authenticate(request, username=username, password=password)

        if user is not None:
            # A backend authenticated the credentials
            refresh = RefreshToken.for_user(user)
            res = {
                'token': str(refresh.access_token),
                'first_name': user.first_name,
                'last_name': user.last_name,
                'username': user.username,
                'user_type': user.user_type,
            }
            return JsonResponse(res, status=200)
        else:
            # No backend authenticated the credentials
            return JsonResponse({'error': 'Invalid credentials'}, status=401)
    return JsonResponse({'error': 'Invalid method'}, status=405)

class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    # permission_classes = [IsTeacherOrReadOnly]

    def create(self, request, *args, **kwargs):
        data = request.data.copy()  # Make a mutable copy
        data['owning_teacher'] = request.user.id  # Set the user id from the request user
        serializer = self.get_serializer(data=data)  # Use the new data for the serializer
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        serializer.save(owning_teacher=self.request.user)
        
    def get_queryset(self):
        if self.request.user.user_type == 'teacher':
            return Quiz.objects.filter(owning_teacher=self.request.user)
        else:
            return Quiz.objects.none()
    

class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer

    def perform_create(self, serializer):
        serializer.save()

