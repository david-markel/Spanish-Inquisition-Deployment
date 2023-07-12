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
        self.game_code = None
        self.redis = redis.Redis(host='localhost', port=6379, db=0)

    async def connect(self):
        print("[INFO] WebSocket connect called")
        await self.accept()

    async def disconnect(self, close_code):
        print("[INFO] WebSocket disconnect called")
        if self.game_code is not None:
            await self.channel_layer.group_discard(self.game_code, self.channel_name)

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
                if self.user.user_type == 'teacher':
                    await self.handle_teacher_connect(payload)
                elif self.user.user_type == 'student':
                    await self.handle_student_connect(payload)

        elif message_type == 'start-game':
            await self.handle_start_game(payload)

        elif message_type == 'next-prompt':
            await self.handle_next_prompt()

    async def handle_teacher_connect(self, payload):
        print("[INFO] Creating game...")
        quiz = await self.get_quiz(payload.get('quizId'))
        questions_serialized = await self.get_questions(quiz)
        self.game_code = str(uuid.uuid4())[:6] 
        game_state = {
            'quiz_id': payload.get('quiz_id'),
            'game_code': self.game_code,
            'owner': self.user.username,
            'players': [{'username': self.user.username, 'score': 0}],
            'questions': questions_serialized,
            'question_idx': 0,
            'game_state': 'start_wait',  # game is waiting for players to join
        }
        self.set_game_state(self.game_code, game_state)
        print(f"[INFO] Game created with game code: {self.game_code}")
        game_state = self.get_game_state(self.game_code)
        print("GAME STATE:", game_state)
        # Modify this part to include Quiz object
        quiz_obj = {
            "id": quiz.id,
            "title": quiz.title,
            "isActive": quiz.is_active,  # assuming you have is_active field in your Quiz model
            "joinCode": self.game_code,
            "owningTeacher": self.user.username,
            "firstPlace": None,  # Assuming these fields are not set yet
            "secondPlace": None,
            "thirdPlace": None,
            "questions": questions_serialized,
        }
        await self.sendJson('connect-accept', {"quiz": quiz_obj})
        # Now that we have the game_code, let's join the group
        await self.channel_layer.group_add(self.game_code, self.channel_name)

    async def handle_student_connect(self, payload):
        print("[INFO] Joining game...")
        self.game_code = payload.get('joinCode')
        print("WHAT IS MY GAME CODE? ", self.game_code)
        print("MY PAYLOAD? ", payload)
        game_state = self.get_game_state(self.game_code)
        print("GAME STATE IN STUDENT:", game_state)
        new_student = {'username': self.user.username, 'score': 0}  # Assuming score is initially 0 for all students
        game_state['players'].append(new_student)  # Add the new player
        self.set_game_state(self.game_code, game_state)
        print(f"[INFO] Game joined with game code: {self.game_code}")
        await self.sendJson('connect-accept', new_student)
        # Send the 'student-connect' message to the group (which includes the teacher)
        await self.channel_layer.group_send(self.game_code, {
            'type': 'student.connect',
            'message': new_student
        })

    async def handle_start_game(self, payload):
        game_state = self.get_game_state(self.game_code)
        
        # Check if the user trying to start the game is the owner
        if game_state and game_state['owner'] == self.user.username:
            game_state['game_state'] = 'game_started'  # Change the game_state to 'game_started'
            self.set_game_state(self.game_code, game_state)  # Store the updated game state in Redis

            # Broadcast to all group members that the game has started
            await self.channel_layer.group_send(self.game_code, {
                'type': 'game.started',
                'message': {}
            })

            # Send a 'game-started' message to the user (owner)
            await self.sendJson('game-started', {})
        else:
            # If not the owner, send an error message
            await self.sendJson('error', {'message': 'Must be the teacher to start the game.'})
            await self.close(code=4001)  # Close the connection with a policy violation code

    async def handle_next_prompt(self):
        game_state = self.get_game_state(self.game_code)
        print("[INFO] Next Prompt...")
        
        # Increment the question index
        game_state['question_idx'] += 1

        print("Question index: ", game_state['question_idx'])
        print("Number of questions: ", len(game_state['questions']))


        # Fetch the next question
        next_question = game_state['questions'][game_state['question_idx']]
        
        # Set the game state back to the server
        self.set_game_state(self.game_code, game_state)
        
        # Prepare the payload to be sent to the frontend
        payload = {'questionId': next_question['id']}
        
        # Send the next-prompt message to the group (which includes the teacher and the students)
        await self.channel_layer.group_send(self.game_code, {
            'type': 'next-prompt',
            'message': payload
        })

    # Add a new handler for 'game.started' type messages
    async def game_started(self, event):
        # This will be received by all members of the group (including the owner)
        await self.sendJson('game-started', event['message'])
    
    # Add a new handler for 'student.connect' type messages
    async def student_connect(self, event):
        # This will be received by the teacher's client
        await self.sendJson('student-connect', event['message'])

    async def sendJson(self, m_type, payload):
        print(f"[INFO] Sending data: {m_type}, {payload}")
        await self.send(text_data=json.dumps({
            'type': m_type,
            'payload': payload
        }))

    async def authenticate(self, query_string):
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
    
    def get_game_state(self, game_code):
        # Fetch the game state from Redis
        game_state_str = self.redis.get(game_code)
        if game_state_str:
            return json.loads(game_state_str)
        return None

    def set_game_state(self, game_code, game_state):
        # Store the game state in Redis
        self.redis.set(game_code, json.dumps(game_state))

