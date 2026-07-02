# User Guide

This guide describes the main workflow of Requirement AssIstant (RAI), from creating a project to generating and managing requirements engineering artifacts.

RAI can be accessed either through a local installation or the hosted instance available at:

> https://rai.leds.dev.br/

---

# 1. Create a Project

After logging into RAI, create a new project by providing:

* Project name
* Project description

Then, create one or more modules associated with the project.

Each module represents a functional area of the software and serves as the basis for artifact generation.

---

# 2. Start the Generation Process

Open the desired module and click **Start Requirements Specification and Analysis**.

A dialog will be displayed allowing you to:

* Select the first artifact to generate (Domain Storytelling)
* Upload an audio or video recording from a requirements elicitation session

Click **Create** to start the generation.

RAI will process the uploaded file and automatically generate the first artifact.

---

# 3. Generate the Remaining Artifacts

After the Domain Storytelling has been generated, RAI guides the user through the remaining artifact generation process.

Each artifact page contains a button for generating the next artifact in the pipeline.

The generation sequence is:

1. Domain Storytelling
2. Requirements 
3. Use Cases
4. Class Diagram

Each artifact uses the previous one as its primary source.

---

# 4. Review and Edit Artifacts

At any point in the workflow, artifacts can be reviewed and updated.

Available actions include:

* Viewing the generated content
* Editing the artifact
* Downloading it as a Markdown file
* Uploading a revised version
* Continuing the generation process using the revised artifact

This allows the requirements engineer to refine intermediate artifacts before proceeding to the next stages.

---

# 5. Browse Generated Artifacts

Each module maintains the complete history of generated artifacts.

Artifacts are organized by:

* Artifact type
* Version

The current versions are displayed separately from historical versions, making it easy to identify the latest approved artifacts.

Selecting an artifact opens its detailed view.

---

# 6. Artifact Traceability

RAI maintains traceability among all generated artifacts.

From an artifact page, it is possible to:

* View its source artifact
* View derived artifacts
* Navigate between previous and newer versions
* Inspect relationships throughout the generation pipeline

This traceability helps users understand how information evolves during the requirements engineering process.

---

# 7. Synchronization Management

Whenever a new version of an artifact is created, RAI checks whether subsequent artifacts were generated from an older version. If so, the affected artifacts are marked as **Out of Sync**.

This informs the requirements engineer that those artifacts may need to be regenerated to maintain consistency.

This mechanism preserves:

* Artifact history
* Version control
* Traceability
* Consistency throughout the generation pipeline