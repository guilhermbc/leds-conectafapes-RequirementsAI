from fluxo import graph

def run_full_flow(audio_path: str):
    input_data = {"video_entrevista": audio_path}
    final_state = graph.invoke(input_data)
    print(final_state)

if __name__ == "__main__":
    run_full_flow("media/entrevista_exemplo.mp3")
