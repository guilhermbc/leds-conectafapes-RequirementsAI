from langgraph.graph import StateGraph, END
from webhook_server.state import MyState

from webhook_server.agents.agent_transcricao import transcribe_audio_agent
from webhook_server.agents.miniworld.agent_minimundo import generate_minimundo_node

from webhook_server.nodes import input_check, final

# Nós
# Builder
builderMW = StateGraph(state_schema=MyState)
# Verificação de entrada (operacional)
builderMW.add_node("verify_input", input_check.check_Input)
# Nodes
builderMW.add_node("audio_transcription", transcribe_audio_agent)
builderMW.add_node("generate_miniworld", generate_minimundo_node)
# Final node (operacional)
builderMW.add_node("final_output", final.final_return)

# Verificação de dados
def input_route(state: dict) -> str:
    return "mensagem_falta_video" if "mensagem" in state else "success"

# Arestas
# Entrada e condicional
builderMW.set_entry_point("verify_input")

builderMW.add_conditional_edges("verify_input", input_route, {
    "mensagem_falta_video": "final_output",
    "success": "audio_transcription"
})
# Fluxo do grafo
builderMW.add_edge("audio_transcription", "generate_miniworld")
builderMW.add_edge("generate_miniworld", END)
builderMW.add_edge("final_output", END)

# Compilação
graphMW = builderMW.compile()