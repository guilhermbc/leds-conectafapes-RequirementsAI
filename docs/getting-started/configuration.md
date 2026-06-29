# Configuration

Requirement AssIstant (RAI) uses environment variables to configure both the backend and frontend applications.

Before running the project, you must create two environment files:

* `backend/.env`
* `frontend/.env`

Both files can be created by copying their respective `.env.example` files.

---

## Backend Configuration

Navigate to the `backend` directory and create the environment file:

```bash
cp .env.example .env
```

If you are using Windows:

```powershell
copy .env.example .env
```

The backend configuration contains settings for:

* Google Gemini API
* LangSmith tracing
* Django
* Database connection
* CORS
* Celery and Redis
* Email service
* Application settings

### Required Variables

The following variables must be configured before running the backend:

| Variable                    | Description                                              |
| --------------------------- | -------------------------------------------------------- |
| `GEMINI_API_KEY`            | API key used to access Google Gemini models.             |
| `LANGSMITH_API_KEY`         | API key for LangSmith (optional if tracing is disabled). |
| `CORS_ORIGIN`               | URL of the frontend application.                         |
| `OAUTH_CLIENT_ID`              | OAuth client identifier used by the application. (must be the same as the frontend) |
| `DJANGO_ALLOWED_HOSTS`      | Backend host address.                                    |
| `DJANGO_SUPERUSER_USERNAME` | Django administrator username.                           |
| `DJANGO_SUPERUSER_EMAIL`    | Django administrator email.                              |
| `DJANGO_SUPERUSER_PASSWORD` | Django administrator password.                           |

The remaining variables already have default values suitable for local development and generally do not need to be modified.

---

## Frontend Configuration

Navigate to the `frontend` directory and create the environment file:

```bash
cp .env.example .env
```

or, on Windows:

```powershell
copy .env.example .env
```

The frontend currently requires the following variables:

| Variable                      | Description                                      |
| ----------------------------- | ------------------------------------------------ |
| `VITE_BACKEND_ADMIN_BASE_URL` | Base URL of the backend server.                  |
| `VITE_CLIENT_ID`              | OAuth client identifier used by the application. |

---

## Local Development

For a typical local setup, verify that:

* `VITE_BACKEND_ADMIN_BASE_URL` points to your local backend.
* `CORS_ORIGIN` points to your local frontend.
* `DJANGO_ALLOWED_HOSTS` includes the backend address.
* `GEMINI_API_KEY` contains a valid API key.

---

## Production Configuration

When deploying RAI to a production environment, review the following settings:

* Database configuration
* `DEBUG`
* `ALLOWED_HOSTS`
* `DJANGO_SETTINGS_MODULE`
* Celery and Redis URLs
* Email service credentials
* CORS and CSRF settings

These values depend on the target deployment environment and should be adjusted accordingly.
