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
        
        Generate the final version of the given class diagram in Mermaid format in a Markdown Document
             
        The Markdown Document must have:
        - 1 class diagram in Mermaid format in a Markdown Document **exacly** like the following DESIRED FORMAT EXAMPLE
        - 1 data dictionary with the description of all attributes of all classes
        - A question section with the questions of the given class diagram

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

        **Important**:
        - All class names, attribute names, relations must be translated into Portuguese.
        - The Data Dictionary and the Questions Sections must be translated into Portuguese. 
        
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