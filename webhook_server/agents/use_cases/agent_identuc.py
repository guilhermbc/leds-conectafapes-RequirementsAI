import datetime
from langchain_core.messages import SystemMessage
from langchain.prompts import ChatPromptTemplate
from app_config import llm_model, parser
from langchain_core.output_parsers import StrOutputParser

# System message em inglês com orientações completas
persona_message_uc = SystemMessage(
    content=(
    """
    You are a Use Case Agent.
    Your task is to analyze a system's requirement table and generate a Markdown table of use cases derived from it.

    **Response Format**:
    - Markdown;
    - One table with: Code, Use Case Name, Actors, Events Involved, Related Requirements;
    - A "Questions and Validations" block at the end, if any inconsistencies remain.

    **Important**: Your entire response must be written in **Portuguese**."""
    ) #**Important**: The entire response must be in Portuguese.
)

# Prompt template
uc_prompt = ChatPromptTemplate.from_messages([
    persona_message_uc,
    ("human", 
    """
    You are a Use Case Agent, responsible for analyzing a system's requirement table and producing a structured list of use cases based on those requirements.

    Below are the prioritized and refined requirements:
    {report}

    **Objective**: Given a requirement table, generate a Use Case Table in the following format (example):

    ## Use Case Table

    | Code  | Use Case Name             | Actors                | Events Involved                            | Related Requirements       |
    |-------|---------------------------|------------------------|---------------------------------------------|-----------------------------|
    | UC01  | Manage Client             | Admin, System         | Create, update, delete, and list clients    | FR001, FR002                |
    | UC02  | Generate Reports          | Analyst               | Select filters, export to PDF               | FR005, NFR002               |
...

    **Instructions**:
    - Each use case must be derived from one or more requirements.
    - Group related requirements logically into coherent use cases.
    - Assign a unique code to each use case (e.g., UC01, UC02, etc.).
    - The "Actors" field must include the primary users or systems that interact with the use case.
    - The "Events Involved" field should summarize the main interactions or operations of the use case.
    - The "Related Requirements" field must include the IDs of the requirements used to create that use case.

    **Response Format**:
    - Use Markdown;
    - Output only one table with the use cases;
    - After the table, include a block titled "Questions and validations" if there are inconsistencies, ambiguities, or missing details;
    - Avoid repetitions or assumptions beyond the given data.

    **Important**: Translate your entire final output into ****.
    Your answer must be written entirely in **Portuguese**.
    """
    )
])

# Cadeia de execução do agente
agent_uc_chain = uc_prompt | llm_model | StrOutputParser()

# Função refinada para o nó
def usecases_node(state):
    print("🔍 Estado recebido no nó de casos de uso:", state)
    resultado = agent_uc_chain.invoke({"report": state["report"]})

    # Gerar nome de arquivo com timestamp
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"usecases_{timestamp}.md"

    # Salvar resultado como arquivo Markdown
    with open(filename, "w", encoding="utf-8") as f:
        f.write(resultado)

    return {**state, "usecases": resultado}
