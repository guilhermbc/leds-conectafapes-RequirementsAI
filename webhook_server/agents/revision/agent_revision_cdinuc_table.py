from langchain_core.messages import SystemMessage
from langchain.prompts import ChatPromptTemplate
from app_config import llm_model, parser
from langchain_core.output_parsers import StrOutputParser

# System message em inglês com orientações completas
persona_message_cdinuc_table = SystemMessage(
    content=(
    """
    You are a Use Case Table Formatter.  
    Your task is to transform a list of validated use cases into a structured Markdown table.

    **Response Format**:
    - Markdown;
    - One table with the following columns: Code, Name, Actors, Events, Related Requirements, Preconditions, Classes;
    - Only include the normal flow of events in the “Events” column;
    - A "Questions and Validations" block at the end, if needed.

    **Important**: Your entire response must be written in **Portuguese**.
    """
    ) #**Important**: The entire response must be in Portuguese.
)

# Prompt template
cdinuc_table_prompt = ChatPromptTemplate.from_messages([
    persona_message_cdinuc_table,
    ("human", 
    """
    You are a **Use Case Table Formatter**.  
    Your task is to organize a list of validated use cases into a Markdown table for clear and structured documentation.

    You will receive the following input:  
    - {cdinuc_description_revised}: a list of validated use cases.  
    Each use case includes:  
    - Name  
    - Actors  
    - Preconditions  
    - Normal Flow of Events  
    - Alternative / Exception Flows  
    - Related Requirements  
    - Classes

    ---

    **Your Objective**:  
    Transform each validated use case into a single row in a Markdown table with the following format:

    ### Use Case Table (Tabela de Casos de Uso)

    | Code | Name | Actors | Events | Related Requirements | Preconditions | Classes |
    |------|------|--------|--------|----------------------|---------------|---------|
    | UC01 | Title of the Use Case | Primary: Actor1, Actor2 <br> Secondary: Actor3 | 1. Summary of Event1 <br> 2. Summary of Event2 | FR01 <br> FR02 | | |

    - **Code**: Assign a unique code to each use case (e.g., UC01, UC02...);  
    - **Name**: The title of the use case;  
    - **Actors**: All relevant actors (primary and secondary);  
    - **Events**: A summarized version of the main steps from the normal flow of events;  
    - **Related Requirements**: The IDs of the requirements associated with the use case;  
    - **Preconditions**: Important conditions that must be met before the use case starts;  
    - **Classes**: Any listed classes.

    ---

    **Instructions**:
    - Include **only the normal flow of events** in the "Events" column;  
    - Do **not** include alternative or exception flows in the table;  
    - Keep summaries clear and concise;
    - Avoid repetitions or assumptions beyond the provided content.

    ---

    <DESIRED OUTPUT EXAMPLE>
    ## Use Cases Description
    | Code | Name | Actors | Events | Related Requirements | Preconditions | Classes |
    |------|------|--------|--------|----------------------|---------------|---------|
    | UC01 | User Login | Primary: User <br> Secondary: System | 1. User navigates to the login page <br> 2. Enters email and password <br> 3. Clicks "Login" <br> 4. System validates credentials <br> 5. User is redirected to the homepage | FR01 | The user must be registered | |

    <END OF EXAMPLE>

    ---

    **Important**: Your entire response must be written in **Portuguese**.
    """
    )
])

# Cadeia de execução do agente
agent_cdinuc_table_chain = cdinuc_table_prompt | llm_model | StrOutputParser()

# Função refinada para o nó
def cdinuc_table_node(state):
    resultado = agent_cdinuc_table_chain.invoke({"cdinuc_description_revised": state["cdinuc_description_revised"]})

    return {**state, "cdinuc_table_revised": resultado}
