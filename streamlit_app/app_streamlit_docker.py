import streamlit as st
import requests
import os
from dotenv import load_dotenv
from pathlib import Path
import tomllib

st.title("📼 Enviar Vídeo para Análise de Requisitos com IA")

UPLOAD_DIR = "shared/uploads" #ajuste do que eu eERRRRREI...... (tinha tirado os dois pontos de voltar para a pasta anterior)
load_dotenv()
webhook = os.getenv('WEBHOOK')
URL = f"http://{webhook}:8001/webhook"

opt = st.selectbox(" Escolha o que deseja criar: ", ["Escolha uma das opções", 
                                                     "Minimundo", 
                                                     "Tabela de Requisitos", 
                                                     "Casos de Uso", 
                                                     "Diagrama de Classe",
                                                     "Casos de Uso e Diagrama de Classe (com validação mútua)",
                                                     "Tudo!"])
opt = opt.lower().replace(" ", "")

match opt:
    case "minimundo":
        uploaded_file = st.file_uploader("Envie um vídeo (.mp3, wav, .mp4 ou .mkv)", type=["mp3", "mp4", "wav", "mkv"])
        uploaded_text = st.file_uploader("Envie um texto com informações adicionais (OPCIONAL) (.txt ou .md)", type=["txt", "md"])

        if uploaded_file:
            os.makedirs(UPLOAD_DIR, exist_ok=True)

            file_path = os.path.join(UPLOAD_DIR, uploaded_file.name)
            with open(file_path, "wb") as f:
                f.write(uploaded_file.getvalue())
            st.success(f"Arquivo salvo em: {file_path}")

            textInfo = ""
            if uploaded_text:
                textInfo = uploaded_text.getvalue().decode("utf-8")

            if st.button(" Enviar para análise"):
                payload = {
                    "chatInput": file_path,
                    "textInfo": textInfo
                }
                try:
                    response = requests.post(f"{URL}/miniworld", json=payload) #local

                    try:
                        pyproject = Path('/app/pyproject.toml')
                        data = tomllib.loads(pyproject.read_text(encoding="utf-8"))
                    except Exception as e:
                        data = {
                            "project":{
                                "name": "RequirementsAi",
                                "version":"0.4.0"
                            }
                        }
                
                    projName = data["project"]["name"]
                    projVersion = data["project"]["version"]

                    footer = f"\n\n---\n\nGerado por {projName} versão {projVersion}"

                    if response.status_code == 200:
                        minimundo = response.json().get("minimundo", "")

                        st.download_button('Download Minimundo', minimundo + footer, file_name="miniworld.md", on_click='ignore')

                        st.markdown("###  Resposta do Agente:")
                        st.markdown("#### Minimundo:")
                        st.markdown(minimundo, unsafe_allow_html=True)
                        st.markdown(footer, unsafe_allow_html=True)

                    else:
                        st.error(f"Erro: {response.status_code}")
                except Exception as e:
                    st.error(f"Erro ao enviar requisição: {e}")

            if os.path.exists(file_path):
                os.remove(file_path)

    case "tabeladerequisitos":
        uploaded_mw = st.file_uploader("Envie o arquivo do minimundo (.md)", type=[".md"])

        if uploaded_mw:
            os.makedirs(UPLOAD_DIR, exist_ok=True)

            minimundo = uploaded_mw.getvalue().decode("utf-8")

            if st.button(" Enviar para análise"):
                payload = {
                    "minimundo": minimundo
                }
                try:
                    response = requests.post(f"{URL}/requirements", json=payload) #local

                    try:
                        pyproject = Path('/app/pyproject.toml')
                        data = tomllib.loads(pyproject.read_text(encoding="utf-8"))
                    except Exception as e:
                        data = {
                            "project":{
                                "name": "RequirementsAi",
                                "version":"0.4.0"
                            }
                        }
                
                    projName = data["project"]["name"]
                    projVersion = data["project"]["version"]

                    footer = f"\n\n---\n\nGerado por {projName} versão {projVersion}"

                    if response.status_code == 200:
                        requisitos = response.json().get("report", "")

                        st.download_button('Download Tabelas de Requisitos', requisitos + footer, file_name="requirements.md", on_click='ignore')

                        st.markdown("###  Resposta do Agente:")
                        st.markdown("#### Tabelas de Requisitos:")
                        st.markdown(requisitos, unsafe_allow_html=True)
                        st.markdown(footer, unsafe_allow_html=True)

                    else:
                        st.error(f"Erro: {response.status_code}")
                except Exception as e:
                    st.error(f"Erro ao enviar requisição: {e}")

    case "casosdeuso":
        uploaded_mw = st.file_uploader("Envie o arquivo do minimundo (.md)", type=[".md"])
        uploaded_rq = st.file_uploader("Envie o arquivo das tabelas de requisitos (.md)", type=[".md"])

        if uploaded_mw and uploaded_rq:
            minimundo = uploaded_mw.getvalue().decode("utf-8")
            requisitos = uploaded_rq.getvalue().decode("utf-8")

            if st.button(" Enviar para análise"):
                    payload = {
                        "minimundo": minimundo,
                        "requisitos": requisitos
                    }
                    try:
                        response = requests.post(f"{URL}/use-cases", json=payload) #local

                        try:
                            pyproject = Path('/app/pyproject.toml')
                            data = tomllib.loads(pyproject.read_text(encoding="utf-8"))
                        except Exception as e:
                            data = {
                                "project":{
                                    "name": "RequirementsAi",
                                    "version":"0.4.0"
                                }
                            }
                    
                        projName = data["project"]["name"]
                        projVersion = data["project"]["version"]

                        footer = f"\n\n---\n\nGerado por {projName} versão {projVersion}"

                        if response.status_code == 200:
                            digrama = response.json().get("diagrama_uc", "")
                            tabela = response.json().get("tabela_uc", "")
                            descricao = response.json().get("descricao_uc", "")

                            st.download_button('Download Diagrama de Caso de Uso', digrama + footer, file_name="uc_diagram.md", on_click='ignore')
                            st.download_button('Download Tabela de Caso de Uso', tabela + footer, file_name="uc_table.md", on_click='ignore')
                            st.download_button('Download Descrição de Caso de Uso', descricao + footer, file_name="uc_description.md", on_click='ignore')

                            st.markdown("###  Resposta do Agente:")
                            st.markdown("#### Diagrama de Caso de Uso:")
                            st.markdown(digrama, unsafe_allow_html=True)
                            st.markdown("#### Tabela de Caso de Uso:")
                            st.markdown(tabela, unsafe_allow_html=True)
                            st.markdown("#### Descrição de Caso de Uso:")
                            st.markdown(descricao, unsafe_allow_html=True)
                            st.markdown(footer, unsafe_allow_html=True)

                        else:
                            st.error(f"Erro: {response.status_code}")
                    except Exception as e:
                        st.error(f"Erro ao enviar requisição: {e}")

    case "diagramadeclasse":
        uploaded_mw = st.file_uploader("Envie o arquivo do minimundo (.md)", type=[".md"])
        uploaded_rq = st.file_uploader("Envie o arquivo das tabelas de requisitos (.md)", type=[".md"])
        uploaded_uctable = st.file_uploader("Envie o arquivo da tabela de casos de uso (.md)", type=[".md"])
        uploaded_ucdescr = st.file_uploader("Envie o arquivo da descricao de caso de uso (.md)", type=[".md"])

        if uploaded_mw and uploaded_rq and uploaded_uctable and uploaded_ucdescr:
            minimundo = uploaded_mw.getvalue().decode("utf-8")
            requisitos = uploaded_rq.getvalue().decode("utf-8")
            tabela = uploaded_uctable.getvalue().decode("utf-8")
            descricao = uploaded_ucdescr.getvalue().decode("utf-8")

            if st.button(" Enviar para análise"):
                    payload = {
                        "minimundo": minimundo,
                        "requisitos": requisitos,
                        "tabela_caso_uso": tabela,
                        "descricao_caso_uso": descricao
                    }
                    try:
                        response = requests.post(f"{URL}/class-diagrams", json=payload) #local

                        try:
                            pyproject = Path('/app/pyproject.toml')
                            data = tomllib.loads(pyproject.read_text(encoding="utf-8"))
                        except Exception as e:
                            data = {
                                "project":{
                                    "name": "RequirementsAi",
                                    "version":"0.4.0"
                                }
                            }
                    
                        projName = data["project"]["name"]
                        projVersion = data["project"]["version"]

                        footer = f"\n\n---\n\nGerado por {projName} versão {projVersion}"

                        if response.status_code == 200:
                            digrama = response.json().get("diagrama_cd", "")

                            st.download_button('Download Diagrama de Classe', digrama + footer, file_name="class_diagram.md", on_click='ignore')

                            st.markdown("###  Resposta do Agente:")
                            st.markdown("#### Diagrama de Classe:")
                            st.markdown(digrama, unsafe_allow_html=True)
                            st.markdown(footer, unsafe_allow_html=True)

                        else:
                            st.error(f"Erro: {response.status_code}")
                    except Exception as e:
                        st.error(f"Erro ao enviar requisição: {e}")
    case "casosdeusoediagramadeclasse(comvalidaçãomútua)":
        uploaded_rq = st.file_uploader("Envie o arquivo das tabelas de requisitos (.md)", type=[".md"])
        uploaded_ucdescr = st.file_uploader("Envie o arquivo da descrição de caso de uso (.md)", type=[".md"])
        uploaded_ctable = st.file_uploader("Envie o arquivo do diagrama de classes (.md)", type=[".md"])

        if uploaded_rq and uploaded_ucdescr and uploaded_ctable:
            requisitos = uploaded_rq.getvalue().decode("utf-8")
            descricao_uc = uploaded_ucdescr.getvalue().decode("utf-8")
            diagrama_classes = uploaded_ctable.getvalue().decode("utf-8")

            if st.button(" Enviar para análise"):
                payload = {
                    "requisitos": requisitos,
                    "descricao_caso_uso": descricao_uc,
                    "diagrama_classes": diagrama_classes
                }
                try:
                    response = requests.post(f"{URL}/revision", json=payload) #local

                    try:
                        pyproject = Path('/app/pyproject.toml')
                        data = tomllib.loads(pyproject.read_text(encoding="utf-8"))
                    except Exception as e:
                        data = {
                            "project":{
                                "name": "RequirementsAi",
                                "version":"0.4.0"
                            }
                        }
    
                    projName = data["project"]["name"]
                    projVersion = data["project"]["version"]

                    footer = f"\n\n---\n\nGerado por {projName} versão {projVersion}"

                    if response.status_code == 200:
                        descricao_uc = response.json().get("descricao_uc", "")
                        tabela_uc = response.json().get("tabela_uc", "")
                        diagrama_uc = response.json().get("diagrama_uc", "")
                        diagrama_classes = response.json().get("diagrama_classes", "")

                        st.download_button('Download Descrição dos Casos de Uso ', descricao_uc + footer, file_name="uc_diagram.md", on_click='ignore')
                        st.download_button('Download Tabela de Casos de Uso', tabela_uc + footer, file_name="uc_table.md", on_click='ignore')
                        st.download_button('Download Diagrama de Casos de Uso', diagrama_uc + footer, file_name="uc_description.md", on_click='ignore')
                        st.download_button('Download Diagrama de Classe', diagrama_classes + footer, file_name="class_diagram.md", on_click='ignore')

                        st.markdown("#### Casos de Uso:")
                        st.markdown(tabela_uc, unsafe_allow_html=True)
                        st.markdown(descricao_uc, unsafe_allow_html=True)
                        st.markdown("#### Diagrama de Classe:")
                        st.markdown(diagrama_classes, unsafe_allow_html=True)

                    else:
                        st.error(f"Erro: {response.status_code}")
                except Exception as e:
                    st.error(f"Erro ao enviar requisição: {e}")
    case "tudo!":
        uploaded_file = st.file_uploader("Envie um vídeo (.mp3, wav, .mp4 ou .mkv)", type=["mp3", "mp4", "wav", "mkv"])
        uploaded_text = st.file_uploader("Envie um texto com informações adicionais (OPCIONAL) (.txt ou .md)", type=["txt", "md"])

        if uploaded_file:
            os.makedirs(UPLOAD_DIR, exist_ok=True)

            file_path = os.path.join(UPLOAD_DIR, uploaded_file.name)
            with open(file_path, "wb") as f:
                f.write(uploaded_file.getvalue())
            st.success(f"Arquivo salvo em: {file_path}")

            textInfo = ""
            if uploaded_text:
                textInfo = uploaded_text.getvalue().decode("utf-8")

            if st.button(" Enviar para análise"):
                payload = {
                    "chatInput": file_path,
                    "textInfo": textInfo
                }
                try:
                    response_mw = requests.post(f"{URL}/miniworld", json=payload) 

                    if response_mw.status_code == 200:
                        minimundo = response_mw.json().get("minimundo", "")
                        payload = {"minimundo": minimundo}

                        try:
                            response_rq = requests.post(f"{URL}/requirements", json=payload) 

                            if response_rq.status_code == 200:
                                requisitos = response_rq.json().get("report", "")
                                payload = {
                                    "minimundo": minimundo,
                                    "requisitos": requisitos
                                }

                                try:
                                    response_uc = requests.post(f"{URL}/use-cases", json=payload)

                                    if response_uc.status_code == 200:
                                        diagrama_uc = response_uc.json().get("diagrama_uc", "")
                                        tabela_uc = response_uc.json().get("tabela_uc", "")
                                        descricao_uc = response_uc.json().get("descricao_uc", "")

                                        payload = {
                                            "minimundo": minimundo,
                                            "requisitos": requisitos,
                                            "tabela_caso_uso": tabela_uc,
                                            "descricao_caso_uso": descricao_uc
                                        }

                                        try:
                                            response_cd = requests.post(f"{URL}/class-diagrams", json=payload) #local

                                            if response_cd.status_code == 200:
                                                diagrama_cd = response_cd.json().get("diagrama_cd", "")

                                                payload = {
                                                    "requisitos": requisitos,
                                                    "descricao_caso_uso": descricao_uc,
                                                    "diagrama_classes": diagrama_cd
                                                }

                                                try:
                                                    response_rv = requests.post(f"{URL}/revision", json=payload) #local

                                                    if response_rv.status_code == 200:
                                                        descricao_uc = response_rv.json().get("descricao_uc", "")
                                                        tabela_uc = response_rv.json().get("tabela_uc", "")
                                                        diagrama_uc = response_rv.json().get("diagrama_uc", "")
                                                        diagrama_classes = response_rv.json().get("diagrama_classes", "")

                                                        try:
                                                            pyproject = Path('/app/pyproject.toml')
                                                            data = tomllib.loads(pyproject.read_text(encoding="utf-8"))
                                                        except Exception as e:
                                                            data = {
                                                                "project":{
                                                                    "name": "RequirementsAi",
                                                                    "version":"0.4.0"
                                                                }
                                                            }
                                                        
                                                        projName = data["project"]["name"]
                                                        projVersion = data["project"]["version"]

                                                        footer = f"\n\n---\n\nGerado por {projName} versão {projVersion}"

                                                        st.download_button('Download Minimundo', minimundo + footer, file_name="miniworld.md", on_click='ignore', key='download_mw')
                                                        st.download_button('Download Tabelas de Requisitos', requisitos + footer, file_name="requirements.md", on_click='ignore', key='download_rq')
                                                        st.download_button('Download Diagrama de Caso de Uso', diagrama_uc + footer, file_name="uc_diagram.md", on_click='ignore', key='download_uc_diagram')
                                                        st.download_button('Download Tabela de Caso de Uso', tabela_uc + footer, file_name="uc_table.md", on_click='ignore', key='download_uc_table')
                                                        st.download_button('Download Descrição de Caso de Uso', descricao_uc + footer, file_name="uc_description.md", on_click='ignore', key='download_uc_description')
                                                        st.download_button('Download Diagrama de Classe', diagrama_classes + footer, file_name="class_diagram.md", on_click='ignore', key='download_class_diagram')

                                                        st.markdown("###  Resposta do Agente:")
                                                        st.markdown("#### Minimundo:")
                                                        st.markdown(minimundo, unsafe_allow_html=True)
                                                        st.markdown("#### Tabelas de Requisitos:")
                                                        st.markdown(requisitos, unsafe_allow_html=True)
                                                        st.markdown("#### Diagrama de Caso de Uso:")
                                                        st.markdown(diagrama_uc, unsafe_allow_html=True)
                                                        st.markdown("#### Tabela de Caso de Uso:")
                                                        st.markdown(tabela_uc, unsafe_allow_html=True)
                                                        st.markdown("#### Descrição de Caso de Uso:")
                                                        st.markdown(descricao_uc, unsafe_allow_html=True)
                                                        st.markdown("#### Diagrama de Classe:")
                                                        st.markdown(diagrama_classes, unsafe_allow_html=True)
                                                        st.markdown(footer, unsafe_allow_html=True)

                                                except Exception as e:
                                                    st.error(f"Erro ao enviar requisição para revisão: {e}")

                                        except Exception as e:
                                            st.error(f"Erro ao enviar requisição para diagrama de classe: {e}")

                                    else:
                                        st.error(f"Erro ao obter casos de uso: {response_uc.status_code}")

                                except Exception as e:
                                    st.error(f"Erro ao enviar requisição para casos de uso: {e}")
                        except Exception as e:
                            st.error(f"Erro ao enviar requisição: {e}")
                            
                    else:
                        st.error(f"Erro: {response_mw.status_code}")
                except Exception as e:
                    st.error(f"Erro ao enviar requisição: {e}")

            if os.path.exists(file_path):
                os.remove(file_path)
    case _:
        st.markdown("### Escolha uma das opções")