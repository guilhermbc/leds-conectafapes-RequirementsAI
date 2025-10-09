"use client"
import RequirementsWorkflow from "@/components/requirements-workflow"
import { useRouter } from "next/navigation"
import { useState } from "react"
import type { HistoryProject, ProjectArtifact } from "@/lib/data"
import { projects } from "@/lib/data"
import { BookOpen, Database, Users, FileText } from "lucide-react"
import Breadcrumb from "@/components/breadcrumb"

type WorkflowStep = "input" | "processing" | "completed" | "final"

export default function NewRequirementsPage() {
  const router = useRouter()
  const [currentProject, setCurrentProject] = useState<HistoryProject | null>(null)
  const [projectName, setProjectName] = useState("")
  const [projectDescription, setProjectDescription] = useState("")

  const [showMinimundoModal, setShowMinimundoModal] = useState(false)
  const [showDiagramModal, setShowDiagramModal] = useState(false)
  const [showUseCasesModal, setShowUseCasesModal] = useState(false)
  const [showRequirementsModal, setShowRequirementsModal] = useState(false)
  const [showFullDocumentModal, setShowFullDocumentModal] = useState(false)
  const [currentArtifactContent, setCurrentArtifactContent] = useState<string | any>(null)
  const [currentArtifactType, setCurrentArtifactType] = useState<ProjectArtifact["type"] | null>(null)

  // State to track the current step of the RequirementsWorkflow component
  const [workflowCurrentStep, setWorkflowCurrentStep] = useState<WorkflowStep>("input")

  const handleGenericModalConfirm = (updatedContent: string | any) => {
    console.log(`Content updated for ${currentArtifactType}:`, updatedContent)
    setShowMinimundoModal(false)
    setShowDiagramModal(false)
    setShowUseCasesModal(false)
    setShowRequirementsModal(false)
    setShowFullDocumentModal(false)
    setCurrentArtifactContent(null)
    setCurrentArtifactType(null)
  }

  const handleModalCancel = () => {
    setShowMinimundoModal(false)
    setShowDiagramModal(false)
    setShowUseCasesModal(false)
    setShowRequirementsModal(false)
    setShowFullDocumentModal(false)
    setCurrentArtifactContent(null)
    setCurrentArtifactType(null)
  }

  const handleNewProjectStart = () => {
    const newProjectId = `proj_${Date.now()}`
    const newProject: HistoryProject = {
      id: newProjectId,
      name: projectName || "Novo Projeto de Requisitos", // Usar nome do formulário
      description: projectDescription || "Projeto gerado a partir de uma nova análise.", // Usar descrição do formulário
      createdAt: new Date().toISOString().split("T")[0],
      lastModified: new Date().toISOString().split("T")[0],
      modules: [], // Iniciar com array vazio de módulos
      transcriptions: [],
      tags: ["novo"],
    }
    projects.push(newProject)
    setCurrentProject(newProject)
  }

  const handleUpdateProjectArtifacts = (artifacts: {
    minimundo: string
    diagram: any
    useCases: string
    requirements: string
  }) => {
    if (currentProject) {
      const updatedProject = { ...currentProject }
      const newVersionId = `v${(Number.parseFloat(currentProject.versions[currentProject.versions.length - 1]?.version || "0.0") + 0.1).toFixed(1)}`
      updatedProject.versions.push({
        id: newVersionId,
        version: newVersionId.substring(1),
        date: new Date().toISOString().split("T")[0],
        status: "draft",
        artifacts: [
          {
            type: "minimundo",
            title: "Minimundo Gerado",
            preview: "Gerado na análise inicial",
            lastModified: new Date().toISOString().split("T")[0],
            content: artifacts.minimundo,
            icon: BookOpen,
          },
          {
            type: "diagram",
            title: "Diagrama de Classes",
            preview: "Gerado na análise inicial",
            lastModified: new Date().toISOString().split("T")[0],
            content: artifacts.diagram,
            icon: Database,
          },
          {
            type: "use-cases",
            title: "Casos de Uso",
            preview: "Gerado na análise inicial",
            lastModified: new Date().toISOString().split("T")[0],
            content: artifacts.useCases,
            icon: Users,
          },
          {
            type: "requirements",
            title: "Documento de Requisitos",
            preview: "Gerado na análise inicial",
            lastModified: new Date().toISOString().split("T")[0],
            content: artifacts.requirements,
            icon: FileText,
          },
        ],
      })
      setCurrentProject(updatedProject)
      const projectIndex = projects.findIndex((p) => p.id === updatedProject.id)
      if (projectIndex !== -1) {
        projects[projectIndex] = updatedProject
      }
      console.log("New project artifacts updated:", artifacts)
    }
  }

  const handleProjectCompleted = (projectId: string) => {
    if (currentProject) {
      // Update the project ID to match the generated one
      const updatedProject = { ...currentProject, id: projectId }
      const projectIndex = projects.findIndex((p) => p.id === currentProject.id)
      if (projectIndex !== -1) {
        projects[projectIndex] = updatedProject
      } else {
        projects.push(updatedProject)
      }
      setCurrentProject(updatedProject)
    }
    // Redirect to the project page
    router.push(`/requirements-ai/${projectId}`)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-card border-b border-border px-6 py-4 flex-shrink-0">
          <div className="space-y-4">
            <Breadcrumb items={[{ label: "Nova Análise" }]} />
            {/* Input fields for project name and description */}
          </div>
        </header>
        <RequirementsWorkflow
          onBackToHistory={() => router.push("/")}
          onNewProjectStart={handleNewProjectStart}
          isExistingProject={false}
          projectName={projectName}
          setProjectName={setProjectName}
          projectDescription={projectDescription}
          setProjectDescription={setProjectDescription}
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
          handleMinimundoModalConfirm={handleGenericModalConfirm}
          handleDiagramModalConfirm={handleGenericModalConfirm}
          handleUseCasesModalConfirm={handleGenericModalConfirm}
          handleRequirementsModalConfirm={handleGenericModalConfirm}
          handleModalCancel={handleModalCancel}
          onUpdateProjectArtifacts={handleUpdateProjectArtifacts}
          onWorkflowStepChange={setWorkflowCurrentStep} // Pass the state setter
          onProjectCompleted={handleProjectCompleted}
        />
      </div>
    </div>
  )
}
