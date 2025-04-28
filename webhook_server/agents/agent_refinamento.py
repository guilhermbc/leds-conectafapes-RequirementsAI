import datetime
from langchain_core.messages import SystemMessage
from langchain.prompts import ChatPromptTemplate
#from RequirementsAI.webhook_server.app_config import llm_model
from app_config import llm_model, parser
from langchain_core.output_parsers import StrOutputParser



persona_message_refinamento = SystemMessage(
    content=(
        "Você é um refinador de requisitos.\n"
        "Sua tarefa é gerar a versão final das 3 tabelas de requisitos (FRs, BRs, NFRs), em Markdown.\n"
        "Inclua dúvidas finais ao final, se existirem.\n"
        "Responda inteiramente em Português."
    )
)

refinamento_prompt = ChatPromptTemplate.from_messages([
    persona_message_refinamento,
    ("human", "Requisitos Priorizados:\n\n{requisitos_priorizados}\n\nGere a versão final.")
])

agent_refinamento_chain = refinamento_prompt | llm_model | StrOutputParser()

def refine_node(state):
    resultado = agent_refinamento_chain.invoke({"requisitos_priorizados": state["requisitos_priorizados"]})

    # Salvar como relatório
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"report_{timestamp}.md"
    with open(filename, "w", encoding="utf-8") as f:
        f.write(resultado)

    return {**state,"report": resultado}
