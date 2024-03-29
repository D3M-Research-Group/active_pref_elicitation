"""backend URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
# from backend.APE.views import NextChoiceView
# from backend.backend.APE.views import ChoicesView, Ses
from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from APE import views


urlpatterns = [
    path("admin/", admin.site.urls),
    path("choices/", views.ChoicesView.as_view(), name="choice"),
    path("sessioninfo/", views.SessionInfoView.as_view(), name="session info"),
    path("forminfo/", views.FormInfoView.as_view(), name="form info"),
    path(
        "memorywipeinfo/", views.MemoryWipeView.as_view(), name="memory wipe form info"
    ),
    path("next_query/", views.NextChoiceView.as_view(), name="next_query"),
    path("rec_policy/", views.RecommendPolicyView.as_view(), name="recommended policy"),
    path("dataset/", views.PolicyDataView.as_view(), name="datasets"),
]
