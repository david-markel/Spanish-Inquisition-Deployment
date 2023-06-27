from django.urls import re_path

from spanish_inquisition import consumers

websocket_urlpatterns = [
    re_path(r'ws/quiz/$', consumers.QuizConsumer.as_asgi()),
]
