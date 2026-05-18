from langgraph.graph import StateGraph, END
from webhook_server.state import MyState

from webhook_server.agents.use_cases.agent_identuc import identuc_node
from webhook_server.agents.use_cases.agent_identevent import identevent_node
from webhook_server.agents.use_cases.agent_validateuc import validateuc_node
from webhook_server.agents.use_cases.agent_formatuc import formatuc_node
from webhook_server.agents.use_cases.agent_diagramuc import diagramuc_node

from webhook_server.agents.classDiagram.agent_extracao_classe import extract_node as extract_CD
from webhook_server.agents.classDiagram.agent_identificacao_classe import identify_node as identify_CD
from webhook_server.agents.classDiagram.agent_revisao_classe import revise_node as revise_CD
from webhook_server.agents.classDiagram.agent_refinamento_classe import refine_node as refine_CD

from webhook_server.agents.simplifiedRevision.agent_cdinuc_description import cdinuc_description_node
from webhook_server.agents.simplifiedRevision.agent_cdinuc_table import cdinuc_table_node

from webhook_server.nodes import input_check, final

# Nós
# Builder
builder = StateGraph(state_schema=MyState)
# Verificação de entrada (operacional)
builder.add_node("verify_MW", input_check.check_MW)
builder.add_node("verify_Rq", input_check.check_Rq)
# Nodes
builder.add_node("identify_usecases", identuc_node)
builder.add_node("identify_events", identevent_node)
builder.add_node("validate_usecases", validateuc_node)
builder.add_node("format_usecases", formatuc_node)
builder.add_node("generate_ucdiagram", diagramuc_node)

builder.add_node("identify_class", identify_CD)
builder.add_node("extract_class_diagram", extract_CD)
builder.add_node("revise_class_diagram", revise_CD)
builder.add_node("refine_class_diagram", refine_CD)

builder.add_node("revise_uc_description_withclasses", cdinuc_description_node)
builder.add_node("revise_uc_table_withclasses", cdinuc_table_node)

# Final node (operacional)
builder.add_node("final_output", final.final_return)

# Verificação de dados
def mw_route(state: dict) -> str:
    return "mensagem_falta_minimundo" if "mensagem" in state else "success"

def rq_route(state: dict) -> str:
    return "mensagem_falta_requisitos" if "mensagem" in state else "success"

# Arestas
# Entrada e condicional
# # Caso passe na primeira condicional, enviar para a segunda
builder.set_entry_point("verify_MW")

builder.add_conditional_edges("verify_MW", mw_route, {
    "mensagem_falta_minimundo": "final_output",
    "success": "verify_Rq"
})
builder.add_conditional_edges("verify_Rq", rq_route, {
    "mensagem_falta_requisitos": "final_output",
    "success": "identify_usecases"
})

# Fluxo do grafo
builder.add_edge("identify_usecases", "identify_events")
builder.add_edge("identify_events", "validate_usecases")
builder.add_edge("validate_usecases", "format_usecases")
builder.add_edge("format_usecases", "generate_ucdiagram")
builder.add_edge("generate_ucdiagram", "identify_class")

builder.add_edge("identify_class", "extract_class_diagram")
builder.add_edge("extract_class_diagram", "revise_class_diagram")
builder.add_edge("revise_class_diagram", "refine_class_diagram")
builder.add_edge("refine_class_diagram", "revise_uc_description_withclasses")

builder.add_edge("revise_uc_description_withclasses", "revise_uc_table_withclasses")
builder.add_edge("revise_uc_table_withclasses", END)

builder.add_edge("final_output", END)

# Compilação
graphUCandCD = builder.compile()