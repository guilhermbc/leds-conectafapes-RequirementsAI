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


load_dotenv()

# Carrega chave Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Inicializa modelo
model = ChatGoogleGenerativeAI(
    model="gemini-2.5-pro-exp-03-25",    
    temperature=0,
    api_key=GEMINI_API_KEY
)

parser = StrOutputParser()

# Definição do estado
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


# Nó 0: Transcrever áudio com Gemini API
def transcrever_audio_func(inputs):
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
        
import shutil

def copiar_arquivo_webui_para_media(caminho_origem: str, nome_destino: str = None) -> str:
    """
    Copia um arquivo vindo do WebUI (/app/backend/data/uploads/...) para a pasta 'media' local,
    garantindo que o LangGraph possa acessá-lo com controle.
    """
    if not os.path.exists(caminho_origem):
        raise FileNotFoundError(f"Arquivo não encontrado: {caminho_origem}")

    os.makedirs("media", exist_ok=True)

    nome_destino = nome_destino or os.path.basename(caminho_origem)
    caminho_destino = os.path.join("media", nome_destino)

    shutil.copy(caminho_origem, caminho_destino)
    print(f"Arquivo copiado para: {caminho_destino}")
    return caminho_destino


def verificar_entrada_func(inputs):
    print("Verificando se o vídeo foi fornecido...")

    video = inputs.get("video_entrevista")

    if video:
        #  Se for um caminho vindo do WebUI, copie para media/
        if video.startswith("/app/backend/data/uploads/"):
            try:
                video_convertido = copiar_arquivo_webui_para_media(video)
                inputs["video_entrevista"] = video_convertido
            except Exception as e:
                print(f"Erro ao copiar arquivo do WebUI: {e}")
                return {
                    **inputs,
                    "mensagem": "Erro ao acessar o vídeo enviado. Verifique o caminho.",
                    "estado": "erro_video"
                }

        #  Caminho relativo → tornar absoluto
        elif not os.path.isabs(video):
            video = os.path.join(os.getcwd(), video)
            inputs["video_entrevista"] = video

    #  Se ainda não encontrar ou não existir
    if not inputs.get("video_entrevista") or not os.path.exists(inputs["video_entrevista"]):
        print("Vídeo não encontrado no estado. Solicitando envio.")
        return {
            **inputs,
            "mensagem": "Por favor, envie o caminho do vídeo da entrevista no formato .mp3, .mp4 ou .mkv.",
            "estado": "aguardando_video"
        }

    print("🎬 Vídeo encontrado! Continuando com a transcrição.")
    return inputs



# Função que executa o grafo e será rastreada no LangSmith
@traceable(name="Run LangGraph com Transcrição")
def run_graph(audio_path: str):
    input_data = {"video_entrevista": audio_path}
    final_state = graph.invoke(input_data)
    return final_state


# Funções para cada etapa
def transcricao_func(inputs):
    """
    Passo 0:
    - Transcrição do minimundo.
    """
    prompt = ChatPromptTemplate.from_template("""
    Você é um especialista em engenharia de requisitos.

    Seu objetivo é por meio da transcrição, criar um minimundo pertinente.

    transcricao: {transcricao}
    O minimundo baseado na transcrição deve ser claro, conciso e refletir as necessidades do usuário.
    O minimundo baseado na transcrição deve conter informações relevantes para a análise de requisitos.
    O minimundo baseado na transcrição deve ser estruturado de forma a facilitar a identificação de requisitos funcionais e não funcionais.
    O minimundo baseado na transcrição deve incluir detalhes sobre o contexto, os usuários e as funcionalidades esperadas do sistema.
    O minimundo baseado na transcrição deve ser escrito em linguagem natural, evitando jargões técnicos.
    O minimundo baseado na transcrição deve ser organizado de forma lógica, com seções distintas para diferentes aspectos do sistema.
    O minimundo baseado na transcrição deve ser revisado para garantir clareza e precisão.
    O minimundo baseado na transcrição deve ser apresentado de forma a facilitar a leitura e compreensão.
    O minimundo baseado na transcrição deve ser escrito em português.

    """)
    chain = prompt | model | parser
    output = chain.invoke(inputs)

    return {**inputs, "minimundo": output}

def analisar_documentacao_func(inputs):
    """
    Passo 1 e 2:
    1. Ler atentamente o minimundo para identificar
       Requisitos Funcionais (RFs), Regras de Negócio (RNs) e 
       Requisitos Não Funcionais (RNFs).
    2. Gerar uma primeira percepção das funcionalidades e atributos correlacionados.
    """
    prompt = ChatPromptTemplate.from_template("""
    Você é um especialista em engenharia de requisitos.

    Seu objetivo é:
    1 Analisar  o minimundo abaixo.
    2️ Identificar funcionalidades específicas esperadas do sistema (Requisitos Funcionais - RFs).
    3️ Identificar Regras de Negócio (RNs).
    4️ Identificar possíveis Requisitos Não Funcionais (RNFs).

    Ao final, você deve:
    - Gerar um rascunho preliminar de requisitos (RFs, RNs, RNFs).
    - Destacar possíveis lacunas ou inconsistências.
    - Perguntar ao usuário sobre pontos não esclarecidos, caso existam.

    Minimundo: {minimundo}

    Lembre-se: se houver informações ausentes ou conflitantes, pergunte ao usuário.
    Se o usuário não tiver respostas, faça suposições bem fundamentadas e informe quais foram as decisões tomadas.
    """)
    chain = prompt | model | parser
    output = chain.invoke(inputs)

    

    return {**inputs, "rascunho_requisitos": output}


def extrair_requisitos_func(inputs):
    print("valor de entrad em extrair requisistos:",inputs)
    prompt = ChatPromptTemplate.from_template("""
    Você é um especialista em engenharia de requisitos.  

    Com base no rascunho de requisitos a seguir:
    {rascunho_requisitos}

    Gere **exatamente** 3 tabelas em formato Markdown:

    1. **Tabela de Requisitos Funcionais (RFs)**  
       - Colunas: ID, Descrição, Prioridade (Alta/Média/Baixa), Requisitos Relacionados
    2. **Tabela de Regras de Negócio (RNs)**  
       - Colunas: ID, Descrição, Prioridade (Alta/Média/Baixa), Requisitos Relacionados
    3. **Tabela de Requisitos Não Funcionais (RNFs)**  
       - Colunas: ID, Descrição, Categoria, Prioridade (Alta/Média/Baixa)

    <EXEMPLO DE FORMATO DESEJADO:>

    ## Tabela de Requisitos Funcionais (RFs)
    | ID    | Descrição                                                                                       | Prioridade | Requisitos Relacionados |
    |-------|--------------------------------------------------------------------------------------------------|------------|--------------------------|
    | RF001 | O sistema deve permitir o cadastro e acompanhamento de bolsistas pelos coordenadores.           | Alta       | RF002, RF003             |
    | RF002 | O sistema deve exibir dados dos projetos, como recursos disponíveis, cotas de bolsas e duração. | Alta       | RF001                    |
    | RF003 | O sistema deve permitir a simulação de cenários de alocação de bolsas para planejamento estratégico. | Alta   | RF002, RF004             |
    | RF004 | <!-- Adicione aqui o próximo requisito seguindo o mesmo padrão -->                              |            |                          |                                          

                                              
    ## Tabela de Regras de Negócio (RNs)
    | ID    | Descrição                                                                                                                            | Prioridade | Requisitos Relacionados |
    |-------|---------------------------------------------------------------------------------------------------------------------------------------|------------|--------------------------|
    | RN001 | O acesso ao sistema será realizado por usuários externos com perfis específicos (coordenador, bolsista, empreendedor).              | Alta       | RF013                    |
    | RN002 | Os documentos exigidos variam de acordo com o edital e devem ser enviados no formato e prazo definidos.                             | Alta       | RF005, RF008             |
    | RN003 | A elegibilidade de bolsistas deve ser verificada com base em critérios como idade mínima, escolaridade, residência e certidões negativas. | Alta   | RF014                    |
    | RN004 | <!-- Adicione aqui a próxima regra de negócio seguindo o mesmo padrão -->  


    ## Tabela de Requisitos Não Funcionais (RNFs)
    | ID     | Descrição                                                                                               | Categoria      | Prioridade |
    |--------|----------------------------------------------------------------------------------------------------------|----------------|------------|
    | RNF001 | O sistema deve ser escalável para atender picos de acesso durante períodos de editais.                  | Escalabilidade | Alta       |
    | RNF002 | O sistema deve integrar-se de forma segura com o SouGov para autenticação.                              | Segurança      | Alta       |
    | RNF003 | O sistema deve ser compatível com diferentes navegadores e dispositivos (ex: mobile).                   | Usabilidade    | Média      |
    | RNF004 | <!-- Adicione aqui o próximo requisito não funcional seguindo o mesmo padrão -->

    <FIM DO EXEMPLO>

    Instruções adicionais:
    - Use IDs curtos e consistentes (ex: RF001, RN001...).
    - Não repita texto desnecessário.
    - Se houver dúvidas ou lacunas, inclua as perguntas ao final, após as tabelas.

    Responda somente com as tabelas (em Markdown) e eventuais dúvidas.
    """)
    chain = prompt | model | parser
    output = chain.invoke(inputs)
    return {**inputs, "requisitos_tabelas": output}



def priorizar_requisitos_func(inputs):
    """
    Passo 3 complementar e 4:
    - Ajuste final das prioridades (se necessário), seguindo referencias de Alta/Média/Baixa.
    - Verifique se há lacunas ou perguntas ao usuário para refinamento.
    """
    print("valor de entrad em priorizar requisistos:",inputs)
    prompt = ChatPromptTemplate.from_template("""
    Você é um especialista em requisitos focado em priorização.

    A seguir estão as tabelas de requisitos já organizadas:
    {requisitos_tabelas}

    1. Valide se as prioridades estão coerentes (Alta, Média, Baixa).
    2. Se necessário, reclassifique ou sugira ajustes de prioridade.
    3. Verifique se há lacunas ainda não esclarecidas. Se houver, liste perguntas específicas.
    4. Prepare estes requisitos para a etapa de refinamento final.
    """)
    chain = prompt | model | parser
    output = chain.invoke(inputs)

    return {**inputs, "requisitos_priorizados": output}


def refinar_requisitos_func(inputs):
    print("valor de entrad em refinar requisistos:",inputs)
    prompt = ChatPromptTemplate.from_template("""
    Você é um refinador de requisitos.

    Abaixo estão os requisitos priorizados:
    {requisitos_priorizados}

    **Objetivo**: Gerar uma versão final dos requisitos em 3 tabelas (RFs, RNs, RNFs), no seguinte formato (exemplo):
    ```
    ## Tabela de Requisitos Funcionais (RFs)
    | ID    | Descrição                                                    | Prioridade | Requisitos Relacionados |
    |-------|--------------------------------------------------------------|------------|-------------------------|
    | RF001 | O sistema deve permitir o cadastro de usuários.             | Alta       | RF002                   |
    ...
    ```
    e assim por diante para RNs e RNFs.

    **Inclua também ao final**:
    - Perguntas ou pontos de dúvida caso ainda haja inconsistências;
    - Observações finais ao usuário.

    **Formato de Resposta**:  
    - Em Markdown;
    - Três tabelas (RF, RN, RNF);
    - Depois das tabelas, inclua um bloco " Dúvidas e validações" se houver.

    Gere apenas isso. Evite repetições.
    """)
    chain = prompt | model | parser
    resultado_final = chain.invoke(inputs)

    # Gera um nome de arquivo com timestamp
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"report_{timestamp}.md"

    # Salva o arquivo com nome único
    with open(filename, "w", encoding="utf-8") as f:
        f.write(resultado_final)

    return {**inputs, "report": resultado_final}

def retorno_final_func(inputs):
    print(" Retornando estado final ao WebUI.")
    return inputs


# Construção do grafo
builder = StateGraph(state_schema=MyState)

# Adiciona nós
builder.add_node("verificar_entrada", RunnableLambda(verificar_entrada_func))
builder.add_node("transcricao_audio", RunnableLambda(transcrever_audio_func))
builder.add_node("gerar_minimundo", RunnableLambda(transcricao_func))
builder.add_node("analisar_documentacao", RunnableLambda(analisar_documentacao_func))
builder.add_node("extrair_requisitos", RunnableLambda(extrair_requisitos_func))
builder.add_node("priorizar_requisitos", RunnableLambda(priorizar_requisitos_func))
builder.add_node("refinar_requisitos", RunnableLambda(refinar_requisitos_func))
builder.add_node("retorno_final", RunnableLambda(retorno_final_func))

# definicão do fluxo
builder.set_entry_point("verificar_entrada")

# Lógica condicional
def rota_entrada(state: dict) -> str:
    return "mensagem_falta_video" if "mensagem" in state else "transcricao_audio"

builder.add_conditional_edges(
    "verificar_entrada",
    rota_entrada,
    {
        "mensagem_falta_video": "retorno_final",  
        "transcricao_audio": "transcricao_audio"
    }
)



#builder.add_edge("verificar_entrada", "transcricao_audio")
builder.add_edge("transcricao_audio", "gerar_minimundo")
builder.add_edge("gerar_minimundo", "analisar_documentacao")
builder.add_edge("analisar_documentacao", "extrair_requisitos")
builder.add_edge("extrair_requisitos", "priorizar_requisitos")
builder.add_edge("priorizar_requisitos", "refinar_requisitos")
builder.add_edge("refinar_requisitos", END)
builder.add_edge("retorno_final", END)

graph = builder.compile()