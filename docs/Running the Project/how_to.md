## How to use RAI?

To use the RAI, access its link. If you don't know which link we are talking about, or you want to test your own modification to the code, or you just want to run it locally, click [here](#how-to-run-locally).

### First steps

#### 1. Creating a project

When you open and login in the tool, you will be seeing the projects screen. There you can see all the projects created and/or create a new project. When you click in a project, you will go to the next step.

#### 2. Creating a module

After selecting the desired project, you will see a similar screen, but now with the modules of the selected project. Here, you also can create a new module. To go to the next step, simply click in the module you want to work in.

#### 3. Creating documents

Now, you will see the documents of the selected module. The documents are divided in 2 sections: Últimos Documentos (last documents), where there are only the latest versions of the generated documents; and Todos os Documents (all the documents), where there are all the documents of that module. To create a new document, you also have to select the type of the document (remember the [document types](#documents)). After selecting the type of the document you can create it. Keep in mind that, since it is a generative AI process it might take some time to create the document. It is also possible to edit a document, to do it, you need to download the document, re write what whatever parts you want and send it in the edit menu.

### How to run locally?

To run the RAI locally you have to parts, the Frontend and the Backend

#### Requirements
- Python 3.12
- Node v22

#### Running the Backend

1. Create a virtual enviroment and activate it with the commands below
```bash
python -m venv .venv
.venv/bin/activate
```
2. Go to the backend folder
```bash
cd ./backend
```
3. Create the `.env` file using the `.env.example` as a template. If in doubt in how to fill the `.env` file, click [here](#how-to-fill-the-backend-env-file).
4. Install the backend dependencies
```bash
pip install -r requirements.txt
```
5. Create the migrations and use the migrate command
```bash
python manage.py makemigrations
python manage.py migrate
```
6. Finally, run the backend local server
```bash
python manage.py runserver
```

#### Running the Frontend

1. Go to the frontend folder
```bash
cd ./frontend
```
2. Create the `.env` file using the `.env.example` as a template. If in doubt in how to fill the `.env` file, click [here](#how-to-fill-the-frontend-env-file).
3. Install the frontend dependencies
```bash
npm install
```
4. Run the frontend development server
```bash
npm run dev
```
5. Access the given `localhost` link.

#### How to fill the backend `.env` file?

At first glance, the backend `.env` file can look intimidating, but lets breat it down:

Firstly, you will need a Gemini API key and put it as `GEMINI_API_KEY`. The next 3 variables, the LangSmith ones, are optional, but recommended if you want to see the execution of the AI processes in the LangSmith. If that is the case, you will need to get a LangSmith API key and put it as `LANGSMITH_API_KEY`, also you will need to give a name to you project and put it on the `LANGSMITH_PROJECT` (it can be any name) and, finally, the `LANGSMITH_TRACING` is always true. Otherwise, if you do not want to see the execution in the LangSmith, you can ignore this 3 variables.

Next you will need to put your frontend URL in the `CORS_ORIGIN`.

The other variables are specific to the used Django structure, you do not need to change them, although you might want to change the `SECRET_KEY`, the `HASHIDS_SALT` and the variables for the database in production `DB_*_PRODUCTION`.

#### How to fill the frontend `.env` file?

The frontend `.env` file is simpler than the backend file. You just need to put the backend base URL at the `VITE_BACKEND_ADMIN_BASE_URL` variable.