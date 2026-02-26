#!/bin/sh

echo "Applying migrations..."
python manage.py migrate --noinput

echo "Collecting static..."
python manage.py collectstatic --noinput

echo "Creating superuser..."
python manage.py createsuperuser --noinput || true

echo "Creating OAuth application..."
python manage.py createapplication public password --user "$DJANGO_SUPERUSER_USERNAME" --client-id "$OAUTH_CLIENT_ID" || true

echo "Starting server..."
exec gunicorn --bind 0.0.0.0:8000 --workers=2 rai.wsgi:application