# Pipeline Overview

The Artifacts Generation is oriented by generated artifact. So, there are multiple pipelines, each focused in a specific artifact. The artifacts and their logical order are defined below. A more in depth explanation of each agent for each pipeline can be found at [Agents and Components](./agents_and_components.md)

## Artifacts

The artifacts created by the RAI can be divided in the following categories:
* **Domain Storytelling:** A initial description of the problem and the software.
* **Requirements:** 3 tables for the software requirements. Each table is used for a type of requirement, knowingly, Funcional (FR), Non Funcional (NFR) and Business Rules (BR).
* **Use Cases:** A use case diagram, a table with a general description of each use case and a complete description of each use case.
* **Class Diagram:** A class diagram with all the domain classes identified and a data dictionary explaining each class.
* **Interface Prototype:** A HTML SPA interface prototype and a artifact explaining the generated prototype.

### AI Artifact Generation

The creation of the artifacts use the following logical order:
1. Given the audio, then create the **miniworld**;
2. Given the **miniworld**, then create the **requirements tables**;
3. Given the **miniworld** and the **requirements tables**, then create the **use cases**;
4. Given the **miniworld**, the **requirements tables** and the **use cases**, then create the **class diagram**; and
5. Given the use cases and the class diagram, then create the **interface prototype**