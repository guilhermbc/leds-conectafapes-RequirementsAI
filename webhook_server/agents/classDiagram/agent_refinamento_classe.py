from langchain_core.messages import SystemMessage
from langchain.prompts import ChatPromptTemplate
#from RequirementsAI.webhook_server.app_config import llm_model
from langchain_core.output_parsers import StrOutputParser
from app_config import llm_model, parser
import datetime
import tomllib
from pathlib import Path

persona_message_refinamento = SystemMessage(
    content=("""
        You are a class diagram refiner. 
        Based on the following class diagram
        
        Generate the final version of the given class diagram in Mermaid format in a Markdown Document
             
        The Markdown Document must have:
        - 1 class diagram in Mermaid format in a Markdown Document **exacly** like the following DESIRED FORMAT EXAMPLE
        - 1 data dictionary with the description of all attributes of all classes
        - A integrity constraints section that lists all constraints between the classes. Each constraint have the related classes and, whenever possible, the rule of the constraint
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
            
        4. Defining Inheritance
            Cls1 --|> Cls2
        
        5. Integrity Constraints
            Integrity constraints are business rules aimed at eliminating ambiguities and making the conceptual model more accurate and faithful to reality. They specify limitations or conditions that must be respected in the relationships between model elements (such as classes and associations), as well as in the attributes of those classes.

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
            
            class Owner{
                String name
            }
            
            Dog --|> Animal
            Dog "1" --> "*" Toy : has
            Owner "1" --> "*" Dog
            Owner "1" --> "*" Toy : bought
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
        
        ### Owner
        | Attribute | Description |
        |-----------|-------------|
        | Name | Name of the Owner |
        
        ## Integrity Constraints
        
        * **IC1:**  
            * Classes: `Dog`  
            * Rule: Each `Dog` must have a unique `ChipCode`.

            * **IC2:**  
            * Classes: `Toy`, `Dog`, `Owner`  
            * Rule: A `Toy` associated with a `Dog` must have been bought by the same `Owner` who owns the `Dog`.

            * **IC3:**  
            * Classes: `Dog`, `Owner`  
            * Rule: A `Dog` can only have one `Owner` at a time.

            * **IC4:**  
            * Classes: `Toy`, `Owner`  
            * Rule: Each `Toy` must be associated with exactly one `Owner`.

            * **IC5:**  
            * Classes: `Toy`  
            * Rule: A `Toy` must have both a `Color` and a `Type`; these attributes must not be null.
        
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
    ("human", "class diagram:\n\n{diagrama_classes_revisado}\n\nGenerate **exactly** 1 class diagram ")
])

agent_refinamento_chain = refinamento_prompt | llm_model | StrOutputParser()

def refine_node(state):
    resultado = agent_refinamento_chain.invoke({"diagrama_classes_revisado": state["diagrama_classes_revisado"]})
    
    # Gerar nome de arquivo com timestamp
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"classDiagram_{timestamp}.md"

    # Salvar resultado como arquivo Markdown

    data = get_project()
    projName = data["name"]
    projVersion = data["version"]

    footer = f"\n\n---\n\nGerado por {projName} versão {projVersion}"

    with open(filename, "w", encoding="utf-8") as f:
        f.write(resultado)
        f.write(footer)

    return {**state, "diagrama_classes_final": resultado}

def get_project():
    pyproject = Path(__file__).resolve().parents[3] / 'pyproject.toml'
    data = tomllib.loads(pyproject.read_text(encoding="utf-8"))
    return data["project"]