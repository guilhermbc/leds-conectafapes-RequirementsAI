from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import uvicorn
import traceback
from langsmith import traceable
from graph import graph

app = FastAPI()

def preparar_estado(data: dict) -> dict:
    caminho_video = ""
    if "messages" in data:
        mensagens = data["messages"]
        for msg in reversed(mensagens):
            if isinstance(msg, dict) and msg.get("role") == "user":
                caminho_video = msg.get("content", "")
                break
    elif "chatInput" in data:
        caminho_video = data["chatInput"]
    elif "message" in data:
        caminho_video = data["message"]

    return {
        "mensagem_usuario": caminho_video,
        "video_entrevista": caminho_video
    }

# Função decorada com traceable para garantir rastreamento
@traceable(name="Run RequirementsAI")
def run_graph_with_trace(input_data: dict):
    final_state = None
    for step in graph.stream(input_data):
        print("🧩 Chunk parcial:", step)
        final_state = step
    return final_state

@app.post("/webhook/webui_pipe_webhook")
async def call_agent(request: Request):
    try:
        from graph import graph  # ⬅️ Importação movida para dentro da função

        data = await request.json()
        estado = preparar_estado(data)

        if not estado["mensagem_usuario"]:
            return JSONResponse(status_code=400, content={"error": "Nenhuma mensagem reconhecida."})

        print(f"🔵 Recebido: {estado['mensagem_usuario']}")

        try:
            result = run_graph_with_trace(estado)
            print(f"🟢 Resposta gerada!")
            print("🧾 RESULTADO COMPLETO DO GRAFO:")
            print(result)

        except Exception as e:
            print(f" Erro no invoke: {str(e)}")
            traceback.print_exc()
            return JSONResponse(content={"output": f"Erro ao gerar resposta: {str(e)}"})

        if result and isinstance(result, dict):
            state = next(iter(result.values())) if len(result) == 1 else result
            assistant_response = (
                state.get("report")
                or state.get("mensagem")
                or state.get("rascunho_requisitos")
                or state.get("minimundo")
                or "Desculpe, não consegui gerar uma resposta."
            )
        else:
            assistant_response = "Desculpe, não consegui gerar uma resposta."

        return JSONResponse(content={"output": assistant_response})

    except Exception as e:
        print(f" Erro geral: {str(e)}")
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})

if __name__ == "__main__":
    uvicorn.run("webhook_server:app", host="0.0.0.0", port=8001, reload=True)
