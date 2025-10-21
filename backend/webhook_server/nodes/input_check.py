import os
from langchain_core.runnables import RunnableLambda
from webhook_server.utils.file_utils import CopyfilefromWebUItoMedia_func

def check_Input_func(inputs):
    video = inputs.get("video_entrevista")

    if video and video.startswith("/app/backend/data/uploads/"):
        try:
            video_convertido = CopyfilefromWebUItoMedia_func(video)
            inputs["video_entrevista"] = video_convertido
        except Exception:
            return {
                **inputs,
                "mensagem": "Erro ao acessar o vídeo enviado.",
                "estado": "erro_video"
            }
    elif not video or not os.path.exists(inputs["video_entrevista"]):
        return {
            **inputs,
            "mensagem": "Por favor, forneça o caminho do vídeo da entrevista.",
            "estado": "aguardando_video"
        }
    return inputs

def check_miniworld_func(inputs):
    miniworld = inputs.get("minimundo")

    if miniworld:
        return {**inputs}
    else:
        return {
            **inputs,
            "mensagem": "Minimundo não identificado",
            "estado": "erro_minimundo"
        }
    
def check_rq_func(inputs):
    requirements = inputs.get("report")

    if requirements:
        return {**inputs}
    else:
        return {
            **inputs,
            "mensagem": "Tabelas de requisitos não identificadas",
            "estado": "erro_requirements"
        }

def check_uc_func(inputs):
    use_case_table = inputs.get("format_uc")
    use_case_description = inputs.get("report_validateuc")

    if use_case_table and use_case_description:
        return {**inputs}
    elif not use_case_table:
        return {
            **inputs,
            "mensagem": "Tabela dos casos de uso não identificada",
            "estado": "erro_use_case_table"
        }
    elif not use_case_description:
        return {
            **inputs,
            "mensagem": "Descrição dos casos de uso não identificado",
            "estado": "erro_use_case_description"
        }
    else:
        return {
            **inputs,
            "mensagem": "Arquivos dos casos de uso não identificados",
            "estado": "erro_use_case"
        }
    
def check_uc_desc_func(inputs):
    use_case_description = inputs.get("report_validateuc")

    if use_case_description:
        return {**inputs}
    else:
        return {
            **inputs,
            "mensagem": "Descrição dos casos de uso não identificado",
            "estado": "erro_use_case_description"
        }

def check_uc_tabl_func(inputs):
    use_case_table = inputs.get("format_uc")

    if use_case_table:
        return {**inputs}
    else:
        return {
            **inputs,
            "mensagem": "Tabela dos casos de uso não identificada",
            "estado": "erro_use_case_table"
        }
    
def check_reviseduc_desc_func(inputs):
    use_case_description = inputs.get("cdinuc_description_revised")

    if use_case_description:
        return {**inputs}
    else:
        return {
            **inputs,
            "mensagem": "Descrição dos casos de uso não identificado",
            "estado": "erro_use_case_description"
        }


def check_cd_func(inputs):
    class_diagram = inputs.get("diagrama_classes_final")

    if class_diagram:
        return {**inputs}
    else:
        return {
            **inputs,
            "mensagem": "Diagrama de classe não identificado",
            "estado": "erro_class_diagram"
        }
    
def check_revisedcd_func(inputs):
    class_diagram = inputs.get("ucincd_revised")

    if class_diagram:
        return {**inputs}
    else:
        return {
            **inputs,
            "mensagem": "Diagrama de classe não identificado",
            "estado": "erro_class_diagram"
        }

check_Input = RunnableLambda(check_Input_func)
check_MW = RunnableLambda(check_miniworld_func)
check_Rq = RunnableLambda(check_rq_func)
check_UC = RunnableLambda(check_uc_func)
check_UC_Descr = RunnableLambda(check_uc_desc_func)
check_UC_Descr_Rev = RunnableLambda(check_reviseduc_desc_func)
check_UC_Table = RunnableLambda(check_uc_tabl_func)
check_CD = RunnableLambda(check_cd_func)
check_CD_Rev = RunnableLambda(check_revisedcd_func)