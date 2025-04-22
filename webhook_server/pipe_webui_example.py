"""
title: Webhook Pipe Function
author: Mso
author_url: https://www.linkedin.com/in/moises-omena-9ab9791a7/
version: 0.1.1

Inclua esse código como uma função no seu gerenciador de
funções do Open WebUI dentro do painel do admin e habilite o mesmo.

Este módulo define uma classe Pipe que chama um webhook externo
para processar mensagens no Open WebUI.

Exemplo de uso:
default="http://localhost:8000/webhook/webui_pipe_webhook"
"""

from typing import Optional, Callable, Awaitable
from pydantic import BaseModel, Field
import time
import requests


class Pipe:
    class Valves(BaseModel):
        webhook_url: str = Field(
            default="http://webhook_server:8000/webhook/webui_pipe_webhook"
        )
        webhook_bearer_token: str = Field(default="")
        input_field: str = Field(default="chatInput")
        response_field: str = Field(default="output")
        emit_interval: float = Field(
            default=2.0, description="Intervalo em segundos entre emissões de status"
        )
        enable_status_indicator: bool = Field(
            default=True, description="Habilitar ou desabilitar indicador de status"
        )

    def __init__(self):
        self.type = "pipe"
        self.id = "webhook_pipe"
        self.name = "Webhook Pipe"
        self.valves = self.Valves()
        self.last_emit_time = 0

    async def emit_status(
        self,
        __event_emitter__: Callable[[dict], Awaitable[None]],
        level: str,
        message: str,
        done: bool,
    ):
        current_time = time.time()
        if (
            __event_emitter__
            and self.valves.enable_status_indicator
            and (
                current_time - self.last_emit_time >= self.valves.emit_interval or done
            )
        ):
            await __event_emitter__(
                {
                    "type": "status",
                    "data": {
                        "status": "complete" if done else "in_progress",
                        "level": level,
                        "description": message,
                        "done": done,
                    },
                }
            )
            self.last_emit_time = current_time

    async def pipe(
        self,
        body: dict,
        __user__: Optional[dict] = None,
        __event_emitter__: Callable[[dict], Awaitable[None]] = None,
        __event_call__: Callable[[dict], Awaitable[dict]] = None,
    ) -> Optional[dict]:
        await self.emit_status(__event_emitter__, "info", "Chamando Webhook...", False)

        messages = body.get("messages", [])
        if messages:
            question = messages[-1]["content"]

            # Limpar "Prompt: " se presente
            if "Prompt: " in question:
                question = question.split("Prompt: ")[-1]

            try:
                headers = {
                    "Authorization": f"Bearer {self.valves.webhook_bearer_token}",
                    "Content-Type": "application/json",
                }

                # Incluir sessionId (opcional, útil para rastreamento)
                payload = {
                    self.valves.input_field: question,
                }
                if __user__ and "id" in __user__:
                    session_id_prefix = f"{__user__['id']} - "
                    session_id_suffix = messages[0]["content"].split("Prompt: ")[-1][
                        :100
                    ]
                    payload["sessionId"] = session_id_prefix + session_id_suffix

                response = requests.post(
                    self.valves.webhook_url,
                    json=payload,
                    headers=headers,
                    timeout=900,  # Adicionado timeout como boa prática
                )

                if response.status_code == 200:
                    response_json = response.json()
                    if self.valves.response_field in response_json:
                        webhook_response = response_json[self.valves.response_field]
                    else:
                        raise KeyError(
                            f"Campo '{self.valves.response_field}' não encontrado na resposta do webhook"
                        )
                else:
                    raise Exception(f"Erro: {response.status_code} - {response.text}")

                body["messages"].append(
                    {"role": "assistant", "content": webhook_response}
                )
                await self.emit_status(
                    __event_emitter__, "info", "Resposta do webhook processada", False
                )
            except requests.Timeout:
                await self.emit_status(
                    __event_emitter__,
                    "error",
                    "Erro: timeout ao chamar o webhook",
                    True,
                )
                return {"error": "Timeout ao chamar o webhook"}
            except KeyError as e:
                await self.emit_status(
                    __event_emitter__,
                    "error",
                    f"Erro na resposta do webhook: {str(e)}",
                    True,
                )
                return {"error": str(e)}
            except Exception as e:
                await self.emit_status(
                    __event_emitter__,
                    "error",
                    f"Erro ao chamar webhook: {str(e)}",
                    True,
                )
                return {"error": str(e)}
        else:
            await self.emit_status(
                __event_emitter__, "error", "Nenhuma mensagem encontrada.", True
            )
            body["messages"].append(
                {"role": "assistant", "content": "Nenhuma mensagem encontrada."}
            )

        await self.emit_status(__event_emitter__, "info", "Processo Finalizando", True)
        return webhook_response
