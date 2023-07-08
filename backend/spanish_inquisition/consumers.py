from channels.generic.websocket import AsyncWebsocketConsumer
import json

class QuizConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # This method is called when the websocket is handshaking as part of the connection process.
        await self.accept()  # Accept the connection first
        await self.sendJson('connect-accept', {'message': 'Connected successfully!'})


    async def disconnect(self, close_code):
        # This method is called when the WebSocket closes for any reason.
        pass

    async def receive(self, text_data):
        # This method is called when the server receives a WebSocket frame.
        text_data_json = json.loads(text_data)
        message_type = text_data_json['type']
        payload = text_data_json['payload']

        # Echo the same received message back to the WebSocket
        await self.sendJson(message_type, payload)

    async def sendJson(self, m_type, payload):
        await self.send(text_data=json.dumps({
            'type': m_type,
            'payload': payload
        }))

