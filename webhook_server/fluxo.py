from langgraph.graph import StateGraph, END
from state import MyState
from agents.agent_transcricao import transcribe_audio_agent
from agents.agent_minimundo import generate_minimundo_node
from agents.agent_analise import analyze_node
from agents.agent_extracao import extract_node
from agents.agent_priorizacao import prioritize_node
from agents.agent_refinamento import refine_node

builder = StateGraph(MyState)

builder.add_node("transcricao_audio", transcribe_audio_agent)
builder.add_node("gerar_minimundo", generate_minimundo_node)
builder.add_node("analisar_documentacao", analyze_node)
builder.add_node("extrair_requisitos", extract_node)
builder.add_node("priorizar_requisitos", prioritize_node)
builder.add_node("refinar_requisitos", refine_node)

builder.set_entry_point("transcricao_audio")
builder.add_edge("transcricao_audio", "gerar_minimundo")
builder.add_edge("gerar_minimundo", "analisar_documentacao")
builder.add_edge("analisar_documentacao", "extrair_requisitos")
builder.add_edge("extrair_requisitos", "priorizar_requisitos")
builder.add_edge("priorizar_requisitos", "refinar_requisitos")
builder.add_edge("refinar_requisitos", END)

graph = builder.compile()
