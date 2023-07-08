from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
import json

class QuizConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        print("[INFO] WebSocket connect called")  # Debugging
        await self.accept()

    async def disconnect(self, close_code):
        # This method is called when the WebSocket closes for any reason.
        pass

    async def receive(self, text_data):
        # This method is called when the server receives a WebSocket frame.
        text_data_json = json.loads(text_data)
        message_type = text_data_json['type']
        payload = text_data_json['payload']

        if message_type == 'connect':
            self.user = await self.authenticate(payload)
            if not self.user:
                print("[INFO] Authentication failed")  # Debugging
                await self.close()
            else:
                await self.sendJson('connect-accept', {'message': 'Connected successfully!'})
        else:
            # Echo the same received message back to the WebSocket
            await self.sendJson(message_type, payload)

    async def sendJson(self, m_type, payload):
        await self.send(text_data=json.dumps({
            'type': m_type,
            'payload': payload
        }))

    async def authenticate(self, query_string):
        print(f"[INFO] Query string received: {query_string}")  # Debugging
        from .authentication import JWTAuthentication
        authenticator = JWTAuthentication()
        user, _ = await self.get_user(query_string, authenticator)
        return user

    @database_sync_to_async
    def get_user(self, query_dict, authenticator):
        try:
            token = query_dict.get('token', None)
            if not token:
                print(f"[ERROR] Token not found in query string")  # Debugging
                return None, None
            print(f"[INFO] Token extracted: {token}")  # Debugging
            return authenticator.authenticate(token)
        except get_user_model().DoesNotExist as e:
            print(f"[ERROR] Exception in get_user: {str(e)}")  # Debugging
            return None, None


