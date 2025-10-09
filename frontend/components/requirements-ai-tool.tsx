"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Upload,
  Mic,
  FileText,
  Send,
  Loader2,
  History,
  GitBranch,
  Database,
  Users,
  BookOpen,
  Calendar,
  FileJson,
  Search,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import MinimundoModal from "@/components/minimundo-modal"
import DiagramModal from "@/components/diagram-modal"
import FinalDocumentView from "@/components/final-document-view"
import UseCasesModal from "@/components/use-cases-modal" // New modal for Use Cases
import RequirementsDocumentModal from "@/components/requirements-document-modal" // New modal for Requirements Document
import { projects } from "@/lib/data"
import { useRouter } from "next/navigation"

interface RequirementsAIToolProps {
  onBack: () => void
}

type WorkflowStep = "input" | "minimundo" | "diagram" | "final"

interface ProjectVersion {
  id: string
  version: string
  date: string
  status: "draft" | "review" | "approved"
}

interface ProjectArtifact {
  type: "minimundo" | "diagram" | "use-cases" | "requirements"
  title: string
  preview: string
  lastModified: string
  content: string | any // Content can be string (markdown) or object (diagram)
}

interface MeetingTranscription {
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

export default function RequirementsAITool({ onBack }: RequirementsAIToolProps) {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>("input")
  const [inputText, setInputText] = useState("")
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [minimundoData, setMinimundoData] = useState("")
  const [diagramData, setDiagramData] = useState<any>(null)
  const [finalDocument, setFinalDocument] = useState("")
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // State for modals
  const [showMinimundoModal, setShowMinimundoModal] = useState(false)
  const [showDiagramModal, setShowDiagramModal] = useState(false)
  const [showUseCasesModal, setShowUseCasesModal] = useState(false)
  const [showRequirementsModal, setShowRequirementsModal] = useState(false)

  const [currentArtifactContent, setCurrentArtifactContent] = useState<string | any>(null)
  const [currentArtifactType, setCurrentArtifactType] = useState<ProjectArtifact["type"] | null>(null)

  const router = useRouter()

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(selectedProject?.toLowerCase() || "") ||
      project.description.toLowerCase().includes(selectedProject?.toLowerCase() || "") ||
      project.tags.some((tag) => tag.toLowerCase().includes(selectedProject?.toLowerCase() || "")),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "review":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
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
        return FileJson // Fallback icon
    }
  }

  const AppSidebar = () => (
    <Sidebar className="border-r border-gray-200 bg-white w-72">
      <SidebarHeader className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">RequirementsAI</h2>
            <p className="text-xs text-gray-500">Gerador de Requisitos</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2 text-gray-700 font-medium mb-4 px-2">
            <History className="h-4 w-4" />
            Histórico de Projetos
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="mb-4 px-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar projetos..."
                  className="pl-9"
                  value={selectedProject || ""}
                  onChange={(e) => setSelectedProject(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-3">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <Card
                    key={project.id}
                    className="cursor-pointer hover:shadow-md transition-shadow border border-gray-200"
                    onClick={() => router.push(`/requirements-ai/${project.id}`)}
                  >
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1">{project.name}</h3>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{project.description}</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {project.tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs px-2 py-0.5">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {project.lastModified}
                        </span>
                        <span className="flex items-center gap-1">
                          <GitBranch className="h-3 w-3" />v
                          {project.versions[project.versions.length - 1]?.version || "N/A"}
                        </span>
                        {project.versions.length > 0 && (
                          <Badge
                            className={`text-xs px-2 py-0.5 ${getStatusColor(project.versions[project.versions.length - 1].status)}`}
                          >
                            {project.versions[project.versions.length - 1].status === "draft" && "Rascunho"}
                            {project.versions[project.versions.length - 1].status === "review" && "Em Revisão"}
                            {project.versions[project.versions.length - 1].status === "approved" && "Aprovado"}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p>Nenhum projeto encontrado.</p>
                </div>
              )}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setAudioFile(file)
    }
  }

  const handleRecording = () => {
    setIsRecording(!isRecording)
  }

  const handleSubmit = async () => {
    if (!inputText && !audioFile && !isRecording) return

    setIsProcessing(true)

    setTimeout(() => {
      setMinimundoData(`O sistema proposto é uma plataforma de gerenciamento de projetos que permite aos usuários criar, organizar e acompanhar o progresso de suas tarefas e projetos. 

O sistema deve permitir que usuários se cadastrem e façam login de forma segura. Cada usuário pode criar múltiplos projetos, onde cada projeto pode conter várias tarefas organizadas em diferentes status (pendente, em andamento, concluído).

As tarefas devem ter informações como título, descrição, data de vencimento, prioridade e responsável. O sistema deve enviar notificações automáticas para lembrar os usuários sobre prazos próximos.

Além disso, o sistema deve gerar relatórios de produtividade e permitir a colaboração entre membros da equipe através de comentários e anexos nas tarefas.`)

      setCurrentStep("minimundo")
      setIsProcessing(false)
    }, 2000)
  }

  const handleMinimundoConfirm = (data: string) => {
    setMinimundoData(data)
    setIsProcessing(true)

    setTimeout(() => {
      setDiagramData({
        classes: [
          {
            name: "User",
            attributes: ["id", "name", "email", "password"],
            methods: ["login()", "logout()", "updateProfile()"],
          },
          {
            name: "Project",
            attributes: ["id", "title", "description", "createdAt"],
            methods: ["create()", "update()", "delete()", "addTask()"],
          },
          {
            name: "Task",
            attributes: ["id", "title", "description", "status", "priority", "dueDate"],
            methods: ["create()", "update()", "changeStatus()"],
          },
        ],
      })
      setCurrentStep("diagram")
      setIsProcessing(false)
    }, 2000)
  }

  const handleDiagramConfirm = (data: any) => {
    setDiagramData(data)
    setIsProcessing(true)

    setTimeout(() => {
      setFinalDocument(`# Documento de Requisitos - Sistema de Gerenciamento de Projetos

## 1. Introdução
${minimundoData}

## 2. Casos de Uso
- Cadastrar usuário
- Fazer login
- Criar projeto
- Gerenciar tarefas

## 3. Requisitos Funcionais

### RF001 - Autenticação de Usuários
O sistema deve permitir que usuários se cadastrem e façam login de forma segura.

### RF002 - Gerenciamento de Projetos
O sistema deve permitir criar, editar e excluir projetos.

### RF003 - Gerenciamento de Tarefas
O sistema deve permitir criar, editar e excluir tarefas dentro dos projetos.

## 4. Requisitos Não Funcionais

### RNF001 - Segurança
O sistema deve criptografar senhas e usar HTTPS.

### RNF002 - Performance
O sistema deve responder em menos de 2 segundos.`)

      setCurrentStep("final")
      setIsProcessing(false)
    }, 2000)
  }

  const handleArtifactClick = (artifact: ProjectArtifact) => {
    setCurrentArtifactContent(artifact.content)
    setCurrentArtifactType(artifact.type)
    switch (artifact.type) {
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
      default:
        break
    }
  }

  const handleModalConfirm = (updatedContent: string | any) => {
    // In a real app, you'd save this to a backend and update the project state
    console.log(`Content updated for ${currentArtifactType}:`, updatedContent)
    // For now, just close the modal
    setShowMinimundoModal(false)
    setShowDiagramModal(false)
    setShowUseCasesModal(false)
    setShowRequirementsModal(false)
    setCurrentArtifactContent(null)
    setCurrentArtifactType(null)
  }

  const handleModalCancel = () => {
    setShowMinimundoModal(false)
    setShowDiagramModal(false)
    setShowUseCasesModal(false)
    setShowRequirementsModal(false)
    setCurrentArtifactContent(null)
    setCurrentArtifactType(null)
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={onBack}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar ao Portal
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-gray-900">Gerador de Requisitos</h1>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-8 pl-[18rem] overflow-auto">
            {" "}
            {/* Adjusted padding-left */}
            {currentStep === "input" && (
              <div className="w-full max-w-6xl mx-auto">
                <div className="mb-10 text-center">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Nova Análise de Requisitos</h2>
                  <p className="text-lg text-gray-600 max-w-4xl mx-auto">
                    Forneça informações sobre seu projeto através de áudio, texto ou gravação ao vivo para gerar
                    documentação completa de requisitos
                  </p>
                </div>

                <Card className="bg-white border border-gray-200 shadow-lg max-w-4xl mx-auto">
                  <CardHeader className="border-b border-gray-100 bg-gray-50">
                    <CardTitle className="text-xl font-semibold text-gray-900 text-center">
                      Material de Entrada
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Upload de Áudio */}
                      <div className="space-y-4">
                        <Label className="text-sm font-medium text-gray-700">Upload de Áudio</Label>
                        <div className="flex gap-3">
                          <Input
                            ref={fileInputRef}
                            type="file"
                            accept=".wav,.mp3,.mp4"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <Button
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 h-11"
                          >
                            <Upload className="h-4 w-4" />
                            Escolher Arquivo
                          </Button>
                          {audioFile && (
                            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                              <span>✓</span>
                              <span>{audioFile.name}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">Formatos aceitos: .wav, .mp3, .mp4 (máx. 50MB)</p>
                      </div>

                      {/* Gravação ao Vivo */}
                      <div className="space-y-4">
                        <Label className="text-sm font-medium text-gray-700">Gravar Reunião ao Vivo</Label>
                        <div className="flex items-center gap-3">
                          <Button
                            variant={isRecording ? "destructive" : "outline"}
                            onClick={handleRecording}
                            className="flex items-center gap-2 h-11"
                          >
                            <Mic className="h-4 w-4" />
                            {isRecording ? "Parar Gravação" : "Iniciar Gravação"}
                          </Button>
                          {isRecording && (
                            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
                              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                              <span>Gravando...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Campo de Texto - Reduzido */}
                    <div className="space-y-4">
                      <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                        Notas Textuais
                      </Label>
                      <Textarea
                        id="notes"
                        placeholder="Descreva seu projeto, funcionalidades desejadas, regras de negócio..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="min-h-[180px] resize-none text-base"
                      />
                    </div>

                    {/* Botão Enviar */}
                    <div className="pt-6">
                      <Button
                        onClick={handleSubmit}
                        disabled={(!inputText && !audioFile && !isRecording) || isProcessing}
                        className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-lg font-medium"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                            Processando...
                          </>
                        ) : (
                          <>
                            <Send className="mr-3 h-6 w-6" />
                            Começar Análise
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            {currentStep === "final" && (
              <FinalDocumentView
                document={finalDocument}
                onNewProject={() => {
                  setCurrentStep("input")
                  setInputText("")
                  setAudioFile(null)
                  setMinimundoData("")
                  setDiagramData(null)
                  setFinalDocument("")
                }}
              />
            )}
          </main>
        </div>
      </div>

      {/* Modais */}
      <MinimundoModal
        isOpen={showMinimundoModal}
        data={currentArtifactContent}
        isProcessing={isProcessing}
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
      />

      <DiagramModal
        isOpen={showDiagramModal}
        data={currentArtifactContent}
        isProcessing={isProcessing}
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
      />

      <UseCasesModal
        isOpen={showUseCasesModal}
        data={currentArtifactContent}
        isProcessing={isProcessing}
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
      />

      <RequirementsDocumentModal
        isOpen={showRequirementsModal}
        data={currentArtifactContent}
        isProcessing={isProcessing}
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
      />
    </SidebarProvider>
  )
}
