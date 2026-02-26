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