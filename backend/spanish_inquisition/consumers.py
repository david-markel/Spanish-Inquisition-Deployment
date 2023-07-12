from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from django.core import serializers
import json
import redis
import uuid
from .models import Quiz, Question
from .serializers import QuestionSerializer


class QuizConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.user = None
        self.redis = redis.Redis(host='localhost', port=6379, db=0)

    async def connect(self):
        print("[INFO] WebSocket connect called")
        await self.accept()

    async def disconnect(self, close_code):
        print("[INFO] WebSocket disconnect called")
        pass

    async def receive(self, text_data):
        print(f"[INFO] Received data: {text_data}")
        text_data_json = json.loads(text_data)
        message_type = text_data_json['type']
        payload = text_data_json['payload']

        if message_type == 'connect':
            self.user = await self.authenticate(payload)
            if not self.user:
                print("[INFO] Authentication failed")
                await self.close()
            else:
                print("USER DATA: ", self.user)
                if self.user.user_type == 'teacher':  # assuming you have an 'is_teacher' attribute
                    # If a teacher connects, we create a game
                    print("[INFO] Creating game...")
                    quiz = await self.get_quiz(payload.get('quizId'))
                    questions_serialized = await self.get_questions(quiz)
                    game_code = str(uuid.uuid4())[:6]  # Generate a unique game code, use only first 6 characters
                    game_state = {
                        'quiz_id': payload.get('quiz_id'),
                        'game_code': game_code,
                        'owner': self.user.username,
                        'players': [{'username': self.user.username, 'score': 0}],
                        'questions': questions_serialized,
                        'question_idx': 0,
                        'game_state': 'start_wait',  # game is waiting for players to join
                    }
                    self.redis.set(game_code, json.dumps(game_state))  # Store the game state in Redis
                    print(f"[INFO] Game created with game code: {game_code}")
                    # Modify this part to include Quiz object
                    quiz_obj = {
                        "id": quiz.id,
                        "title": quiz.title,
                        "isActive": quiz.is_active,  # assuming you have is_active field in your Quiz model
                        "joinCode": game_code,
                        "owningTeacher": self.user.username,
                        "firstPlace": None,  # Assuming these fields are not set yet
                        "secondPlace": None,
                        "thirdPlace": None,
                        "questions": questions_serialized,
                    }
                    await self.sendJson('connect-accept', {"quiz": quiz_obj})
                else:
                    await self.sendJson('connect-accept', {'message': 'Connected successfully!'})

        elif message_type == 'start-game':
            print("[INFO] Starting quiz...")
            game_code = payload.get('game_code')
            game_state = json.loads(self.redis.get(game_code))  # Fetch the game state from Redis
            game_state['game_state'] = 'in_progress'  # Update the game state
            self.redis.set(game_code, json.dumps(game_state))  # Update the game state in Redis
            print(f"[INFO] Quiz started with game code: {game_code}")
            await self.sendJson('quiz-started', {'game_code': game_code})

        elif message_type == 'student-connect':
            print("[INFO] Joining game...")
            game_code = payload.get('game_code')
            game_state = json.loads(self.redis.get(game_code))  # Fetch the game state from Redis
            game_state['players'].append({'username': self.user.username, 'score': 0})  # Add the new player
            self.redis.set(game_code, json.dumps(game_state))  # Update the game state in Redis
            print(f"[INFO] Game joined with game code: {game_code}")
            await self.sendJson('game-joined', {'game_code': game_code})


    async def sendJson(self, m_type, payload):
        print(f"[INFO] Sending data: {m_type}, {payload}")
        await self.send(text_data=json.dumps({
            'type': m_type,
            'payload': payload
        }))

    async def authenticate(self, query_string):
        # print(f"[INFO] Query string received: {query_string}")
        from .authentication import JWTAuthentication
        authenticator = JWTAuthentication()
        user, _ = await self.get_user(query_string, authenticator)
        return user

    @database_sync_to_async
    def get_user(self, query_dict, authenticator):
        try:
            token = query_dict.get('token', None)
            if not token:
                print(f"[ERROR] Token not found in query string")
                return None, None
            # print(f"[INFO] Token extracted: {token}")
            return authenticator.authenticate(token)
        except get_user_model().DoesNotExist as e:
            print(f"[ERROR] Exception in get_user: {str(e)}")
            return None, None

    @database_sync_to_async
    def get_quiz(self, quizId):
        return Quiz.objects.get(id=quizId)

    @database_sync_to_async
    def get_questions(self, quiz):
        questions = Question.objects.filter(quiz=quiz).all()
        return QuestionSerializer(questions, many=True).data

