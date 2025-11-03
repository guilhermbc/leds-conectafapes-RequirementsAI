from langchain_core.messages import SystemMessage
from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from webhook_server.app_config import llm_model, parser  # Garantindo consistência com seu projeto

# System message in English
persona_message_prioritization = SystemMessage(
    content=(
        "You are a requirements engineering specialist, with a focus on prioritization.\n"
        "Your task is:\n"
        "1. Validate whether the priorities in the following tables are coherent (High, Medium, Low).\n"
        "2. If necessary, reclassify or suggest priority adjustments.\n"
        "3. Check for any unresolved gaps or unclear information. If any, list specific questions.\n"
        "4. Prepare the reviewed requirements for the final refinement stage.\n"
        "Respond with the adjusted tables and any questions (if applicable).\n"
    )
)

# Chat prompt also in English
prioritization_prompt = ChatPromptTemplate.from_messages([
    persona_message_prioritization,
    ("human", "Requirements tables:\n\n{requisitos_tabelas}\n\nPlease perform validation and adjustment as instructed.")
])

# Chain with model
agent_prioritization_chain = prioritization_prompt | llm_model | StrOutputParser()

# Node function integrated with the agent
def prioritize_node(state):
    """
    Complementary Step 3 and Step 4:
    - Final adjustment of priorities (if necessary), following High/Medium/Low references.
    - Check if there are gaps or questions for the user for refinement.
    """
    print("🔍 State received at prioritization node:", state)
    result = agent_prioritization_chain.invoke({"requisitos_tabelas": state["requisitos_tabelas"]})
    return {**state, "requisitos_priorizados": result}
