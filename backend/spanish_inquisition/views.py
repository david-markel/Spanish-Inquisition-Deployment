from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
import json

User = get_user_model()

@csrf_exempt
def register(request):
    if request.method == 'POST':
        # Load JSON data from the request
        data = json.loads(request.body)

        # Create a new user with the loaded data
        # Make sure to hash the password
        new_user = User.objects.create(
            first_name=data['firstName'],
            last_name=data['lastName'],
            username=data['username'],
            password=make_password(data['password']),
            user_type=data['userType'],
        )

        return JsonResponse({'message': 'Registration successful'})

    return JsonResponse({'error': 'Invalid method'}, status=405)
