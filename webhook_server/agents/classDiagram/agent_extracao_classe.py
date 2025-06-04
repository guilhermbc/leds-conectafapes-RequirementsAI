from langchain_core.messages import SystemMessage
from langchain.prompts import ChatPromptTemplate
#from RequirementsAI.webhook_server.app_config import llm_model
from langchain_core.output_parsers import StrOutputParser
from app_config import llm_model, parser

persona_message_extracao = SystemMessage(
    content=("""
        You are a classes engineering expert. 
        Based on the following draft of classes
        
        Generate **exactly** 1 class diagram in Mermaid format in a Markdown Document:

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

        <END OF EXAMPLE>

        Additional instructions:
        - Use short and consistent names for classes and attributes (e.g., class Cls, +String Attr).
        - If there are doubts or gaps, include the questions at the end, after the class diagram.

        Respond only with the class diagram (in Markdown) and any doubts."""
    )
)

extracao_prompt = ChatPromptTemplate.from_messages([
    persona_message_extracao,
    ("human", "draft of classes:\n\n{rascunho_classes}\n\nGenerate **exactly** 1 class diagram ") #Generate **exactly** 3 tables in Markdown format
])

agent_extracao_chain = extracao_prompt | llm_model | StrOutputParser()

def extract_node(state):
    resultado = agent_extracao_chain.invoke({"rascunho_classes": state["rascunho_classes"]})
    return {**state, "diagrama_classes": resultado}