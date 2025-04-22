# langgraph_streamlit_requirements


# LangGraphExampleAgentPipe – Pipeline de Agente com Interface Streamlit

Este repositório contém um exemplo de pipeline de **levantamento de requisitos** utilizando a biblioteca **LangGraph** e modelos de linguagem. O projeto permite **transcrever entrevistas em vídeo** e, a partir da transcrição, **extrair requisitos de software** (funcionais, regras de negócio e não funcionais) de forma automatizada com IA. 

Esta versão do projeto introduz uma interface web interativa usando **Streamlit** para facilitar o envio de vídeos e a visualização dos resultados, bem como uma arquitetura baseada em **FastAPI** para o backend do agente. A aplicação pode ser executada via **Docker Compose** (com dois serviços: um para a interface Streamlit e outro para o servidor FastAPI) ou localmente em ambiente Python.
(outra versão disponibiliza o OpenWebUI e integração com este, mas tem maiores complexidades na manipulação de vídeos)

## Índice

- [Visão Geral](#visão-geral)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Configuração com Docker](#configuração-com-docker)
- [Serviços](#serviços)
- [Fluxos de Uso](#fluxos-de-uso)
- [Execução Local](#execução-local)

# LangGraphExampleAgentPipe – Pipeline de Agente com Interface Streamlit


Visão Geral

O LangGraphExampleAgentPipe exemplifica como um agente de IA pode auxiliar no levantamento de requisitos de software a partir de entrevistas gravadas. A aplicação realiza, de forma automatizada, as seguintes etapas:

1. Transcrição de Áudio/Vídeo: utiliza a API do Google Cloud (modelo Gemini) para transcrever o áudio do vídeo enviado pelo usuário. A transcrição é salva em texto e servirá de base para as próximas etapas.
2. Geração de "Minimundo": a partir da transcrição, o agente gera um minimundo, que é um resumo contextual ou descrição do domínio do problema, extraindo informações relevantes do diálogo.
3. Análise e Rascunho de Requisitos: o minimundo é então analisado por um especialista virtual em engenharia de requisitos (LLM) que identifica Requisitos Funcionais (RF), Regras de Negócio (RN) e Requisitos Não Funcionais (RNF), produzindo um rascunho preliminar de requisitos.
4. Extração Estruturada de Requisitos: com base nesse rascunho, o agente gera tabelas estruturadas em Markdown separando RFs, RNs e RNFs, incluindo identificadores e prioridades iniciais.
5. Priorização de Requisitos: o agente revê as tabelas geradas, ajusta/valida as prioridades (Alta, Média, Baixa) e aponta possíveis lacunas ou questões em aberto que precisam de clarificação.
6. Refinamento e Relatório Final: por fim, os requisitos são refinados em uma versão final e compilados em um relatório em formato Markdown, incluindo as tabelas finais e uma seção de dúvidas ou pontos para validação com stakeholders, caso existam.

A resposta final do agente (incluindo as tabelas de requisitos geradas) é exibida diretamente na interface Streamlit para o usuário. Além disso, o sistema salva o relatório final em um arquivo Markdown (por exemplo, report_YYYYMMDD_HHMMSS.md) no servidor, o que permite revisar ou compartilhar o resultado posteriormente.

## Grafo de Estados do projeto

![alt text](image.png)

Um exemplo de entrevista (EntrevistaFelipe.mkv e sua transcrição EntrevistaFelipe_transcricao.txt) é incluído em shared/uploads para demonstrar o funcionamento do agente de requisitos. Já o arquivo report_20250421_172831.md é o exemplo de um report de resultado obtido com base na entrevista.

---
## Estrutura de Pastas
A estrutura do repositório foi organizada para separar a interface do usuário (frontend) do agente inteligente (backend), facilitando o desenvolvimento e implantação com Docker. Os principais diretórios e arquivos são os seguintes:


## Estrutura do Projeto

```
├── docker-compose.yml              # Arquivo Docker Compose para orquestrar os serviços
├── streamlit_app/                  # Aplicação Streamlit (frontend)
│   ├── app_streamlit.py            # Código principal da interface Streamlit (upload de vídeo e display do resultado)
│   ├── Dockerfile                  # Dockerfile para construir a imagem do serviço Streamlit
│   └── requirements.txt            # Dependências Python do Streamlit (streamlit, requests, etc.)
├── webhook_server/                 # Servidor FastAPI com a lógica do agente (backend)
│   ├── webhook_server.py           # Aplicação FastAPI definindo endpoints e integração com o pipeline LangGraph
│   ├── graph.py                    # Definição do grafo de estados (pipeline de requisitos) usando LangGraph
│   ├── langgraph.json              # Configuração do LangGraph (define grafo padrão e dependências)
│   ├── Dockerfile                  # Dockerfile para construir a imagem do serviço FastAPI
│   ├── requirements.txt            # Dependências Python do backend (FastAPI, LangGraph, Google API, etc.)
│   ├── .env.example                # Exemplo de arquivo de configuração de variáveis de ambiente (API keys, etc.)
│   └── .env                        # **(Ignorado no git)** Arquivo .env real com as chaves/variáveis de ambiente necessárias (deve ser criado pelo usuário a partir do exemplo)
├── shared/
│   └── uploads/                    # Diretório compartilhado (volume) para uploads de vídeo e arquivos gerados
│       ├── EntrevistaFelipe.mkv            # **Exemplo:** vídeo de entrevista para teste do pipeline
│       └── EntrevistaFelipe_transcricao.txt # **Exemplo:** transcrição pré-gerada do vídeo de exemplo
└── report_YYYYMMDD_HHMMSS.md       # Relatórios gerados pelo pipeline (formato Markdown, um novo arquivo é criado a cada execução bem-sucedida)
```
...
---
## Observações sobre a estrutura:
O arquivo docker-compose.yml na raiz define dois serviços: streamlit_app e webhook_server, correspondentes aos diretórios acima. Ele também monta o diretório shared/uploads como volume em ambos os containers, permitindo que o vídeo enviado via Streamlit seja acessível pelo backend.

* O diretório streamlit_app contém a interface web. O arquivo app_streamlit.py lida com o upload de arquivos (formatos aceitos: .mp3, .mp4, .mkv), envia o vídeo para análise e exibe o resultado retornado pelo agente. Ele usa a biblioteca Streamlit para criar uma UI simples (título, input de arquivo, botão de enviar e área de resultado).

* O diretório webhook_server contém a aplicação FastAPI. O arquivo webhook_server.py define um endpoint POST (/webhook/webui_pipe_webhook) que recebe requisições do front (Streamlit) com o caminho do arquivo de vídeo, então prepara o estado inicial e executa o grafo definido em graph.py. O graph.py utiliza a biblioteca LangGraph para construir a cadeia de funções/etapas descritas na Visão Geral (transcrição, análise, etc.), interagindo com modelos de linguagem (Google Gemini) para gerar cada parte da saída.

* O arquivo graph.py é onde o pipeline de IA foi desenvolvido. Ele define a estrutura de dados do estado (MyState), implementa funções Python para cada etapa (por exemplo, transcrever_audio_func, analisar_documentacao_func, extrair_requisitos_func, etc.) e monta o grafo de execução usando StateGraph. Cada nó do grafo é associado a uma função e, ao final, o grafo produz um estado final com todos os campos preenchidos (inclusive o relatório final em state["report"]).

* Em webhook_server/.env.example estão listadas as variáveis de ambiente necessárias. Em especial, é preciso fornecer a chave da API do Google Generative AI (Gemini) em GEMINI_API_KEY. Há também campos para TAVILY_API_KEY (serviço de busca para LLMs, não obrigatório nesta pipeline) e configurações do LangSmith (opcionais, para monitoramento/tracing das execuções do agente).
O diretório shared/uploads é montado como volume no Docker e serve para troca de arquivos entre os serviços. Quando um usuário faz upload de um vídeo pela interface, o arquivo é salvo neste diretório (no container Streamlit) e disponibilizado para o container do servidor. O pipeline também salva arquivos auxiliares aqui, como a transcrição gerada (*_transcricao.txt). Este diretório pode ser usado para adicionar manualmente arquivos de teste quando necessário.
Arquivos report_*.md: sempre que o pipeline conclui com sucesso a extração de requisitos, um relatório Markdown é salvo (no container do backend, pasta de trabalho /app). O nome inclui data e hora para evitar conflitos. O relatório contém as tabelas de requisitos finalizadas e eventuais observações. Nota: Como esses arquivos não estão em um volume compartilhado, se a aplicação estiver em container, eles ficam dentro do container do servidor (podendo ser acessados via logs ou copiando do container). Em execução local, eles serão gerados no diretório local corrente.


## Executando o projeto

1. **Clone o repositório e acesse a pasta:**

```bash
git https://github.com/profmoisesomena/langgraph_streamlit_requirements.git
cd langgraph_streamlit_requirements
```

2. **Configure variáveis de ambiente:**

```bash
cp webhook_server/.env.example webhook_server/.env
```

Edite o `.env` e informe:
- `GEMINI_API_KEY` (obrigatório)
- `TAVILY_API_KEY` (opcional)
- `LANGSMITH_API_KEY`, `LANGSMITH_PROJECT`, `LANGSMITH_TRACING` (opcional)

## Execução direta

Acesse a pasta webhook_server e execute a instrução python3 webhook_server.py
```bash
cd webhook_server
python3 webhook_server.py
```
Abra um novo terminal e acesse a pasta pasta streamlit_app e execute a instrução streamlit run app_streamlit.py
```bash
cd streamlit_app
streamlit run app_streamlit.py
```

Agora acesse: http://localhost:8501  e você verá o Stremlit executando no seu ambiente local.

O backend FastAPI funcionará em http://localhost:8000

## Configuração Docker

3. **Suba os containers com Docker Compose:**

```bash
docker-compose up --build
```

- O Streamlit será acessado em [http://localhost:8501](http://localhost:8501)
- O backend FastAPI funciona internamente (porta 8000), sem exposição direta

## Uso da Interface Web

- Acesse a página e envie um vídeo `.mp4`, `.mkv` ou `.mp3`
- Clique em "Enviar para análise"
- O backend processará o vídeo com
  - Transcrição via Gemini
  - Geração de minimundo
  - Extração e categorização de requisitos
- O resultado será exibido na tela e salvo como `report_YYYYMMDD_HHMMSS.md`

## Execução Local (sem Docker)

### Backend (FastAPI):

```bash
cd webhook_server
python3.12 -m venv venv12
source venv12/bin/activate  # ou venv\Scripts\activate no Windows
pip install -r requirements.txt
uvicorn webhook_server:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend (Streamlit):

```bash
cd streamlit_app
pip install -r requirements.txt
# Ajuste o app_streamlit.py para usar "http://localhost:8000 ou via docker"
streamlit run app_streamlit.py --server.port=8501
```

## Fluxo via API (Alternativo)

```bash
curl -X POST http://localhost:8000/webhook/webui_pipe_webhook \
     -H "Content-Type: application/json" \
     -d '{"chatInput": "shared/uploads/nome_do_arquivo.mp4"}'
```

A resposta virá em formato Markdown com os requisitos extraídos.

---

Também é possível passar o arquivo via Open WebUI, mas é necessário inserir o aquivo na pasta shared/uploads/ e indicar via webui o caminho do arquivo.

![alt text](image-1.png)

...
 Sinta-se à vontade para contribuir com melhorias, relatar *issues* ou utilizar este projeto! Boa exploração 🙂.
