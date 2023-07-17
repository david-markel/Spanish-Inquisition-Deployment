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
        # self.redis = redis.Redis(host='localhost', port=6379, db=0)
        self.redis = redis.Redis(host='redis', port=6379, db=0)


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
                if self.user.user_type == 'teacher':
                    await self.handle_teacher_connect(payload)
                elif self.user.user_type == 'student':
                    await self.handle_student_connect(payload)

        elif message_type == 'start-game':
            await self.handle_start_game(payload)

        elif message_type == 'next-prompt':
            await self.handle_next_prompt()

        elif message_type == 'next-choices':
            await self.handle_next_choices()

        elif message_type == 'next-results':
            await self.handle_next_results()

        elif message_type == 'submit-choice':
            await self.handle_submit_choice(payload)

    async def handle_teacher_connect(self, payload):
        print("[INFO] Creating game...")
        quiz = await self.get_quiz(payload.get('quizId'))
        questions_serialized = await self.get_questions(quiz)
        self.game_code = str(uuid.uuid4())[:6] 
        game_state = {
            'quiz_id': payload.get('quiz_id'),
            'game_code': self.game_code,
            'owner': self.user.username,
            'players': [],
            'questions': questions_serialized,
            'question_idx': 0,
            'game_state': 'start_wait',
            'question_incremented': False,
            'total_questions': len(questions_serialized)
        }
        self.set_game_state(self.game_code, game_state)
        print(f"[INFO] Game created with game code: {self.game_code}")
        game_state = self.get_game_state(self.game_code)
        quiz_obj = {
            "id": quiz.id,
            "title": quiz.title,
            "isActive": quiz.is_active,
            "joinCode": self.game_code,
            "owningTeacher": self.user.username,
            "firstPlace": None, 
            "secondPlace": None,
            "thirdPlace": None,
            "questions": questions_serialized,
        }
        await self.sendJson('connect-accept', {"quiz": quiz_obj})
        await self.channel_layer.group_add(self.game_code, self.channel_name)

    async def handle_student_connect(self, payload):
        print("[INFO] Joining game...")
        self.game_code = payload.get('joinCode')
        game_state = self.get_game_state(self.game_code)
        new_student = {
            'username': self.user.username, 
            'score': 0, 
            'previous_score': 0
        }
        game_state['players'].append(new_student)  
        self.set_game_state(self.game_code, game_state)
        print(f"[INFO] Game joined with game code: {self.game_code}")
        await self.sendJson('connect-accept', new_student)
        await self.channel_layer.group_add(self.game_code, self.channel_name)
        await self.channel_layer.group_send(self.game_code, {
            'type': 'student.connect',
            'message': new_student
        })

    async def handle_start_game(self, payload):
        game_state = self.get_game_state(self.game_code)
        if game_state and game_state['owner'] == self.user.username:
            game_state['game_state'] = 'game_started'  
            self.set_game_state(self.game_code, game_state)  
            await self.channel_layer.group_send(self.game_code, {
                'type': 'game.started',
                'message': {}
            })
            await self.sendJson('game-started', {})
        else:
            await self.sendJson('error', {'message': 'Must be the teacher to start the game.'})
            await self.close(code=4001) 

    async def handle_next_prompt(self):
        game_state = self.get_game_state(self.game_code)
        message_type = 'server.next.prompt'
        print("[INFO] Next Prompt...")

        if game_state['question_idx'] >= game_state['total_questions']:
            message_type = 'final.results'
            player_scores = await self.get_player_scores()
            top_all = [{'username': player, 'score': score['score'], 'previous_score': score['previous_score']} for player, score in player_scores.items()][:5]
            payload = {
                'topAll': top_all
            }
        else:
            next_question = game_state['questions'][game_state['question_idx']]
            payload = {'questionId': next_question['id']}
            game_state['question_incremented'] = False
            self.set_game_state(self.game_code, game_state)

        await self.channel_layer.group_send(self.game_code, {
            'type': message_type,
            'message': payload
        })    

    async def handle_next_choices(self):
        await self.channel_layer.group_send(self.game_code, {
            'type': 'server.next.choices',
            'message': {}
        })


    async def handle_next_results(self):
        player_scores = await self.get_player_scores()
        print("PLAYER SCORES: ", player_scores)
        top_all = [{'username': player, 'score': score['score'], 'previous_score': score['previous_score']} for player, score in player_scores.items()][:5]
        top_last = sorted(top_all, key=lambda player: player['previous_score'], reverse=True)
        payload = {
            'topAll': top_all,
            'topLast': top_last,
        }

        game_state = self.get_game_state(self.game_code)
        message_type = 'server.next.results'
        if not game_state['question_incremented']:
            game_state['question_idx'] += 1
            game_state['question_incremented'] = True
            self.set_game_state(self.game_code, game_state)

        await self.channel_layer.group_send(self.game_code, {
            'type': message_type,
            'message': payload
        })


    async def handle_submit_choice(self, payload):
        current_question = self.get_current_question()
        print("current question: ", current_question)
        if payload["choice"] != current_question["correctChoice"]:
            await self.sendJson('choice-result', {
                "correct": False,
            })
            self.update_player_score(self.user.username, 0)
            return

        MAX_POINTS = 1000
        time_limit_millis = current_question["timeLimit"] * 1000
        percent_taken = 1 - (payload["millisTaken"] / time_limit_millis) 
        points = MAX_POINTS * percent_taken
        self.update_player_score(self.user.username, points)
        await self.sendJson('choice-result', {
            "correct": True,
            "points": points,
        })


    def get_current_question(self):
        game_state = self.get_game_state(self.game_code)
        question_idx = game_state['question_idx']
        question = game_state['questions'][question_idx]

        return question
    
    async def get_player_scores(self):
        game_state = self.get_game_state(self.game_code)
        if not game_state:
            return None

        player_scores = {}
        for player in game_state['players']:
            player_scores[player['username']] = {'score': player['score'], 'previous_score': player['previous_score']}
        
        return player_scores


    def update_player_score(self, username, points):
        game_state = self.get_game_state(self.game_code)
        player = next((player for player in game_state['players'] if player['username'] == username), None)
        if player:
            player['previous_score'] = player['score']
            player['score'] += points
        self.set_game_state(self.game_code, game_state)



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
        game_state_str = self.redis.get(game_code)
        if game_state_str:
            return json.loads(game_state_str)
        return None

    def set_game_state(self, game_code, game_state):
        self.redis.set(game_code, json.dumps(game_state))

    async def game_started(self, event):
        await self.sendJson('game-started', event['message'])
    
    async def student_connect(self, event):
        await self.sendJson('student-connect', event['message'])

    async def server_next_prompt(self, event):
        await self.sendJson('server-next-prompt', event['message'])

    async def server_next_choices(self, event):
        await self.sendJson('server-next-choices', event['message'])

    async def server_next_results(self, event):
        await self.sendJson('server-next-results', event['message'])

    async def final_results(self, event):
        await self.sendJson('final-results', event['message'])


