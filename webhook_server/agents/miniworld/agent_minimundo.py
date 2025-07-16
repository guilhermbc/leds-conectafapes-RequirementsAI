from langchain_core.messages import SystemMessage
from langgraph.prebuilt import create_react_agent
from langchain.prompts import ChatPromptTemplate
#from RequirementsAI.webhook_server.app_config import llm_model
from app_config import llm_model, parser
import datetime
from langchain_core.output_parsers import StrOutputParser
import tomllib
from pathlib import Path

# Prompt do agente de geração de minimundo
persona_message_minimundo = SystemMessage(
    content=(
    "You are a requirements engineer specializing in transforming transcripts into mini-worlds.\n"
    "Your mission is to create a clear and accurate domain narrative based on the provided transcript, in Portuguese."
    )
)

minimundo_prompt = ChatPromptTemplate.from_messages([
    persona_message_minimundo,
    ("human", """
    You are a requirements engineering expert.

    Your goal is to create a relevant domain narrative based on the transcription and using the addicional information below the transcription.
    OBS: The addicional information might be empty.

    transcription: {transcricao}
    addicional information: {info}
    The domain narrative based on the transcription should be clear, concise, and reflect the user's needs.
    The domain narrative based on the transcription should contain relevant information for requirements analysis.
    The domain narrative based on the transcription should be structured to facilitate the identification of functional and non-functional requirements.
    The domain narrative based on the transcription should include details about the context, users, and expected system functionalities.
    The domain narrative based on the transcription should be written in natural language, avoiding technical jargon.
    The domain narrative based on the transcription should be logically organized, with distinct sections for different aspects of the system.
    The domain narrative based on the transcription should be reviewed to ensure clarity and accuracy.
    The domain narrative based on the transcription should be presented in a way that facilitates reading and understanding.
    The domain narrative based on the transcription should be written in Portuguese.
     """)
])

agent_minimundo_chain = minimundo_prompt | llm_model | StrOutputParser()

def generate_minimundo_node(state):
    """
    Step 0:
    - Transcription of the domain narrative.
    """
    resultado = agent_minimundo_chain.invoke({"transcricao": state["transcricao"], "info":state["informacoes_adicionais"]})
    print("📚 Minimundo gerado:", resultado)

    return {**state, "minimundo": resultado}