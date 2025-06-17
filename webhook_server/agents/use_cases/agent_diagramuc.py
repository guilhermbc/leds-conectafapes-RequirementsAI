import datetime
from langchain_core.messages import SystemMessage
from langchain.prompts import ChatPromptTemplate
from app_config import llm_model, parser
from langchain_core.output_parsers import StrOutputParser

# System message em inglês com orientações completas
persona_message_diagramuc = SystemMessage(
    content=(
    """
    You are a UML Use Case Diagram Generator.
    Your task is to generate a Use Case Diagram in Mermaid format based on an input Markdown table.

    Input:

    A Markdown table of use cases (represented by {format_uc}), containing at least the columns "Name" and "Actors".
    Response Format:

    A single code block containing only the diagram in Mermaid syntax.
    The diagram must correctly connect Actors to their respective Use Cases as defined in the table.
    Actors must be represented as "stick figures" (actor "Nome do Ator").
    Important: Your entire response must be written in Portuguese.
    """
    ) #**Important**: The entire response must be in Portuguese.
)

# Prompt template
diagramuc_prompt = ChatPromptTemplate.from_messages([
    persona_message_diagramuc,
    ("human", 
    """
    You are a UML Use Case Diagram Generator.

    Your task is to create a Use Case Diagram in Mermaid format based on a structured Markdown table of use cases.

    You will receive the following input:

    {format_uc}: A Markdown table containing validated use cases.
    The table you will receive has the following columns, but you will primarily use Actors and Name:

    Code: The unique identifier for the use case (e.g., UC01).
    Name: The name of the use case, which will be the label in the diagram.
    Actors: A comma-separated list of actors involved with the use case.
    Events: A summary of the flow of events (provides context but is not used in the diagram).
    Related Requirements: Associated requirements (not used in the diagram).
    Preconditions: Preconditions for the use case (not used in the diagram).
    Classes: Associated classes (not used in the diagram).
    Your Objective:
    Generate a complete and syntactically correct Use Case Diagram in a single Mermaid code block. The diagram must accurately represent all relationships between the actors and the use cases as defined in the input table.

    Instructions:

    Identify Unique Actors: First, scan the "Actors" column throughout the entire table to identify every unique actor.
    Declare Actors: Declare each unique actor once at the beginning of the diagram using the stick-figure syntax: actor "Nome do Ator" as VariavelAtor.
    Declare Use Cases: For each row in the table, declare its use case using its "Name". The syntax should be: NomeVariavelUC("Nome do Caso de Uso"). It's common to use the "Code" for the variable name (e.g., UC01("Realizar Login")).
    Map Relationships: For each use case, connect it to all its associated actors from the "Actors" column using the --> operator. For example: VariavelAtor --> NomeVariavelUC.
    Structure: You can optionally group all use cases within a subgraph to represent the system boundary.
    Final Output: Your output must contain ONLY the Mermaid code block. Do NOT include any explanations, titles, or text outside the ```mermaid ... ``` block.
    
    Example of Mermaid Code Block:
    graph TD
    actor "Cliente" as Cliente
    actor "Sistema de Pagamento" as SistemaPagamento
    actor "Administrador" as Administrador

    subgraph "Sistema Principal"
        UC01("Realizar Login")
        UC02("Buscar Produto")
        UC04("Processar Pagamento")
        UC05("Gerenciar Estoque")
    end

    Cliente --> UC01
    Cliente --> UC02
    Cliente --> UC04
    SistemaPagamento --> UC04
    Administrador --> UC05

    Important: Your entire response must be written in Portuguese.
    """
    )
])

# Cadeia de execução do agente
agent_diagramuc_chain = diagramuc_prompt | llm_model | StrOutputParser()

# Função refinada para o nó
def diagramuc_node(state):
    print("🔍 Estado recebido no nó de geração de diagrama de casos de uso:", state)
    resultado = agent_diagramuc_chain.invoke({"format_uc": state["format_uc"]})

    # Gerar nome de arquivo com timestamp
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"ucDiagram_{timestamp}.md"

    stringona += resultado + "\n\n"
    stringona += state["format_uc"] + "\n\n"
    stringona += state["report_validateuc"]

    # Salvar resultado como arquivo Markdown
    with open(filename, "w", encoding="utf-8") as f:
        f.write(stringona)

    return {**state, "usecases_diagram": resultado}


