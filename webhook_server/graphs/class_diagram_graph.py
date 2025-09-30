from langgraph.graph import StateGraph, END
from state import MyState

from agents.classDiagram.agent_extracao_classe import extract_node as extract_CD
from agents.classDiagram.agent_identificacao_classe import identify_node as identify_CD
from agents.classDiagram.agent_revisao_classe import revise_node as revise_CD
from agents.classDiagram.agent_refinamento_classe import refine_node as refine_CD

from nodes import input_check, final

# Nós
# Builder
builderDC = StateGraph(state_schema=MyState)
# Verificação de entrada (operacional)
builderDC.add_node("verify_MW", input_check.check_MW)
builderDC.add_node("verify_Rq", input_check.check_Rq)
builderDC.add_node("verify_UC", input_check.check_UC)
# Nodes
builderDC.add_node("indentify_class", identify_CD)
builderDC.add_node("extract_class_diagram", extract_CD)
builderDC.add_node("revise_class_diagram", revise_CD)
builderDC.add_node("refine_class_diagram", refine_CD)
builderDC.add_node("final_output", final.final_return)

# Verificação de dados
def mw_route(state: dict) -> str:
    return "mensagem_falta_minimundo" if "mensagem" in state else "success"

def rq_route(state: dict) -> str:
    return "mensagem_falta_requisitos" if "mensagem" in state else "success"

def uc_route(state: dict) -> str:
    return "mensagem_falta_caso_uso" if "mensagem" in state else "success"

# Arestas
# Entrada e condicional
# # Caso passe na primeira condicional, enviar para a segunda e assim sucessivamente
builderDC.set_entry_point("verify_MW")

builderDC.add_conditional_edges("verify_MW", mw_route, {
    "mensagem_falta_minimundo": "final_output",
    "success": "verify_Rq"
})
builderDC.add_conditional_edges("verify_Rq", rq_route, {
    "mensagem_falta_requisitos": "final_output",
    "success": "verify_UC"
})
builderDC.add_conditional_edges("verify_UC", uc_route, {
    "mensagem_falta_caso_uso": "final_output",
    "success": "indentify_class"
})

# Fluxo do grafo
builderDC.add_edge("indentify_class", "extract_class_diagram")
builderDC.add_edge("extract_class_diagram", "revise_class_diagram")
builderDC.add_edge("revise_class_diagram", "refine_class_diagram")
builderDC.add_edge("refine_class_diagram", END)
builderDC.add_edge("final_output", END)

# Compilação
graphDC = builderDC.compile()