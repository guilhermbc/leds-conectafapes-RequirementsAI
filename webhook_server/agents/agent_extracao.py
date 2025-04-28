from langchain_core.messages import SystemMessage
from langchain.prompts import ChatPromptTemplate
#from RequirementsAI.webhook_server.app_config import llm_model
from langchain_core.output_parsers import StrOutputParser
from app_config import llm_model, parser


persona_message_extracao = SystemMessage(
    content=(
        "Você é especialista em documentar requisitos.\n"
        "Sua tarefa é transformar o rascunho em 3 tabelas Markdown:\n"
        "- FRs (ID, Descrição, Prioridade, Requisitos Relacionados)\n"
        "- BRs (ID, Descrição, Prioridade, Requisitos Relacionados)\n"
        "- NFRs (ID, Descrição, Categoria, Prioridade).\n"
        "Responda com apenas as tabelas."
    )
)

extracao_prompt = ChatPromptTemplate.from_messages([
    persona_message_extracao,
    ("human", "Rascunho:\n\n{rascunho_requisitos}\n\nGere as 3 tabelas.")
])

agent_extracao_chain = extracao_prompt | llm_model | StrOutputParser()

def extract_node(state):
    resultado = agent_extracao_chain.invoke({"rascunho_requisitos": state["rascunho_requisitos"]})
    return {**state, "requisitos_tabelas": resultado}


