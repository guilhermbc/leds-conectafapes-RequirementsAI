## Miniworld Agents

1. **Audio Transcription:** Read and transcribe the audio file. Returns the transcription of the audio; and
2. **Generate Miniworld:** Based in the transcription, creates a description of the software.

## Requirements Tables Agents

1. **Analyze Documentation:** Given the miniworld (also called Domain Narrative), returns the identified Functional Requirements (FRs), Non Functional Requirements (NFRs) and the Business Rules (BRs);
2. **Extract Requirements:** Given the identified requirements, returns 3 formated requirements tables, one for each type of requirement (FR, NFR and BR);
3. **Prioritize Requirements:** Given the formated requirements tables, give each requirement a priority level (Low, Mid or High); and
4. **Refine Requirements:** Given the formated and prioritized requirements tables, run a final revision before returning the requirements tables to the user.

## Use Cases Agents

1. **Identify Use Cases:** Given the Miniworld and the Requirements Tables, identifies the use cases and their actors;
2. **Identift Events:** Given the Miniworld, the Requirements Tables and the identified use cases, identifies the events of each use case;
3. **Validate Use Cases:** Given the identified use cases and their events, returns a formated and reviewed description of each use case;
4. **Format Use Cases:** Given the formated description of the use cases, returns a table with the main informations of each use case; and
5. **Generate Use Cases Diagram:** Given the use cases table, returns the use cases diagram in PlantUML.

## Class Diagram Agents

1. **Identify Classes:** Given the Miniworld and the Requirements Tables, identifies the classes, their attributes and their relations with other classes;
2. **Extract Class Diagram:** Given the identifies classes, returns a class diagram with them and the data dictionary for the said class diagram;
3. **Revise Class Diagram:** Given the class diagram, adds the needed integrity constraints to it; and
4. **Refine Class Diagram:** Given the class diagram with the integrity constraints, do a final revision to it.

## Interface Prototype Agents

1. **Interface:** Given the Requirements Tables, the Use Case Description and the Class Diagram, creates a SPA HTML to be the interface prototype for the system; and
2. **Interface Description:** Given the Use Case Description and the SPA code, returns a description of the interface prototype.

-----

## Input Files (audio or video)

### Miniworld Generation
  - `shared/uploads/*.mkv` – Interview videos
  - `*.wav`, `*.mp3` – Interview audio

### Requirements Generation
  - Miniworld - Markdown document

### Use Cases Generation
  - Miniworld - Markdown document
  - Requirements - Markdown document

### Class Diagram Generation
  - Miniworld - Markdown document
  - Requirements - Markdown document
  - Use Cases - Markdown document

### Interface Prototype Generation
  - Miniworld - Markdown document
  - Requirements - Markdown document
  - Use Cases - Markdown document
  - Class Diagram - Markdown document
-----

## References

  - [LangGraph](https://langchain-ai.github.io/langgraph/)
  - [Gemini API](https://ai.google.dev/)
  - [LangSmith Traceable](https://docs.smith.langchain.com/)
  - [Streamlit](https://streamlit.io/)
  - [FastAPI](https://fastapi.tiangolo.com/)