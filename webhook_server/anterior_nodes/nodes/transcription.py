import os
import sys
import google.generativeai as genai
from config import GEMINI_API_KEY
from langchain_core.runnables import RunnableLambda

def transcribe_audio_func(inputs):
    audio_file_path = inputs["video_entrevista"]
    genai.configure(api_key=GEMINI_API_KEY)
    model_gemini = genai.GenerativeModel("gemini-1.5-pro")

    if not os.path.exists(audio_file_path):
        raise FileNotFoundError(f"Arquivo não encontrado: {audio_file_path}")
    
    try:
        with open(audio_file_path, 'rb') as f:
            audio_data = f.read()

        prompt = """
        Por favor, forneça uma transcrição completa e precisa deste áudio.
        Inclua marcações de tempo a cada 30 segundos, se possível.
        Identifique diferentes falantes se houver múltiplas pessoas falando.
        """

        response = model_gemini.generate_content(
            [{"mime_type": "audio/mp3", "data": audio_data}, prompt]
        )

        return {**inputs, "transcricao": response.text}
    except Exception as e:
        raise RuntimeError(f"Erro ao transcrever áudio: {str(e)}")
        sys.exit(1)

transcribe_audio = RunnableLambda(transcribe_audio_func)
