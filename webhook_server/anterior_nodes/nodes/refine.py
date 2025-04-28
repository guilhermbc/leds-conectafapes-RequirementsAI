import datetime
from config import model, parser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableLambda

def refine_requirements_func(inputs):
    prompt = ChatPromptTemplate.from_template("""
    You are a requirements refiner.

    Prioritized requirements:
    {requisitos_priorizados}

    Objective:
    - Finalize 3 tables: FRs, BRs, NFRs in Markdown.
    - Include a section with doubts or validations if needed.
    - Response must be entirely in **Portuguese**.
    """)
    chain = prompt | model | parser
    resultado_final = chain.invoke(inputs)

    # Save report to a file
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"report_{timestamp}.md"
    with open(filename, "w", encoding="utf-8") as f:
        f.write(resultado_final)

    return {**inputs, "report": resultado_final}

refine_requirements = RunnableLambda(refine_requirements_func)
