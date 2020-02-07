
from django.urls import path
from extractor.views import MyView

urlpatterns = [
    path('', MyView.as_view()),
]
