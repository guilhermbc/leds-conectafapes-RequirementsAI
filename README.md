# Requirement AssIstant – Intelligent Requirements Extraction Pipeline

This repository demonstrates a complete software requirements extraction pipeline from video interviews, utilizing Natural Language Models (LLMs), LangGraph, specialized agents, and a user-friendly Streamlit interface.

The solution consists of two main services:

  - **Streamlit Interface**: allows video uploads and displays results.
  - **FastAPI Server with LangGraph**: orchestrates LLM agents for transcription, analysis, and generation of structured requirements.

-----

## Pipeline Overview

1.  Upload an interview video (MKV, MP4, etc.).
2.  Automated audio transcription via LLM (Gemini/OpenAI).
3.  Generation of a miniworld from the transcription.
4.  Analysis and classification of requirements:
      - Functional Requirements (FR)
      - Business Rules (BR)
      - Non-Functional Requirements (NFR)
5.  Agents refine, validate, and organize the data.
6.  Final result: Markdown with three resulting tables.

## Graphical Representation

![alt text](image.png)

---

## 📂 Folder Structure

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

-----

## Running the Project

### Requirements (for local execution):

  - Python 3.12+
  - [Poetry](https://python-poetry.org/) or `pip`
  - Gemini API key (`GEMINI_API_KEY`) or OpenAI

## Configuring the project

1.  **Clone the repository and access the folder:**

<!-- end list -->

```bash
git clone https://github.com/profmoisesomena/RequirementsAI.git
cd RequirementsAI
```

2.  **Set environment variables:**

<!-- end list -->

```bash
cp webhook_server/.env.example webhook_server/.env
```

Edit the `.env` file and provide:

  - `GEMINI_API_KEY` (required)
  - `LANGSMITH_API_KEY`, `LANGSMITH_PROJECT`, `LANGSMITH_TRACING` (optional)

## Creating virtual environment

```bash
python3.12 -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
```

### Using Docker Compose

```bash
docker-compose up --build
```

  - Streamlit will be accessible at http://localhost:8501
  - The FastAPI backend runs internally (port 8001), without direct exposure

### Manual Execution

### Backend (FastAPI):

Access the webhook\_server folder and run the python3 webhook\_server.py command

```bash
cd webhook_server
pip install -r requirements.txt 
pip install -U "langgraph-cli[inmem]" # for langgraph dev
python3 webhook_server.py
```

### Frontend (Streamlit):

Open a new terminal and access the streamlit\_app folder and run the streamlit run app\_streamlit.py command

```bash
cd streamlit_app
# pip install -r requirements.txt
pip install -r reduced_requirements.txt
# Adjust app_streamlit.py to use "http://localhost:8001 or via docker"
streamlit run app_streamlit.py --server.port=8501
```

Now access: http://localhost:8501 and you will see Streamlit running in your local environment.

The FastAPI backend will run at http://localhost:8001

The response will come in Markdown format with the extracted requirements. The final Markdown is saved as `report_YYYYMMDD_HHMMSS.md`.

-----

## Agents and Components

| Agent                  | Main Function                                    |
|------------------------|--------------------------------------------------|
| `agent_transcricao`    | Transcribe audio/video                           |
| `agent_minimundo`      | Generate textual context overview (miniworld)    |
| `agent_analise`        | Analyze the miniworld and generate requirements  |
| `agent_refinamento`    | Refine and classify requirements (FR, BR, NFR)   |
| `agent_validacao`      | Validate and structure the final response in Markdown |

All agents are organized via LangGraph in the `graph.py` file, respecting state transitions and allowing traceability with LangSmith's `@traceable`.

-----

## Input Files (audio or video)

  - `shared/uploads/*.mkv` – Interview videos
  - `*.wav`, `*.mp3` – Interview audio

-----

## References

  - [LangGraph](https://langchain-ai.github.io/langgraph/)
  - [Gemini API](https://ai.google.dev/)
  - [LangSmith Traceable](https://docs.smith.langchain.com/)
  - [Streamlit](https://streamlit.io/)
  - [FastAPI](https://fastapi.tiangolo.com/)

-----

## Contribution

Pull requests are welcome\! For issues or suggestions, please open an *issue*. 
