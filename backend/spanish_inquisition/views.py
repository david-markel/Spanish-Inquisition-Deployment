from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def register(request):
    # Handle the registration logic here
    # You can simply return a success response for now
    return JsonResponse({'message': 'Registration successful'})