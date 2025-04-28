from config import model, parser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableLambda

def transcription_func(inputs):
    prompt = ChatPromptTemplate.from_template("""
    You are a requirements engineering expert.

    Your goal is to create a relevant domain narrative based on the transcription.

    transcription: {transcricao}
    The domain narrative based on the transcription should be clear, concise, and reflect the user's needs.
    The domain narrative based on the transcription should contain relevant information for requirements analysis.
    The domain narrative based on the transcription should be structured to facilitate the identification of functional and non-functional requirements.
    The domain narrative based on the transcription should include details about the context, users, and expected system functionalities.
    The domain narrative based on the transcription should be written in natural language, avoiding technical jargon.
    The domain narrative should be presented in Portuguese.
    """)
    chain = prompt | model | parser
    output = chain.invoke(inputs)
    return {**inputs, "minimundo": output}

generate_minimundo = RunnableLambda(transcription_func)
