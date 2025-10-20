from langgraph.graph import StateGraph, END
from state import MyState

from agents.interfacePrototype.agent_interface import interface_node
from agents.interfacePrototype.agent_interface_description import interface_description_node

from nodes import input_check, final

# Nós
# Builder
builderIP = StateGraph(state_schema=MyState)
# Verificação de entrada (operacional)
builderIP.add_node("verify_Rq", input_check.check_Rq)
builderIP.add_node("verify_UC", input_check.check_UC_Descr_Rev)
builderIP.add_node("verify_CD", input_check.check_CD_Rev)
# Nodes
builderIP.add_node("generate_interface_prototype", interface_node)
builderIP.add_node("generate_interface_description", interface_description_node)
# Final node (operacional)
builderIP.add_node("final_output", final.final_return)

# Verificação de dados
def uc_route(state: dict) -> str:
    return "mensagem_falta_caso_uso" if "mensagem" in state else "success"

def cd_route(state: dict) -> str:
    return "mensagem_falta_diagrama_classe" if "mensagem" in state else "success"

# Arestas
builderIP.set_entry_point("verify_UC")

builderIP.add_conditional_edges("verify_UC", uc_route, {
    "mensagem_falta_caso_uso": "final_output",
    "success": "verify_CD"
})
builderIP.add_conditional_edges("verify_CD", cd_route, {
    "mensagem_falta_diagrama_classe": "final_output",
    "success": "generate_interface_prototype"
})
# Fluxo do grafo
builderIP.add_edge("generate_interface_prototype", "generate_interface_description")
builderIP.add_edge("generate_interface_description", END)
builderIP.add_edge("final_output", END)

# Compilação
graphIP = builderIP.compile()