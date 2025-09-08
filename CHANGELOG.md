## v0.8.1 (2025-09-08)

### Fix

- **streamlit**: readição do protótipo de interface nas opções

## v0.8.0 (2025-09-01)

### Feat

- **agent_minimundo/agent_identificacao_classe**: opcao de envio de um documento anterior
- opção de adicionar versões anteriores de requisitos e casos de uso

### Fix

- **agent_identuc**: agent_identuc também recebe os arquivos opcionais como entrada
- **state.py**: padronizacao de nomes dos documentos anteriores passados para a ia
- **app_streamlit_docker.py**: correcoes menores no frontend

### Refactor

- **.github**: branch develop compartinha do mesmo historico de commits da branch main

## v0.7.0 (2025-08-26)

### Feat

- **agent_interface_description**: adição de relação de telas com casos de uso

### Fix

- **webhook_server/streamlit**: correção da geração dos artefatos
- **streamlit/webhook_server**: adição da geração de protótipo de interface na opção de gerar tudo

## v0.6.0 (2025-08-13)

### Feat

- **interfacePrototype**: geração de descrição de uso dos protótipos de interface

## v0.5.1 (2025-08-12)

### Refactor

- **webhook**: geração de um único html com todas as páginas

## v0.5.0 (2025-08-07)

### Feat

- **streamlit/webhook**: adição da versão inicial de protótipo de interface

## v0.4.0 (2025-07-28)

### Refactor

- **changelog.md**: incremento de versão para 0.4.0

## v0.3.0 (2025-07-28)

### Feat

- **streamlit/webhook_server**: adiciona opções de gerar artefatos com revisão mútua ou gerar tudo
- **webhook_server/streamlit_app**: modularizacao dos agentes
- **streamlit/webhook**: adicao da opcao de enviar um arquivo com informacoes adicionais e modularizacao dos agentes
- **webhook_server/streamlit**: adição de verificação entre UCs e classes
- **streamlit_app/webhook_server**: adição de validação entre UCs e classes
- **streamlit/webhook**: ajustes do frontend
- markdowns nao sao criados no repositorio
- **streamlit_app**: adicao de um botao de download no streamlit
- ajuste no grafo e no estado para incluir os nos de diagrama de classe
- criacao dos agentes de diagrama de classes
- criacao dos agentes para o diagrama de classe
- criacao dos arquivos dos agentes para o diagrama de classes
- **agents/use_cases**: geração de diagramas de caso de uso
- **agents**: início da criação de novos agentes para a geração de casos de uso
- **pyproject.toml-/-webhook_server/agents**: adicao do pyproject.toml, versao impressa nos artefatos gerados e troca de versao via commitizen

### Fix

- **input_check.py**: correcoes gerais para o funcionamento dos agentes de revisao
- **app_streamlit**: adicao do footer no final da impressao no streamlit
- **webhook_server**: adição de novas instruções nos prompts
- **agent/revision**: correcao nos agentes de revisao
- **webhook_server**: ajustes apos a atualizacao da branch
- **app_streamlit_docker.py**: se o .toml nao for encontrado, usar os valores hardcoded
- **app_streamlit_docker.py**: uso com docker chama o nome do webhook via .env
- **app_streamlit.py/webhook_server.py**: ip usado nas urls vem de um .env
- **streamlit_app**: ajustes para possibilitar o download do minimundo como um arquivo markdown
- **agents/classDiagram**: restricoes de integridade sao criadas no agente de revisao do diagrama de classe
- **agent_identificacao_classe.py**: alteracao do prompt para evitar atributos calculados e para evitar classes sem relacoes ou sem atributos
- **agent_refinamento_classe**: ajuste no footer da versao
- **webhook_server/agents**: ajusting the footer's version text
- texto indicando geracao eh adicionado no final dos artefatos criados
- **agent_refinamento_classe**: ajuste nas restricoes de integridade geradas
- **agent_refinamento_classe.py**: adicao de listagem de restricao de integridade
- definicao de classe, atributo e relacao para os agentes, alteracao no prompt para a parte de questoes
- ajustes nos agentes de geracao de classes para incluir dicinario de dados, secao de questionamentos e regras de cardinalidade
- ajuste na exibicao do streamlit
- ajustes nas entradas e saidas dos agentes de diagrama de classes
- **webhook_server/agents**: ajuste na formatacao da saida
- **webhook_server**: correção da geração de diagrama de casos de uso
- **agents**: adição da tabela de UCs nas personas
- ajuste no modelo usado

### Refactor

- **agent_identuc.py**: refinamento do prompt da persona do identuc

## v0.3.0 (2025-06-30)

### Feat

- ajuste no grafo e no estado para incluir os nos de diagrama de classe
- criacao dos agentes de diagrama de classes
- criacao dos agentes para o diagrama de classe
- criacao dos arquivos dos agentes para o diagrama de classes

### Fix

- **agent_refinamento_classe**: ajuste no footer da versao
- **webhook_server/agents**: ajusting the footer's version text
- texto indicando geracao eh adicionado no final dos artefatos criados
- **agent_refinamento_classe**: ajuste nas restricoes de integridade geradas
- **agent_refinamento_classe.py**: adicao de listagem de restricao de integridade
- definicao de classe, atributo e relacao para os agentes, alteracao no prompt para a parte de questoes
- ajustes nos agentes de geracao de classes para incluir dicinario de dados, secao de questionamentos e regras de cardinalidade
- ajuste na exibicao do streamlit
- ajustes nas entradas e saidas dos agentes de diagrama de classes

## v0.2.0 (2025-06-27)

### Feat

- **pyproject.toml-/-webhook_server/agents**: adicao do pyproject.toml, versao impressa nos artefatos gerados e troca de versao via commitizen

### Fix

- texto indicando geracao eh adicionado no final dos artefatos criados