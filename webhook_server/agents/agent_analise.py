from langchain_core.messages import SystemMessage
from langchain.prompts import ChatPromptTemplate
#from RequirementsAI.webhook_server.app_config import llm_model
from app_config import llm_model, parser
from langchain_core.output_parsers import StrOutputParser

persona_message_analise = SystemMessage(
    content=(
        "Você é um engenheiro de requisitos.\n"
        "Sua tarefa é analisar o minimundo e gerar um rascunho com:\n"
        "- Requisitos Funcionais (FRs)\n"
        "- Regras de Negócio (BRs)\n"
        "- Requisitos Não-Funcionais (RNFs).\n"
        "Levante possíveis dúvidas ou lacunas ao final."
    )
)

analise_prompt = ChatPromptTemplate.from_messages([
    persona_message_analise,
    ("human", "Minimundo:\n\n{minimundo}\n\nGere o rascunho de requisitos.")
])

agent_analise_chain = analise_prompt | llm_model | StrOutputParser()

def analyze_node(state):
    print("🔎 Estado recebido no nó de análise:", state)
    resultado = agent_analise_chain.invoke({"minimundo": state["minimundo"]})
    #return {"rascunho_requisitos": resultado}
    return {**state, "rascunho_requisitos": resultado}


