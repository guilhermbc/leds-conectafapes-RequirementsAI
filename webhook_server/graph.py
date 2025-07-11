from langgraph.graph import StateGraph, END
from state import MyState

# Importa os agentes no lugar dos nodes
from agents.agent_transcricao import transcribe_audio_agent
from agents.agent_minimundo import generate_minimundo_node
from agents.agent_analise import analyze_node
from agents.agent_extracao import extract_node
from agents.agent_priorizacao import prioritize_node
from agents.agent_refinamento import refine_node

# Importa os agentes do diagrama de casos de uso
from agents.use_cases.agent_identuc import identuc_node
from agents.use_cases.agent_identevent import identevent_node
from agents.use_cases.agent_validateuc import validateuc_node
from agents.use_cases.agent_formatuc import formatuc_node
from agents.use_cases.agent_diagramuc import diagramuc_node

# Importa os agentes do diagrama de classe
from agents.classDiagram.agent_extracao_classe import extract_node as extract_CD
from agents.classDiagram.agent_identificacao_classe import identify_node as identify_CD
from agents.classDiagram.agent_revisao_classe import revise_node as revise_CD
from agents.classDiagram.agent_refinamento_classe import refine_node as refine_CD
# from agents.classDiagram.agent_join import join_node as join_CD

from nodes import input_check, final  # Apenas esses são operacionais, sem LLM

builder = StateGraph(state_schema=MyState)

# Verificação de entrada (não é um agente, é operacional)
builder.add_node("verify_input", input_check.check_Input)

# Substitui os nodes antigos pelos agentes
builder.add_node("audio_transcription", transcribe_audio_agent)
builder.add_node("generate_miniworld", generate_minimundo_node)
builder.add_node("analyze_documentation", analyze_node)
builder.add_node("extract_requirements", extract_node)
builder.add_node("prioritize_requirements", prioritize_node)
builder.add_node("refine_requirements", refine_node)
# Nodes do diagrama de casos de uso
builder.add_node("identify_usecases", identuc_node)
builder.add_node("identify_events", identevent_node)
builder.add_node("validate_usecases", validateuc_node)
builder.add_node("format_usecases", formatuc_node)
builder.add_node("generate_ucdiagram", diagramuc_node)

# Nodes do diagrama de classe
builder.add_node("indentify_class", identify_CD)
builder.add_node("extract_class_diagram", extract_CD)
builder.add_node("revise_class_diagram", revise_CD)
builder.add_node("refine_class_diagram", refine_CD)

# Nó final ainda é operacional
builder.add_node("final_output", final.final_return)

# Entrada e condicional
builder.set_entry_point("verify_input")

def input_route(state: dict) -> str:
    return "mensagem_falta_video" if "mensagem" in state else "audio_transcription"

builder.add_conditional_edges("verify_input", input_route, {
    "mensagem_falta_video": "final_output",
    "audio_transcription": "audio_transcription"
})

# Fluxo do grafo com agentes
builder.add_edge("audio_transcription", "generate_miniworld")
builder.add_edge("generate_miniworld", "analyze_documentation")
builder.add_edge("analyze_documentation", "extract_requirements")
builder.add_edge("extract_requirements", "prioritize_requirements")
builder.add_edge("prioritize_requirements", "refine_requirements")
# Arestas para o diagrama de casos de uso
builder.add_edge("refine_requirements", "identify_usecases")
builder.add_edge("identify_usecases", "identify_events")
builder.add_edge("identify_events", "validate_usecases")
builder.add_edge("validate_usecases", "format_usecases")
builder.add_edge("format_usecases", "generate_ucdiagram")
builder.add_edge("generate_ucdiagram", "indentify_class")

# Arestas para o diagrama de classes
builder.add_edge("indentify_class", "extract_class_diagram")
builder.add_edge("extract_class_diagram", "revise_class_diagram")
builder.add_edge("revise_class_diagram", "refine_class_diagram")
builder.add_edge("refine_class_diagram", END)

builder.add_edge("final_output", END)

graph = builder.compile()
