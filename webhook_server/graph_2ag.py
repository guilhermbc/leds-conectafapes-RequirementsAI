import os
import datetime
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableLambda
from langgraph.graph import StateGraph, END
from typing import TypedDict, Optional
from langsmith import traceable
import google.generativeai as genai
import sys
from langchain.memory import ConversationBufferMemory
#from langchain_core.messages import ChatMessageHistory
import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)


from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.runnables import RunnableConfig


load_dotenv()

# Load Gemini key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Initialize AI model
model = ChatGoogleGenerativeAI(
    model="gemini-2.5-pro-exp-03-25",    
    temperature=0,
    api_key=GEMINI_API_KEY
)

parser = StrOutputParser()

# Novo Agente Validador com Memória
#validador_memory = ChatMessageHistory()
validador_memory = ConversationBufferMemory(return_messages=True)

validador_prompt = ChatPromptTemplate.from_template("""
Você é um agente especialista em validação de requisitos.

Seu trabalho é:
1. Analisar os requisitos abaixo.
2. Validar clareza, completude e viabilidade.
3. Gerar feedback e indicar se os requisitos podem ser aprovados ou precisam de ajustes.

Requisitos:
{requisitos}

Responda com:
- Avaliação (Clareza, Completude, Viabilidade);
- Sugestões de Melhoria;
- Status Final: [Aprovado / Requer Revisão]
""")

validador_chain = validador_prompt | model | parser

# Função para retornar a memória (simples, sem sessões múltiplas)
def get_simple_memory(session_id: str):
    return validador_memory

validador_agent = RunnableWithMessageHistory(
    validador_chain,
    get_session_history=get_simple_memory, 
    input_messages_key="requisitos",
    history_messages_key="history"
)


# State definition
class MyState(TypedDict):
    video_entrevista: Optional[str]
    mensagem_usuario: Optional[str]
    mensagem: Optional[str]
    estado: Optional[str]
    transcricao: Optional[str]
    minimundo: Optional[str]
    rascunho_requisitos: Optional[str]
    requisitos_tabelas: Optional[str]
    requisitos_priorizados: Optional[str]
    report: Optional[str]


import shutil



def CopyfilefromWebUItoMedia_func(caminho_origem: str, nome_destino: str = None) -> str:
    """
    Copies a file from WebUI (/app/backend/data/uploads/...) to the local 'media' folder,
    ensuring that LangGraph can access it properly.

    """
    if not os.path.exists(caminho_origem):
        raise FileNotFoundError(f"Arquivo não encontrado: {caminho_origem}")

    os.makedirs("media", exist_ok=True)

    nome_destino = nome_destino or os.path.basename(caminho_origem)
    caminho_destino = os.path.join("media", nome_destino)

    shutil.copy(caminho_origem, caminho_destino)
    print(f"File copied to: {caminho_destino}")
    return caminho_destino


def check_Input_func(inputs):
    print("Checking if the video was provided...")
    video = inputs.get("video_entrevista")
    print(f"Original video path:: {video}")
    video = inputs.get("video_entrevista")

    if video:
        # If the path is from WebUI, copy it to media/
        if video.startswith("/app/backend/data/uploads/"):
            try:
                video_convertido = CopyfilefromWebUItoMedia_func(video)
                inputs["video_entrevista"] = video_convertido
            except Exception as e:
                print(f"Error copying file from WebUI: {e}")
                return {
                    **inputs,
                    "mensagem": "Error accessing the uploaded video. Check the path.",
                    "estado": "erro_video"
                }

        # Relative path → make absolute
        elif not os.path.isabs(video):
            video = os.path.join(os.getcwd(), video)
            inputs["video_entrevista"] = video

    # If still not found or doesn't exist
    if not inputs.get("video_entrevista") or not os.path.exists(inputs["video_entrevista"]):
        print("Video not found in the state. Requesting upload.")
        return {
            **inputs,
            "mensagem": "Please provide the interview video path in .mp3, .mp4, or .mkv format.",
            "estado": "aguardando_video"
        }

    print("Video found! Continuing with transcription.")
    return inputs


# Node 0: Transcribe audio with Gemini API
def transcribe_audio_func(inputs):
    audio_file_path = inputs["video_entrevista"]
    print(f"Transcrevendo arquivo de áudio: {audio_file_path}")
    
    genai.configure(api_key=GEMINI_API_KEY)
    model_gemini = genai.GenerativeModel("gemini-1.5-pro")

    if not os.path.exists(audio_file_path):
        raise FileNotFoundError(f"Arquivo de áudio não encontrado: {audio_file_path}")
    
    try:
        with open(audio_file_path, 'rb') as f:
            audio_data = f.read()

        prompt = """
        Por favor, forneça uma transcrição completa e precisa deste áudio.
        Inclua marcações de tempo a cada 30 segundos, se possível.
        Identifique diferentes falantes se houver múltiplas pessoas falando.
        """

        response = model_gemini.generate_content(
            [
                {"mime_type": "audio/mp3", "data": audio_data},
                prompt
            ]
        )

        # Salvar a transcrição em um arquivo
        output_file = f"{os.path.splitext(audio_file_path)[0]}_transcricao.txt"
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(response.text)
        
        print(f"Transcrição salva em: {output_file}")

        return {**inputs, "transcricao": response.text}
    
    except Exception as e:
        raise RuntimeError(f"Erro ao transcrever áudio: {str(e)}")
        sys.exit(1)

# Funções para cada etapa
def transcription_func(inputs):
    """
    Step 0:
    - Transcription of the domain narrative.
    """
    prompt = ChatPromptTemplate.from_template("""
    You are a requirements engineering expert.

    Your goal is to create a relevant domain narrative based on the transcription.

    transcription: {transcricao}
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
    chain = prompt | model | parser
    output = chain.invoke(inputs)

    return {**inputs, "minimundo": output}


def analyze_documentation_func(inputs):
    """
    Steps 1 and 2:
    1. Carefully read the domain narrative to identify
       Functional Requirements (FRs), Business Rules (BRs), and 
       Non-Functional Requirements (NFRs).
    2. Generate an initial understanding of the functionalities and related attributes.
    """
    prompt = ChatPromptTemplate.from_template("""
    You are a requirements engineering expert.

    Your goal is:
    1 Analyze the domain narrative below.
    2️ Identify specific functionalities expected from the system (Functional Requirements - FRs).
    3️ Identify Business Rules (BRs).
    4️ Identify possible Non-Functional Requirements (NFRs).

    At the end, you must:
    - Generate a preliminary draft of requirements (FRs, BRs, NFRs).
    - Highlight possible gaps or inconsistencies.
    - Ask the user about unclear points, if any.

    Domain Narrative: {minimundo}

    Remember: if there is missing or conflicting information, ask the user.
    If the user has no answers, make well-founded assumptions and inform what decisions were made.
    """)
    chain = prompt | model | parser
    output = chain.invoke(inputs)

    

    return {**inputs, "rascunho_requisitos": output}


def extract_requirements_func(inputs):
    print("input value in extract requirements:",inputs)
    prompt = ChatPromptTemplate.from_template("""
    You are a requirements engineering expert.  

    Based on the following draft of requirements:
    {rascunho_requisitos}

    Generate **exactly** 3 tables in Markdown format:

    1. **Functional Requirements Table (FRs)**  
       - Columns: ID, Description, Priority (High/Medium/Low), Related Requirements
    2. **Business Rules Table (BRs)**  
       - Columns: ID, Description, Priority (High/Medium/Low), Related Requirements
    3. **Non-Functional Requirements Table (NFRs)**  
       - Columns: ID, Description, Category, Priority (High/Medium/Low)

    <DESIRED FORMAT EXAMPLE:>

    ## Functional Requirements Table (FRs)
    | ID    | Description                                                                                       | Priority | Related Requirements |
    |-------|---------------------------------------------------------------------------------------------------|----------|-----------------------|
    | FR001 | The system must allow coordinators to register and monitor scholarship holders.                   | High     | FR002, FR003          |
    | FR002 | The system must display project data, such as available resources, scholarship quotas, and duration. | High  | FR001                 |
    | FR003 | The system must allow scenario simulation for strategic scholarship allocation planning.          | High     | FR002, FR004          |
    | FR004 | <!-- Add the next requirement here following the same pattern -->                                 |          |                       |

    ## Business Rules Table (BRs)
    | ID    | Description                                                                                                                            | Priority | Related Requirements |
    |-------|----------------------------------------------------------------------------------------------------------------------------------------|----------|-----------------------|
    | BR001 | System access will be performed by external users with specific profiles (coordinator, scholarship holder, entrepreneur).             | High     | FR013                 |
    | BR002 | Required documents vary according to the call and must be submitted in the defined format and deadline.                               | High     | FR005, FR008          |
    | BR003 | Scholarship holder eligibility must be verified based on criteria such as minimum age, education level, residence, and negative certificates. | High | FR014          |
    | BR004 | <!-- Add the next business rule here following the same pattern -->

    ## Non-Functional Requirements Table (NFRs)
    | ID     | Description                                                                                               | Category      | Priority |
    |--------|-----------------------------------------------------------------------------------------------------------|---------------|----------|
    | NFR001 | The system must be scalable to handle access peaks during call periods.                                   | Scalability   | High     |
    | NFR002 | The system must securely integrate with SouGov for authentication.                                        | Security      | High     |
    | NFR003 | The system must be compatible with different browsers and devices (e.g., mobile).                         | Usability     | Medium   |
    | NFR004 | <!-- Add the next non-functional requirement here following the same pattern -->

    <END OF EXAMPLE>

    Additional instructions:
    - Use short and consistent IDs (e.g., FR001, BR001...).
    - Do not repeat unnecessary text.
    - If there are doubts or gaps, include the questions at the end, after the tables.

    Respond only with the tables (in Markdown) and any doubts.
    """)
    chain = prompt | model | parser
    output = chain.invoke(inputs)
    return {**inputs, "requisitos_tabelas": output}


def prioritize_requirements_func(inputs):
    """
    Complementary Step 3 and Step 4:
    - Final adjustment of priorities (if necessary), following High/Medium/Low references.
    - Check if there are gaps or questions for the user for refinement.
    """
    print("input value in prioritize requirements:",inputs)
    prompt = ChatPromptTemplate.from_template("""
    You are a requirements specialist focused on prioritization.

    Below are the already organized requirement tables:
    {requisitos_tabelas}

    1. Validate whether the priorities are coherent (High, Medium, Low).
    2. If necessary, reclassify or suggest priority adjustments.
    3. Check if there are still any unresolved gaps. If so, list specific questions.
    4. Prepare these requirements for the final refinement step.
    """)
    chain = prompt | model | parser
    output = chain.invoke(inputs)

    return {**inputs, "requisitos_priorizados": output}


def refine_requirements_func(inputs):
    print("input value in refine requirements:",inputs)
    prompt = ChatPromptTemplate.from_template("""
    You are a requirements refiner.

    Below are the prioritized requirements:
    {requisitos_priorizados}

    **Objective**: Generate a final version of the requirements in 3 tables (FRs, BRs, NFRs), in the following format (example):
    ```
    ## Functional Requirements Table (FRs)
    | ID    | Description                                                    | Priority   | Related Requirements     |
    |-------|----------------------------------------------------------------|------------|--------------------------|
    | FR001 | The system must allow user registration.                      | High       | FR002                    |
    ...
    ```
    and so on for BRs and NFRs.

    **Also include at the end**:
    - Questions or doubts if there are still inconsistencies;
    - Final remarks for the user.

    **Response Format**:  
    - In Markdown;
    - Three tables (FR, BR, NFR);
    - After the tables, include a "Questions and validations" block if applicable.
                                              

    Generate only this. Avoid repetitions.
                                              
    **Important**: Translate all your final output into **Portuguese**.
    Your answer must be entirely in **Portuguese**.
    """)
    chain = prompt | model | parser
    resultado_final = chain.invoke(inputs)

    # Generate a file name with timestamp
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"report_{timestamp}.md"

    # Save the file with a unique name
    with open(filename, "w", encoding="utf-8") as f:
        f.write(resultado_final)

    return {**inputs, "report": resultado_final}


def agente_validador_func(inputs):
    print("Validating with autonomous agent...")
    requisitos = inputs.get("report", "")

    if not requisitos:
        raise ValueError("No requirements found for validation.")

    output = validador_agent.invoke(
    {"requisitos": requisitos},
    config={"configurable": {"session_id": "sessao_unica"}}
    )
    
    # Salvar resultado da validação
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"validation_agent_{timestamp}.md"
    with open(filename, "w", encoding="utf-8") as f:
        f.write(output)

    return {**inputs, "validation_result": output}

# Function that runs the graph and will be traced in LangSmith
@traceable(name="Run LangGraph with Transcription")
def run_graph(audio_path: str):
    input_data = {"video_entrevista": audio_path}
    final_state = graph.invoke(input_data)
    return final_state

def final_return_func(inputs):
    print("Returning final state to WebUI.")
    return inputs


# graph build
builder = StateGraph(state_schema=MyState)


# add node
builder.add_node("verificar_entrada", RunnableLambda(check_Input_func))
builder.add_node("transcricao_audio", RunnableLambda(transcribe_audio_func))
builder.add_node("gerar_minimundo", RunnableLambda(transcription_func))
builder.add_node("analisar_documentacao", RunnableLambda(analyze_documentation_func))
builder.add_node("extrair_requisitos", RunnableLambda(extract_requirements_func))
builder.add_node("priorizar_requisitos", RunnableLambda(prioritize_requirements_func))
builder.add_node("refinar_requisitos", RunnableLambda(refine_requirements_func))
builder.add_node("retorno_final", RunnableLambda(final_return_func))
builder.add_node("agente_validador", RunnableLambda(agente_validador_func))

# Define the flow
builder.set_entry_point("verificar_entrada")

# Conditional logic
def input_route(state: dict) -> str:
    return "mensagem_falta_video" if "mensagem" in state else "transcricao_audio"

builder.add_conditional_edges(
    "verificar_entrada",
    input_route,
    {
        "mensagem_falta_video": "retorno_final",  
        "transcricao_audio": "transcricao_audio"
    }
)


builder.add_edge("transcricao_audio", "gerar_minimundo")
builder.add_edge("gerar_minimundo", "analisar_documentacao")
builder.add_edge("analisar_documentacao", "extrair_requisitos")
builder.add_edge("extrair_requisitos", "priorizar_requisitos")
builder.add_edge("priorizar_requisitos", "refinar_requisitos")
builder.add_edge("refinar_requisitos", "agente_validador")
builder.add_edge("agente_validador", END)
builder.add_edge("retorno_final", END)

graph = builder.compile()