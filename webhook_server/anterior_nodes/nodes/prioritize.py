from config import model, parser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableLambda

def prioritize_requirements_func(inputs):
    prompt = ChatPromptTemplate.from_template("""
    You are a requirements specialist focused on prioritization.

    Below are the requirement tables:
    {requisitos_tabelas}

    1. Validate if the priorities (High, Medium, Low) make sense.
    2. Suggest adjustments if needed.
    3. Point out any remaining doubts or gaps.
    """)
    chain = prompt | model | parser
    output = chain.invoke(inputs)
    return {**inputs, "requisitos_priorizados": output}

prioritize_requirements = RunnableLambda(prioritize_requirements_func)
