from django.db import models

# Session info
class SessionInfo(models.Model):
    ip_address = models.GenericIPAddressField()
    date = models.DateTimeField('date test taken')
    # We might want to keep user info in the form of a cookie?
    session_id = models.BigAutoField(auto_created=True,
                                        primary_key=True,
                                        serialize= False,
                                        verbose_name='session_id')
    # To-do: want a way to differentiate between AMTurkers and regular people using the app
    # easiest would be to have a URI for the link given to AMTurkers like ?amturk=true
    mturker = models.BooleanField(default=False)

# Each user choice is a row here with session_id connecting them together.
# We insert this information in at the end by looping over the info stored user-side
class Choices(models.Model):
    session_id = models.BigAutoField(auto_created=True,
                                    primary_key=True,
                                    serialize= False,
                                    verbose_name='session_id') # session id which relates this to SessionInfo
    question_id = models.PositiveIntegerField() # id of the question shown to the user
    user_choice = models.PositiveIntegerField() # which of the two options did the user choose?
    left_choice = models.PositiveIntegerField() # when we showed this question to a user, which option was on the left side?


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

    