from langgraph.graph import StateGraph, END
from state import MyState

# Importa os agentes no lugar dos nodes
from agents.agent_transcricao import transcribe_audio_agent
from agents.miniworld.agent_minimundo import generate_minimundo_node
from agents.requirements.agent_analise import analyze_node
from agents.requirements.agent_extracao import extract_node
from agents.requirements.agent_priorizacao import prioritize_node
from agents.requirements.agent_refinamento import refine_node

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
# Importa os agentes de revisão
from agents.revision.agent_cdinuc_description import cdinuc_description_node
from agents.revision.agent_cdinuc_table import cdinuc_table_node
from agents.revision.agent_cdinuc_diagram import cdinuc_diagram_node
from agents.revision.agent_ucincd import ucincd_node

from nodes import input_check, final  # Apenas esses são operacionais, sem LLM

# Nós dos grafos

# Grafo do minimundo (prerequisitos: audio e texto com informações extras(opcional))
# Builder
builderMW = StateGraph(state_schema=MyState)
# Verificação de entrada (operacional)
builderMW.add_node("verify_input", input_check.check_Input)
# Nodes
builderMW.add_node("audio_transcription", transcribe_audio_agent)
builderMW.add_node("generate_miniworld", generate_minimundo_node)
# Final node (operacional)
builderMW.add_node("final_output", final.final_return)

# Grafo das tabelas de requisitos (prerequisitos: minimundo)
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

# Grafo do caso de uso (prerequisitos: minimundo e tabelas de requisitos)
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

# Grafo do diagrama de classe (prerequisitos: minimundo, tabelas de requisitos e diagrama de casos de uso)
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
# Final node (operacional)
builderDC.add_node("final_output", final.final_return)

# Grafo de revisão (prerequisitos: tabelas de requisitos, diagrama de casos de uso e diagrama de classe)
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

# Funções de verificação de rotas
def input_route(state: dict) -> str:
    return "mensagem_falta_video" if "mensagem" in state else "success"

def mw_route(state: dict) -> str:
    return "mensagem_falta_minimundo" if "mensagem" in state else "success"

def rq_route(state: dict) -> str:
    return "mensagem_falta_requisitos" if "mensagem" in state else "success"

def uc_route(state: dict) -> str:
    return "mensagem_falta_caso_uso" if "mensagem" in state else "success"

def cd_route(state: dict) -> str:
    return "mensagem_falta_diagrama_classe" if "mensagem" in state else "success"


# Minimundo
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

# Requisitos
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

# Caso de uso
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

# Diagrama de classe
# Entrada e condicional
# # Caso passe na primeira condicional, enviar para a segunda
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

# Revisão
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

# Compilação dos grafos
graphMW = builderMW.compile()
graphRq = builderRq.compile()
graphUC = builderUC.compile()
graphDC = builderDC.compile()
graphRv = builderRv.compile()