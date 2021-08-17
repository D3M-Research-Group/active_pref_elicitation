from django.shortcuts import render
from rest_framework import serializers, viewsets
from .serializers import NextChoiceSerializer, SessionInfoSerializer, ChoicesSerializer
from .models import NextChoice, SessionInfo, Choices

# The viewsets base class provides an implementation of CRUD operations by default
class NextChoiceView(viewsets.ModelViewSet):
    serializer_class = NextChoiceSerializer
    queryset = NextChoice.objects.all()

class SessionInfoView(viewsets.ModelViewSet):
    serializer_class = SessionInfoSerializer
    queryset = SessionInfo.objects.all()

class ChoicesView(viewsets.ModelViewSet):
    serializer_class = ChoicesSerializer
    queryset = SessionInfo.objects.all()