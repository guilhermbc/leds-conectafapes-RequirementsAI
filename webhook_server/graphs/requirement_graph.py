from langgraph.graph import StateGraph, END
from state import MyState

from agents.requirements.agent_analise import analyze_node
from agents.requirements.agent_extracao import extract_node
from agents.requirements.agent_priorizacao import prioritize_node
from agents.requirements.agent_refinamento import refine_node

from nodes import input_check, final

# Nós
# Builder
builderRq = StateGraph(state_schema=MyState)
# Verificação de entrada (operacional)
builderRq.add_node("verify_MW", input_check.check_MW)
# Nodes
builderRq.add_node("analyze_documentation", analyze_node)
builderRq.add_node("extract_requirements", extract_node)
builderRq.add_node("prioritize_requirements", prioritize_node)
builderRq.add_node("refine_requirements", refine_node)
# Final node (operacional)
builderRq.add_node("final_output", final.final_return)

# Verificação de dados
def mw_route(state: dict) -> str:
    return "mensagem_falta_minimundo" if "mensagem" in state else "success"

# Arestas
# Entrada e condicional
builderRq.set_entry_point("verify_MW")

builderRq.add_conditional_edges("verify_MW", mw_route, {
    "mensagem_falta_minimundo": "final_output",
    "success": "analyze_documentation"
})
# Fluxo do grafo
builderRq.add_edge("analyze_documentation", "extract_requirements")
builderRq.add_edge("extract_requirements", "prioritize_requirements")
builderRq.add_edge("prioritize_requirements", "refine_requirements")
builderRq.add_edge("refine_requirements", END)
builderRq.add_edge("final_output", END)

# Compilação
graphRq = builderRq.compile()