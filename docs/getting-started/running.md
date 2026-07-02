# Running the Project

This page describes the available methods for running Requirement AssIstant (RAI).

Before proceeding, make sure you have completed the steps described in the **Installation** and **Configuration** sections.

---

## Running with Docker (Recommended)

The easiest way to start the entire application is by using Docker Compose.

From the project root directory, execute:

```bash
docker compose up --build
```

This command starts all required services, including:

* Backend (Django)
* Frontend (Vue.js)
* Redis
* Celery Worker
* Celery Beat (if configured)

To stop the application:

```bash
docker compose down
```

---

## Running Locally

If you prefer not to use Docker, the frontend and backend must be started separately.

### Start the Backend

Navigate to the backend directory:

```bash
cd backend
```

Activate the virtual environment:

```bash
# Linux/macOS
source .venv/bin/activate

# Windows
.venv\Scripts\activate
```

Start the Django development server:

```bash
python manage.py runserver
```

By default, the backend will be available at:

```text
http://localhost:8000
```

---

### Start Celery

Open another terminal in the backend directory and activate the virtual environment.

Start the Celery worker:

```bash
celery -A rai worker --loglevel=info
```

If your project uses Celery Beat, start it in another terminal:

```bash
celery -A rai beat --loglevel=info
```

---

### Start Redis

If Redis is not running through Docker, start a local Redis server before starting Celery.

---

### Start the Frontend

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies (only the first time):

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at:

```text
http://localhost:5173
```
