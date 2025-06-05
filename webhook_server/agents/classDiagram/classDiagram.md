# Agentes da Criação dos Diagramas de Classe

## Linha do Tempo do Fluxo dos Agentes

| Tempo | Requirements | Class Diagram                      |
|-------|--------------|------------------------------------|
| T1    | Transcrição  | Transcrição                        |
| T2    | Minimundo    | Minimundo                          |
| T3    | Análise      | Identificação de Classes           |
| T4    | Extração     | Extração do Diagrama de Classes    |
| T5    | Priorização  | ---                                |
| T6    | Refinamento  | ---                                |
| T7    | ---          | Revisão do Diagrama de Classes     |
| T8    | ---          | Refinamento do Diagrama de Classes |

---

## Gráfico da Linha do Tempo do Fluxo dos Agentes

```mermaid
graph TD
    T0[START] --> T1[Transcrição]
    T1 --> T2[Minimundo]
    T2 --> T3A[Análise]
    T3A --> T4A[Extração]
    T4A --> T5A[Priorização]
    T5A --> T6A[Refinamento]
    T2 --> T3B[Identificação de Classes]
    T3B --> T4B[Extração do Diagrama de Classes]
    T4B --> T5B[Revisão do Diagrama de Classes]
    T6A --> T5B
    T5B --> T6B[Refinamento do Diagrama de Classes]
    T6B --> T7[END]
```

---

## Agentes

### Transcrição
Responsável por converter a gravação da reunião em texto estruturado, servindo como base para a modelagem inicial do sistema.

---

### Minimundo
Gera uma descrição textual formalizada do domínio do sistema (minimundo), sintetizando as informações extraídas da transcrição.

---

### Identificação de Classes
Analisa o minimundo para extrair as entidades principais do sistema, identificando classes, atributos e relações, baseando-se nos princípios da modelagem orientada a objetos.

---

### Extração do Diagrama de Classes
Cria uma primeira versão do diagrama de classes a partir da lista de classes, atributos e relações previamente identificados na análise do minimundo.

---

### Revisão do Diagrama de Classes
Reavalia o diagrama, alinhando-o com os requisitos funcionais, regras de negócio e requisitos não funcionais, corrigindo possíveis inconsistências, lacunas ou erros semânticos.

---

### Refinamento do Diagrama de Classes
Realiza o aprimoramento final do diagrama, garantindo alinhamento semântico, consistência técnica e conformidade com os padrões de modelagem adotados.

---