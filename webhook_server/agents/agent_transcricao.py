from langchain_core.messages import SystemMessage
from langgraph.prebuilt import create_react_agent
#from RequirementsAI.webhook_server.app_config import llm_model  # Seu modelo Gemini ou outro
from app_config import llm_model, parser
import google.generativeai as genai
import tomllib
from pathlib import Path

import os

# Prompt do agente de transcrição
persona_message_transcricao = SystemMessage(
    content=(
        "Você é um especialista em transcrição de entrevistas.\n"
        "Sua tarefa é ouvir o áudio e gerar uma transcrição fiel, com marcação de tempo a cada 30 segundos.\n"
        "Identifique falantes diferentes se necessário e forneça o texto em Português."
    )
)

# Node 0: Transcribe audio with Gemini API
def transcribe_audio_agent(inputs):
    audio_file_path = inputs["video_entrevista"]
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model_gemini = genai.GenerativeModel("gemini-2.5-flash-preview-05-20")
    if not os.path.exists(audio_file_path):
        raise FileNotFoundError(f"Arquivo de áudio não encontrado: {audio_file_path}")
    
    try:

        with open(audio_file_path, 'rb') as f:
            audio_data = f.read()

        prompt = """
        Por favor, forneça uma transcrição completa e precisa deste áudio.
        Inclua marcações de tempo a cada 30 segundos, se possível.
        Identifique diferentes falantes se houver múltiplas pessoas falando.
        """

        response = model_gemini.generate_content([
            {"mime_type": "audio/mp3", "data": audio_data}, prompt
        ])

        # data = get_project()
        # projName = data["name"]
        # projVersion = data["version"]

        # footer = f"\n\n---\n\nGerado por {projName} versão {projVersion}"

        # # Salvar a transcrição em um arquivo
        # # output_file = f"{os.path.splitext(audio_file_path)[0]}_transcricao.txt"
        # # with open(output_file, 'w', encoding='utf-8') as f:
        # #     f.write(response.text)
        # #     f.write(footer)
        
        # print(f"Transcrição salva em: {output_file}")
        print("🎙️ Resultado da transcrição:", response.text)
        print("📦 Estado retornado:", {**inputs, "transcricao": response.text})
        return {**inputs, "transcricao": response.text}

    except Exception as e:
        raise RuntimeError(f"Erro ao transcrever áudio: {str(e)}")
        sys.exit(1)

# def get_project():
#     pyproject = Path(__file__).resolve().parents[2] / 'pyproject.toml'
#     data = tomllib.loads(pyproject.read_text(encoding="utf-8"))
#     return data["project"]