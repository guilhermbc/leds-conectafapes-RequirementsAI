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