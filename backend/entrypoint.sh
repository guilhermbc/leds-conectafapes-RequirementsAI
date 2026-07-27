#!/bin/sh

set -e

echo "Waiting for PostgreSQL..."

if [ -z "$DB_HOST_PRODUCTION" ] || [ -z "$DB_PORT_PRODUCTION" ]; then
    echo "DB_HOST_PRODUCTION ou DB_PORT_PRODUCTION não definidos."
    exit 1
fi

until nc -z "$DB_HOST_PRODUCTION" "$DB_PORT_PRODUCTION"; do
    echo "Waiting for PostgreSQL..."
    sleep 1
done

echo "PostgreSQL started"

echo "Applying migrations..."
python manage.py migrate --noinput

echo "Collecting static..."
python manage.py collectstatic --noinput

echo "Creating Superuser e OAuth Application..."

python manage.py shell <<EOF
from django.contrib.auth import get_user_model
from oauth2_provider.models import Application
import os

User = get_user_model()

username = os.environ.get("DJANGO_SUPERUSER_USERNAME", "admin")
email = os.environ.get("DJANGO_SUPERUSER_EMAIL", "admin@admin.com")
password = os.environ.get("DJANGO_SUPERUSER_PASSWORD", "admin123")
client_id = os.environ.get("OAUTH_CLIENT_ID", "teste123")

# Criar ou atualizar usuário
user, created = User.objects.get_or_create(
    username=username,
    defaults={'email': email}
)

# Garante que o usuário esteja sempre válido
user.email = email
user.is_superuser = True
user.is_staff = True
user.is_active = True
user.set_password(password)
user.save()

if created:
    print(f"-> Superusuario '{username}' criado com sucesso!")
else:
    print(f"-> Superusuario '{username}' atualizado!")

# Criar ou atualizar aplicação OAuth
app, app_created = Application.objects.get_or_create(
    client_id=client_id,
    defaults={
        "name": "Frontend",
        "user": user,
        "client_type": Application.CLIENT_PUBLIC,
        "authorization_grant_type": Application.GRANT_PASSWORD,
    }
)

# Garante consistência mesmo se já existir
app.user = user
app.client_type = Application.CLIENT_PUBLIC
app.authorization_grant_type = Application.GRANT_PASSWORD
app.name = "Frontend"
app.save()

if app_created:
    print("-> Aplicacao OAuth criada com sucesso!")
else:
    print("-> Aplicacao OAuth atualizada!")
EOF

echo "Starting server..."
exec gunicorn --bind 0.0.0.0:8000 --workers=2 rai.wsgi:application --timeout 300