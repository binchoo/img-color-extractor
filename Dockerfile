FROM python:3.7

WORKDIR /myproject
EXPOSE 8000
RUN ["pip", "install", "django"]
ENTRYPOINT ["python", "manage.py", "runserver", "0.0.0.0:8000"]