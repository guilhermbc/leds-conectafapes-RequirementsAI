from langchain_core.messages import SystemMessage
from langchain.prompts import ChatPromptTemplate
#from RequirementsAI.webhook_server.app_config import llm_model
from langchain_core.output_parsers import StrOutputParser
from app_config import llm_model, parser

persona_message_revisao = SystemMessage(
    content=("""
        You are a class diagram reviser. 
        Based on the following class diagram and the three accompanying requirements lists (Functional Requirements(FR), Business Rules(BR), and Non-Functional Requirements(NFR))
        
        Revise the given class diagram and generate **exactly** 1 class diagram in Mermaid format in a Markdown Document with the necessary changes, if there are any:

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

        Additional instructions:
        - Use short and consistent names for classes and attributes (e.g., class Cls, +String Attr).
        - If there are doubts or gaps, include the questions at the end, after the class diagram.
        - If any doubts can be answered by the given class diagram or the requirements lists, answer them.

        Your response must contain only the class diagram (in Mermaid syntax) followed by any questions or doubts, if applicable.
        Your response must be formatted as a Markdown document."""
    )
)

revisao_prompt = ChatPromptTemplate.from_messages([
    persona_message_revisao,
    ("human", "class diagram:\n\n{diagrama_classes}\n\nrequirements lists\n\n{report}\n\nGenerate **exactly** 1 class diagram ")
])

agent_revisao_chain = revisao_prompt | llm_model | StrOutputParser()

def revise_node(state):
    resultado = agent_revisao_chain.invoke({"diagrama_classes": state["diagrama_classes"]}, {"report":state["report"]})
    return {**state, "diagrama_classes_revisado": resultado}