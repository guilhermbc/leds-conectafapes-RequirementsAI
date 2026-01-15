# 📂 Folder Structure

```
.
├── streamlit_app/            # User Interface
│   ├── app_streamlit.py      # Main App
│   ├── dockerfile            # Interface Dockerfile
│   └── requirements.txt      # Dependencies
│
├── webhook_server/           # Backend with FastAPI + LangGraph
│   ├── main.py               # Server Entrypoint
│   ├── webhook_server.py     # Initializes LangGraph via endpoint
│   ├── graph.py              # Graph node definitions
│   ├── state.py              # Shared state definition
│   ├── agents/               # Specialized agents per task
│   └── dockerfile            # Backend Dockerfile
│
├── shared/uploads/           # Video uploads and transcriptions
├── docker-compose.yml        # Runs Streamlit + FastAPI together
└── README.md
```