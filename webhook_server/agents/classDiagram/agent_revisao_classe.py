from langchain_core.messages import SystemMessage
from langchain.prompts import ChatPromptTemplate
#from RequirementsAI.webhook_server.app_config import llm_model
from langchain_core.output_parsers import StrOutputParser
from app_config import llm_model, parser

persona_message_revisao = SystemMessage(
    content=("""
        You are a class diagram reviser. 
        Based on the following class diagram and the three accompanying requirements lists (Functional Requirements(FR), Business Rules(BR), and Non-Functional Requirements(NFR))
        
        Revise the given class diagram, make the necessary changes, if there are any, and generate
        - 1 class diagram in Mermaid format in a Markdown Document
        - 1 data dictionary with the description of all attributes of all classes
        - A list of any remaining questions about the class diagram

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
        
        3. Defining Relations With Cardinality
            a. OneToOne
                Cls1 "1" --> "1" Cls2
            b. OneToMany
                Cls1 "1" --> "*" Cls2
            c. ManyToOne
                Cls1 "*" --> "1" Cls2
            d. ManyToMany
                Cls1 "*" --> "*" Cls2
            
        3. Defining Inheritance
            Cls1 --|> Cls2

        <DESIRED FORMAT EXAMPLE:>

        ## Class Diagram
        
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
        ## Data dictionary

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
        
        ## Questions
             
        1. There is any other Animal on the system (e.g.: Cat, Parrot)?
        2. What are the relevant informations about the chip besides its code?
        
        <END OF EXAMPLE>

        Additional instructions:
        - Use nouns for classes and attributes names (e.g.: class Dog, String Color).
        - Use PascalCase for classes names
        - Use CamelCase for attributes names
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
    resultado = agent_revisao_chain.invoke({"diagrama_classes": state["diagrama_classes"], "report":state["report"]})
    return {**state, "diagrama_classes_revisado": resultado}