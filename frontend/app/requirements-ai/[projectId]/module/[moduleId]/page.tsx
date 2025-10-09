"use client"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { FileText, History, Loader2, BookOpen, Database, Users, Trash2, Mic, Pencil } from "lucide-react"
import RequirementsWorkflow from "@/components/requirements-workflow"
import MainContentViewer from "@/components/main-content-viewer"
import MeetingUploadModal from "@/components/meeting-upload-modal"
import { projects, type HistoryProject, type ProjectArtifact, type ProjectModule } from "@/lib/data"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import DeleteConfirmationModal from "@/components/delete-confirmation-modal"
import { formatDate } from "@/lib/utils"
import Breadcrumb from "@/components/breadcrumb"
import Input from "@/components/ui/input"

interface ModuleReviewPageProps {
  params: {
    projectId: string
    moduleId: string
  }
}

type WorkflowStep = "input" | "processing" | "completed" | "final"

export default function ModuleReviewPage({ params }: ModuleReviewPageProps) {
  const { projectId, moduleId } = params
  const [currentProject, setCurrentProject] = useState<HistoryProject | null>(null)
  const [currentModule, setCurrentModule] = useState<ProjectModule | null>(null)
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null)
  const router = useRouter()

  const [selectedArtifact, setSelectedArtifact] = useState<ProjectArtifact | null>(null)

  const [showMinimundoModal, setShowMinimundoModal] = useState(false)
  const [showDiagramModal, setShowDiagramModal] = useState(false)
  const [showUseCasesModal, setShowUseCasesModal] = useState(false)
  const [showRequirementsModal, setShowRequirementsModal] = useState(false)
  const [showFullDocumentModal, setShowFullDocumentModal] = useState(false)
  const [currentArtifactContent, setCurrentArtifactContent] = useState<string | any>(null)
  const [currentArtifactType, setCurrentArtifactType] = useState<ProjectArtifact["type"] | null>(null)
  const [showDeleteVersionConfirmModal, setShowDeleteVersionConfirmModal] = useState(false)
  const [showDeleteModuleConfirmModal, setShowDeleteModuleConfirmModal] = useState(false)
  const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false)
  const [showMeetingUploadModal, setShowMeetingUploadModal] = useState(false)

  const [isEditingVersionMetadata, setIsEditingVersionMetadata] = useState(false)
  const [editedVersionNumber, setEditedVersionNumber] = useState("")
  const [editedVersionDate, setEditedVersionDate] = useState("")

  const [workflowCurrentStep, setWorkflowCurrentStep] = useState<WorkflowStep>("final")
  const [showInputSection, setShowInputSection] = useState(false)

  const [isEditingModuleName, setIsEditingModuleName] = useState(false)
  const [editedModuleName, setEditedModuleName] = useState("")
  const [editedModuleDescription, setEditedModuleDescription] = useState("")

  useEffect(() => {
    const project = projects.find((p) => p.id === projectId)
    if (project) {
      setCurrentProject(project)
      const module = project.modules.find((m) => m.id === moduleId)
      if (module) {
        setCurrentModule(module)
        setEditedModuleName(module.name)
        setEditedModuleDescription(module.description)
        if (module.versions.length > 0 && !selectedVersionId) {
          setSelectedVersionId(module.versions[module.versions.length - 1].id)
        }
      }
    }
  }, [projectId, moduleId, selectedVersionId])

  const handleArtifactClick = (artifact: ProjectArtifact) => {
    setSelectedArtifact(artifact)
  }

  const handleArtifactSave = (updatedContent: string | any) => {
    if (currentProject && currentModule && selectedArtifact && selectedVersionId) {
      const updatedProject = { ...currentProject }
      const moduleIndex = updatedProject.modules.findIndex((m) => m.id === moduleId)

      if (moduleIndex !== -1) {
        const targetModule = updatedProject.modules[moduleIndex]
        const versionIndex = targetModule.versions.findIndex((v) => v.id === selectedVersionId)

        if (versionIndex !== -1) {
          const targetVersion = targetModule.versions[versionIndex]
          targetVersion.artifacts = targetVersion.artifacts.map((artifact) => {
            if (artifact.type === selectedArtifact.type) {
              return { ...artifact, content: updatedContent, lastModified: new Date().toISOString().split("T")[0] }
            }
            return artifact
          })
          targetVersion.date = new Date().toISOString().split("T")[0]
          targetVersion.status = "draft"
        }
      }

      setCurrentProject(updatedProject)
      setCurrentModule(updatedProject.modules.find((m) => m.id === moduleId) || null)

      setSelectedArtifact({
        ...selectedArtifact,
        content: updatedContent,
        lastModified: new Date().toISOString().split("T")[0],
      })
    }
  }

  const handleDeleteModule = () => {
    setShowDeleteModuleConfirmModal(true)
  }

  const confirmDeleteModule = () => {
    if (currentProject) {
      const updatedProject = {
        ...currentProject,
        modules: currentProject.modules.filter((m) => m.id !== moduleId),
      }

      const projectIndex = projects.findIndex((p) => p.id === projectId)
      if (projectIndex !== -1) {
        projects[projectIndex] = updatedProject
      }

      router.push(`/requirements-ai/${projectId}`)
    }
    setShowDeleteModuleConfirmModal(false)
  }

  const handleEditModuleName = () => {
    setIsEditingModuleName(true)
  }

  const handleSaveModuleName = () => {
    if (currentProject && currentModule && editedModuleName.trim()) {
      const updatedProject = { ...currentProject }
      const moduleIndex = updatedProject.modules.findIndex((m) => m.id === moduleId)

      if (moduleIndex !== -1) {
        updatedProject.modules[moduleIndex] = {
          ...updatedProject.modules[moduleIndex],
          name: editedModuleName.trim(),
          description: editedModuleDescription.trim(),
        }

        const projectIndex = projects.findIndex((p) => p.id === projectId)
        if (projectIndex !== -1) {
          projects[projectIndex] = updatedProject
        }

        setCurrentProject(updatedProject)
        setCurrentModule(updatedProject.modules[moduleIndex])
      }
      setIsEditingModuleName(false)
    }
  }

  const handleCancelEditModuleName = () => {
    if (currentModule) {
      setEditedModuleName(currentModule.name)
      setEditedModuleDescription(currentModule.description)
    }
    setIsEditingModuleName(false)
  }

  const handleMeetingUpload = (meetingData: {
    file?: File
    meetingDate: string
    participants: string
    notes: string
    meetingTitle: string
  }) => {
    console.log("Processing meeting data:", meetingData)

    if (currentProject && currentModule) {
      const newVersionNumber = (currentModule.versions.length + 1).toString()
      const newVersion = {
        id: `v${newVersionNumber}`,
        version: newVersionNumber,
        date: new Date().toISOString().split("T")[0],
        status: "processing" as const,
        artifacts: [],
        meetingInfo: {
          title: meetingData.meetingTitle,
          date: meetingData.meetingDate,
          participants: meetingData.participants,
          notes: meetingData.notes,
          fileName: meetingData.file?.name,
        },
      }

      const updatedProject = { ...currentProject }
      const moduleIndex = updatedProject.modules.findIndex((m) => m.id === moduleId)
      if (moduleIndex !== -1) {
        updatedProject.modules[moduleIndex].versions.push(newVersion)

        const projectIndex = projects.findIndex((p) => p.id === projectId)
        if (projectIndex !== -1) {
          projects[projectIndex] = updatedProject
        }

        setCurrentProject(updatedProject)
        setCurrentModule(updatedProject.modules[moduleIndex])
        setSelectedVersionId(newVersion.id)
      }
    }

    setShowMeetingUploadModal(false)

    alert("Reunião enviada com sucesso! O processamento foi iniciado.")
  }

  const workflowRef = useRef<any>(null)

  const handleBreadcrumbNavigation = () => {
    if (workflowRef.current && typeof workflowRef.current.resetToFinalStep === "function") {
      workflowRef.current.resetToFinalStep()
    }
  }

  const handlePrimaryAction = () => {
    setShowMeetingUploadModal(true)
  }

  const getArtifactIcon = (type: string) => {
    switch (type) {
      case "minimundo":
        return BookOpen
      case "diagram":
        return Database
      case "use-cases":
        return Users
      case "requirements":
        return FileText
      default:
        return FileText
    }
  }

  const selectedVersion = currentModule?.versions.find((v) => v.id === selectedVersionId)
  const artifactsToDisplay = selectedVersion ? selectedVersion.artifacts : []

  if (!currentProject || !currentModule) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Panel - Module Info */}
      <div className="w-80 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3 mb-4 justify-start mt-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <button
              onClick={() => router.push(`/requirements-ai/${projectId}`)}
              className="text-left hover:opacity-80 transition-opacity cursor-pointer"
            >
              <h2 className="font-semibold text-foreground">RequirementsAI</h2>
              <p className="text-xs text-muted-foreground">Gerador de Requisitos</p>
            </button>
          </div>
        </div>

        <div className="flex-1 p-4 space-y-6">
          <div>
            {isEditingModuleName ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Input
                    value={editedModuleName}
                    onChange={(e) => setEditedModuleName(e.target.value)}
                    className="text-lg font-semibold bg-background border-border"
                    placeholder="Nome do módulo"
                  />
                </div>
                <textarea
                  value={editedModuleDescription}
                  onChange={(e) => setEditedModuleDescription(e.target.value)}
                  className="w-full p-2 text-sm text-muted-foreground bg-background border border-border rounded resize-none"
                  placeholder="Descrição do módulo"
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveModuleName} disabled={!editedModuleName.trim()}>
                    Salvar
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancelEditModuleName}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-1">{currentModule.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{currentModule.description}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={handleEditModuleName}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground font-medium mb-2">
              <History className="h-4 w-4" />
              Versões do Módulo
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={selectedVersionId || ""}
                onValueChange={(value) => {
                  setSelectedVersionId(value)
                  setSelectedArtifact(null)
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione uma versão" />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  {currentModule.versions.map((version) => (
                    <SelectItem key={version.id} value={version.id}>
                      v{version.version} - {formatDate(version.date)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Artefatos da Versão</h4>
              <div className="space-y-2">
                {artifactsToDisplay.length > 0 ? (
                  artifactsToDisplay.map((artifact, index) => {
                    const Icon = getArtifactIcon(artifact.type)
                    const isSelected = selectedArtifact?.type === artifact.type
                    return (
                      <Button
                        key={index}
                        variant={isSelected ? "default" : "ghost"}
                        className={`w-full flex items-start justify-start gap-2 py-1 h-auto px-2 ${
                          isSelected ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                        }`}
                        onClick={() => handleArtifactClick(artifact)}
                      >
                        <Icon
                          className={`h-3 w-3 mt-0.5 flex-shrink-0 ${
                            isSelected ? "text-primary-foreground" : "text-muted-foreground"
                          }`}
                        />
                        <div className="min-w-0 flex-1 text-left">
                          <p
                            className={`text-xs font-medium truncate ${
                              isSelected ? "text-primary-foreground" : "text-foreground"
                            }`}
                          >
                            {artifact.title}
                          </p>
                          <p
                            className={`text-xs truncate ${
                              isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                            }`}
                          >
                            {artifact.preview}
                          </p>
                        </div>
                      </Button>
                    )
                  })
                ) : (
                  <p className="text-xs text-muted-foreground">Nenhum artefato para esta versão.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Center Panel - Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-card border-b border-border py-4 px-6 flex-shrink-0 mt-8">
          <Breadcrumb
            items={[
              {
                label: currentProject.name,
                href: `/requirements-ai/${projectId}`,
              },
              { label: currentModule.name },
            ]}
          />
        </header>

        {selectedArtifact && selectedArtifact.type !== "requirements" ? (
          <MainContentViewer artifact={selectedArtifact} onEdit={() => {}} onSave={handleArtifactSave} />
        ) : currentModule ? (
          <RequirementsWorkflow
            ref={workflowRef}
            initialMinimundo={
              currentModule.versions
                .find((v) => v.id === selectedVersionId)
                ?.artifacts.find((a) => a.type === "minimundo")?.content || ""
            }
            initialDiagram={
              currentModule.versions
                .find((v) => v.id === selectedVersionId)
                ?.artifacts.find((a) => a.type === "diagram")?.content || null
            }
            initialUseCases={
              currentModule.versions
                .find((v) => v.id === selectedVersionId)
                ?.artifacts.find((a) => a.type === "use-cases")?.content || ""
            }
            initialFinalDocument={
              currentModule.versions
                .find((v) => v.id === selectedVersionId)
                ?.artifacts.find((a) => a.type === "requirements")?.content || ""
            }
            onBackToHistory={() => router.push(`/requirements-ai/${projectId}`)}
            isExistingProject={true}
            onStartNewMeetingForExistingProject={(content?: string) => {
              if (workflowRef.current && typeof workflowRef.current.handleStartNewMeeting === "function") {
                workflowRef.current.handleStartNewMeeting(content)
              }
            }}
            showMinimundoModal={showMinimundoModal}
            setShowMinimundoModal={setShowMinimundoModal}
            showDiagramModal={showDiagramModal}
            setShowDiagramModal={setShowDiagramModal}
            showUseCasesModal={showUseCasesModal}
            setShowUseCasesModal={setShowUseCasesModal}
            showRequirementsModal={showRequirementsModal}
            setShowRequirementsModal={setShowRequirementsModal}
            showFullDocumentModal={showFullDocumentModal}
            setShowFullDocumentModal={setShowFullDocumentModal}
            currentArtifactContent={currentArtifactContent}
            setCurrentArtifactContent={setCurrentArtifactContent}
            currentArtifactType={currentArtifactType}
            setCurrentArtifactType={setCurrentArtifactType}
            handleMinimundoModalConfirm={() => {}}
            handleDiagramModalConfirm={() => {}}
            handleUseCasesModalConfirm={() => {}}
            handleRequirementsModalConfirm={() => {}}
            handleModalCancel={() => {}}
            onUpdateProjectArtifacts={() => {}}
            onWorkflowStepChange={setWorkflowCurrentStep}
            onProjectCompleted={() => {}}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </div>

      {/* Right Panel - Actions */}
      <div className="w-80 bg-card border-l border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground mb-4">Ações</h3>

          <div className="space-y-3">
            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" onClick={handlePrimaryAction}>
              <Mic className="h-4 w-4 mr-2" />
              Enviar Nova Reunião
            </Button>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Exportar Documento</h4>
              <div className="grid grid-cols-1 gap-2">
                <Button variant="outline" size="sm" className="justify-start bg-transparent">
                  <FileText className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button variant="outline" size="sm" className="justify-start bg-transparent">
                  <FileText className="h-4 w-4 mr-2" />
                  Word
                </Button>
                <Button variant="outline" size="sm" className="justify-start bg-transparent">
                  <FileText className="h-4 w-4 mr-2" />
                  Markdown
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto p-4 border-t border-border">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteModule}
            className="w-full flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Deletar Módulo
          </Button>
        </div>
      </div>

      {/* Modals */}
      <DeleteConfirmationModal
        isOpen={showDeleteModuleConfirmModal}
        onClose={() => setShowDeleteModuleConfirmModal(false)}
        onConfirm={confirmDeleteModule}
        title="Confirmar Exclusão do Módulo"
        description="Tem certeza de que deseja apagar este módulo? Todas as versões e dados associados serão perdidos. Esta ação não pode ser desfeita."
      />
      <MeetingUploadModal
        isOpen={showMeetingUploadModal}
        onClose={() => setShowMeetingUploadModal(false)}
        onSubmit={handleMeetingUpload}
        moduleName={currentModule.name}
      />
    </div>
  )
}
