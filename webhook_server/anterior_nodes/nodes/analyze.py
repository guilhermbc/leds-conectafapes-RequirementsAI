from config import model, parser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableLambda

def analyze_documentation_func(inputs):
    prompt = ChatPromptTemplate.from_template("""
    You are a requirements engineering expert.

    Your goal is:
    1 Analyze the domain narrative below.
    2️ Identify specific functionalities expected from the system (Functional Requirements - FRs).
    3️ Identify Business Rules (BRs).
    4️ Identify possible Non-Functional Requirements (NFRs).

    At the end:
    - Generate a preliminary draft of requirements (FRs, BRs, NFRs).
    - Highlight possible gaps or inconsistencies.
    - Ask the user about unclear points, if any.

    Domain Narrative: {minimundo}

    If missing or conflicting information exists, ask the user.
    """)
    chain = prompt | model | parser
    output = chain.invoke(inputs)
    return {**inputs, "rascunho_requisitos": output}

analyze_documentation = RunnableLambda(analyze_documentation_func)
