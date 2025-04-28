from langchain_core.messages import SystemMessage
from langgraph.prebuilt import create_react_agent
from langchain.prompts import ChatPromptTemplate
#from RequirementsAI.webhook_server.app_config import llm_model
from app_config import llm_model, parser

from langchain_core.output_parsers import StrOutputParser

# Prompt do agente de geração de minimundo
persona_message_minimundo = SystemMessage(
    content=(
        "Você é um engenheiro de requisitos especializado em transformar transcrições em minimundos.\n"
        "Sua missão é criar uma narrativa de domínio clara e precisa baseada na transcrição fornecida, em Português."
    )
)

minimundo_prompt = ChatPromptTemplate.from_messages([
    persona_message_minimundo,
    ("human", "Aqui está a transcrição da entrevista:\n\n{transcricao}\n\nGere o minimundo correspondente.")
])

agent_minimundo_chain = minimundo_prompt | llm_model | StrOutputParser()

def generate_minimundo_node(state):
    resultado = agent_minimundo_chain.invoke({"transcricao": state["transcricao"]})
    print("📚 Minimundo gerado:", resultado)
    return {**state, "minimundo": resultado}
