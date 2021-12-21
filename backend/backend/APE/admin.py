from django.contrib import admin
from django.db import models
from .models import SessionInfo, Choices, FormInfo
# Register your models here.


class SessionInfoAdmin(admin.ModelAdmin):
    list_display = ('session_id',
                    'time_submitted',
                     'mturker')

admin.site.register(SessionInfo, SessionInfoAdmin)

class ChoicesAdmin(admin.ModelAdmin):
    list_display = ('session_id',
                    'question_num',
                    'policy_a',
                    'policy_b',
                    'policy_dataset',
                    'user_choice',
                    'prediction',
                    'recommended_item',
                    'algorithm_stage',
                    'time_on_page'
    )

admin.site.register(Choices, ChoicesAdmin)


class FormInfoAdmin(admin.ModelAdmin):
    list_display = ('session_id',
                  'turker_id',
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

admin.site.register(FormInfo, FormInfoAdmin)


# class NextChoiceAdmin(admin.ModelAdmin):
#     list_display = ('session_id', 'previous_step', 'current_step', 'choice_topic',
#     'left_choice')

# admin.site.register(NextChoice,NextChoiceAdmin)