import streamlit as st
import requests
import os
from dotenv import load_dotenv
from pathlib import Path
import tomllib

st.title("📼 Enviar Vídeo para Análise de Requisitos com IA")

UPLOAD_DIR = "shared/uploads" #ajuste do que eu eERRRRREI...... (tinha tirado os dois pontos de voltar para a pasta anterior)

uploaded_file = st.file_uploader("Envie um vídeo (.mp3, wav, .mp4 ou .mkv)", type=["mp3", "mp4", "wav", "mkv"])

if uploaded_file:
    os.makedirs(UPLOAD_DIR, exist_ok=True)  # Garante que o diretório exista
    file_path = os.path.join(UPLOAD_DIR, uploaded_file.name)
    with open(file_path, "wb") as f:
        f.write(uploaded_file.getvalue())
    load_dotenv()
    webhook = os.getenv('WEBHOOK')
    st.success(f"Arquivo salvo em: {file_path}")

    if st.button(" Enviar para análise"):
        payload = {
            "chatInput": file_path
        }
        try:
            response = requests.post(f"http://{webhook}:8001/webhook/webui_pipe_webhook", json=payload) #docker
            #response = requests.post("http://localhost:8001/webhook/webui_pipe_webhook", json=payload) #local

            pyproject = Path(__file__).resolve().parent / 'pyproject.toml'
            data = tomllib.loads(pyproject.read_text(encoding="utf-8"))
            
            projName = data["project"]["name"]
            projVersion = data["project"]["version"]

            footer = f"\n\n---\n\nGerado por {projName} versão {projVersion}"

            if response.status_code == 200:
                result = response.json().get("output", "")
                minimundo = response.json().get("minimundo", "")

                st.download_button('Download Tabelas de Requisitos', result + footer, file_name="requirements.md", on_click='ignore')
                st.download_button('Download Minimundo', minimundo + footer, file_name="miniworld.md", on_click='ignore')

                st.markdown("###  Resposta do Agente:")
                st.markdown(minimundo, unsafe_allow_html=True)
                st.markdown(result, unsafe_allow_html=True)
                st.markdown(footer, unsafe_allow_html=True)
            else:
                st.error(f"Erro: {response.status_code}")
        except Exception as e:
            st.error(f"Erro ao enviar requisição: {e}")
    
    if os.path.exists(file_path):
        os.remove(file_path)