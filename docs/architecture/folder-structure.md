# Folder Structure

This page presents the overall organization of the Requirement AssIstant (RAI) source code and describes the purpose of each major directory.

> **Note:** The structure shown below highlights only the main project directories. Internal implementation details have been omitted for clarity.

---

# Project Structure

```text
requirements-ai/
├── backend/
├── frontend/
├── docs/
├── docker-compose.yml
├── shared/
├── README.md
├── mkdocs.yml

```

---

# Backend

The `backend` directory contains the Django application responsible for business logic, persistence, API endpoints, and orchestration of the LLM workflows.

```text
backend/
├── apps/
│   └── classes/
├── features/
├── rai/
├── webhook_server/
├── entrypoint.sh
└── manage.py
```

Its main responsibilities are:

* Project and module management
* Artifact persistence
* REST API
* Authentication and authorization
* Background task management
* Integration with LangGraph workflows

## apps/

```text
apps/
├── migrations/
├── services/
│   └── document_generation_service.py
└── classes/
    ├── admin.py
    ├── api_urls.py
    ├── api_views.py
    ├── apps.py
    ├── filters.py
    ├── models.py
    ├── pagination.py 
    ├── serializers.py
    ├── signals.py
    ├── tasks.py
    └── utils.py
```

| Component                        | Responsibility                                               |
| -------------------------------- | ------------------------------------------------------------ |
| `migrations/`                    | Database schema migrations.                                  |
| `services/`                      | Business logic implementation.                               |
| `document_generation_service.py` | Coordinates artifact generation workflows.                   |
| `classes/`                       | Main Django application containing the API and domain logic. |

| Component        | Responsibility                     |
| ---------------- | ---------------------------------- |
| `admin.py`       | Django admin configuration.        |
| `api_urls.py`    | API route definitions.             |
| `api_views.py`   | REST API endpoints.                |
| `apps.py`        | Django application configuration.  |
| `filters.py`     | API filtering logic.               |
| `models.py`      | Database models.                   |
| `pagination.py`  | API pagination configuration.      |
| `serializers.py` | Data serialization and validation. |
| `signals.py`     | Django signal handlers.            |
| `tasks.py`       | Asynchronous Celery tasks.         |
| `utils.py`       | Shared utility functions.          |


## webhook_server/

```text
webhook_server/
├── agents/
├── graphs/
├── nodes/
├── utils/
├── webhook_server_functions/
├── app_config.py
└──  state.py
```

| Component                       | Responsibility                     |
| ------------------------------- | ---------------------------------- |
| `agents/`                       | Artifact generation agents.        |
| `graphs/`                       | Artifact generation graphs.        |
| `nodes/`                        | Artifact generation graphs  nodes. |
| `utils/`                        | Shared utility functions.          |
| `webhook_server_functions/`     | Graphs running functions.          |
| `app_config.py`                 | LLM API key setting.               |
| `state.py`                      | LangGraph state configuration.     |


## rai/

```text
rai/
├── settings/
├── asgi.py
├── celery.py
├── urls.py
└── wsgi.py
```

| Component   | Responsibility                                        |
| ----------- | ----------------------------------------------------- |
| `settings/` | Django settings for different execution environments. |
| `asgi.py`   | Entry point for asynchronous application servers.     |
| `celery.py` | Celery application configuration.                     |
| `urls.py`   | Root URL configuration.                               |
| `wsgi.py`   | Entry point for synchronous application servers.      |

---

# Frontend

The `frontend` directory contains the Vue.js application that provides the user interface. The frontend follows a feature-based modular architecture, where each module encapsulates its own views, API layer, controllers, routes, localization files, and type definitions. This organization promotes separation of concerns, maintainability, and scalability.


```text
frontend/
├── src/
│   ├── api/
│   ├── assets/
│   ├── components/
│   ├── composables/
│   ├── layouts/
│   ├── locales/
│   ├── modules/
│   ├── plugins/
│   ├── routes/
│   ├── stores/
│   ├── types/
│   ├── utils/
│   ├── views/
│   ├── App.vue
│   └── main.ts
├── public/
├── package.json
└── vite.config.js
```

Its responsibilities include:

* User interface
* Authentication
* Project management
* File uploads
* Artifact visualization
* Artifact editing
* Version navigation

---

# Documentation

The `docs` directory contains the MkDocs documentation for the project.

```text
docs/
├── getting-started/
├── agents/
├── architecture/
├── user-guide/
├── references.md
├── code-of-conduct.md
└── contribution.md
```

This documentation is automatically rendered using MkDocs Material.

---

# Root Files

Several configuration files are located in the project root.

| File                       | Purpose                                                                |
| -------------------------- | -----------------------------------------------------------------------|
| `README.md`                | Project overview and quick start instructions                          |
| `mkdocs.yml`               | MkDocs configuration                                                   |
| `docker-compose.yml`       | Defines the containerized application stack                            |
| `docker-compose.infra.yml` | Defines the infrastructure containers, such as PostgreSQL and Redis.   |

Additional configuration files may also be present depending on the development environment.

