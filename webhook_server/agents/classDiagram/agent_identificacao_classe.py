from langchain_core.messages import SystemMessage
from langgraph.prebuilt import create_react_agent
from langchain.prompts import ChatPromptTemplate
#from RequirementsAI.webhook_server.app_config import llm_model
from app_config import llm_model, parser
import datetime
from langchain_core.output_parsers import StrOutputParser

persona_message_ident_class = SystemMessage(
    content=(
        "You are a highly experienced Class Engineering Specialist. "
        "Your tasks involve: carefully analyzing domain narratives, "
        "identifying classes, indentifying it's attributes and relations "
        "and detecting missing information or inconsistencies. "
        "Your output must be clear, structured, and actionable."
    )
)

analise_prompt = ChatPromptTemplate.from_messages([
    persona_message_ident_class,
    ("human", """
    You are an expert in class engineering.

    Task:
    1. Read and analyze the domain narrative below.
    2. Identify and extract:
        - Classes (CLS): What are the system's classes?
        - Attributes (ATTR): What are the attributes of said classes?
        - Relations (REL): What are the relations of the classes, if there is any?
     
    3. Deliver:
        - A structured preliminary draft listing FRs, BRs, and NFRs separately.
        - A list of any identified gaps, ambiguities, or inconsistencies.
        - Questions for the user to clarify unclear or missing points.
     
        - A structured preliminary draft listing CLS and, for each CLS, their ATTR and REL.
        - A list of any identified gaps, ambiguities, or inconsistencies.
        - Questions for the user to clarify unclear or missing points.

    Instructions:
    - If you identify missing or conflicting information, **explicitly list** the issues and suggest specific questions to ask the user.
    - If the user cannot provide the necessary answers, **propose well-founded assumptions** and document them clearly.
    - Present your final response in the following format:

    ---
     **Classes (CLS):**
    - CLS1: [description]
    -- ATTR1: [description]
    -- ATTR2: [description]
    [...]
    -- REL1: [description]
    -- REL2: [description]
    [...]
    - CLS2: [description]
    -- ATTR1: [description]
    -- ATTR2: [description]
    [...]
    -- REL1: [description]
    -- REL2: [description]
    [...]

    **Identified Gaps and Inconsistencies:**
    - [List the issues found]

    **Questions for the User:**
    - [List of questions]
    ---

    Domain Narrative:
    {minimundo}

    Remember: if there is missing or conflicting information, ask the user.
    If the user has no answers, make well-founded assumptions and inform what decisions were made.
     """)
])

agent_analise_chain = analise_prompt | llm_model | StrOutputParser()

def analyze_node(state):
    """
    Steps 1 and 2:
    1. Carefully read the domain narrative to identify
       Classes (CLS), Attributes (ATTR) and Relations (REL).
    2. Generate an initial understanding of the classes and their attributes and relations.
    """
    print("🔎 Estado recebido no nó de identificacao:", state)
    resultado = agent_analise_chain.invoke({"minimundo": state["minimundo"]})

    return {**state, "rascunho_classes": resultado}