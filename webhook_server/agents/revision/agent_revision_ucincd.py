from langchain_core.messages import SystemMessage
from langchain.prompts import ChatPromptTemplate
from app_config import llm_model, parser
from langchain_core.output_parsers import StrOutputParser

# System message em inglês com orientações completas
persona_message_ucincd = SystemMessage(
    content=(
    """
    You are a Class Diagram Reviser Agent.

    Your task is to revise the given class diagram to make it fully consistent with the system's validated use cases.

    **Inputs**:
    - A class diagram in Mermaid format;
    - A list of use cases described with: Name, Actors, Preconditions, Normal Flow of Events, Alternative/Exception Flows, Related Requirements, and Classes.

    **Instructions**:
    - Use the use cases to validate and improve the class diagram;
    - Add missing classes, relationships or attributes;
    - Fix inconsistencies between class diagram and use cases.

    **Output Format**:
    - Markdown document with:
    - ## Class Diagram (in Mermaid)
    - ## Data Dictionary
    - ## Integrity Constraints
    - ## Questions (if any)

    **Your response must be in Portuguese.**

    """
    ) #**Important**: The entire response must be in Portuguese.
)

# Prompt template
ucincd_prompt = ChatPromptTemplate.from_messages([
    persona_message_ucincd,
    ("human", 
    """
    You are a Class Diagram Reviser Agent.

    Your goal is to review and improve the given class diagram to ensure it aligns with the system's use cases. The use cases are already validated and follow a structured format. You must revise the class diagram accordingly and make it congruent with the behaviors and entities described in the use cases.

    **Inputs**:
    - A class diagram in Mermaid format: {diagrama_classes_final}
    - A list of validated use cases ({cdinuc_description_revised}), described using the following structure: 

    ### Use Case Structure:
    - **Name**  
    - **Actors** (primary and secondary)  
    - **Preconditions**  
    - **Normal Flow of Events** (numbered list)  
    - **Alternative / Exception Flows** (bullet points)  
    - **Related Requirements**  
    - **Classes**

    ## Class Diagram Structure Example:

        ```mermaid
        classDiagram
            class Animal{
                String Name
            }
            
            class Dog{
                String ChipCode
            }
            
            class Toy{
                String Color
                String Type
            }
            
            Dog --|> Animal
            Dog "1" --> "*" Toy : has
        ```
    ## Data Dictionary Example

    ### Animal
    | Attribute | Description |
    |-----------|-------------|
    | Name | Name of the Animal |
    
    ### Dog
    | Attribute | Description |
    |-----------|-------------|
    | ChipCode | Unique code that identify the Dog |
    
    ### Toy
    | Attribute | Description |
    |-----------|-------------|
    | Color | Color of the Toy |
    | Type | Type of the Toy (e.g.: Throwing, Chewing) |

    **Instructions**:
    - Analyze the behaviors, entities, and interactions described in the use cases.
    - Add, modify, or remove classes and their attributes/relationships to align with the use cases.
    - Maintain correct cardinality and inheritance if applicable.
    - Ensure the revised class diagram fully supports the events and data described in the use cases.

    **Generate**:
    1. A revised class diagram in Mermaid format.
    2. A data dictionary for all classes and attributes.
    3. A list of integrity constraints based on the requirements and use case logic (e.g., uniqueness, associations, limitations).
    4. A list of questions or observations if anything is unclear or ambiguous.

    **Additional Guidelines**:
    - Use PascalCase for class names.
    - Use camelCase for attributes.
    - Prefer nouns for names.
    - Do not invent behavior beyond what is supported by the use cases.

    **Output Format**: Markdown document with the following sections:
    - ## Class Diagram (Mermaid)
    - ## Data Dictionary
    - ## Integrity Constraints
    - ## Questions

    **Your response must be in Portuguese.**

    """
    )
])

# Cadeia de execução do agente
agent_ucincd_chain = ucincd_prompt | llm_model | StrOutputParser()

# Função refinada para o nó
def ucincd_node(state):
    resultado = agent_ucincd_chain.invoke({"cdinuc_description_revised": state["cdinuc_description_revised"],
                                            "diagrama_classes_final": state["diagrama_classes_final"]})

    return {**state, "ucincd_revised": resultado}
