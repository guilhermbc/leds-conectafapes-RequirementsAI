# How to run: Backend
Ir para a pasta `backend`
```bash
cd backend
```

Criar as migrações
```bash
python manage.py makemigrations
```

Executar as migrações
```bash
python manage.py migrate
```

Criar superuser (admin)
```bash
python manage.py createsuperuser
```

Coletar estatisticas
```bash
python manage.py collectstatic
```

Executar servidor de desenvolvimento
```bash
python manage.py runserver
```