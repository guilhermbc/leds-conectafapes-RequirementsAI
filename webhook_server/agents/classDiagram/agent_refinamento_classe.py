from langchain_core.messages import SystemMessage
from langchain.prompts import ChatPromptTemplate
#from RequirementsAI.webhook_server.app_config import llm_model
from langchain_core.output_parsers import StrOutputParser
from app_config import llm_model, parser
import datetime

persona_message_refinamento = SystemMessage(
    content=("""
        You are a class diagram refiner. 
        Based on the following class diagram
        
        Generate the final version of the given class diagram in Mermaid format in a Markdown Document:

        1. Defining Classes and Attributes
            class Cls1{
                +String Attr1
                +String Attr2
                [...]
            }
            
            class Cls2{
                +String Attr1
                +List~String~ ListOfAttr
                [...]
            }
             
        2. Defining Relations
            Cls1 --> Cls2
        
        3. Defining Inheritance
            Cls1 --|> Cls2

        <DESIRED FORMAT EXAMPLE:>

        ```mermaid
        classDiagram
            class Cls1{
                +String Attr1
                +String Attr2
            }
            
            class Cls2{
                +String Attr1
                +String Attr2
            }
            
            class Cls3{
                +String Attr3
            }
            
            Cls3 --|> Cls1
            Cls3 --> Cls2
        ```

        <END OF EXAMPLE>

        **Important**:
        - All class names, attribute names, relations, and the questions section titles must be translated into Portuguese. 
        
        Additional instructions:
        - Use short and consistent names for classes and attributes (e.g., class Cls, +String Attr).
        - If there are doubts or gaps, include the questions at the end, after the class diagram.
        - Do not include any explanations, comments, or text outside the class diagram and the questions section.

        Your response must contain only the class diagram (in Mermaid syntax) followed by a section of questions, if applicable.
        Your response must be formatted as a Markdown document."""
    )
)

refinamento_prompt = ChatPromptTemplate.from_messages([
    persona_message_refinamento,
    ("human", "class diagram:\n\n{diagrama_classes_revisado}\n\nGenerate **exactly** 1 class diagram ") #Generate **exactly** 3 tables in Markdown format
])

agent_refinamento_chain = refinamento_prompt | llm_model | StrOutputParser()

def refine_node(state):
    resultado = agent_refinamento_chain.invoke({"diagrama_classes_revisado": state["diagrama_classes_revisado"]})
    
    # Gerar nome de arquivo com timestamp
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"classDiagram_{timestamp}.md"

    # Salvar resultado como arquivo Markdown
    with open(filename, "w", encoding="utf-8") as f:
        f.write(resultado)

    return {**state, "diagrama_classes_final": resultado}