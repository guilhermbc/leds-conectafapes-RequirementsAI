import { FileText, Database, Users, BookOpen } from "lucide-react"
import type React from "react"

export interface ArtifactUpdateHistory {
  id: string
  date: string
  version: string
  description: string
  author: string
  changeType: "created" | "updated" | "reviewed" | "approved"
}

export interface ProjectArtifact {
  type: "minimundo" | "diagram" | "use-cases" | "requirements"
  title: string
  preview: string
  lastModified: string
  content: string | any // Content can be string (markdown) or object (diagram)
  icon: React.ComponentType<{ className?: string }>
  updateHistory: ArtifactUpdateHistory[]
}

export interface ProjectVersion {
  id: string
  version: string
  date: string
  status: "draft" | "review" | "approved"
  artifacts: ProjectArtifact[] // Moved artifacts here
}

export interface MeetingTranscription {
  id: string
  date: string // YYYY-MM-DD
  title: string // e.g., "Reunião de Kick-off", "Reunião de Refinamento"
  content: string // The raw text/audio transcription
  generatedArtifacts?: {
    // Optional, store artifacts generated from this transcription
    minimundo?: string
    diagram?: any
    useCases?: string
    requirements?: string
  }
}

export interface ProjectModule {
  id: string
  name: string
  description: string
  createdAt: string
  lastModified: string
  versions: ProjectVersion[]
  transcriptions: MeetingTranscription[]
  tags: string[]
}

export interface HistoryProject {
  id: string
  name: string
  description: string
  createdAt: string
  lastModified: string
  modules: ProjectModule[] // Changed from versions to modules
  tags: string[]
}

export const projects: HistoryProject[] = [
  {
    id: "1",
    name: "Sistema de E-commerce",
    description: "Plataforma completa de vendas online",
    createdAt: "2024-01-15",
    lastModified: "2024-01-20",
    modules: [
      {
        id: "m1",
        name: "Versão 1.0",
        description: "Versão inicial do sistema",
        createdAt: "2024-01-15",
        lastModified: "2024-01-15",
        versions: [
          {
            id: "v1",
            version: "1.0",
            date: "2024-01-15",
            status: "approved",
            artifacts: [
              {
                type: "minimundo",
                title: "Minimundo Gerado",
                preview: "Sistema para vendas online com carrinho, pagamento...",
                lastModified: "2024-01-15",
                content: `O sistema proposto é uma plataforma de gerenciamento de projetos que permite aos usuários criar, organizar e acompanhar o progresso de suas tarefas e projetos. 

O sistema deve permitir que usuários se cadastrem e façam login de forma segura. Cada usuário pode criar múltiplos projetos, onde cada projeto pode conter várias tarefas organizadas em diferentes status (pendente, em andamento, concluído).

As tarefas devem ter informações como título, descrição, data de vencimento, prioridade e responsável. O sistema deve enviar notificações automáticas para lembrar os usuários sobre prazos próximos.

Além disso, o sistema deve gerar relatórios de produtividade e permitir a colaboração entre membros da equipe através de comentários e anexos nas tarefas.`,
                icon: BookOpen,
                updateHistory: [
                  {
                    id: "hist1",
                    date: "2024-01-15",
                    version: "1.0",
                    description: "Criação inicial do minimundo baseado na reunião de kick-off",
                    author: "Sistema IA",
                    changeType: "created",
                  },
                ],
              },
              {
                type: "diagram",
                title: "Diagrama de Classes",
                preview: "User, Product, Order, Payment (4 classes)",
                lastModified: "2024-01-15",
                content: {
                  classes: [
                    { name: "User", attributes: ["id: String"], methods: ["login()"] },
                    { name: "Product", attributes: ["id: String"], methods: ["addProduct()"] },
                    { name: "Order", attributes: ["id: String"], methods: ["createOrder()"] },
                    { name: "Payment", attributes: ["id: String"], methods: ["processPayment()"] },
                  ],
                },
                icon: Database,
                updateHistory: [
                  {
                    id: "hist2",
                    date: "2024-01-15",
                    version: "1.0",
                    description: "Criação do diagrama inicial com 4 classes principais",
                    author: "Sistema IA",
                    changeType: "created",
                  },
                ],
              },
              {
                type: "use-cases",
                title: "Casos de Uso",
                preview: "Login, Cadastro, Comprar, Pagar (8 casos)",
                lastModified: "2024-01-15",
                content: `## Casos de Uso do Sistema de E-commerce

### CU001: Realizar Login
**Ator Principal:** Cliente
**Objetivo:** Permitir que o cliente acesse sua conta no sistema.
**Pré-condições:** O cliente deve ter uma conta cadastrada.
**Fluxo Principal:**
1. O cliente acessa a página de login.
2. O sistema exibe o formulário de login.
3. O cliente insere seu email e senha.
4. O sistema valida as credenciais.
5. O sistema redireciona o cliente para o painel de controle.
**Pós-condições:** Cliente logado no sistema.

### CU002: Cadastrar Novo Cliente
**Ator Principal:** Cliente
**Objetivo:** Permitir que um novo cliente crie uma conta no sistema.
**Pré-condições:** Nenhuma.
**Fluxo Principal:**
1. O cliente acessa a página de cadastro.
2. O sistema exibe o formulário de cadastro.
3. O cliente preenche os dados obrigatórios (nome, email, senha).
4. O sistema valida os dados e cria a nova conta.
5. O sistema envia um email de confirmação.
**Pós-condições:** Nova conta de cliente criada e ativa.

### CU003: Comprar Produto
**Ator Principal:** Cliente
**Objetivo:** Permitir que o cliente selecione e compre produtos.
**Pré-condições:** Cliente logado.
**Fluxo Principal:**
1. O cliente navega pelos produtos.
2. O cliente adiciona produtos ao carrinho.
3. O cliente finaliza a compra.
4. O sistema exibe as opções de pagamento.
5. O cliente seleciona o método de pagamento e confirma.
6. O sistema processa o pagamento e gera o pedido.
**Pós-condições:** Pedido criado e pagamento processado.
`,
                icon: Users,
                updateHistory: [
                  {
                    id: "hist3",
                    date: "2024-01-15",
                    version: "1.0",
                    description: "Definição dos casos de uso principais do sistema",
                    author: "Sistema IA",
                    changeType: "created",
                  },
                ],
              },
              {
                type: "requirements",
                title: "Documento de Requisitos",
                preview: "45 requisitos funcionais, 12 não funcionais",
                lastModified: "2024-01-15",
                content: `
# Documento de Requisitos - Sistema de E-commerce

## 1. Introdução
Este documento descreve os requisitos funcionais e não funcionais para o Sistema de E-commerce, uma plataforma completa de vendas online.

## 2. Requisitos Funcionais (RFs)

| ID    | Descrição                                          | Prioridade | Requisitos Relacionados |
|-------|----------------------------------------------------|------------|-------------------------|
| RF001 | O sistema deve permitir o cadastro de novos usuários. | Alta       | -                       |
| RF002 | O sistema deve permitir o login e logout de usuários. | Alta       | -                       |
| RF003 | O sistema deve exibir uma lista de produtos disponíveis. | Média      | -                       |
| RF004 | O sistema deve permitir adicionar produtos ao carrinho. | Alta       | -                       |
| RF005 | O sistema deve permitir remover produtos do carrinho. | Média      | -                       |
| RF006 | O sistema deve permitir finalizar a compra.        | Alta       | RF007, RF008            |
| RF007 | O sistema deve integrar com um gateway de pagamento. | Alta       | -                       |
| RF008 | O sistema deve gerar um histórico de pedidos para o usuário. | Média      | -                       |

## 3. Requisitos Não Funcionais (RNFs)

| ID    | Descrição                                          | Categoria      | Prioridade |
|-------|----------------------------------------------------|----------------|------------|
| RNF001 | O sistema deve ser responsivo em dispositivos móveis. | Usabilidade    | Alta       |
| RNF002 | O sistema deve garantir a segurança dos dados do usuário. | Segurança      | Alta       |
| RNF003 | O sistema deve ter um tempo de resposta inferior a 2 segundos. | Performance    | Alta       |
| RNF004 | O sistema deve estar disponível 99.9% do tempo.    | Disponibilidade | Alta       |
| RNF005 | O sistema deve suportar 1000 usuários simultâneos. | Escalabilidade | Média      |

## 4. Regras de Negócio (BRs)

| ID    | Descrição                                          | Prioridade | Requisitos Relacionados |
|-------|----------------------------------------------------|------------|-------------------------|
| BR001 | O estoque de um produto deve ser atualizado após cada compra. | Alta       | RF006                   |
| BR002 | O valor mínimo de um pedido é R$ 10,00.            | Média      | RF006                   |

## 5. Dicionário de Dados

### FerramentaTransacao
| ATRIBUTO | DESCRIÇÃO |
|---|---|
| nome | O nome da ferramenta de transcrição (por exemplo, "ferramenta de transcrição do YouTube com Gemini do Google"). |
| descricao | Uma descrição geral do propósito da ferramenta de transcrição (por exemplo, "projetada para converter conteúdo de áudio em texto"). |
| versao | A versão específica da ferramenta de transcrição que está sendo testada. |
| formatosAudioSuportados | Uma lista de formatos de áudio que a ferramenta de transcrição é capaz de processar (por exemplo, "MP3", "WAV", "FLAC"). |
| idiomasSuportados | Uma lista de idiomas que a ferramenta de transcrição pode transcrever (por exemplo, "pt-BR", "en-US"). |
| duracaoMaximaAudioMinutos | A duração máxima, em minutos, de um arquivo de áudio que a ferramenta de transcrição pode processar. |
| formatosSaida | Uma lista de formatos de texto nos quais a ferramenta de transcrição pode gerar a saída (por exemplo, "TXT", "SRT", "VTT"). |

### ArquivoAudio
| ATRIBUTO | DESCRIÇÃO |
|---|---|
| nomeArquivo | Um identificador único ou nome para o arquivo de áudio. |
| categoria | A categorização ou propósito do arquivo de áudio dentro do contexto de teste (por exemplo, "teste", "treinamento"). |
| descricaoConteudo | Uma descrição geral do conteúdo de áudio dentro do arquivo. |
| temTomAgudo | Um sinalizador booleano indicando se um tom agudo foi detectado no arquivo de áudio, relevante para testes de robustez. |
| formato | O formato de arquivo específico do áudio (por exemplo, "MP3", "WAV"). |
| duracaoEmSegundos | A duração do áudio em segundos. |

### Transcricao
| ATRIBUTO | DESCRIÇÃO |
|---|---|
| textoTranscrito | O conteúdo de texto real gerado pela ferramenta de transcrição a partir do arquivo de áudio. |
| pontuacaoPrecisao | Uma pontuação numérica (por exemplo, porcentagem ou WER) indicando quão precisa é a transcrição, com base em critérios predefinidos. |
| confiancaHabilidade | Um valor numérico (por exemplo, de 0 a 1) que representa a confiança da ferramenta na qualidade da transcrição. |
| formatoSaida | O formato de saída da transcrição (por exemplo, "TXT", "SRT"). |
| idioma | O idioma detectado ou especificado para a transcrição. |
| temErroLocutor | Um sinalizador booleano indicando se um erro relacionado ao locutor foi detectado na transcrição. |
| temErroTempo | Um sinalizador booleano indicando se um erro relacionado ao tempo foi detectado na transcrição. |
`,
                icon: FileText,
                updateHistory: [
                  {
                    id: "hist4",
                    date: "2024-01-15",
                    version: "1.0",
                    description: "Documento inicial de requisitos com 45 RFs e 12 RNFs",
                    author: "Sistema IA",
                    changeType: "created",
                  },
                ],
              },
            ],
          },
        ],
        transcriptions: [
          {
            id: "transc1_v1",
            date: "2024-01-14",
            title: "Reunião de Kick-off E-commerce",
            content: `Nesta reunião inicial, discutimos a necessidade de um sistema de e-commerce robusto. Os principais pontos levantados foram: cadastro de usuários, listagem de produtos, carrinho de compras e um sistema de pagamento seguro. A ideia é que o usuário possa navegar, adicionar itens ao carrinho e finalizar a compra de forma intuitiva.`,
            generatedArtifacts: {
              minimundo: `O sistema proposto é uma plataforma de e-commerce que permite aos usuários criar contas, navegar por produtos, adicionar itens ao carrinho e realizar pagamentos.`,
              diagram: {
                classes: [
                  { name: "User", attributes: ["id", "email", "password"], methods: ["login()"] },
                  { name: "Product", attributes: ["id", "name", "price"], methods: ["viewDetails()"] },
                  { name: "Cart", attributes: ["id", "userId"], methods: ["addItem()", "removeItem()"] },
                  { name: "Order", attributes: ["id", "userId", "total"], methods: ["createOrder()"] },
                ],
              },
              useCases: `## Casos de Uso - Reunião de Kick-off
### CU001: Cadastrar Usuário
### CU002: Navegar Produtos
### CU003: Adicionar ao Carrinho
### CU004: Realizar Pagamento`,
              requirements: `# Requisitos - Reunião de Kick-off
## RFs
- RF001: O sistema deve permitir cadastro de usuários.
- RF002: O sistema deve exibir produtos.
- RF003: O sistema deve ter carrinho de compras.
- RF004: O sistema deve processar pagamentos.`,
            },
          },
          {
            id: "transc2_v1",
            date: "2024-01-17",
            title: "Reunião de Refinamento - Promoções",
            content: `Na reunião de refinamento, decidimos incluir um módulo de promoções e cupons de desconto. O sistema deve permitir a criação de cupons com validade e percentual de desconto. O cliente poderá aplicar um cupom no carrinho antes de finalizar a compra.`,
            generatedArtifacts: {
              minimundo: `O sistema de e-commerce será aprimorado com funcionalidades de promoções e cupons de desconto.`,
              diagram: {
                classes: [
                  { name: "User", attributes: ["id", "email", "password"], methods: ["login()"] },
                  { name: "Product", attributes: ["id", "name", "price"], methods: ["viewDetails()"] },
                  { name: "Cart", attributes: ["id", "userId"], methods: ["addItem()", "removeItem()"] },
                  { name: "Order", attributes: ["id", "userId", "total"], methods: ["createOrder()"] },
                  { name: "Promotion", attributes: ["id", "code", "discount"], methods: ["apply()"] },
                ],
              },
              useCases: `## Casos de Uso - Refinamento Promoções
### CU005: Aplicar Cupom de Desconto
### CU006: Criar Promoção (Admin)`,
              requirements: `# Requisitos - Refinamento Promoções
## RFs
- RF005: O sistema deve permitir aplicação de cupons.
- RF006: O sistema deve permitir criação de promoções por admin.`,
            },
          },
        ],
        tags: ["e-commerce", "web", "pagamento"],
      },
      {
        id: "m2",
        name: "Versão 1.1",
        description: "Versão com promoções e cupons",
        createdAt: "2024-01-18",
        lastModified: "2024-01-18",
        versions: [
          {
            id: "v2",
            version: "1.1",
            date: "2024-01-18",
            status: "review",
            artifacts: [
              {
                type: "minimundo",
                title: "Narrativa de Domínio (v1.1)",
                preview: "Atualização: Sistema para vendas online com carrinho, pagamento e promoções...",
                lastModified: "2024-01-18",
                content: `O sistema proposto é uma plataforma de gerenciamento de projetos que permite aos usuários criar, organizar e acompanhar o progresso de suas tarefas e projetos. 
            
            Nesta versão 1.1, adicionamos funcionalidades de promoções e cupons.
            
            O sistema deve permitir que usuários se cadastrem e façam login de forma segura. Cada usuário pode criar múltiplos projetos, onde cada projeto pode conter várias tarefas organizadas em diferentes status (pendente, em andamento, concluído).
            
            As tarefas devem ter informações como título, descrição, data de vencimento, prioridade e responsável. O sistema deve enviar notificações automáticas para lembrar os usuários sobre prazos próximos.
            
            Além disso, o sistema deve gerar relatórios de produtividade e permitir a colaboração entre membros da equipe através de comentários e anexos nas tarefas.`,
                icon: BookOpen,
                updateHistory: [
                  {
                    id: "hist5",
                    date: "2024-01-18",
                    version: "1.1",
                    description: "Adição de funcionalidades de promoções e cupons",
                    author: "Sistema IA",
                    changeType: "updated",
                  },
                ],
              },
              {
                type: "diagram",
                title: "Diagrama de Classes (v1.1)",
                preview: "User, Product, Order, Payment, Promotion (5 classes)",
                lastModified: "2024-01-18",
                content: {
                  classes: [
                    { name: "User", attributes: ["id: String"], methods: ["login()"] },
                    { name: "Product", attributes: ["id: String"], methods: ["addProduct()"] },
                    { name: "Order", attributes: ["id: String"], methods: ["createOrder()"] },
                    { name: "Payment", attributes: ["id: String"], methods: ["processPayment()"] },
                    {
                      name: "Promotion",
                      attributes: ["id: String", "code: String", "discount: Float"],
                      methods: ["applyPromotion()"],
                    },
                  ],
                },
                icon: Database,
                updateHistory: [
                  {
                    id: "hist6",
                    date: "2024-01-18",
                    version: "1.1",
                    description: "Adição da classe Promotion",
                    author: "Sistema IA",
                    changeType: "updated",
                  },
                ],
              },
              {
                type: "use-cases",
                title: "Casos de Uso (v1.1)",
                preview: "Login, Cadastro, Comprar, Pagar, Aplicar Cupom (9 casos)",
                lastModified: "2024-01-18",
                content: `## Casos de Uso do Sistema de E-commerce (v1.1)
            
            ### CU001: Realizar Login
            **Ator Principal:** Cliente
            **Objetivo:** Permitir que o cliente acesse sua conta no sistema.
            **Pré-condições:** O cliente deve ter uma conta cadastrada.
            **Fluxo Principal:**
            1. O cliente acessa a página de login.
            2. O sistema exibe o formulário de login.
            3. O cliente insere seu email e senha.
            4. O sistema valida as credenciais.
            5. O sistema redireciona o cliente para o painel de control.
            **Pós-condições:** Cliente logado no sistema.
            
            ### CU004: Aplicar Cupom de Desconto
            **Ator Principal:** Cliente
            **Objetivo:** Permitir que o cliente aplique um cupom de desconto ao carrinho.
            **Pré-condições:** Cliente logado, produtos no carrinho.
            **Fluxo Principal:**
            1. O cliente acessa o carrinho de compras.
            2. O sistema exibe o campo para cupom.
            3. O cliente insere o código do cupom.
            4. O sistema valida o cupom e aplica o desconto.
            5. O sistema atualiza o valor total do carrinho.
            **Pós-condições:** Desconto aplicado ao carrinho.`,
                icon: Users,
                updateHistory: [
                  {
                    id: "hist7",
                    date: "2024-01-18",
                    version: "1.1",
                    description: "Adição do caso de uso Aplicar Cupom de Desconto",
                    author: "Sistema IA",
                    changeType: "updated",
                  },
                ],
              },
              {
                type: "requirements",
                title: "Documento de Requisitos (v1.1)",
                preview: "48 requisitos funcionais, 12 não funcionais",
                lastModified: "2024-01-18",
                content: `
# Documento de Requisitos - Sistema de E-commerce (v1.1)

## 1. Introdução
Este documento descreve os requisitos funcionais e não funcionais para o Sistema de E-commerce, uma plataforma completa de vendas online, com a adição de funcionalidades de promoção.

## 2. Requisitos Funcionais (RFs)

| ID    | Descrição                                          | Prioridade | Requisitos Relacionados |
|-------|----------------------------------------------------|------------|-------------------------|
| RF001 | O sistema deve permitir o cadastro de novos usuários. | Alta       | -                       |
| RF002 | O sistema deve permitir o login e logout de usuários. | Alta       | -                       |
| RF003 | O sistema deve exibir uma lista de produtos disponíveis. | Média      | -                       |
| RF004 | O sistema deve permitir adicionar produtos ao carrinho. | Alta       | -                       |
| RF005 | O sistema deve permitir remover produtos do carrinho. | Média      | -                       |
| RF006 | O sistema deve permitir finalizar a compra.        | Alta       | RF007, RF008            |
| RF007 | O sistema deve integrar com um gateway de pagamento. | Alta       | -                       |
| RF008 | O sistema deve gerar um histórico de pedidos para o usuário. | Média      | -                       |
| RF009 | O sistema deve permitir a aplicação de cupons de desconto. | Alta       | -                       |

## 3. Requisitos Não Funcionais (RNFs)

| ID    | Descrição                                          | Categoria      | Prioridade |
|-------|----------------------------------------------------|----------------|------------|
| RNF001 | O sistema deve ser responsivo em dispositivos móveis. | Usabilidade    | Alta       |
| RNF002 | O sistema deve garantir a segurança dos dados do usuário. | Segurança      | Alta       |
| RNF003 | O sistema deve ter um tempo de resposta inferior a 2 segundos. | Performance    | Alta       |
| RNF004 | O sistema deve estar disponível 99.9% do tempo.    | Disponibilidade | Alta       |
| RNF005 | O sistema deve suportar 1000 usuários simultâneos. | Escalabilidade | Média      |

## 4. Regras de Negócio (BRs)

| ID    | Descrição                                          | Prioridade | Requisitos Relacionados |
|-------|----------------------------------------------------|------------|-------------------------|
| BR001 | O estoque de um produto deve ser atualizado após cada compra. | Alta       | RF006                   |
| BR002 | O valor mínimo de um pedido é R$ 10,00.            | Média      | RF006                   |
| BR003 | Cupons de desconto só podem ser aplicados uma vez por pedido. | Alta       | RF009                   |

## 5. Dicionário de Dados

### FerramentaTransacao
| ATRIBUTO | DESCRIÇÃO |
|---|---|
| nome | O nome da ferramenta de transcrição (por exemplo, "ferramenta de transcrição do YouTube com Gemini do Google"). |
| descricao | Uma descrição geral do propósito da ferramenta de transcrição (por exemplo, "projetada para converter conteúdo de áudio em texto"). |
| versao | A versão específica da ferramenta de transcrição que está sendo testada. |
| formatosAudioSuportados | Uma lista de formatos de áudio que a ferramenta de transcrição é capaz de processar (por exemplo, "MP3", "WAV", "FLAC"). |
| idiomasSuportados | Uma lista de idiomas que a ferramenta de transcrição pode transcrever (por exemplo, "pt-BR", "en-US"). |
| duracaoMaximaAudioMinutos | A duração máxima, em minutos, de um arquivo de áudio que a ferramenta de transcrição pode processar. |
| formatosSaida | Uma lista de formatos de texto nos quais a ferramenta de transcrição pode gerar a saída (por exemplo, "TXT", "SRT", "VTT"). |

### ArquivoAudio
| ATRIBUTO | DESCRIÇÃO |
|---|---|
| nomeArquivo | Um identificador único ou nome para o arquivo de áudio. |
| categoria | A categorização ou propósito do arquivo de áudio dentro do contexto de teste (por exemplo, "teste", "treinamento"). |
| descricaoConteudo | Uma descrição geral do conteúdo de áudio dentro do arquivo. |
| temTomAgudo | Um sinalizador booleano indicando se um tom agudo foi detectado no arquivo de áudio, relevante para testes de robustez. |
| formato | O formato de arquivo específico do áudio (por exemplo, "MP3", "WAV"). |
| duracaoEmSegundos | A duração do áudio em segundos. |

### Transcricao
| ATRIBUTO | DESCRIÇÃO |
|---|---|
| textoTranscrito | O conteúdo de texto real gerado pela ferramenta de transcrição a partir do arquivo de áudio. |
| pontuacaoPrecisao | Uma pontuação numérica (por exemplo, porcentagem ou WER) indicando quão precisa é a transcrição, com base em critérios predefinidos. |
| confiancaHabilidade | Um valor numérico (por exemplo, de 0 a 1) que representa a confiança da ferramenta na qualidade da transcrição. |
| formatoSaida | O formato de saída da transcrição (por exemplo, "TXT", "SRT"). |
| idioma | O idioma detectado ou especificado para a transcrição. |
| temErroLocutor | Um sinalizador booleano indicando se um erro relacionado ao locutor foi detectado na transcrição. |
| temErroTempo | Um sinalizador booleano indicando se um erro relacionado ao tempo foi detectado na transcrição. |
`,
                icon: FileText,
                updateHistory: [
                  {
                    id: "hist8",
                    date: "2024-01-18",
                    version: "1.1",
                    description: "Adição de requisitos relacionados a promoções",
                    author: "Sistema IA",
                    changeType: "updated",
                  },
                ],
              },
            ],
          },
        ],
        transcriptions: [],
        tags: ["e-commerce", "web", "pagamento"],
      },
      {
        id: "m3",
        name: "Versão 1.2",
        description: "Versão com sistema de reviews",
        createdAt: "2024-01-20",
        lastModified: "2024-01-20",
        versions: [
          {
            id: "v3",
            version: "1.2",
            date: "2024-01-20",
            status: "draft",
            artifacts: [
              {
                type: "minimundo",
                title: "Narrativa de Domínio (v1.2)",
                preview:
                  "Atualização: Sistema para vendas online com carrinho, pagamento, promoções e sistema de reviews de produtos...",
                lastModified: "2024-01-20",
                content: `O sistema proposto é uma plataforma de gerenciamento de projetos que permite aos usuários criar, organizar e acompanhar o progresso de suas tarefas e projetos. 
            
            Nesta versão 1.2, adicionamos funcionalidades de promoções, cupons e sistema de reviews de produtos.
            
            O sistema deve permitir que usuários se cadastrem e façam login de forma segura. Cada usuário pode criar múltiplos projetos, onde cada projeto pode conter várias tarefas organizadas em diferentes status (pendente, em andamento, concluído).
            
            As tarefas devem ter informações como título, descrição, data de vencimento, prioridade e responsável. O sistema deve enviar notificações automáticas para lembrar os usuários sobre prazos próximos.
            
            Além disso, o sistema deve gerar relatórios de produtividade e permitir a colaboração entre membros da equipe através de comentários e anexos nas tarefas.`,
                icon: BookOpen,
                updateHistory: [
                  {
                    id: "hist9",
                    date: "2024-01-20",
                    version: "1.2",
                    description: "Adição de funcionalidades de reviews de produtos",
                    author: "Sistema IA",
                    changeType: "updated",
                  },
                ],
              },
              {
                type: "diagram",
                title: "Diagrama de Classes (v1.2)",
                preview: "User, Product, Order, Payment, Promotion, Review (6 classes)",
                lastModified: "2024-01-20",
                content: {
                  classes: [
                    { name: "User", attributes: ["id: String"], methods: ["login()"] },
                    { name: "Product", attributes: ["id: String"], methods: ["addProduct()"] },
                    { name: "Order", attributes: ["id: String"], methods: ["createOrder()"] },
                    { name: "Payment", attributes: ["id: String"], methods: ["processPayment()"] },
                    {
                      name: "Promotion",
                      attributes: ["id: String", "code: String", "discount: Float"],
                      methods: ["applyPromotion()"],
                    },
                    {
                      name: "Review",
                      attributes: [
                        "id: String",
                        "productId: String",
                        "userId: String",
                        "rating: Integer",
                        "comment: String",
                      ],
                      methods: ["addReview()"],
                    },
                  ],
                },
                icon: Database,
                updateHistory: [
                  {
                    id: "hist10",
                    date: "2024-01-20",
                    version: "1.2",
                    description: "Adição da classe Review",
                    author: "Sistema IA",
                    changeType: "updated",
                  },
                ],
              },
              {
                type: "use-cases",
                title: "Casos de Uso (v1.2)",
                preview: "Login, Cadastro, Comprar, Pagar, Aplicar Cupom, Deixar Review (10 casos)",
                lastModified: "2024-01-20",
                content: `## Casos de Uso do Sistema de E-commerce (v1.2)
            
            ### CU001: Realizar Login
            **Ator Principal:** Cliente
            **Objetivo:** Permitir que o cliente acesse sua conta no sistema.
            **Pré-condições:** O cliente deve ter uma conta cadastrada.
            **Fluxo Principal:**
            1. O cliente acessa a página de login.
            2. O sistema exibe o formulário de login.
            3. O cliente insere seu email e senha.
            4. O sistema valida as credenciais.
            5. O sistema redireciona o cliente para o painel de control.
            **Pós-condições:** Cliente logado no sistema.
            
            ### CU004: Aplicar Cupom de Desconto
            **Ator Principal:** Cliente
            **Objetivo:** Permitir que o cliente aplique um cupom de desconto ao carrinho.
            **Pré-condições:** Cliente logado, produtos no carrinho.
            **Fluxo Principal:**
            1. O cliente acessa o carrinho de compras.
            2. O sistema exibe o campo para cupom.
            3. O cliente insere o código do cupom.
            4. O sistema valida o cupom e aplica o desconto.
            5. O sistema atualiza o valor total do carrinho.
            **Pós-condições:** Desconto aplicado ao carrinho.
            
            ### CU005: Deixar Avaliação de Produto
            **Ator Principal:** Cliente
            **Objetivo:** Permitir que o cliente avalie um produto comprado.
            **Pré-condições:** Cliente logado, produto comprado.
            **Fluxo Principal:**
            1. O cliente acessa a página do produto ou seu histórico de compras.
            2. O sistema exibe a opção de deixar uma avaliação.
            3. O cliente insere a nota e o comentário.
            4. O sistema salva a avaliação e a exibe na página do produto.
            **Pós-condições:** Avaliação do produto registrada.`,
                icon: Users,
                updateHistory: [
                  {
                    id: "hist11",
                    date: "2024-01-20",
                    version: "1.2",
                    description: "Adição do caso de uso Deixar Avaliação de Produto",
                    author: "Sistema IA",
                    changeType: "updated",
                  },
                ],
              },
              {
                type: "requirements",
                title: "Documento de Requisitos (v1.2)",
                preview: "50 requisitos funcionais, 12 não funcionais",
                lastModified: "2024-01-20",
                content: `
# Documento de Requisitos - Sistema de E-commerce (v1.2)

## 1. Introdução
Este documento descreve os requisitos funcionais e não funcionais para o Sistema de E-commerce, uma plataforma completa de vendas online, com a adição de funcionalidades de promoção e sistema de reviews.

## 2. Requisitos Funcionais (RFs)

| ID    | Descrição                                          | Prioridade | Requisitos Relacionados |
|-------|----------------------------------------------------|------------|-------------------------|
| RF001 | O sistema deve permitir o cadastro de novos usuários. | Alta       | -                       |
| RF002 | O sistema deve permitir o login e logout de usuários. | Alta       | -                       |
| RF003 | O sistema deve exibir uma lista de produtos disponíveis. | Média      | -                       |
| RF004 | O sistema deve permitir adicionar produtos ao carrinho. | Alta       | -                       |
| RF005 | O sistema deve permitir remover produtos do carrinho. | Média      | -                       |
| RF006 | O sistema deve permitir finalizar a compra.        | Alta       | RF007, RF008            |
| RF007 | O sistema deve integrar com um gateway de pagamento. | Alta       | -                       |
| RF008 | O sistema deve gerar um histórico de pedidos para o usuário. | Média      | -                       |
| RF009 | O sistema deve permitir a aplicação de cupons de desconto. | Alta       | -                       |
| RF010 | O sistema deve permitir que usuários deixem avaliações e comentários em produtos. | Média      | -                       |

## 3. Requisitos Não Funcionais (RNFs)

| ID    | Descrição                                          | Categoria      | Prioridade |
|-------|----------------------------------------------------|----------------|------------|
| RNF001 | O sistema deve ser responsivo em dispositivos móveis. | Usabilidade    | Alta       |
| RNF002 | O sistema deve garantir a segurança dos dados do usuário. | Segurança      | Alta       |
| RNF003 | O sistema deve ter um tempo de resposta inferior a 2 segundos. | Performance    | Alta       |
| RNF004 | O sistema deve estar disponível 99.9% do tempo.    | Disponibilidade | Alta       |
| RNF005 | O sistema deve suportar 1000 usuários simultâneos. | Escalabilidade | Média      |

## 4. Regras de Negócio (BRs)

| ID    | Descrição                                          | Prioridade | Requisitos Relacionados |
|-------|----------------------------------------------------|------------|-------------------------|
| BR001 | O estoque de um produto deve ser atualizado após cada compra. | Alta       | RF006                   |
| BR002 | O valor mínimo de um pedido é R$ 10,00.            | Média      | RF006                   |
| BR003 | Cupons de desconto só podem ser aplicados uma vez por pedido. | Alta       | RF009                   |
| BR004 | Apenas usuários que compraram um produto podem avaliá-lo. | Alta       | RF010                   |

## 5. Dicionário de Dados

### FerramentaTransacao
| ATRIBUTO | DESCRIÇÃO |
|---|---|
| nome | O nome da ferramenta de transcrição (por exemplo, "ferramenta de transcrição do YouTube com Gemini do Google"). |
| descricao | Uma descrição geral do propósito da ferramenta de transcrição (por exemplo, "projetada para converter conteúdo de áudio em texto"). |
| versao | A versão específica da ferramenta de transcrição que está sendo testada. |
| formatosAudioSuportados | Uma lista de formatos de áudio que a ferramenta de transcrição é capaz de processar (por exemplo, "MP3", "WAV", "FLAC"). |
| idiomasSuportados | Uma lista de idiomas que a ferramenta de transcrição pode transcrever (por exemplo, "pt-BR", "en-US"). |
| duracaoMaximaAudioMinutos | A duração máxima, em minutos, de um arquivo de áudio que a ferramenta de transcrição pode processar. |
| formatosSaida | Uma lista de formatos de texto nos quais a ferramenta de transcrição pode gerar a saída (por exemplo, "TXT", "SRT", "VTT"). |

### ArquivoAudio
| ATRIBUTO | DESCRIÇÃO |
|---|---|
| nomeArquivo | Um identificador único ou nome para o arquivo de áudio. |
| categoria | A categorização ou propósito do arquivo de áudio dentro do contexto de teste (por exemplo, "teste", "treinamento"). |
| descricaoConteudo | Uma descrição geral do conteúdo de áudio dentro do arquivo. |
| temTomAgudo | Um sinalizador booleano indicando se um tom agudo foi detectado no arquivo de áudio, relevante para testes de robustez. |
| formato | O formato de arquivo específico do áudio (por exemplo, "MP3", "WAV"). |
| duracaoEmSegundos | A duração do áudio em segundos. |

### Transcricao
| ATRIBUTO | DESCRIÇÃO |
|---|---|
| textoTranscrito | O conteúdo de texto real gerado pela ferramenta de transcrição a partir do arquivo de áudio. |
| pontuacaoPrecisao | Uma pontuação numérica (por exemplo, porcentagem ou WER) indicando quão precisa é a transcrição, com base em critérios predefinidos. |
| confiancaHabilidade | Um valor numérico (por exemplo, de 0 a 1) que representa a confiança da ferramenta na qualidade da transcrição. |
| formatoSaida | O formato de saída da transcrição (por exemplo, "TXT", "SRT"). |
| idioma | O idioma detectado ou especificado para a transcrição. |
| temErroLocutor | Um sinalizador booleano indicando se um erro relacionado ao locutor foi detectado na transcrição. |
| temErroTempo | Um sinalizador booleano indicando se um erro relacionado ao tempo foi detectado na transcrição. |
`,
                icon: FileText,
                updateHistory: [
                  {
                    id: "hist12",
                    date: "2024-01-20",
                    version: "1.2",
                    description: "Adição de requisitos relacionados a reviews de produtos",
                    author: "Sistema IA",
                    changeType: "updated",
                  },
                ],
              },
            ],
          },
        ],
        transcriptions: [],
        tags: ["e-commerce", "web", "pagamento"],
      },
    ],
    tags: ["e-commerce", "web", "pagamento"],
  },
  {
    id: "2",
    name: "App de Delivery",
    description: "Aplicativo mobile para entregas",
    createdAt: "2024-01-10",
    lastModified: "2024-01-15",
    modules: [
      {
        id: "m4",
        name: "Versão 1.0",
        description: "Versão inicial do app",
        createdAt: "2024-01-10",
        lastModified: "2024-01-10",
        versions: [
          {
            id: "v1",
            version: "1.0",
            date: "2024-01-10",
            status: "approved",
            artifacts: [
              {
                type: "minimundo",
                title: "Minimundo Gerado",
                preview: "Aplicativo para conectar clientes e entregadores...",
                lastModified: "2024-01-10",
                content: `Aplicativo para conectar clientes e entregadores, permitindo pedidos e acompanhamento em tempo real.`,
                icon: BookOpen,
                updateHistory: [
                  {
                    id: "hist13",
                    date: "2024-01-10",
                    version: "1.0",
                    description: "Criação inicial do minimundo para o App de Delivery",
                    author: "Sistema IA",
                    changeType: "created",
                  },
                ],
              },
              {
                type: "diagram",
                title: "Diagrama de Classes",
                preview: "Customer, Restaurant, Delivery, Order (4 classes)",
                lastModified: "2024-01-10",
                content: {
                  classes: [
                    { name: "Customer", attributes: ["id", "name", "address"], methods: ["placeOrder()"] },
                    { name: "Restaurant", attributes: ["id", "name", "menu"], methods: ["receiveOrder()"] },
                  ],
                },
                icon: Database,
                updateHistory: [
                  {
                    id: "hist14",
                    date: "2024-01-10",
                    version: "1.0",
                    description: "Criação do diagrama inicial para o App de Delivery",
                    author: "Sistema IA",
                    changeType: "created",
                  },
                ],
              },
              {
                type: "requirements",
                title: "Documento de Requisitos",
                preview: "32 requisitos funcionais, 8 não funcionais",
                lastModified: "2024-01-10",
                content: `## Requisitos App de Delivery`,
                icon: FileText,
                updateHistory: [
                  {
                    id: "hist15",
                    date: "2024-01-10",
                    version: "1.0",
                    description: "Documento inicial de requisitos para o App de Delivery",
                    author: "Sistema IA",
                    changeType: "created",
                  },
                ],
              },
            ],
          },
        ],
        transcriptions: [
          {
            id: "transc_delivery_1",
            date: "2024-01-09",
            title: "Reunião de Ideação - App Delivery",
            content: `A ideia é criar um app de delivery onde o cliente pode pedir comida de restaurantes próximos. O entregador recebe o pedido e faz a entrega. Precisamos de rastreamento em tempo real.`,
            generatedArtifacts: {
              minimundo: `Aplicativo mobile para conectar clientes a restaurantes e entregadores, com foco em pedidos e rastreamento.`,
              diagram: {
                classes: [
                  { name: "Client", attributes: ["id", "name"], methods: ["placeOrder()"] },
                  { name: "Restaurant", attributes: ["id", "name"], methods: ["manageMenu()"] },
                  { name: "DeliveryPerson", attributes: ["id", "name"], methods: ["acceptDelivery()"] },
                  { name: "Order", attributes: ["id", "status"], methods: ["trackOrder()"] },
                ],
              },
              useCases: `## Casos de Uso - App Delivery
### CU001: Fazer Pedido
### CU002: Rastrear Pedido`,
              requirements: `# Requisitos - App Delivery
## RFs
- RF001: O app deve permitir fazer pedidos.
- RF002: O app deve permitir rastrear pedidos.`,
            },
          },
        ],
        tags: ["mobile", "delivery", "gps"],
      },
      {
        id: "m5",
        name: "Versão 2.0",
        description: "Versão com chat integrado",
        createdAt: "2024-01-15",
        lastModified: "2024-01-15",
        versions: [
          {
            id: "v2",
            version: "2.0",
            date: "2024-01-15",
            status: "draft",
            artifacts: [
              {
                type: "minimundo",
                title: "Minimundo Gerado (v2.0)",
                preview: "Atualização: Aplicativo para conectar clientes e entregadores com chat...",
                lastModified: "2024-01-15",
                content: `Aplicativo para conectar clientes e entregadores, permitindo pedidos, acompanhamento em tempo real e chat integrado.`,
                icon: BookOpen,
                updateHistory: [
                  {
                    id: "hist16",
                    date: "2024-01-15",
                    version: "2.0",
                    description: "Adição de funcionalidade de chat",
                    author: "Sistema IA",
                    changeType: "updated",
                  },
                ],
              },
              {
                type: "diagram",
                title: "Diagrama de Classes (v2.0)",
                preview: "Customer, Restaurant, Delivery, Order, Chat (5 classes)",
                lastModified: "2024-01-15",
                content: {
                  classes: [
                    { name: "Customer", attributes: ["id", "name"], methods: ["placeOrder()"] },
                    { name: "Restaurant", attributes: ["id", "name"], methods: ["manageMenu()"] },
                    { name: "DeliveryPerson", attributes: ["id", "name"], methods: ["acceptDelivery()"] },
                    { name: "Order", attributes: ["id", "status"], methods: ["trackOrder()"] },
                    { name: "Chat", attributes: ["id", "message", "sender", "receiver"], methods: ["sendMessage()"] },
                  ],
                },
                icon: Database,
                updateHistory: [
                  {
                    id: "hist17",
                    date: "2024-01-15",
                    version: "2.0",
                    description: "Adição da classe Chat",
                    author: "Sistema IA",
                    changeType: "updated",
                  },
                ],
              },
              {
                type: "requirements",
                title: "Documento de Requisitos (v2.0)",
                preview: "35 requisitos funcionais, 8 não funcionais",
                lastModified: "2024-01-15",
                content: `## Requisitos App de Delivery (v2.0)`,
                icon: FileText,
                updateHistory: [
                  {
                    id: "hist18",
                    date: "2024-01-15",
                    version: "2.0",
                    description: "Atualização do documento de requisitos com chat",
                    author: "Sistema IA",
                    changeType: "updated",
                  },
                ],
              },
            ],
          },
        ],
        transcriptions: [],
        tags: ["mobile", "delivery", "gps"],
      },
    ],
    tags: ["mobile", "delivery", "gps"],
  },
  {
    id: "3",
    name: "Sistema Bancário",
    description: "Sistema para operações bancárias",
    createdAt: "2024-01-05",
    lastModified: "2024-01-12",
    modules: [
      {
        id: "m6",
        name: "Versão 1.0",
        description: "Versão inicial do sistema",
        createdAt: "2024-01-05",
        lastModified: "2024-01-05",
        versions: [
          {
            id: "v1",
            version: "1.0",
            date: "2024-01-05",
            status: "approved",
            artifacts: [
              {
                type: "minimundo",
                title: "Minimundo Gerado",
                preview: "Sistema para gerenciar contas, transações...",
                lastModified: "2024-01-05",
                content: `Sistema para gerenciar operações bancárias básicas como contas, depósitos, saques e transferências.`,
                icon: BookOpen,
                updateHistory: [
                  {
                    id: "hist19",
                    date: "2024-01-05",
                    version: "1.0",
                    description: "Criação inicial do minimundo para o Sistema Bancário",
                    author: "Sistema IA",
                    changeType: "created",
                  },
                ],
              },
              {
                type: "diagram",
                title: "Diagrama de Classes",
                preview: "Account, Transaction, Customer (3 classes)",
                lastModified: "2024-01-05",
                content: {
                  classes: [
                    { name: "Client", attributes: ["id", "name"], methods: ["openAccount()"] },
                    { name: "Account", attributes: ["id", "balance"], methods: ["deposit()", "withdraw()"] },
                    { name: "Transaction", attributes: ["id", "amount"], methods: ["record()"] },
                  ],
                },
                icon: Database,
                updateHistory: [
                  {
                    id: "hist20",
                    date: "2024-01-05",
                    version: "1.0",
                    description: "Criação do diagrama inicial para o Sistema Bancário",
                    author: "Sistema IA",
                    changeType: "created",
                  },
                ],
              },
              {
                type: "requirements",
                title: "Documento de Requisitos",
                preview: "28 requisitos funcionais, 15 não funcionais",
                lastModified: "2024-01-05",
                content: `## Requisitos Sistema Bancário`,
                icon: FileText,
                updateHistory: [
                  {
                    id: "hist21",
                    date: "2024-01-05",
                    version: "1.0",
                    description: "Documento inicial de requisitos para o Sistema Bancário",
                    author: "Sistema IA",
                    changeType: "created",
                  },
                ],
              },
            ],
          },
        ],
        transcriptions: [
          {
            id: "transc_banco_1",
            date: "2024-01-04",
            title: "Reunião de Escopo - Sistema Bancário",
            content: `O sistema bancário deve permitir que clientes abram contas, façam depósitos, saques e transferências. A segurança é primordial.`,
            generatedArtifacts: {
              minimundo: `Sistema para gerenciar operações bancárias básicas como contas, depósitos, saques e transferências.`,
              diagram: {
                classes: [
                  { name: "Client", attributes: ["id", "name"], methods: ["openAccount()"] },
                  { name: "Account", attributes: ["id", "balance"], methods: ["deposit()", "withdraw()"] },
                  { name: "Transaction", attributes: ["id", "amount"], methods: ["record()"] },
                ],
              },
              useCases: `## Casos de Uso - Sistema Bancário
### CU001: Abrir Conta
### CU002: Realizar Depósito
### CU003: Realizar Saque`,
              requirements: `# Requisitos - Sistema Bancário
## RFs
- RF001: O sistema deve permitir abertura de contas.
- RF002: O sistema deve permitir depósitos.
- RF003: O sistema deve permitir saques.`,
            },
          },
        ],
        tags: ["bancário", "segurança", "transações"],
      },
    ],
    tags: ["bancário", "segurança", "transações"],
  },
]
