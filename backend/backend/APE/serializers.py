from rest_framework import serializers
from .models import SessionInfo, Choices, FormInfo

# The serializer converts model instances to JSON so that our frontend can work with the received data
# class NextChoiceSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = NextChoice
#         fields = ('session_id', 'previous_step', 'current_step', 'choice_topic', 'left_choice')


class SessionInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = SessionInfo
        fields = ('session_id',
                  'time_submitted',
                  'mturker')

class ChoicesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choices
        fields = ('session_id',
                    'question_num',
                    'policy_a',
                    'policy_b',
                    'policy_dataset',
                    'user_choice',
                    'prediction',
                    'algorithm_stage')

class FormInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormInfo
        fields = ('session_id',
                  'username',
                  'age',
                  'race_ethnicity',
                  'gender',
                  'marital_status',
                  'education',
                  'political',
                  'positive_family',
                  'positive_anyone',
                  'healthcare_yn',
                  'healthcare_role')