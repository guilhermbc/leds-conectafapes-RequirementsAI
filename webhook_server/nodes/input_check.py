import os
from langchain_core.runnables import RunnableLambda
from utils.file_utils import CopyfilefromWebUItoMedia_func

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

check_Input = RunnableLambda(check_Input_func)
