#!/bin/sh

echo "Running migrations..."
python manage.py makemigrations --noinput

echo "Applying migrations..."
python manage.py migrate --noinput

echo "Collecting static..."
python manage.py collectstatic --noinput

echo "Creating superuser..."
python manage.py createsuperuser --noinput || true

echo "Creating OAuth application..."

python manage.py shell <<EOF
from django.contrib.auth import get_user_model
from oauth2_provider.models import Application

User = get_user_model()

username = "$DJANGO_SUPERUSER_USERNAME"
client_id = "$OAUTH_CLIENT_ID"

user = User.objects.get(username=username)

if not Application.objects.filter(client_id=client_id).exists():
    Application.objects.create(
        name="Frontend",
        user=user,
        client_id=client_id,
        client_type=Application.CLIENT_PUBLIC,
        authorization_grant_type=Application.GRANT_PASSWORD,
    )
    print("OAuth application created.")
else:
    print("OAuth application already exists.")
EOF

echo "Starting server..."
exec gunicorn --bind 0.0.0.0:8000 --workers=2 rai.wsgi:application --timeout 120
