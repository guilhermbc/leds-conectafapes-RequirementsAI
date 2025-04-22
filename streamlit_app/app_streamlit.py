import streamlit as st
import requests
import os

st.title("📼 Enviar Vídeo para Análise de Requisitos com IA")

UPLOAD_DIR = "../shared/uploads" #ajuste do que eu eERRRRREI...... (tinha tirado os dois pontos de voltar para a pasta anterior)

uploaded_file = st.file_uploader("Envie um vídeo (.mp3, .mp4 ou .mkv)", type=["mp3", "mp4", "mkv"])

if uploaded_file:
    os.makedirs(UPLOAD_DIR, exist_ok=True)  # Garante que o diretório exista
    file_path = os.path.join(UPLOAD_DIR, uploaded_file.name)
    with open(file_path, "wb") as f:
        f.write(uploaded_file.getvalue())

    st.success(f"Arquivo salvo em: {file_path}")

    if st.button(" Enviar para análise"):
        payload = {
            "chatInput": file_path
        }
        try:
            #response = requests.post("http://webhook_server:8000/webhook/webui_pipe_webhook", json=payload) #docker
            response = requests.post("http://localhost:8001/webhook/webui_pipe_webhook", json=payload) #local

            if response.status_code == 200:
                result = response.json().get("output", "")
                st.markdown("###  Resposta do Agente:")
                st.markdown(result, unsafe_allow_html=True)
            else:
                st.error(f"Erro: {response.status_code}")
        except Exception as e:
            st.error(f"Erro ao enviar requisição: {e}")
