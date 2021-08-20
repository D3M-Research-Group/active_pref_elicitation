from django.contrib import admin
from django.db import models
from .models import SessionInfo, Choices
# Register your models here.


class SessionInfoAdmin(admin.ModelAdmin):
    list_display = ('ip_address', 'date', 'session_id', 'mturker')

admin.site.register(SessionInfo, SessionInfoAdmin)

class ChoicesAdmin(admin.ModelAdmin):
    list_display = ('session_id', 'question_id', 'user_choice', 'left_choice')

admin.site.register(Choices, ChoicesAdmin)


# class NextChoiceAdmin(admin.ModelAdmin):
#     list_display = ('session_id', 'previous_step', 'current_step', 'choice_topic',
#     'left_choice')

# admin.site.register(NextChoice,NextChoiceAdmin)