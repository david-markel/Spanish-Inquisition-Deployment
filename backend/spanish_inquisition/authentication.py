from rest_framework import authentication
from rest_framework_simplejwt.tokens import UntypedToken
from spanish_inquisition.models import CustomUser  # replace this line

class JWTAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        header = authentication.get_authorization_header(request).split()
        if len(header) == 2 and header[0].lower() == b'bearer':
            raw_token = header[1]
            validated_token = UntypedToken(raw_token)
            return CustomUser.objects.get(id=validated_token['user_id']), None  # change User to CustomUser
        return None  # authentication did not succeed
