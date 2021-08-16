from django.shortcuts import render
from rest_framework import viewsets
from .serializers import NextChoiceSerializer
from .models import NextChoice

# The viewsets base class provides an implementation of CRUD operations by default
class NextChoiceView(viewsets.ModelViewSet):
    serializer_class = NextChoiceSerializer
    queryset = NextChoice.objects.all()
