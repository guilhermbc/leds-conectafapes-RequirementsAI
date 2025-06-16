import datetime
from langchain_core.messages import SystemMessage
from langchain.prompts import ChatPromptTemplate
from app_config import llm_model, parser
from langchain_core.output_parsers import StrOutputParser

# System message em inglês com orientações completas
persona_message_validateuc = SystemMessage(
    content=(
    """
    You are a Use Case Review and Correction Agent.  
    Your task is to validate and correct a Markdown table of use cases based on the system’s miniworld and refined requirements.

    **Input**:
    - Miniworld: {minimundo}  
    - Refined Requirements: {report}  
    - Initial Use Case Table: {usecase_table}

    **Response Format**:
    - Markdown;
    - A corrected table: Code, Use Case Name, Actors, Related Requirements;
    - A "Validation Report" section listing any changes or justifications;
    - A "Final Remarks" block at the end, if needed.

    **Important**: Your entire response must be written in **Portuguese**.

    """
    ) #**Important**: The entire response must be in Portuguese.
)

# Prompt template
validateuc_prompt = ChatPromptTemplate.from_messages([
    persona_message_validateuc,
    ("human", 
    """
    You are a **Use Case Review and Correction Agent**.  
    Your task is to review and correct a Markdown table of use cases, ensuring it accurately reflects the system’s refined requirements and miniworld.

    **Input**:
    - Miniworld:  
    {minimundo}

    - Refined Requirements Report:  
    {report}

    - Initial Use Case Table (to be reviewed and corrected):  
    {ident_usecases}

    ---

    **Objective**:
    - Carefully analyze the use case table and validate it based on the miniworld and refined requirements.
    - Identify and fix any of the following issues:
    - Use cases that are too broad, too vague, or not self-contained;
    - Missing or incorrect actors;
    - Improper grouping or omission of functional requirements;
    - Missing use cases that should be present based on the miniworld;
    - Naming inconsistencies (use infinitive verbs and capitalize each main word).

    ---

    **Response Format**:
    - Markdown;
    - First, regenerate a corrected and validated **Use Case Table** with the columns: Code, Use Case Name, Actors, Related Requirements;
    - Then, include a **"Validation Report"** section listing the corrections made and reasoning behind them;
    - Finish with a **"Final Remarks"** block if needed.

    **Important**: Your entire response must be written in **Portuguese**.

    """
    )
])

# Cadeia de execução do agente
agent_validateuc_chain = validateuc_prompt | llm_model | StrOutputParser()

# Função refinada para o nó
def validateuc_node(state):
    resultado = agent_validateuc_chain.invoke({"report": state["report"], 
                                               "minimundo": state["minimundo"],
                                               "ident_usecases": state["ident_usecases"]})

    # Gerar nome de arquivo com timestamp
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"reportuc_{timestamp}.md"

    # Salvar resultado como arquivo Markdown
    with open(filename, "w", encoding="utf-8") as f:
        f.write(resultado)

    return {**state, "report_usecases": resultado}
