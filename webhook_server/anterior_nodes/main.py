"""
from tracing_utils import run_graph

if __name__ == "__main__":
    audio_path = "caminho/do/seu/audio.mp4"  # Exemplo
    resultado = run_graph(audio_path)
    print(resultado)
"""
from langsmith import traceable
from graph import graph

@traceable(name="Run LangGraph with Transcription")
def run_graph(audio_path: str):
    input_data = {"video_entrevista": audio_path}
    final_state = graph.invoke(input_data)
    return final_state

if __name__ == "__main__":
    audio_path = "media/exemplo.mp4"  # Exemplo de entrada
    resultado = run_graph(audio_path)
    print(resultado)
