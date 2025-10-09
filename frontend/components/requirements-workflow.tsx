"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookOpen, Database, FileText, Users, Eye } from "lucide-react"
import MinimundoModal from "@/components/minimundo-modal"
import DiagramModal from "@/components/diagram-modal"
import FinalDocumentView from "@/components/final-document-view"
import UseCasesModal from "@/components/use-cases-modal"
import RequirementsDocumentModal from "@/components/requirements-document-modal"
import ProgressTimeline from "@/components/progress-timeline"
import type { ProjectArtifact } from "@/lib/data"

interface RequirementsWorkflowProps {
  initialMinimundo?: string
  initialDiagram?: any
  initialUseCases?: string
  initialFinalDocument?: string
  onBackToHistory: () => void
  onNewProjectStart?: () => void
  isExistingProject?: boolean
  projectName?: string
  setProjectName?: (name: string) => void
  projectDescription?: string
  setProjectDescription?: (description: string) => void
  onStartNewMeetingForExistingProject?: (transcriptionContent?: string) => void
  showMinimundoModal: boolean
  setShowMinimundoModal: (show: boolean) => void
  showDiagramModal: boolean
  setShowDiagramModal: (show: boolean) => void
  showUseCasesModal: boolean
  setShowUseCasesModal: (show: boolean) => void
  showRequirementsModal: boolean
  setShowRequirementsModal: (show: boolean) => void
  showFullDocumentModal: boolean
  setShowFullDocumentModal: (show: boolean) => void
  currentArtifactContent: string | any
  setCurrentArtifactContent: (content: string | any) => void
  currentArtifactType: ProjectArtifact["type"] | null
  setCurrentArtifactType: (type: ProjectArtifact["type"] | null) => void
  handleMinimundoModalConfirm: (updatedContent: string) => void
  handleDiagramModalConfirm: (updatedContent: any) => void
  handleUseCasesModalConfirm: (updatedContent: string) => void
  handleRequirementsModalConfirm: (updatedContent: string) => void
  handleModalCancel: () => void
  onUpdateProjectArtifacts?: (artifacts: {
    minimundo: string
    diagram: any
    useCases: string
    requirements: string
  }) => void
  onWorkflowStepChange?: (step: WorkflowStep) => void // New prop
  onProjectCompleted?: (projectId: string) => void // Added new prop for project completion with redirect
}

type WorkflowStep = "input" | "processing" | "completed" | "final"

export default function RequirementsWorkflow({
  initialMinimundo = "",
  initialDiagram = null,
  initialUseCases = "",
  initialFinalDocument = "",
  onBackToHistory,
  onNewProjectStart,
  isExistingProject = false,
  projectName: externalProjectName,
  setProjectName: setExternalProjectName,
  projectDescription: externalProjectDescription,
  setProjectDescription: setExternalProjectDescription,
  onStartNewMeetingForExistingProject,
  showMinimundoModal,
  setShowMinimundoModal,
  showDiagramModal,
  setShowDiagramModal,
  showUseCasesModal,
  setShowUseCasesModal,
  showRequirementsModal,
  setShowRequirementsModal,
  showFullDocumentModal,
  setShowFullDocumentModal,
  currentArtifactContent,
  setCurrentArtifactContent,
  currentArtifactType,
  setCurrentArtifactType,
  handleMinimundoModalConfirm,
  handleDiagramModalConfirm,
  handleUseCasesModalConfirm,
  handleRequirementsModalConfirm,
  handleModalCancel,
  onUpdateProjectArtifacts,
  onWorkflowStepChange, // Destructure new prop
  onProjectCompleted, // Added new prop for project completion with redirect
}: RequirementsWorkflowProps) {
  const [projectName, setProjectName] = useState(externalProjectName || "")
  const [projectDescription, setProjectDescription] = useState(externalProjectDescription || "")
  const [participants, setParticipants] = useState("")
  const [inputText, setInputText] = useState("")

  const [newlyGeneratedMinimundoData, setNewlyGeneratedMinimundoData] = useState("")
  const [newlyGeneratedDiagramData, setNewlyGeneratedDiagramData] = useState<any>(null)
  const [newlyGeneratedUseCasesData, setNewlyGeneratedUseCasesData] = useState("")
  const [newlyGeneratedFinalDocument, setNewlyGeneratedFinalDocument] = useState("")

  const [currentMinimundoData, setCurrentMinimundoData] = useState(initialMinimundo)
  const [currentDiagramData, setCurrentDiagramData] = useState<any>(initialDiagram)
  const [currentUseCasesData, setCurrentUseCasesData] = useState(initialUseCases)
  const [currentFinalDocument, setCurrentFinalDocument] = useState(initialFinalDocument)

  const [timelineSteps, setTimelineSteps] = useState([
    {
      id: "minimundo",
      title: "Minimundo Gerado",
      description: "Narrativa de domínio baseada na análise do conteúdo fornecido",
      status: "pending" as const,
      icon: BookOpen,
    },
    {
      id: "diagram",
      title: "Diagrama de Classes",
      description: "Estrutura das classes e relacionamentos do sistema",
      status: "pending" as const,
      icon: Database,
    },
    {
      id: "use-cases",
      title: "Casos de Uso",
      description: "Identificação e documentação dos casos de uso do sistema",
      status: "pending" as const,
      icon: Users,
    },
    {
      id: "requirements",
      title: "Documento de Requisitos",
      description: "Documento final com todos os requisitos funcionais e não funcionais",
      status: "pending" as const,
      icon: FileText,
    },
  ])

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isDragOver, setIsDragOver] = useState(false)
  const [isDragActive, setIsDragActive] = useState(false)

  useEffect(() => {
    if (isExistingProject) {
      // For existing projects, always show artifacts regardless of content
      setCurrentStep("final")
      setShowInputSection(false)
      onWorkflowStepChange?.("final")
    } else if (initialMinimundo || initialDiagram || initialUseCases || initialFinalDocument) {
      // For new projects with existing artifacts
      setCurrentStep("final")
      setShowInputSection(false)
      onWorkflowStepChange?.("final")
    } else {
      // For completely new projects
      setCurrentStep("input")
      setShowInputSection(true)
      onWorkflowStepChange?.("input")
    }
  }, [initialMinimundo, initialDiagram, initialUseCases, initialFinalDocument, isExistingProject, onWorkflowStepChange])

  useEffect(() => {
    if (externalProjectName !== undefined) {
      setProjectName(externalProjectName)
    }
  }, [externalProjectName])

  useEffect(() => {
    if (externalProjectDescription !== undefined) {
      setProjectDescription(externalProjectDescription)
    }
  }, [externalProjectDescription])

  const [showInputSection, setShowInputSection] = useState(() => {
    // If it's an existing project, always show artifacts (not input section)
    if (isExistingProject) {
      return false
    }
    // For new projects, show input section if no artifacts exist
    return !initialMinimundo && !initialDiagram && !initialUseCases && !initialFinalDocument
  })

  const [currentStep, setCurrentStep] = useState<WorkflowStep>(() => {
    // If it's an existing project, always start at final step
    if (isExistingProject) {
      return "final"
    }
    // For new projects, determine based on artifacts
    return !initialMinimundo && !initialDiagram && !initialUseCases && !initialFinalDocument ? "input" : "final"
  })

  const updateStepStatus = (stepId: string, status: "pending" | "processing" | "completed") => {
    setTimelineSteps((prev) => prev.map((step) => (step.id === stepId ? { ...step, status } : step)))
  }

  const addAnalyzeHandler = (stepId: string, handler: () => void) => {
    setTimelineSteps((prev) => prev.map((step) => (step.id === stepId ? { ...step, onAnalyze: handler } : step)))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Placeholder for file handling logic
    }
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Only set drag active to false if we're leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragActive(false)
      setIsDragOver(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      // Placeholder for file handling logic
    }
  }

  const artifactSequence: ProjectArtifact["type"][] = ["minimundo", "diagram", "use-cases", "requirements"]

  const startProcessingNextStep = (currentArtifactType: ProjectArtifact["type"] | null) => {
    const currentIndex = currentArtifactType ? artifactSequence.indexOf(currentArtifactType) : -1
    const nextIndex = currentIndex + 1

    if (nextIndex < artifactSequence.length) {
      const nextStepId = artifactSequence[nextIndex]
      // Placeholder for processing logic
    } else {
      // All artifacts generated, transition to completed state
      setCurrentStep("completed")
      onWorkflowStepChange?.("completed") // Notify parent
      onUpdateProjectArtifacts?.({
        minimundo: newlyGeneratedMinimundoData,
        diagram: newlyGeneratedDiagramData,
        useCases: newlyGeneratedUseCasesData,
        requirements: newlyGeneratedFinalDocument,
      })
    }
  }

  const simulateArtifactGeneration = (stepId: ProjectArtifact["type"], prompt?: string) => {
    setTimeout(() => {
      let content: string | any
      switch (stepId) {
        case "minimundo":
          content = `O sistema proposto é uma plataforma de gerenciamento de projetos que permite aos usuários criar, organizar e acompanhar o progresso de suas tarefas e projetos. 
          ${prompt ? `\n\n(Regenerado com prompt: "${prompt}")` : ""}
          O sistema deve permitir que usuários se cadastrem e façam login de forma segura. Cada usuário pode criar múltiplos projetos, onde cada projeto pode conter várias tarefas organizadas em diferentes status (pendente, em andamento, concluído).
          
          As tarefas devem ter informações como título, descrição, data de vencimento, prioridade e responsável. O sistema deve enviar notificações automáticas para lembrar os usuários sobre prazos próximos.
          
          Além disso, o sistema deve gerar relatórios de produtividade e permitir a colaboração entre membros da equipe através de comentários e anexos nas tarefas.`
          setNewlyGeneratedMinimundoData(content)
          setCurrentArtifactContent(content) // Update content for modal
          break
        case "diagram":
          content = {
            classes: [
              {
                name: "User",
                attributes: ["id: String", "name: String", "email: String", "password: String"],
                methods: ["login()", "logout()", "updateProfile()"],
              },
              {
                name: "Project",
                attributes: ["id: String", "title: String", "description: String", "createdAt: DateTime"],
                methods: ["create()", "update()", "delete()", "addTask()"],
              },
              {
                name: "Task",
                attributes: [
                  "id: String",
                  "title: String",
                  "description: String",
                  "status: String",
                  "priority: String",
                  "dueDate: DateTime",
                ],
                methods: ["create()", "update()", "changeStatus()", "assignTo()"],
              },
              {
                name: "Notification",
                attributes: ["id: String", "message: String", "userId: String", "createdAt: DateTime"],
                methods: ["send()", "markAsRead()"],
              },
            ],
          }
          if (prompt) {
            // Simple modification based on prompt for demo
            if (prompt.toLowerCase().includes("pagamento")) {
              content.classes.push({
                name: "Payment",
                attributes: ["id: String", "amount: Float", "status: String"],
                methods: ["process()"],
              })
            }
            if (prompt.toLowerCase().includes("remover notificação")) {
              content.classes = content.classes.filter((cls: any) => cls.name !== "Notification")
            }
          }
          setNewlyGeneratedDiagramData(content)
          setCurrentArtifactContent(content) // Update content for modal
          break
        case "use-cases":
          content = `## Casos de Uso do Sistema de Gerenciamento de Projetos
          ${prompt ? `\n\n(Regenerado com prompt: "${prompt}")` : ""}
          ### CU001: Realizar Login
          **Ator Principal:** Usuário
          **Objetivo:** Permitir que o usuário acesse sua conta no sistema.
          **Pré-condições:** O usuário deve ter uma conta cadastrada.
          **Fluxo Principal:**
          1. O usuário acessa a página de login.
          2. O sistema exibe o formulário de login.
          3. O usuário insere seu email e senha.
          4. O sistema valida as credenciais.
          5. O sistema redireciona o usuário para o dashboard.
          **Pós-condições:** Usuário logado no sistema.
          
          ### CU002: Criar Projeto
          **Ator Principal:** Usuário
          **Objetivo:** Permitir que o usuário crie um novo projeto.
          **Pré-condições:** Usuário logado.
          **Fluxo Principal:**
          1. O usuário acessa a área de projetos.
          2. O usuário clica em "Novo Projeto".
          3. O sistema exibe o formulário de criação.
          4. O usuário preenche os dados do projeto.
          5. O sistema salva o projeto e exibe confirmação.
          **Pós-condições:** Novo projeto criado.
          
          ### CU003: Gerenciar Tarefas
          **Ator Principal:** Usuário
          **Objetivo:** Permitir que o usuário crie e gerencie tarefas.
          **Pré-condições:** Usuário logado e projeto selecionado.
          **Fluxo Principal:**
          1. O usuário seleciona um projeto.
          2. O usuário cria uma nova tarefa.
          3. O sistema permite editar status, prioridade e responsável.
          4. O sistema salva as alterações.
          **Pós-condições:** Tarefa criada/atualizada.`
          setNewlyGeneratedUseCasesData(content)
          setCurrentArtifactContent(content) // Update content for modal
          break
        case "requirements":
          content = `# Documento de Requisitos - Sistema de Gerenciamento de Projetos
          ${prompt ? `\n\n(Regenerado com prompt: "${prompt}")` : ""}
          ## 1. Introdução
          ${newlyGeneratedMinimundoData}
          
          ## 2. Casos de Uso
          ${newlyGeneratedUseCasesData}
          
          ## 3. Requisitos Funcionais
          
          ### RF001 - Autenticação de Usuários
          O sistema deve permitir que usuários se cadastrem e façam login de forma segura.
          **Prioridade:** Alta
          
          ### RF002 - Gerenciamento de Projetos
          O sistema deve permitir criar, editar e excluir projetos.
          **Prioridade:** Alta
          
          ### RF003 - Gerenciamento de Tarefas
          O sistema deve permitir criar, editar e excluir tarefas dentro dos projetos.
          **Prioridade:** Alta
          
          ### RF004 - Sistema de Notificações
          O sistema deve enviar notificações automáticas sobre prazos e atualizações.
          **Prioridade:** Média
          
          ## 4. Requisitos Não Funcionais
          
          ### RNF001 - Segurança
          O sistema deve criptografar senhas e usar HTTPS.
          **Prioridade:** Alta
          
          ### RNF002 - Performance
          O sistema deve responder em menos de 2 segundos.
          **Prioridade:** Alta
          
          ### RNF003 - Usabilidade
          O sistema deve ter interface intuitiva e responsiva.
          **Prioridade:** Média
          
          ## 5. Regras de Negócio
          
          ### RN001 - Hierarquia de Projetos
          Um usuário pode ter múltiplos projetos, mas cada tarefa pertence a apenas um projeto.
          
          ### RN002 - Status de Tarefas
          As tarefas devem seguir o fluxo: Pendente → Em Andamento → Concluída.
          
          ### RN003 - Notificações
          Notificações devem ser enviadas 24h antes do vencimento de uma tarefa.`
          setNewlyGeneratedFinalDocument(content)
          setCurrentArtifactContent(content) // Update content for modal
          break
      }
      updateStepStatus(stepId, "completed")
      addAnalyzeHandler(stepId, () => {
        setCurrentArtifactContent(content)
        setCurrentArtifactType(stepId)
        switch (stepId) {
          case "minimundo":
            setShowMinimundoModal(true)
            break
          case "diagram":
            setShowDiagramModal(true)
            break
          case "use-cases":
            setShowUseCasesModal(true)
            break
          case "requirements":
            setShowRequirementsModal(true)
            break
        }
      })

      // After an artifact is generated and its status is completed, check if the next step should start
      // This is crucial for the non-paused flow
      startProcessingNextStep(stepId)
    }, 2000) // Simulate processing time
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!projectName.trim() || !projectDescription.trim()) return

    if (onNewProjectStart) {
      // Criar o projeto com os dados básicos
      const newProjectId = `proj_${Date.now()}`
      onNewProjectStart()

      // Redirecionar para a página de módulos do projeto
      if (onProjectCompleted) {
        onProjectCompleted(newProjectId)
      }
      return
    }

    // Código original para processamento de artefatos (usado apenas em módulos)
    setCurrentStep("processing")
    onWorkflowStepChange?.("processing")

    // Reset timeline steps and start the first one
    setTimelineSteps((prev) => prev.map((step) => ({ ...step, status: "pending" as const, onAnalyze: undefined })))
    updateStepStatus("minimundo", "processing")
    simulateArtifactGeneration("minimundo")

    console.log("Starting analysis for project:", projectName, "Participants:", participants)
  }

  // This function is called when "Usar na Versão Atual" is clicked in any artifact modal
  const handleArtifactModalConfirmAndProceed = (updatedContent: string | any, type: ProjectArtifact["type"]) => {
    // First, update the content in the workflow's state (newly generated data)
    switch (type) {
      case "minimundo":
        setNewlyGeneratedMinimundoData(updatedContent)
        handleMinimundoModalConfirm(updatedContent) // Call parent handler to update project data
        break
      case "diagram":
        setNewlyGeneratedDiagramData(updatedContent)
        handleDiagramModalConfirm(updatedContent)
        break
      case "use-cases":
        setNewlyGeneratedUseCasesData(updatedContent)
        handleUseCasesModalConfirm(updatedContent)
        break
      case "requirements":
        setNewlyGeneratedFinalDocument(updatedContent)
        handleRequirementsModalConfirm(updatedContent)
        break
    }
    handleModalCancel() // Close the modal

    // Now, proceed to the next step based on the sequence and pause config
    startProcessingNextStep(type)
  }

  // New handler for regeneration from within modals
  const handleRegenerateArtifact = async (type: ProjectArtifact["type"], prompt: string) => {
    console.log(`Regenerating ${type} with prompt: "${prompt}"`)
    // Simulate regeneration and update the current artifact content
    simulateArtifactGeneration(type, prompt)
  }

  const handleViewFinalAnalysis = () => {
    if (onProjectCompleted) {
      // Generate a unique project ID and redirect to the project page
      const projectId = `proj_${Date.now()}`
      onProjectCompleted(projectId)
    } else {
      // Fallback to original behavior
      onBackToHistory()
    }
  }

  const handleNewProject = () => {
    setCurrentStep("input")
    onWorkflowStepChange?.("input")
    setShowInputSection(true)
    setProjectName("")
    setProjectDescription("")
    setParticipants("")
    setInputText("")
    setNewlyGeneratedMinimundoData("")
    setNewlyGeneratedDiagramData(null)
    setNewlyGeneratedUseCasesData("")
    setNewlyGeneratedFinalDocument("")
    setCurrentMinimundoData("")
    setCurrentDiagramData(null)
    setCurrentUseCasesData("")
    setCurrentFinalDocument("")
    setTimelineSteps((prev) => prev.map((step) => ({ ...step, status: "pending" as const, onAnalyze: undefined })))
    onNewProjectStart?.()
  }

  const handleStartNewMeeting = (transcriptionContent?: string) => {
    setCurrentStep("input")
    onWorkflowStepChange?.("input")
    setShowInputSection(true)
    setProjectName("")
    setProjectDescription("")
    setParticipants("")
    setInputText(transcriptionContent || "")
    setTimelineSteps((prev) => prev.map((step) => ({ ...step, status: "pending" as const, onAnalyze: undefined })))
  }

  return (
    <main className="flex-1 overflow-auto p-8">
      {currentStep === "input" && showInputSection && (
        <div className="w-full max-w-3xl mx-auto">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">Novo Projeto</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Crie um novo projeto fornecendo as informações básicas. Você poderá adicionar reuniões e materiais
              posteriormente nos módulos.
            </p>
          </div>

          <Card className="bg-card border border-border">
            <CardHeader className="border-b border-border bg-muted/50">
              <CardTitle className="text-xl font-semibold text-foreground text-center">
                Informações do Projeto
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-4">
                <Label htmlFor="projectName" className="text-sm font-medium text-foreground">
                  Nome do Projeto *
                </Label>
                <Input
                  id="projectName"
                  placeholder="Ex: Sistema de Gerenciamento de Tarefas"
                  value={projectName}
                  onChange={(e) => {
                    setProjectName(e.target.value)
                    if (setExternalProjectName) {
                      setExternalProjectName(e.target.value)
                    }
                  }}
                  className="text-base"
                  required
                />
              </div>

              <div className="space-y-4">
                <Label htmlFor="participants" className="text-sm font-medium text-foreground">
                  Envolvidos no Projeto
                </Label>
                <Input
                  id="participants"
                  placeholder="Ex: João Silva, Maria Souza, Carlos Mendes"
                  value={participants}
                  onChange={(e) => setParticipants(e.target.value)}
                  className="text-base"
                />
              </div>

              <div className="space-y-4">
                <Label htmlFor="notes" className="text-sm font-medium text-foreground">
                  Descrição do Projeto *
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Descreva seu projeto, objetivos, funcionalidades desejadas, regras de negócio..."
                  value={projectDescription}
                  onChange={(e) => {
                    setProjectDescription(e.target.value)
                    if (setExternalProjectDescription) {
                      setExternalProjectDescription(e.target.value)
                    }
                  }}
                  className="min-h-[120px] resize-none text-base py-3"
                  required
                />
              </div>

              <div className="pt-6">
                <Button
                  onClick={handleSubmit}
                  disabled={!projectName.trim() || !projectDescription.trim()}
                  className="w-full h-14 bg-primary hover:bg-primary/90 text-white text-lg font-medium"
                >
                  Criar Projeto
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {currentStep === "input" && !showInputSection && (
        <div className="w-full max-w-3xl mx-auto text-center py-20">
          <h2 className="text-2xl font-bold text-foreground mb-4">Pronto para um novo projeto?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Use o botão "Enviar Nova Reunião" na barra lateral para iniciar uma nova reunião e gerar novos artefatos de
            requisitos.
          </p>
        </div>
      )}
      {currentStep === "processing" && <ProgressTimeline steps={timelineSteps} />}
      {currentStep === "completed" && (
        <div className="w-full max-w-4xl mx-auto">
          <ProgressTimeline steps={timelineSteps} />
          <div className="mt-8 text-center">
            <Card className="bg-card border border-border">
              <CardContent className="p-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                    <FileText className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-foreground mb-2">Análise Concluída!</h3>
                    <p className="text-muted-foreground mb-6">
                      Todos os artefatos foram gerados com sucesso. Você pode analisar cada etapa individualmente ou
                      visualizar o documento final completo.
                    </p>
                  </div>
                  <Button
                    onClick={handleViewFinalAnalysis}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg"
                  >
                    <Eye className="mr-2 h-5 w-5" />
                    Ver análise final completa
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      {currentStep === "final" && (
        <FinalDocumentView
          document={currentFinalDocument}
          onNewProject={handleNewProject}
          onStartNewMeetingForExistingProject={isExistingProject ? handleStartNewMeeting : undefined}
          isExistingProject={isExistingProject}
          showFullDocumentModal={showFullDocumentModal}
          setShowFullDocumentModal={setShowFullDocumentModal}
        />
      )}
      <MinimundoModal
        isOpen={showMinimundoModal}
        data={currentArtifactContent}
        isProcessing={false}
        onConfirm={(updatedContent) => handleArtifactModalConfirmAndProceed(updatedContent, "minimundo")}
        onCancel={handleModalCancel}
        onRegenerate={(prompt) => handleRegenerateArtifact("minimundo", prompt)} // Pass regenerate handler
      />
      <DiagramModal
        isOpen={showDiagramModal}
        data={currentArtifactContent}
        isProcessing={false}
        onConfirm={(updatedContent) => handleArtifactModalConfirmAndProceed(updatedContent, "diagram")}
        onCancel={handleModalCancel}
        onRegenerate={(prompt) => handleRegenerateArtifact("diagram", prompt)} // Pass regenerate handler
      />
      <UseCasesModal
        isOpen={showUseCasesModal}
        data={currentArtifactContent}
        isProcessing={false}
        onConfirm={(updatedContent) => handleArtifactModalConfirmAndProceed(updatedContent, "use-cases")}
        onCancel={handleModalCancel}
        onRegenerate={(prompt) => handleRegenerateArtifact("use-cases", prompt)} // Pass regenerate handler
      />
      <RequirementsDocumentModal
        isOpen={showRequirementsModal}
        data={currentArtifactContent}
        isProcessing={false}
        onConfirm={(updatedContent) => handleArtifactModalConfirmAndProceed(updatedContent, "requirements")}
        onCancel={handleModalCancel}
        onRegenerate={(prompt) => handleRegenerateArtifact("requirements", prompt)} // Pass regenerate handler
      />
    </main>
  )
}
