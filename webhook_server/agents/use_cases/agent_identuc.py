import datetime
from langchain_core.messages import SystemMessage
from langchain.prompts import ChatPromptTemplate
from app_config import llm_model, parser
from langchain_core.output_parsers import StrOutputParser

# System message em inglês com orientações completas
persona_message_identuc = SystemMessage(
    content=(
    """
    You are a Use Case Identification Agent.  
    Your task is to identify use cases, actors, and related functional requirements based on the provided system description and refined requirements.

    **Response Format**:
    - Plain text;
    - For each use case:  
    - Name  
    - Actors  
    - Related Requirements  
    - Brief Description  
    - A “Questions and Validations” block at the end, if any inconsistencies remain.

    **Important**: Your entire response must be written in **Portuguese**.  
    """
    ) #**Important**: The entire response must be in Portuguese.
)

# Prompt template
identuc_prompt = ChatPromptTemplate.from_messages([
    persona_message_identuc,
    ("human", 
    """
    You are a **Use Case Identification Agent**.  
    Your task is to identify and describe the system’s main **use cases**, their corresponding **actors**, and the **functional requirements** that support them.

    **Input**:  
    - **Miniworld**:  
    {minimundo}

    - **Refined Requirements Report**:  
    {report}

    ---

    **About Actors**  
    - An **actor** is the *role* played by physical entities (people or other systems) that interact with the system in the same way, striving to achieve common goals.
    - Vague or generic roles (e.g., “User”, “System”) are **not** actors;
    - Avoid considering Login and Authentication as use cases, as it is a common functionality that does not represent a specific goal or outcome for the user.
    - The same physical entity can play different roles in the same system, and a given role can be assumed by different entities.  
    - Actors are **external** to the system: they communicate directly with it but are not part of its implementation.  
    - Who counts as an actor depends on the **system boundary** and the **level of automation**:  
    - If the use case runs over the Internet, the actor is the end user (e.g., “Client”).  
    - If it requires an on‑site human operator, the actor is that operator (e.g., “Attendant”).  
    - An external system may be an actor only if it is a complete information system outside the scope of the current system.  
    - **Primary actors** initiate interactions to achieve goals; **secondary actors** provide services to the system.  
    - To name an actor, use **singular nouns** with an initial capital letter (e.g., `Client`, `Librarian`, `Payment System`).

    ---

    **About Use Cases**  
    - A **use case** is a coherent slice of functionality the system provides to actors, consisting of a set of actions that produce an observable, valuable outcome for one or more actors.  
    - It must represent a **complete transaction**: an actor could start the system, perform the use case, and finish in a single session, achieving their goal.  
    - Use cases requiring multiple sessions should be split into smaller, self‑contained cases (e.g., “Submit Loan Request”, “Analyze Loan Request”, “Finalize Loan Approval”).  
    - The **name** of a use case must capture its essence, starting with an **infinitive verb** followed by a complement, with each main word capitalized (e.g., `Register Client`, `Issue Invoice`, `Process Payment`).

    ---

    **Output**  
    Provide a numbered list of use cases in **plain text**, each including:  
    1. **Name**: the use case name.  
    2. **Actors**: primary and secondary actors.  
    3. **Related Functional Requirements**: IDs of associated functional requirements.  
    4. **Brief Description**: how the use case fulfills system goals.

    **Format**  
    - Plain text (no Markdown table yet)  
    - Use bullets or sub‑headers to separate each use case.

    **Important**: Write your entire response in **Portuguese**.  
    """
    )
])

# Cadeia de execução do agente
agent_identuc_chain = identuc_prompt | llm_model | StrOutputParser()

# Função refinada para o nó
def identuc_node(state):
    print("🔍 Estado recebido no nó de identificação de UCs:", state)
    resultado = agent_identuc_chain.invoke({"report": state["report"], 
                                            "minimundo": state["minimundo"]})

    return {**state, "ident_usecases": resultado}
