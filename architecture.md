# RAI Architecture

## Backend

* **Architecture:** Python Django MVC

There are 3 main folders in the **backend**: **apps**, **rai** and **webhook_server**

### Apps (Classes)

This folder is responsible for defining the models of the domain classes and their API views. The models, defined in the ``models.py`` file and are the following: *Projeto* (Project), *Modulo* (Module) and *Documentos* (Documents). For the system, a document can have one of the following types: *Minimundo* (Miniworld), *Tabela de Requisitos* (Requirements Table), *Casos de Uso* (Use Cases), *Diagrama de Classes* (Class Diagram) e *Protótipo de Interface* (Interface Prototype). Finally, the diagram for the described domain classes can be found [here](./docs/classes/classdiagram.puml).

For each domain class is created a standard view with API routes exposed for using the backend, this views can de found in the ``api_views.py`` file. It is important to notice that the used views by the backend is not the standard created by the Django library, but the used views are modified versions of them. This modifications can also be found in the methods overrides also in the ``api_views.py``.

The contents of each view is described below:
* ***Projeto* view:** Creates, updates and deletes projects from the database. Reads and lists projects with the modules of each project.

* ***Modulo* view:** Creates, updates and deletes modules from the database. Reads and lists modules with the documents of each project.

* ***Documentos* view:** Creates documents based on the given audio of a interview about a software project requirements, use cases and classes (using agentic AI). Reads, updates, deletes and lists documents in the database. Also, it uses a enum to define the types of each document.

### Rai (Database)

The information for the database and general configurations are defined here. The ``setting`` folder is where the definitions of the `.env` file are used. There are 3 segments of this configutations organized in 4 files defined below:
* **Base Settings (`base.py`):** Base configurations used in all types of initialization of the backend;
* **Local Settings (`local.py`):** Configurations for the daabase in local/development use;
* **Test Settings (`test.py`):** Configurations for the database in testing; and
* **Production Settings (``production.py`):** Configurations for the database in production.

Also, there are definitions for the application in both ASGI (Asynchronous Server Gateway Interface) and WSGI (Web Server Gateway Interface).

### Webhook Server (AI graphs and functions)

The `webhook_server` folder have the definitions of the graphs (in the `graphs` folder) and the agents (in the `agents` and in the `nodes` folders) used in the generation of the documents contents. It also define the functions to execute the AI graphs (found in the `webhook_server_functions` folder). Each graph is responsible for the creation of a artifact. The artifacts are the same that define the types of the documents in the Document Class.

> OBS: The names used to describe the agents are based on the names used on the graphs to facilitate the identifications of the agents in the code.

#### Miniworld Agents

1. **Audio Transcription:** Read and transcribe the audio file. Returns the transcription of the audio; and
2. **Generate Miniworld:** Based in the transcription, creates a description of the software.

#### Requirements Tables Agents

1. **Analyze Documentation:** Given the miniworld (also called Domain Narrative), returns the identified Functional Requirements (FRs), Non Functional Requirements (NFRs) and the Business Rules (BRs);
2. **Extract Requirements:** Given the identified requirements, returns 3 formated requirements tables, one for each type of requirement (FR, NFR and BR);
3. **Prioritize Requirements:** Given the formated requirements tables, give each requirement a priority level (Low, Mid or High); and
4. **Refine Requirements:** Given the formated and prioritized requirements tables, run a final revision before returning the requirements tables to the user.

#### Use Cases Agents

1. **Identify Use Cases:** Given the Miniworld and the Requirements Tables, identifies the use cases and their actors;
2. **Identift Events:** Given the Miniworld, the Requirements Tables and the identified use cases, identifies the events of each use case;
3. **Validate Use Cases:** Given the identified use cases and their events, returns a formated and reviewed description of each use case;
4. **Format Use Cases:** Given the formated description of the use cases, returns a table with the main informations of each use case; and
5. **Generate Use Cases Diagram:** Given the use cases table, returns the use cases diagram in PlantUML.

#### Class Diagram Agents

1. **Identify Classes:** Given the Miniworld and the Requirements Tables, identifies the classes, their attributes and their relations with other classes;
2. **Extract Class Diagram:** Given the identifies classes, returns a class diagram with them and the data dictionary for the said class diagram;
3. **Revise Class Diagram:** Given the class diagram, adds the needed integrity constraints to it; and
4. **Refine Class Diagram:** Given the class diagram with the integrity constraints, do a final revision to it.

#### Interface Prototype Agents

1. **Interface:** Given the Requirements Tables, the Use Case Description and the Class Diagram, creates a SPA HTML to be the interface prototype for the system; and
2. **Interface Description:** Given the Use Case Description and the SPA code, returns a description of the interface prototype.

## Frontend

* **Architecture:** TypeScript (Vue + Tailwind), Conecta Architecture.

The frontend reflects the backend domain classes acessing its CRUDs routes.

### The Src Folder
Besides configurations files and the png icon in the public folder, the src folder is what you will find in the frontend folder. It is the most important folder because it is where the frontend code is found. Inside of it the following structure exists:
```
src
    |--- api            // configuration for the backend connection
    |--- assets         // logo image files and a tailwindcss import
    |--- components     // components used in the layouts and in the pages
    |--- layouts        // layouts for the pages
    |--- modules        // standarized structure for the domain classes
        |--- Projeto    // used as example, the same structure is aplied to the other two folders
            |--- api            // configuration for the Projeto routes in the backend (using functions as abstraction)
            |--- controllers    // controllers for the Projeto functions (from the api folder)
            |--- routes         // frontend Projeto routes
            |--- types          // Projeto object and return objects
            |--- views          // Pages specific for the Projeto (create, read and list)
        |--- Modulo
        |--- Documento
    |--- plugins        // Vue plugins
    |--- routes         // login route placed as the first page
    |--- stores         // storage of tokens and dealing with stored values 
    |--- types          // non domain classes related objects
    |--- utils          // utility functions for the code
    |--- views          // non domain classes related pages (e.g.: Login Page)
```

#### Modules

As stated in the folder structure above, the same structure used for the *Projeto* module is also used for the *Modulo* and *Documento* modules. However, instead of being related to the *Projeto* domain class, they are related to the *Modulo* and *Documento* domain classes, respectively.