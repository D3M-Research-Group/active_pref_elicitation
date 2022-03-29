from sre_parse import Verbose
from django.db import models

# Session info
class SessionInfo(models.Model):
    session_id = models.CharField(max_length=50,primary_key=True,
                                        verbose_name='session_id') # UUID generated on browser side
    time_submitted = models.DateTimeField(auto_now_add=True, blank=True,verbose_name='date test taken')
    # To-do: want a way to differentiate between AMTurkers and regular people using the app
    # easiest would be to have a URI for the link given to AMTurkers like ?amturk=true
    mturker = models.BooleanField(default=False)

# Each user choice is a row here with session_id connecting them together.
# We insert this information in at the end by looping over the info stored user-side
class Choices(models.Model):
    session_id = models.CharField(max_length=50, 
                                verbose_name='Session ID') # session id which relates this to SessionInfo
    question_num = models.PositiveIntegerField(verbose_name="Question Number") # id of the question shown to the user
    policy_a = models.PositiveIntegerField() # id of the policy_A shown to the user
    policy_b = models.PositiveIntegerField() # id of the policy_B shown to the user
    policy_dataset = models.CharField(max_length=50) # name of the policy dataset e.g. COVID or LAHSA
    user_choice = models.CharField(max_length=20) # which of the two options did the user choose?
    prediction = models.CharField(max_length=20)
    recommended_item = models.PositiveIntegerField(null=True)
    algorithm_stage = models.CharField(max_length=50, verbose_name="algorithm stage")
    time_on_page = models.FloatField(verbose_name="Time Spent on Question (seconds)")
    # gamma = models.FloatField(verbose_name="Gamma value")

class FormInfo(models.Model):
    # Need some fields to be nullable so that we can use this model for
    # COVID and LAHSA forms
    session_id = models.CharField(max_length=50,
                            primary_key=True,
                            verbose_name='session_id') # session id which relates this to SessionInfo
    turker_id = models.CharField(max_length=100, null=True)
    age = models.CharField(max_length=15)
    race_ethnicity = models.CharField(max_length=100)
    gender = models.CharField(max_length=20)
    marital_status = models.CharField(max_length=100)
    education = models.CharField(max_length=100)
    political = models.CharField(max_length=100)
    positive_family = models.CharField(max_length=10, null=True)
    positive_anyone = models.CharField(max_length=10, null=True)
    healthcare_yn = models.CharField(max_length=10, null=True)
    healthcare_role = models.CharField(max_length=10, null=True)

# Which question to display next
# class NextChoice(models.Model):
#     # Don't need the session id for this model

#     # session_id = models.BigAutoField(auto_created=True,
#     #                                 primary_key=True,
#     #                                 serialize= False,
#     #                                 verbose_name='session_id')
#     previous_step = models.PositiveIntegerField() # what was the step just passed to the backend?
#     current_step = models.PositiveIntegerField() # for which step are we giving the frontend data?
#     choice_topic = models.PositiveIntegerField() # integer corresponding to one of a fixed number of topics. Data is matched with the topic number
#     left_choice = models.PositiveIntegerField() # which choice should we put on the left side?

    