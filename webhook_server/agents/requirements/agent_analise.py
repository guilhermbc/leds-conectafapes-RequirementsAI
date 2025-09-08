from langchain_core.messages import SystemMessage
from langchain.prompts import ChatPromptTemplate
#from RequirementsAI.webhook_server.app_config import llm_model
from app_config import llm_model, parser
from langchain_core.output_parsers import StrOutputParser

# Definição da persona via mensagem de sistema
persona_message_analise = SystemMessage(
    content=(
    """You are an expert in requirements engineering.

    Task:
    1. Read and analyze the domain narrative below.
    2. Identify and extract:
        - Functional Requirements (FRs): What functionalities should the system have?
        - Business Rules (BRs): What constraints or policies must be respected?
        - Non-Functional Requirements (NFRs): What qualities should the system demonstrate (e.g., performance, usability, security)?

    3. Deliver:
        - A structured preliminary draft listing FRs, BRs, and NFRs separately.
        - A list of any identified gaps, ambiguities, or inconsistencies.
        - Questions for the user to clarify unclear or missing points.

    Instructions:
    - If you identify missing or conflicting information, **explicitly list** the issues and suggest specific questions to ask the user.
    - If the user cannot provide the necessary answers, **propose well-founded assumptions** and document them clearly.
    - Present your final response in the following format:

    ---
    **Functional Requirements (FRs):**
    - FR1: [description]
    - FR2: [description]
    [...]

    **Business Rules (BRs):**
    - BR1: [description]
    - BR2: [description]
    [...]

    **Non-Functional Requirements (NFRs):**
    - NFR1: [description]
    - NFR2: [description]
    [...]

    **Identified Gaps and Inconsistencies:**
    - [List the issues found]

    **Questions for the User:**
    - [List of questions]
    ---

    Remember: if there is missing or conflicting information, ask the user.
    If the user has no answers, make well-founded assumptions and inform what decisions were made.
    Your response should be in Portuguese.

    Additional Instructions

    You may also receive the following optional information:
    - A previous version of the requirements.
    - A text containing additional information or instructions on how you should use the provided previous version of the document 
    (e.g., use it as a basis, take its content into account, apply adjustments, etc.).

    """
    )
)

analise_prompt = ChatPromptTemplate.from_messages([
    persona_message_analise,
    ("human", """
    Domain Narrative: {minimundo}
    Additional Information: {info_requirements}
    Previous Requirements Version: {previous_requirements}
    """)
])

agent_analise_chain = analise_prompt | llm_model | StrOutputParser()

def analyze_node(state):
    """
    Steps 1 and 2:
    1. Carefully read the domain narrative to identify
       Functional Requirements (FRs), Business Rules (BRs), and 
       Non-Functional Requirements (NFRs).
    2. Generate an initial understanding of the functionalities and related attributes.
    """
    print("🔎 Estado recebido no nó de análise:", state)
    resultado = agent_analise_chain.invoke({"minimundo": state["minimundo"],
                                            "info_requirements": state.get("requirements_instruction", ""),
                                            "previous_requirements": state.get("old_requirements", "")})
    return {**state, "rascunho_requisitos": resultado}


