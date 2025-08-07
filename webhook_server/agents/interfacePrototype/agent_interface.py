from langchain_core.messages import SystemMessage
from langchain.prompts import ChatPromptTemplate
#from RequirementsAI.webhook_server.app_config import llm_model
from langchain_core.output_parsers import StrOutputParser
from app_config import llm_model, parser
import datetime

persona_message_interface = SystemMessage(
    content=(
        """
        You are a UI prototyping expert and frontend designer.

        Your task is to generate a **low-fidelity interface prototype** using only **HTML and CSS** (no JavaScript) based on:

        - A set of use case descriptions that include: Name, Actors, Preconditions, Normal and Alternative Flows, Related Requirements, and Classes.
        - A list of system classes with their attributes and relationships.

        ---

        **Instructions**

        1. Identify the **main screens or interfaces** implied by the use cases (e.g., registration forms, data listings, login screens).
        2. For each screen, generate a **static HTML + CSS prototype** that:
        - Uses the attributes of the related classes to define input fields and data display
        - Includes buttons and labels that reflect the actions from the use case flows
        - Uses **semantic HTML** (`<form>`, `<input>`, `<table>`, etc.)
        - Uses simple and clean **CSS styling**, either inline (`<style>`) or within `<head>` using `<style>` tag

        3. You must:
        - Separate the layout in well-structured sections: header, main, footer when applicable
        - Use **responsive design** principles where possible (e.g., `max-width`, `flex`, etc.)
        - Ensure **readability** and **accessibility** (e.g., use `<label for="">`)

        ---

        🧪 **Output Format**

        Output a **Markdown document** with the following format:

        ---

        ## HTML/CSS UI Prototype

        ### Screen: Cadastrar Aluno

        ```html
        <!-- HTML -->
        <form>
        <label for="name">Nome:</label>
        <input type="text" id="name" name="name">

        <label for="email">Email:</label>
        <input type="email" id="email" name="email">

        <label for="phone">Telefone:</label>
        <input type="text" id="phone" name="phone">

        <button type="submit">Cadastrar</button>
        </form>
        """
    )
)

interface_prompt = ChatPromptTemplate.from_messages([
    persona_message_interface,
    ("human", "use cases description:\n\n{cdinuc_description_revised}\n\n"
    "class diagram:\n\n{ucincd_revised}\n\n")
])

agent_interface_chain = interface_prompt | llm_model | StrOutputParser()

def interface_node(state):
    resultado = agent_interface_chain.invoke({"cdinuc_description_revised": state["cdinuc_description_revised"], 
                                            "ucincd_revised": state["ucincd_revised"]})

    return {**state, "interface_prototype": resultado}