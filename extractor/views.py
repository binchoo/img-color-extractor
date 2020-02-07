from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views.generic.base import View
# Create your views here.

class MyView(View) :
    #@method_decorator(login_required)
    def get(self, request, *args, **kwargs) :
        return render(request, 'home.html')