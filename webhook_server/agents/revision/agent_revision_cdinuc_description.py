from langchain_core.messages import SystemMessage
from langchain.prompts import ChatPromptTemplate
from app_config import llm_model, parser
from langchain_core.output_parsers import StrOutputParser

# System message em inglês com orientações completas
persona_message_cdinuc_description = SystemMessage(
    content=(
    """
    You are a Use Case and Class Diagram Reviser Agent.

    Your task is to review the consistency between use cases and the class diagram, and update each use case by adding the related classes.

    **Input**:  
    - Use cases described in structured format (Name, Actors, Preconditions, Normal Flow of Events, Alternative Flows, Related Requirements, Classes [empty])  
    - Class diagram in Mermaid  
    - Requirements (FR, NFR, BR)

    **Actions**:
    - Add the related classes to each use case under the "Classes" field  
    - Ensure the flows described in the use cases are aligned with the class diagram  
    - Suggest adjustments if inconsistencies are found

    **Output Format**:
    - Markdown document with:
    - **Revised Use Cases** (preserving the same structure)
    - **Questions and Suggestions** if any issue or doubt arises

    Your output must be written in **Portuguese**.

    """
    ) #**Important**: The entire response must be in Portuguese.
)

# Prompt template
cdinuc_description_prompt = ChatPromptTemplate.from_messages([
    persona_message_cdinuc_description,
    ("human", 
    """
    You are a Use Case and Class Diagram Reviser Agent.

    Your task is to validate and align the class diagram and the use case descriptions, ensuring their consistency, and update the use cases by adding the related classes to each one.

    You must perform the following actions:

    1. **Check Alignment**:
    - For each use case, validate whether its flow of events corresponds to operations or data represented in the current class diagram.
    - Check if the actors’ interactions and responsibilities described in the use case are supported by class relationships and attributes.

    2. **Add Related Classes**:
    - Insert in each use case the classes involved in the described flow of events.
    - You must update the “Classes” field in each use case.
    - Add only the relevant class names, using the class names exactly as declared in the class diagram.

    3. **Correct Inconsistencies**:
    - If there are mismatches between the use cases and the class diagram (e.g., a class or operation mentioned in a use case that does not exist in the diagram), correct the use case or raise the issue in the Questions section.
    - If the correction requires adjusting the diagram itself, you can also suggest updates to the class diagram and include those in your response.

    4. **Output Format**:
    Return your response as a Markdown document with the following structure:

    ---

    ### Output Format:

    - ## Revised Use Cases  
    Update and show the revised list of use cases in the structured format below.

    **Structure (for each use case):**  
    - **Name**  
    - **Actors** (include both primary and secondary, if applicable)  
    - **Preconditions**  
    - **Normal Flow of Events** (numbered list)  
    - **Alternative / Exception Flows** (bullet points)  
    - **Related Requirements**  
    - **Classes** (ADD THE CLASSES RELATED TO THE UC HERE)

    - ## Questions and Suggestions  
    - List any identified inconsistencies, doubts, or points that need clarification.
    - If you adjusted use cases to match the diagram, explain briefly what was changed and why.

    ---

    ### Inputs Provided to You:

    - **Use Case Descriptions** in the structure specified above, **without the "Classes" field filled**: {report_validateuc}
    - **Class Diagram** in Mermaid syntax, including classes, attributes, relationships, and inheritance: {diagrama_classes_final}
    - **Requirements**: functional (FR), non-functional (NFR), and business rules (BR) — use them as support to clarify flows, data, and constraints when necessary: {report}

    ---

    ### Additional Instructions:

    - Use PascalCase for class names when inserting them into the “Classes” field.
    - Maintain the original structure of each use case and just complete or fix the necessary parts.
    - If any inconsistency can't be resolved with the available data, report it clearly in the "Questions and Suggestions" section.
    - Do not remove existing use cases. You may split a use case **only if it violates the definition of a complete transaction**.
    - Ensure that any class mentioned in a use case actually exists in the class diagram (or suggest it as a necessary class in the questions section).

    Your output must be written in **Portuguese**.

    """
    )
])

# Cadeia de execução do agente
agent_cdinuc_description_chain = cdinuc_description_prompt | llm_model | StrOutputParser()

# Função refinada para o nó
def cdinuc_description_node(state):
    resultado = agent_cdinuc_description_chain.invoke({"report": state["report"], 
                                            "diagrama_classes_final": state["diagrama_classes_final"],
                                            "report_validateuc": state["report_validateuc"]})

    return {**state, "cdinuc_description_revised": resultado}
