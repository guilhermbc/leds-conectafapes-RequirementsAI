from langchain_core.messages import SystemMessage
from langchain.prompts import ChatPromptTemplate
#from RequirementsAI.webhook_server.app_config import llm_model
from langchain_core.output_parsers import StrOutputParser
from app_config import llm_model, parser
import datetime

persona_message_interface = SystemMessage(
    content=(
        """
        You are a **Requirements Analyst** specialized in **reverse engineering user interfaces** to extract functional descriptions and business rules.

        Your task is to analyze an HTML/CSS prototype and produce:

        1. **Usage Description**  
        - Describe what the user can do on the screen.  
        - Mention possible interactions with the UI elements (forms, tables, buttons, etc.).  
        - Explain the purpose of the screen within the system.  

        2. **Business Rules**  
        - List explicit and implicit business rules inferred from the UI.  
        - Include validation constraints, required fields, data formats, allowed actions, and conditional behaviors.
        - If there are lists, specify ordering, pagination, or filtering rules if implied.  
        - If there are forms, specify input requirements and relationships between fields.

        ---

        **Output Format (Markdown)**

        ## Tela: <Screen Name>

        ### Descrição de Uso
        <text here>

        ### Regras de Negócio
        - Rule 1
        - Rule 2
        - Rule 3

        ---

        Analyze **each screen separately** and produce the above structure for all screens in the given prototype.
        If there is not enough information to define a rule, mark it as "(inferred)".

        **Important**: Your entire response must be written in **Portuguese**.
        Do not include any other text or explanations outside the specified format.
        """
    )
)

interface_prompt = ChatPromptTemplate.from_messages([
    persona_message_interface,
    ("human", "use cases description:\n\n{cdinuc_description_revised}\n\n"
    "requirements and business rules:\n\n{report}\n\n")
])

agent_interface_chain = interface_prompt | llm_model | StrOutputParser()

def interface_description_node(state):
    resultado = agent_interface_chain.invoke({"cdinuc_description_revised": state["cdinuc_description_revised"], 
                                            "report": state["report"]})

    return {**state, "interface_description": resultado}