# Installation

This guide explains how to install and set up Requirement AssIstant (RAI) in your local environment or using Docker.

This page focuses only on setting up and running the project for the first time. For environment-specific parameters and API keys, refer to the **Configuration** section.

---

## 1. Prerequisites

Before starting, ensure you have the following installed:

* Python 3.12 or higher
* Node.js 18 or higher
* Git
* Docker and Docker Compose (optional, if using containerized setup)

---

## 2. Clone the Repository

Start by cloning the project repository:

```bash id="9k2d1a"
git clone https://github.com/leds-conectafapes/leds-conectafapes-RequirementsAI.git
```

---

## 3. Backend Setup

The backend is built with **Python (Django + LangGraph)**.

### 3.1 Create a virtual environment

```bash id="v3n8qp"
py -3.12 -m venv env
```

Activate it:

```bash id="k1x9lz"
# Linux/macOS
source .venv/bin/activate

# Windows
.venv\Scripts\activate
```

---

### 3.2 Install dependencies

```bash id="m8c2pw"
pip install -r requirements.txt
```

---

### 3.3 Run database migrations

```bash id="t7q1sd"
python manage.py migrate
```

---

### 3.4 Start the backend server

```bash id="h4z9xk"
python manage.py runserver
```

The backend will be available at:

```
http://localhost:8000
```

---

## 4. Frontend Setup

The frontend is built with **Vue.js + Tailwind CSS**.

### 4.1 Install dependencies

```bash id="r6p1ab"
cd frontend
npm install
```

---

### 4.2 Start development server

```bash id="w2t8nc"
npm run dev
```

The frontend will be available at:

```
http://localhost:5173
```

---

## 5. Docker Setup (Optional)

You can run the entire system using Docker Compose:

```bash id="d9v4mf"
docker compose up --build
```

This will start:

* Backend service
* Frontend service
* All required supporting services

---

## 6. Installation Verification

After completing the setup, verify that:

* Backend is running at `http://localhost:8000`
* Frontend is running at `http://localhost:5173`
* The frontend can communicate with the backend API

---

## 7. Next Step

After installation, proceed to:

* **Configuration** – to set environment variables and system parameters
* **Running the Project** – to understand execution modes and workflows
