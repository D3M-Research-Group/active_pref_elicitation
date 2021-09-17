from django.shortcuts import render
from rest_framework import viewsets, mixins, status
from rest_framework.generics import GenericAPIView, CreateAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import SessionInfoSerializer, ChoicesSerializer, FormInfoSerializer
from .models import SessionInfo, Choices, FormInfo

from random import randrange
from time import sleep

# The viewsets base class provides an implementation of CRUD operations by default
# But we only want to create new data, not anything else
# class SessionInfoView(viewsets.ModelViewSet):
#     serializer_class = SessionInfoSerializer
#     queryset = SessionInfo.objects.all()
class SessionInfoView(mixins.CreateModelMixin,
                  GenericAPIView):
    queryset = SessionInfo.objects.all()
    serializer_class = SessionInfoSerializer
    
    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)


# Mixin that allows to create multiple objects from lists.
class CreateListModelMixin(object):
    def get_serializer(self, *args, **kwargs):
        """ if an array is passed, set serializer to many """
        if isinstance(kwargs.get('data', {}), list):
            kwargs['many'] = True
        return super(CreateListModelMixin, self).get_serializer(*args, **kwargs)

class ChoicesView(CreateListModelMixin, CreateAPIView):
    # Here we are expecting to get a JSON object with the session id,
    # an array of user choices
    # and an array of arrays of policies shown
    # queryset = Choices.objects.all()
    serializer_class = ChoicesSerializer


class FormInfoView(mixins.CreateModelMixin, GenericAPIView):
    queryset = FormInfo.objects.all()
    serializer_class = FormInfoSerializer
    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)

# NextChoice is a generic view
class NextChoiceView(APIView):
    def post(self, request, format=None):
        print(request.data)
        # just randomly select policies to show and sleep to simulate latency
        response_dict = {"policy_ids": [randrange(1,6), randrange(1,6)]}
        sleep(0.5)
        return Response(response_dict)
