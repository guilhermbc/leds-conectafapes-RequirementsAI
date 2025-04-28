from langgraph.graph import StateGraph, END
from state import MyState
from nodes import input_check, transcription, minimundo, analyze, extract, prioritize, refine, final

builder = StateGraph(state_schema=MyState)

# Adiciona os agentes especialistas
builder.add_node("verificar_entrada", input_check.check_Input)
builder.add_node("transcricao_audio", transcription.transcribe_audio)
builder.add_node("gerar_minimundo", minimundo.generate_minimundo)
builder.add_node("analisar_documentacao", analyze.analyze_documentation)
builder.add_node("extrair_requisitos", extract.extract_requirements)
builder.add_node("priorizar_requisitos", prioritize.prioritize_requirements)
builder.add_node("refinar_requisitos", refine.refine_requirements)
builder.add_node("retorno_final", final.final_return)

builder.set_entry_point("verificar_entrada")

def input_route(state: dict) -> str:
    return "mensagem_falta_video" if "mensagem" in state else "transcricao_audio"

builder.add_conditional_edges("verificar_entrada", input_route, {
    "mensagem_falta_video": "retorno_final",
    "transcricao_audio": "transcricao_audio"
})

builder.add_edge("transcricao_audio", "gerar_minimundo")
builder.add_edge("gerar_minimundo", "analisar_documentacao")
builder.add_edge("analisar_documentacao", "extrair_requisitos")
builder.add_edge("extrair_requisitos", "priorizar_requisitos")
builder.add_edge("priorizar_requisitos", "refinar_requisitos")
builder.add_edge("refinar_requisitos", END)
builder.add_edge("retorno_final", END)

graph = builder.compile()
