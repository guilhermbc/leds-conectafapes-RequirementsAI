from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import uvicorn
import traceback
from langsmith import traceable
from graph import graphMW, graphRq, graphUC, graphDC, graphRv, graphIP
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

    info = ""
    if "textInfo" in data:
        info = data["textInfo"]

    return {
        "mensagem_usuario": caminho_video,
        "video_entrevista": caminho_video,
        "informacoes_adicionais": info
    }

def preparar_estado_minimundo(data: dict) -> dict:
    caminho_video = ""
    old_mw = ""
    mw_instruction = ""

    if "chatInput" in data:
        caminho_video = data["chatInput"]

    if "old_mw" in data:
        old_mw = data["old_mw"]
        if "mw_instruction" in data:
            mw_instruction = data["mw_instruction"]

    return {
        "mensagem_usuario": caminho_video,
        "video_entrevista": caminho_video,
        "old_mw": old_mw,
        "mw_instruction": mw_instruction
    }

def preparar_estado_requisitos(data: dict) -> dict:
    minimundo = ""
    requisitos_anteriores = ""
    info_requisitos = ""

    if "minimundo" in data:
        minimundo = data["minimundo"]
    if "requisitos_anteriores" in data:
        requisitos_anteriores = data["requisitos_anteriores"]
    if "info_requisitos" in data:
        info_requisitos = data["info_requisitos"]
    
    return {
        "mensagem_usuario": minimundo,
        "minimundo": minimundo,
        "old_requirements": info_requisitos,
        "requirements_information": requisitos_anteriores
    }

def preparar_estado_caso_uso(data: dict) -> dict:
    minimundo = ""
    requisitos = ""
    casosdeuso_anteriores = ""
    info_casosdeuso = ""

    if "minimundo" in data:
        minimundo = data["minimundo"]
    if "requisitos" in data:
        requisitos = data["requisitos"]
    if "casosdeuso_anteriores" in data:
        casosdeuso_anteriores = data["casosdeuso_anteriores"]
    if "info_casosdeuso" in data:
        info_casosdeuso = data["info_casosdeuso"]

    return {
        "mensagem_usuario": requisitos,
        "report": requisitos,
        "minimundo": minimundo,
        "old_uc": casosdeuso_anteriores,
        "uc_information": info_casosdeuso,
    }

def preparar_estado_diagrama_classe(data: dict) -> dict:
    minimundo = ""
    requisitos = ""
    tabela_uc = ""
    descricao_uc = ""
    old_cd = ""
    cd_instruction = ""

    if "minimundo" in data:
        minimundo = data["minimundo"]
    if "requisitos" in data:
        requisitos = data["requisitos"]
    if "tabela_caso_uso" in data:
        tabela_uc = data["tabela_caso_uso"]
    if "descricao_caso_uso" in data:
        descricao_uc = data["descricao_caso_uso"]

    if "old_cd" in data:
        old_cd = data["old_cd"]
        if "cd_instruction" in data:
            cd_instruction = data["cd_instruction"]

    return {
        "mensagem_usuario": tabela_uc,
        "minimundo": minimundo,
        "report": requisitos,
        "format_uc": tabela_uc,
        "report_validateuc": descricao_uc,
        "old_cd": old_cd,
        "cd_instruction": cd_instruction
    }

def preparar_estado_revisao(data: dict) -> dict:
    requisitos = ""
    descricao_uc = ""
    diagrama_classes = ""
    if "requisitos" in data:
        requisitos = data["requisitos"]
    if "descricao_caso_uso" in data:
        descricao_uc = data["descricao_caso_uso"]
    if "diagrama_classes" in data:
        diagrama_classes = data["diagrama_classes"]

    return {
        "mensagem_usuario": diagrama_classes,
        "report": requisitos,
        "report_validateuc": descricao_uc,
        "diagrama_classes_final": diagrama_classes
    }

def preparar_estado_prototipo_interface(data: dict) -> dict:
    descricao_uc = ""
    diagrama_classes = ""
    if "descricao_caso_uso" in data:
        descricao_uc = data["descricao_caso_uso"]
    if "diagrama_classes" in data:
        diagrama_classes = data["diagrama_classes"]

    return {
        "mensagem_usuario": descricao_uc,
        "cdinuc_description_revised": descricao_uc,
        "ucincd_revised": diagrama_classes
    }

# Função decorada com traceable para garantir rastreamento
@traceable(name="Run RequirementsAI")
def run_graphMW_with_trace(input_data: dict):
    final_state = None
    for step in graphMW.stream(input_data):
        print("🧩 Chunk parcial:", step)
        final_state = step
    return final_state

def run_graphRq_with_trace(input_data: dict):
    final_state = None
    for step in graphRq.stream(input_data):
        print("🧩 Chunk parcial:", step)
        final_state = step
    return final_state

def run_graphUC_with_trace(input_data: dict):
    final_state = None
    for step in graphUC.stream(input_data):
        print("🧩 Chunk parcial:", step)
        final_state = step
    return final_state

def run_graphDC_with_trace(input_data: dict):
    final_state = None
    for step in graphDC.stream(input_data):
        print("🧩 Chunk parcial:", step)
        final_state = step
    return final_state

def run_graphRv_with_trace(input_data: dict):
    final_state = None
    for step in graphRv.stream(input_data):
        print("🧩 Chunk parcial:", step)
        final_state = step
    return final_state

def run_graphIP_with_trace(input_data: dict):
    final_state = None
    for step in graphIP.stream(input_data):
        print("🧩 Chunk parcial:", step)
        final_state = step
    return final_state

# Rota: Health Check
@app.get("/health")
def health_check():
    return JSONResponse(
            status_code=200,
            content={"status": "ok"}
        )

# Rota: Minimundo
@app.post("/webhook/miniworld")
async def call_agent_miniworld(request: Request):
    try:
        from graph import graphMW

        data = await request.json()
        estado = preparar_estado_minimundo(data)

        if not estado["mensagem_usuario"] or estado["mensagem_usuario"] == "":
            return JSONResponse(status_code=400, content={"error": "Nenhuma mensagem reconhecida."})

        print(f"🔵 Recebido: {estado['mensagem_usuario']}")

        try:
            result = run_graphMW_with_trace(estado)
            print(f"Resposta gerada!")
            print("🧾 RESULTADO COMPLETO DO GRAFO:")
            print(result)

        except Exception as e:
            print(f" Erro no invoke: {str(e)}")
            traceback.print_exc()
            return JSONResponse(content={"output": f"Erro ao gerar resposta: {str(e)}"})
        
        if result and isinstance(result, dict):
            state = next(iter(result.values())) if len(result) == 1 else result
            minimundo = (
                state.get("minimundo")
                or "Desculpe, não foi possível gerar uma resposta."
            )
        else:
            minimundo = "Desculpe, não foi possível gerar uma resposta."
        
        return JSONResponse(content={"minimundo": minimundo})

    except Exception as e:
        print(f" Erro geral: {str(e)}")
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})

# Rota: Requisitos
@app.post("/webhook/requirements")
async def call_agent_miniworld(request: Request):
    try:
        from graph import graphRq

        data = await request.json()
        estado = preparar_estado_requisitos(data)

        if not estado["mensagem_usuario"] or estado["mensagem_usuario"] == "":
            return JSONResponse(status_code=400, content={"error": "Nenhuma mensagem reconhecida."})

        print(f"🔵 Recebido: {estado['mensagem_usuario']}")

        try:
            result = run_graphRq_with_trace(estado)
            print(f"Resposta gerada!")
            print("🧾 RESULTADO COMPLETO DO GRAFO:")
            print(result)

        except Exception as e:
            print(f" Erro no invoke: {str(e)}")
            traceback.print_exc()
            return JSONResponse(content={"output": f"Erro ao gerar resposta: {str(e)}"})
        
        if result and isinstance(result, dict):
            state = next(iter(result.values())) if len(result) == 1 else result
            report = (
                state.get("report")
                or "Desculpe, não foi possível gerar uma resposta."
            )
        else:
            report = "Desculpe, não foi possível gerar uma resposta."
        
        return JSONResponse(content={"report": report})

    except Exception as e:
        print(f" Erro geral: {str(e)}")
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})

# Rota: Caso de Uso
@app.post("/webhook/use-cases")
async def call_agent_miniworld(request: Request):
    try:
        from graph import graphUC

        data = await request.json()
        estado = preparar_estado_caso_uso(data)

        if not estado["mensagem_usuario"] or estado["mensagem_usuario"] == "":
            return JSONResponse(status_code=400, content={"error": "Nenhuma mensagem reconhecida."})

        print(f"🔵 Recebido: {estado['mensagem_usuario']}")

        try:
            result = run_graphUC_with_trace(estado)
            print(f"Resposta gerada!")
            print("🧾 RESULTADO COMPLETO DO GRAFO:")
            print(result)

        except Exception as e:
            print(f" Erro no invoke: {str(e)}")
            traceback.print_exc()
            return JSONResponse(content={"output": f"Erro ao gerar resposta: {str(e)}"})
        
        if result and isinstance(result, dict):
            state = next(iter(result.values())) if len(result) == 1 else result
            diagrama = (
                state.get("usecases_diagram")
                or "Desculpe, não foi possível gerar uma resposta."
                )
            tabela = (
                state.get("format_uc")
                or ""
            )
            descricao = (
                state.get("report_validateuc")
                or ""
            )

        else:
            diagrama = "Desculpe, não foi possível gerar uma resposta."
            tabela = ""
            descricao = ""
        
        return JSONResponse(content={
            "diagrama_uc": diagrama,
            "tabela_uc": tabela,
            "descricao_uc": descricao
            })

    except Exception as e:
        print(f" Erro geral: {str(e)}")
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})

# Rota: Diagrama de Classe
@app.post("/webhook/class-diagrams")
async def call_agent_miniworld(request: Request):
    try:
        from graph import graphDC

        data = await request.json()
        estado = preparar_estado_diagrama_classe(data)

        if not estado["mensagem_usuario"] or estado["mensagem_usuario"] == "":
            return JSONResponse(status_code=400, content={"error": "Nenhuma mensagem reconhecida."})

        print(f"🔵 Recebido: {estado['mensagem_usuario']}")

        try:
            result = run_graphDC_with_trace(estado)
            print(f"Resposta gerada!")
            print("🧾 RESULTADO COMPLETO DO GRAFO:")
            print(result)

        except Exception as e:
            print(f" Erro no invoke: {str(e)}")
            traceback.print_exc()
            return JSONResponse(content={"output": f"Erro ao gerar resposta: {str(e)}"})
        
        if result and isinstance(result, dict):
            state = next(iter(result.values())) if len(result) == 1 else result
            diagrama = (
                state.get("diagrama_classes_final")
                or "Desculpe, não foi possível gerar uma resposta."
            )
        else:
            diagrama = "Desculpe, não foi possível gerar uma resposta."
        
        return JSONResponse(content={"diagrama_cd": diagrama})

    except Exception as e:
        print(f" Erro geral: {str(e)}")
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})

# Rota: Revisão
@app.post("/webhook/revision")
async def call_agent_miniworld(request: Request):
    try:
        from graph import graphRv

        data = await request.json()
        estado = preparar_estado_revisao(data)

        if not estado["mensagem_usuario"] or estado["mensagem_usuario"] == "":
            return JSONResponse(status_code=400, content={"error": "Nenhuma mensagem reconhecida."})

        print(f"🔵 Recebido: {estado['mensagem_usuario']}")

        try:
            result = run_graphRv_with_trace(estado)
            print(f"Resposta gerada!")
            print("🧾 RESULTADO COMPLETO DO GRAFO:")
            print(result)

        except Exception as e:
            print(f" Erro no invoke: {str(e)}")
            traceback.print_exc()
            return JSONResponse(content={"output": f"Erro ao gerar resposta: {str(e)}"})
        
        if result and isinstance(result, dict):
            state = next(iter(result.values())) if len(result) == 1 else result
            descricao_uc = (
                state.get("cdinuc_description_revised")
                or "Desculpe, não foi possível gerar uma resposta."
            )
            tabela_uc = (
                state.get("cdinuc_table_revised")
                or "Desculpe, não foi possível gerar uma resposta."
            )
            diagrama_uc = (
                state.get("cdinuc_diagram_revised")
                or "Desculpe, não foi possível gerar uma resposta."
            )
            diagrama_classes = (
                state.get("ucincd_revised")
                or "Desculpe, não foi possível gerar uma resposta."
            )
        else:
            descricao_uc = "Desculpe, não foi possível gerar uma resposta."
            tabela_uc = "Teste de erro."
            diagrama_uc = "Teste de erro 2"
            diagrama_classes = "Teste de erro 3"
        
        return JSONResponse(content={
            "descricao_uc": descricao_uc,
            "tabela_uc": tabela_uc,
            "diagrama_uc": diagrama_uc,
            "diagrama_classes": diagrama_classes
            })

    except Exception as e:
        print(f" Erro geral: {str(e)}")
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})
    
@app.post("/webhook/interface-prototype")
async def call_agent_miniworld(request: Request):
    try:
        from graph import graphIP

        data = await request.json()
        estado = preparar_estado_prototipo_interface(data)

        if not estado["mensagem_usuario"] or estado["mensagem_usuario"] == "":
            return JSONResponse(status_code=400, content={"error": "Nenhuma mensagem reconhecida."})

        print(f"🔵 Recebido: {estado['mensagem_usuario']}")

        try:
            result = run_graphIP_with_trace(estado)
            print(f"Resposta gerada!")
            print("🧾 RESULTADO COMPLETO DO GRAFO:")
            print(result)

        except Exception as e:
            print(f" Erro no invoke: {str(e)}")
            traceback.print_exc()
            return JSONResponse(content={"output": f"Erro ao gerar resposta: {str(e)}"})
        
        if result and isinstance(result, dict):
            state = next(iter(result.values())) if len(result) == 1 else result
            prototipo_interface = (
                state.get("interface_prototype")
                or "Desculpe, não foi possível gerar uma resposta."
            )
            descricao_interface = (
                state.get("interface_description")
                or "Desculpe, não foi possível gerar uma resposta."
            )
        else:
            prototipo_interface = "Desculpe, não foi possível gerar uma resposta."
            descricao_interface = "Desculpe, não foi possível gerar uma resposta."
        
        return JSONResponse(content={
            "prototipo_interface": prototipo_interface,
            "descricao_interface": descricao_interface
            })

    except Exception as e:
        print(f" Erro geral: {str(e)}")
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})

def uvicorn_run():
    # webhook = os.getenv('WEBHOOK')
    uvicorn.run("webhook_server:app", host=f"0.0.0.0", port=8001, reload=True)

if __name__ == "__main__":
    uvicorn_run()