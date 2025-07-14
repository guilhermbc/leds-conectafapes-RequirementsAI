from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import uvicorn
import traceback
from langsmith import traceable
from graph import graph
import os

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
        from graph import graph  # Importar o grafo aqui para evitar problemas de importação circular

        data = await request.json()
        estado = preparar_estado(data)

        if not estado["mensagem_usuario"]:
            return JSONResponse(status_code=400, content={"error": "Nenhuma mensagem reconhecida."})

        print(f"🔵 Recebido: {estado['mensagem_usuario']}")

        try:
            result = run_graph_with_trace(estado)
            print(f"Resposta gerada!")
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
                or "Desculpe, não foi possível gerar uma resposta."
            )
            minimundo = (
                state.get("minimundo")
                or "Desculpe, não foi possível gerar uma resposta."
            )

            usecases_diagram = (
                state.get("usecases_diagram")
                or state.get("format_uc")
                or state.get("report_validateuc")
                or state.get("ident_events")
                or state.get("ident_usecases")
            )
            format_uc = (
                state.get("cdinuc_table_revised")
                or state.get("format_uc")
                or state.get("report_validateuc")
                or state.get("ident_events")
                or state.get("ident_usecases")
            )
            report_validateuc = (
                state.get("cdinuc_description_revised")
                or state.get("report_validateuc")
                or state.get("ident_events")
                or state.get("ident_usecases")
            )

            class_diagram = (
                state.get("diagrama_classes_final")
                or state.get("diagrama_classes_revisado")
                or state.get("diagrama_classes")
                or state.get("rascunho_classes")
                or ""
            )
            
        else:
            assistant_response = "Desculpe, não foi possível gerar uma resposta."
            minimundo = ""
            usecases_diagram = ""
            format_uc = ""
            report_validateuc = ""
            class_diagram = ""

        return JSONResponse(content={"output": assistant_response, 
                                     "minimundo": minimundo, 
                                     "usecases_diagram": usecases_diagram, 
                                     "format_uc": format_uc, 
                                     "report_validateuc": report_validateuc, 
                                     "class_diagram": class_diagram})

    except Exception as e:
        print(f" Erro geral: {str(e)}")
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})

def uvicorn_run():
    # webhook = os.getenv('WEBHOOK')
    uvicorn.run("webhook_server:app", host=f"0.0.0.0", port=8001, reload=True)

if __name__ == "__main__":
    uvicorn_run()