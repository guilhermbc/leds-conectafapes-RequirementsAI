from langgraph.graph import StateGraph, END
from webhook_server.state import MyState

from webhook_server.agents.revision.agent_cdinuc_description import cdinuc_description_node
from webhook_server.agents.revision.agent_cdinuc_table import cdinuc_table_node
from webhook_server.agents.revision.agent_cdinuc_diagram import cdinuc_diagram_node
from webhook_server.agents.revision.agent_ucincd import ucincd_node

from webhook_server.nodes import input_check, final

# Nós
# Builder
builderRv = StateGraph(state_schema=MyState)
# Verificação de entrada (operacional)
builderRv.add_node("verify_Rq", input_check.check_Rq)
builderRv.add_node("verify_UC", input_check.check_UC_Descr)
builderRv.add_node("verify_CD", input_check.check_CD)
# Nodes
builderRv.add_node("revise_uc_description_withclasses", cdinuc_description_node)
builderRv.add_node("revise_uc_table_withclasses", cdinuc_table_node)
builderRv.add_node("revise_uc_diagram_withclasses", cdinuc_diagram_node)
builderRv.add_node("revise_classes_withuc", ucincd_node)
# Final node (operacional)
builderRv.add_node("final_output", final.final_return)

# Verificação de dados
def rq_route(state: dict) -> str:
    return "mensagem_falta_requisitos" if "mensagem" in state else "success"

def uc_route(state: dict) -> str:
    return "mensagem_falta_caso_uso" if "mensagem" in state else "success"

def cd_route(state: dict) -> str:
    return "mensagem_falta_diagrama_classe" if "mensagem" in state else "success"

# Arestas
# Entrada e condicional
# # Caso passe na primeira condicional, enviar para a segunda
builderRv.set_entry_point("verify_Rq")

builderRv.add_conditional_edges("verify_Rq", rq_route, {
    "mensagem_falta_requisitos": "final_output",
    "success": "verify_UC"
})
builderRv.add_conditional_edges("verify_UC", uc_route, {
    "mensagem_falta_caso_uso": "final_output",
    "success": "verify_CD"
})
builderRv.add_conditional_edges("verify_CD", cd_route, {
    "mensagem_falta_diagrama_classe": "final_output",
    "success": "revise_uc_description_withclasses"
})

# Fluxo do grafo
builderRv.add_edge("revise_uc_description_withclasses", "revise_uc_table_withclasses")
builderRv.add_edge("revise_uc_table_withclasses", "revise_uc_diagram_withclasses")
builderRv.add_edge("revise_uc_diagram_withclasses", "revise_classes_withuc")
builderRv.add_edge("revise_classes_withuc", END)
builderRv.add_edge("final_output", END)

# Compilação
graphRv = builderRv.compile()