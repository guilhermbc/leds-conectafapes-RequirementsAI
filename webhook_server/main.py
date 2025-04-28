from graph import graph
from webhook_server import run_graph_with_trace  # Reutilizando a função decorada

if __name__ == "__main__":
    input_data = {"video_entrevista": "/home/mso/requirementsAI/RequirementsAI/shared/uploads/test_audio.wav"}
    final_state = run_graph_with_trace(input_data)
    print(final_state)