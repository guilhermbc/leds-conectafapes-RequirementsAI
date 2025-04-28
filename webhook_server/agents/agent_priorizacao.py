from langchain_core.messages import SystemMessage
from langchain.prompts import ChatPromptTemplate
#from RequirementsAI.webhook_server.app_config import llm_model
from app_config import llm_model, parser

from langchain_core.output_parsers import StrOutputParser

persona_message_priorizacao = SystemMessage(
    content=(
        "Você é um especialista em priorização de requisitos.\n"
        "Sua tarefa é revisar as prioridades (Alta, Média, Baixa) nas tabelas abaixo e sugerir ajustes.\n"
        "Liste dúvidas se houver informações insuficientes."
    )
)

priorizacao_prompt = ChatPromptTemplate.from_messages([
    persona_message_priorizacao,
    ("human", "Tabelas de requisitos:\n\n{requisitos_tabelas}\n\nRevise as prioridades e ajuste se necessário.")
])

agent_priorizacao_chain = priorizacao_prompt | llm_model | StrOutputParser()

def prioritize_node(state):
    resultado = agent_priorizacao_chain.invoke({"requisitos_tabelas": state["requisitos_tabelas"]})
    return {**state,"requisitos_priorizados": resultado}
