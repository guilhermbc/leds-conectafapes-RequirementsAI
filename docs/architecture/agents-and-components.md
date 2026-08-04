# Agents and Components

This page describes the specialized LLM agents used by Requirement AssIstant (RAI). Each generation workflow is composed of multiple agents, where each agent is responsible for a specific task in the artifact generation pipeline.

---

# Domain Storytelling Workflow

| Agent                            | Responsibility                                         |
| -------------------------------- | ------------------------------------------------------ |
| **Audio Transcription**          | Transcribes the uploaded audio or video into text.     |
| **Generate Domain Storytelling** | Produces a domain storytelling from the transcription. |

---

# Requirements Workflow

| Agent                       | Responsibility                                                                                                    |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Analyze Documentation**   | Identifies functional requirements, non-functional requirements, and business rules from the domain storytelling. |
| **Extract Requirements**    | Organizes the identified requirements into structured requirement tables.                                         |
| **Prioritize Requirements** | Assigns a priority level (Low, Medium, or High) to each requirement.                                              |
| **Refine Requirements**     | Reviews and refines the generated requirements before producing the final artifact.                               |

---

# Use Case Workflow

| Agent                         | Responsibility                                             |
| ----------------------------- | ---------------------------------------------------------- |
| **Identify Use Cases**        | Identifies use cases and their corresponding actors.       |
| **Identify Events**           | Identifies the flow of events for each use case.           |
| **Validate Use Cases**        | Reviews and validates the generated use case descriptions. |
| **Format Use Cases**          | Produces a structured table summarizing the use cases.     |
| **Generate Use Case Diagram** | Generates the use case diagram in PlantUML format.         |

---

# Class Diagram Workflow

| Agent                     | Responsibility                                                                  |
| ------------------------- | ------------------------------------------------------------------------------- |
| **Identify Classes**      | Identifies classes, attributes, and relationships from the generated artifacts. |
| **Extract Class Diagram** | Generates the class diagram and its corresponding data dictionary.              |
| **Revise Class Diagram**  | Adds integrity constraints to the generated class diagram.                      |
| **Refine Class Diagram**  | Performs a final review and refinement of the class diagram before delivery.    |

# Revision Workflow

| Agent                           | Responsibility                                                                     |
| ------------------------------- | ---------------------------------------------------------------------------------- |
| **Revise Use Case Description** | Given a class diagram, search for and fixes inconsistencies in the UC description. |
| **Revise Use Case Table**       | Given a class diagram, search for and fixes inconsistencies in the UC table.       |
| **Revise Use Case Diagram**     | Given a class diagram, search for and fixes inconsistencies in the UC diagram.     |
| **Revise Class Diagram**        | Given use cases, search for and fixes inconsistencies in the class diagram.        |
