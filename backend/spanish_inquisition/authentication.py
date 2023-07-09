from rest_framework import authentication
from rest_framework_simplejwt.tokens import UntypedToken
from spanish_inquisition.models import CustomUser  # replace this line

class JWTAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        # If request is a string, then it's assumed to be a token
        if isinstance(request, str):
            raw_token = request

            # validate the token
            validated_token = UntypedToken(raw_token)

            # get the user using the user_id from the validated token
            user = CustomUser.objects.get(id=validated_token['user_id'])

            # return user and token
            return (user, raw_token)
            
        else:
            header = authentication.get_authorization_header(request).split()
            if len(header) == 2 and header[0].lower() == b'bearer':
                raw_token = header[1]
                # print("raw token: ", raw_token)
                validated_token = UntypedToken(raw_token)
                # print("Validated token", validated_token)
                return CustomUser.objects.get(id=validated_token['user_id']), None  # change User to CustomUser
            return None  # authentication did not succeed
