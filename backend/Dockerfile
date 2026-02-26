FROM python:3.12-slim

# Variáveis seguras e não sensíveis
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app/backend

# Dependências do sistema
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    libpq-dev \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# Instala dependências Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia projeto
COPY . .

# Dá permissão ao entrypoint
RUN chmod +x /app/backend/entrypoint.sh

EXPOSE 8000

CMD ["/app/backend/entrypoint.sh"]