from django.contrib import admin
from django.db import models
from import_export.admin import ExportActionMixin

from .models import Choices, FormInfo, MemoryWipeInfo, SessionInfo

# Register your models here.


class SessionInfoAdmin(ExportActionMixin, admin.ModelAdmin):
    list_display = ("session_id", "time_submitted", "mturker")


admin.site.register(SessionInfo, SessionInfoAdmin)


class ChoicesAdmin(ExportActionMixin, admin.ModelAdmin):
    list_display = (
        "session_id",
        "question_num",
        "policy_a",
        "policy_b",
        "policy_dataset",
        "user_choice",
        "prediction",
        "algorithm_stage",
        "recommended_item",
        "time_on_page",
        "gamma",
        "problem_type",
        "u0_type",
    )


admin.site.register(Choices, ChoicesAdmin)


class FormInfoAdmin(ExportActionMixin, admin.ModelAdmin):
    list_display = (
        "session_id",
        "turker_id",
        "age",
        "race_ethnicity",
        "gender",
        "marital_status",
        "education",
        "positive_family",
        "positive_anyone",
    )


admin.site.register(FormInfo, FormInfoAdmin)


class MemoryWipeInfoAdmin(ExportActionMixin, admin.ModelAdmin):
    list_display = ("session_id", "question_1", "question_2", "question_3")


admin.site.register(MemoryWipeInfo, MemoryWipeInfoAdmin)

# class NextChoiceAdmin(admin.ModelAdmin):
#     list_display = ('session_id', 'previous_step', 'current_step', 'choice_topic',
#     'left_choice')

# admin.site.register(NextChoice,NextChoiceAdmin)
