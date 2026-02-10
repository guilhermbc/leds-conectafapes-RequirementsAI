import os
import shutil

def CopyfilefromWebUItoMedia_func(caminho_origem: str, nome_destino: str = None) -> str:
    if not os.path.exists(caminho_origem):
        raise FileNotFoundError(f"Arquivo não encontrado: {caminho_origem}")

    os.makedirs("media", exist_ok=True)
    nome_destino = nome_destino or os.path.basename(caminho_origem)
    caminho_destino = os.path.join("media", nome_destino)
    shutil.copy(caminho_origem, caminho_destino)
    return caminho_destino
