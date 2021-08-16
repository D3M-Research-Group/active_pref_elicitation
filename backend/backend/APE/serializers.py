from rest_framework import serializers
from .models import NextChoice

# The serializer converts model instances to JSON so that our frontend can work with the received data
class NextChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NextChoice
        fields = ('session_id', 'previous_step', 'current_step', 'choice_topic', 'left_choice')