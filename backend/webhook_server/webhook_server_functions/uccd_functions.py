from langsmith import traceable
from webhook_server.graphs.uccd_graph import graphUCandCD
from fastapi import Request, APIRouter
from fastapi.responses import JSONResponse
import traceback

router = APIRouter()

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

@traceable(name="Run Use Cases and Class Diagram")
def run_graphUCandCD_with_trace(input_data: dict):
    '''
    expected data
    { minimundo: str, report: str }
    '''

    final_state = None
    for step in graphUCandCD.stream(input_data):
        print("🧩 Chunk parcial:", step)
        final_state = step
    return final_state