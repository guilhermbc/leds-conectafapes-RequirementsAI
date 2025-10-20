from langgraph.graph import StateGraph, END
from state import MyState

from agents.use_cases.agent_identuc import identuc_node
from agents.use_cases.agent_identevent import identevent_node
from agents.use_cases.agent_validateuc import validateuc_node
from agents.use_cases.agent_formatuc import formatuc_node
from agents.use_cases.agent_diagramuc import diagramuc_node

from nodes import input_check, final

# Nós
# Builder
builderUC = StateGraph(state_schema=MyState)
# Verificação de entrada (operacional)
builderUC.add_node("verify_MW", input_check.check_MW)
builderUC.add_node("verify_Rq", input_check.check_Rq)
# Nodes
builderUC.add_node("identify_usecases", identuc_node)
builderUC.add_node("identify_events", identevent_node)
builderUC.add_node("validate_usecases", validateuc_node)
builderUC.add_node("format_usecases", formatuc_node)
builderUC.add_node("generate_ucdiagram", diagramuc_node)
# Final node (operacional)
builderUC.add_node("final_output", final.final_return)

# Verificação de dados
def mw_route(state: dict) -> str:
    return "mensagem_falta_minimundo" if "mensagem" in state else "success"

def rq_route(state: dict) -> str:
    return "mensagem_falta_requisitos" if "mensagem" in state else "success"

# Arestas
# Entrada e condicional
# # Caso passe na primeira condicional, enviar para a segunda
builderUC.set_entry_point("verify_MW")

builderUC.add_conditional_edges("verify_MW", mw_route, {
    "mensagem_falta_minimundo": "final_output",
    "success": "verify_Rq"
})
builderUC.add_conditional_edges("verify_Rq", rq_route, {
    "mensagem_falta_requisitos": "final_output",
    "success": "identify_usecases"
})

# Fluxo do grafo
builderUC.add_edge("identify_usecases", "identify_events")
builderUC.add_edge("identify_events", "validate_usecases")
builderUC.add_edge("validate_usecases", "format_usecases")
builderUC.add_edge("format_usecases", "generate_ucdiagram")
builderUC.add_edge("generate_ucdiagram", END)
builderUC.add_edge("final_output", END)

# Compilação
graphUC = builderUC.compile()