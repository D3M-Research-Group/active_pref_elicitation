from django.contrib import admin
from django.db import models
from .models import Choice, NextChoice
# Register your models here.

class ChoiceAdmin(admin.ModelAdmin):
    list_display = ('ip_address', 'date', 'session_id', 'choice_1',
    'choice_2', 'choice_3')

admin.site.register(Choice,ChoiceAdmin)


class NextChoiceAdmin(admin.ModelAdmin):
    list_display = ('session_id', 'previous_step', 'current_step', 'choice_topic',
    'left_choice')

admin.site.register(NextChoice,NextChoiceAdmin)