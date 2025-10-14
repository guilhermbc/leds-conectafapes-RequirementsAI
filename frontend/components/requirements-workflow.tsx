import { api } from '../api/client'

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

const simulateArtifactGeneration = async (stepId: ProjectArtifact["type"], prompt?: string) => {
  let content: string | any

  try {
    switch (stepId) {
      case "minimundo": {
        const response = await api.webhook.callAgentMiniworldWebhookMiniworldPost({});
        content = response
        setNewlyGeneratedMinimundoData(content)
        setCurrentArtifactContent(content)
        break
      }
      case "diagram": {
        const response = await api.webhook.callAgentMiniworldWebhookClassDiagramsPost({});
        content = response
        setNewlyGeneratedDiagramData(content)
        setCurrentArtifactContent(content)
        break
      }
      case "use-cases": {
        const response = await api.webhook.callAgentMiniworldWebhookUseCasesPost({});
        content = response
        setNewlyGeneratedUseCasesData(content)
        setCurrentArtifactContent(content)
        break
      }
      case "requirements": {
        const response = await api.webhook.callAgentMiniworldWebhookRequirementsPost({});
        content = response
        setNewlyGeneratedFinalDocument(content)
        setCurrentArtifactContent(content)
        break
      }
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

    startProcessingNextStep(stepId)
  } catch (error: any) {
    // Optionally, handle error state here
    setCurrentArtifactContent(`Erro ao gerar artefato: ${error?.message || "Erro desconhecido"}`)
    updateStepStatus(stepId, "completed")
  }
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
