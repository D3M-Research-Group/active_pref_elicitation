from django.shortcuts import render
from rest_framework import viewsets, mixins, status
from rest_framework.generics import GenericAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import SessionInfoSerializer, ChoicesSerializer
from .models import SessionInfo, Choices

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

class ChoicesView(mixins.CreateModelMixin,
                  GenericAPIView):
    queryset = Choices.objects.all()
    serializer_class = ChoicesSerializer
    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)


# NextChoice is a generic view
class NextChoiceView(APIView):
    def get(self, request, format=None):
        # pass the request parameters into the code for calculating next choice
        # return Response(response_dict, status=status.HTTP_201_CREATED)
        # pass
        response_dict = {"test": "hello"}
        return Response(response_dict, status=status.HTTP_200_CREATED)
