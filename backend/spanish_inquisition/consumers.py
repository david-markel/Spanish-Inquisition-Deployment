from channels.generic.websocket import AsyncWebsocketConsumer
import json

class QuizConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # This method is called when the websocket is handshaking as part of the connection process.
        await self.accept()

    async def disconnect(self, close_code):
        # This method is called when the WebSocket closes for any reason.
        pass

    async def receive(self, text_data):
        # This method is called when the server receives a WebSocket frame.
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        # Echo the same received message back to the WebSocket
        await self.send(text_data=json.dumps({
            'message': message
        }))
