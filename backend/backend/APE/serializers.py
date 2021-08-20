from rest_framework import serializers
from .models import SessionInfo, Choices

# The serializer converts model instances to JSON so that our frontend can work with the received data
# class NextChoiceSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = NextChoice
#         fields = ('session_id', 'previous_step', 'current_step', 'choice_topic', 'left_choice')


class SessionInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = SessionInfo
        fields = ('ip_address', 'date', 'session_id', 'mturker')

class ChoicesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choices
        fields = ('session_id', 'question_id', 'user_choice', 'left_choice')
