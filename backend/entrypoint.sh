#!/bin/sh

echo "Aplicando migrations..."
python manage.py migrate --noinput

echo "Coletando arquivos estáticos..."
python manage.py collectstatic --noinput

echo "Iniciando Gunicorn..."
exec gunicorn rai.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers 3 \
  --timeout 120