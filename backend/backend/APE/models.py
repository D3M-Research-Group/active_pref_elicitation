from django.db import models


class Choice(models.Model):
    ip_address = models.GenericIPAddressField()
    date = models.DateTimeField('date test taken')
    # We might want to keep user info in the form of a cookie?
    session_id = models.JSONField()
    # To-do: how do we want to store the choices information
    # will we always give users the same number of questions?
    choice_1 = models.IntegerField
    choice_2 = models.IntegerField
    choice_3 = models.IntegerField
    # To-do: want a way to differentiate between AMTurkers and regular people using the app
    # easiest would be to have a URI for the link given to AMTurkers like ?amturk=true

class NextChoice(models.Model):
    session_id = models.JSONField()
    previous_step = models.IntegerField() # what was the step just passed to the backend?
    current_step = models.IntegerField() # for which step are we giving the frontend data?
    choice_topic = models.IntegerField() # integer corresponding to one of a fixed number of topics. Data is matched with the topic number
    left_choice = models.IntegerField() # which choice should we put on the left side?