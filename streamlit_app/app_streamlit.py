import streamlit as st
import requests
import os
from dotenv import load_dotenv
from pathlib import Path
import tomllib

st.title("📼 Enviar Vídeo para Análise de Requisitos com IA")

UPLOAD_DIR = "../shared/uploads" #ajuste do que eu eERRRRREI...... (tinha tirado os dois pontos de voltar para a pasta anterior)

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
            #response = requests.post("http://webhook_server:8001/webhook/webui_pipe_webhook", json=payload) #docker
            response = requests.post(f"http://{webhook}:8001/webhook/webui_pipe_webhook", json=payload) #local

            pyproject = Path(__file__).resolve().parents[1] / 'pyproject.toml'
            data = tomllib.loads(pyproject.read_text(encoding="utf-8"))
            
            projName = data["project"]["name"]
            projVersion = data["project"]["version"]

            footer = f"\n\n---\n\nGerado por {projName} versão {projVersion}"

            if response.status_code == 200:
                result = response.json().get("output", "")
                minimundo = response.json().get("minimundo", "")
                usecases_diagram = response.json().get("usecases_diagram", "")
                usecases_table = response.json().get("usecases_table", "")
                usecases_description = response.json().get("usecases_description", "")
                class_diagram = response.json().get("class_diagram", "")

                st.download_button('Download Tabelas de Requisitos', result + footer, file_name="requirements.md", on_click='ignore')
                st.download_button('Download Minimundo', minimundo + footer, file_name="miniworld.md", on_click='ignore')
                st.download_button('Download Diagrama de Casos de Uso', usecases_diagram + footer, file_name="usecasesDiagram.md", on_click='ignore')
                st.download_button('Download Tabela de Casos de Uso', usecases_table + footer, file_name="usecasesTable.md", on_click='ignore')
                st.download_button('Download Descrição de Casos de Uso', usecases_description + footer, file_name="usecasesDescription.md", on_click='ignore')
                st.download_button('Download Diagrama de Classe', class_diagram + footer, file_name="classDiagram.md", on_click='ignore')

                st.markdown("###  Resposta do Agente:")
                st.markdown("#### Tabelas de Requisitos:")
                st.markdown(result, unsafe_allow_html=True)
                st.markdown("#### Casos de Uso:")
                st.markdown(usecases_table, unsafe_allow_html=True)
                st.markdown(usecases_description, unsafe_allow_html=True)
                st.markdown("#### Diagrama de Classe:")
                st.markdown(class_diagram, unsafe_allow_html=True)
                minimundo = response.json().get("minimundo", "")

            else:
                st.error(f"Erro: {response.status_code}")
        except Exception as e:
            st.error(f"Erro ao enviar requisição: {e}")

    if os.path.exists(file_path):
        os.remove(file_path)
