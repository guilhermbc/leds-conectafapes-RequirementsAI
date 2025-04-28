from config import model, parser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableLambda

def extract_requirements_func(inputs):
    prompt = ChatPromptTemplate.from_template("""
    You are a requirements engineering expert.

    Based on the draft of requirements:
    {rascunho_requisitos}

    Generate 3 tables in Markdown format:

    1. **Functional Requirements (FRs)** - ID, Description, Priority (High/Medium/Low), Related Requirements
    2. **Business Rules (BRs)** - ID, Description, Priority, Related Requirements
    3. **Non-Functional Requirements (NFRs)** - ID, Description, Category, Priority

    Only output the tables in Markdown and any doubts at the end.
    """)
    chain = prompt | model | parser
    output = chain.invoke(inputs)
    return {**inputs, "requisitos_tabelas": output}

extract_requirements = RunnableLambda(extract_requirements_func)
