# Requirement AssIstant (RAI)

Requirements AssIstant (RAI) is an LLM-based multi-agent tool that generates requirements engineering artifacts from requirements elicitation sessions recorded as audio or video. 

## Generated Artifacts and Generation Workflow

By leveraging automatic speech recognition and natural language processing, RAI captures and interprets conversations recorded during requirements elicitation sessions, extracts relevant information, and structures it into a **domain storytelling**. Based on this narrative, RAI generates a **requirements** document comprising functional requirements (FR), business rules (BR), and non-functional requirements (NFR), plus questions aimed at assisting the requirements engineer in improving domain understanding and clarifying or refining requirements. Finally, from the requirements document, RAI derives a **use case** diagram with use case descriptions, and a **class diagram** accompanied by a data dictionary.

## System Architecture

The solution consists of two main services:

- **TypeScript (Vue + Tailwind)**: allows video uploads and displays results with versioning.
- **Python Django MVC with Langgraph**: allows projects, modules and artifacts management and orchestrates LLM agents for transcription, analysis, and generation of structured requirements engineering artifacts.

## Documentation Structure

This documentation is organized into the following sections:

- Getting Started – Installation, configuration, and execution instructions.
- Architecture – System architecture, workflow, agents, and components.
- User Guide – How to use the platform and generate artifacts.
- References – Bibliographic references and supporting materials.
- Contributing – Guidelines for contributors and collaborators.