# Configuring

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