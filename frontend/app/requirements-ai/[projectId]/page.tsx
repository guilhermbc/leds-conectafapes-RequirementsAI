"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Calendar, Plus, Search, X, Settings, ChevronDown, Trash2, Pencil } from "lucide-react"
import { projects, type HistoryProject, type ProjectModule } from "@/lib/data"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { formatDate } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import DeleteConfirmationModal from "@/components/delete-confirmation-modal"
import Link from "next/link"

interface ProjectModulesPageProps {
  params: {
    projectId: string
  }
}

export default function ProjectModulesPage({ params }: ProjectModulesPageProps) {
  const { projectId } = params
  const [currentProject, setCurrentProject] = useState<HistoryProject | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOrder, setSortOrder] = useState<"recent" | "alphabetical" | "oldest">("recent")
  const [showDeleteModuleModal, setShowDeleteModuleModal] = useState(false)
  const [moduleToDelete, setModuleToDelete] = useState<string | null>(null)
  const [showDeleteProjectModal, setShowDeleteProjectModal] = useState(false)
  const [isEditingProject, setIsEditingProject] = useState(false)
  const [editedProjectName, setEditedProjectName] = useState("")
  const [editedProjectDescription, setEditedProjectDescription] = useState("")
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null)
  const [editedModuleName, setEditedModuleName] = useState("")
  const [editedModuleDescription, setEditedModuleDescription] = useState("")
  const router = useRouter()

  useEffect(() => {
    const project = projects.find((p) => p.id === projectId)
    if (project) {
      setCurrentProject(project)
      setEditedProjectName(project.name)
      setEditedProjectDescription(project.description)
    }
  }, [projectId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-600 text-green-100 border-green-500"
      case "review":
        return "bg-yellow-600 text-yellow-100 border-yellow-500"
      case "draft":
        return "bg-gray-600 text-gray-100 border-gray-500"
      default:
        return "bg-gray-600 text-gray-100 border-gray-500"
    }
  }

  const filteredModules =
    currentProject?.modules.filter(
      (module) =>
        module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.description.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || []

  const sortedModules = [...filteredModules].sort((a, b) => {
    switch (sortOrder) {
      case "alphabetical":
        return a.name.localeCompare(b.name)
      case "oldest":
        return new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime()
      case "recent":
      default:
        return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    }
  })

  const getSortLabel = () => {
    switch (sortOrder) {
      case "alphabetical":
        return "Ordem alfabética"
      case "oldest":
        return "Mais antigo"
      case "recent":
      default:
        return "Mais recentes"
    }
  }

  const handleDeleteModule = (moduleId: string) => {
    setModuleToDelete(moduleId)
    setShowDeleteModuleModal(true)
  }

  const confirmDeleteModule = () => {
    if (currentProject && moduleToDelete) {
      const updatedProject = {
        ...currentProject,
        modules: currentProject.modules.filter((m) => m.id !== moduleToDelete),
      }

      const projectIndex = projects.findIndex((p) => p.id === projectId)
      if (projectIndex !== -1) {
        projects[projectIndex] = updatedProject
      }

      setCurrentProject(updatedProject)
    }
    setShowDeleteModuleModal(false)
    setModuleToDelete(null)
  }

  const handleDeleteProject = () => {
    setShowDeleteProjectModal(true)
  }

  const confirmDeleteProject = () => {
    const projectIndex = projects.findIndex((p) => p.id === projectId)
    if (projectIndex !== -1) {
      projects.splice(projectIndex, 1)
    }
    setShowDeleteProjectModal(false)
    router.push("/")
  }

  const handleEditProject = () => {
    setIsEditingProject(true)
  }

  const handleSaveProject = () => {
    if (currentProject && editedProjectName.trim()) {
      const updatedProject = {
        ...currentProject,
        name: editedProjectName.trim(),
        description: editedProjectDescription.trim(),
      }

      const projectIndex = projects.findIndex((p) => p.id === projectId)
      if (projectIndex !== -1) {
        projects[projectIndex] = updatedProject
      }

      setCurrentProject(updatedProject)
      setIsEditingProject(false)
    }
  }

  const handleCancelEditProject = () => {
    if (currentProject) {
      setEditedProjectName(currentProject.name)
      setEditedProjectDescription(currentProject.description)
    }
    setIsEditingProject(false)
  }

  const handleEditModule = (module: ProjectModule) => {
    setEditingModuleId(module.id)
    setEditedModuleName(module.name)
    setEditedModuleDescription(module.description)
  }

  const handleSaveModule = () => {
    if (currentProject && editingModuleId && editedModuleName.trim()) {
      const updatedProject = {
        ...currentProject,
        modules: currentProject.modules.map((m) =>
          m.id === editingModuleId
            ? {
                ...m,
                name: editedModuleName.trim(),
                description: editedModuleDescription.trim(),
              }
            : m,
        ),
      }

      const projectIndex = projects.findIndex((p) => p.id === projectId)
      if (projectIndex !== -1) {
        projects[projectIndex] = updatedProject
      }

      setCurrentProject(updatedProject)
      setEditingModuleId(null)
      setEditedModuleName("")
      setEditedModuleDescription("")
    }
  }

  const handleCancelEditModule = () => {
    setEditingModuleId(null)
    setEditedModuleName("")
    setEditedModuleDescription("")
  }

  const handleCreateNewModule = () => {
    router.push(`/requirements-ai/${projectId}/module/new`)
  }

  if (!currentProject) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando projeto...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border shadow-sm sticky top-0 z-50 bg-[rgba(0,0,0,1)]">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
                <h1 className="text-2xl font-bold text-primary">REQUIREMENTSAI</h1>
              </Link>

              <nav className="hidden md:flex items-center gap-6">
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                  Todos os projetos
                </Link>
                <span className="text-foreground font-medium">{currentProject.name}</span>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <span className="text-sm">{getSortLabel()}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setSortOrder("recent")}>Mais recentes</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOrder("alphabetical")}>Ordem alfabética</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOrder("oldest")}>Mais antigo</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                asChild
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <Link href="/settings">
                  <Settings className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              {isEditingProject ? (
                <div className="border border-border rounded-lg p-4 bg-card/50">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Input
                        value={editedProjectName}
                        onChange={(e) => setEditedProjectName(e.target.value)}
                        className="text-2xl font-semibold bg-background border-border"
                        placeholder="Nome do projeto"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveProject} disabled={!editedProjectName.trim()}>
                          Salvar
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEditProject}>
                          Cancelar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleDeleteProject}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <textarea
                      value={editedProjectDescription}
                      onChange={(e) => setEditedProjectDescription(e.target.value)}
                      className="w-full p-2 text-muted-foreground bg-background border border-border rounded resize-none"
                      placeholder="Descrição do projeto"
                      rows={2}
                    />
                  </div>
                </div>
              ) : (
                <div className="border border-border/50 rounded-lg p-4 bg-card/20 hover:bg-card/40 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h2 className="text-2xl font-semibold text-foreground">{currentProject.name}</h2>
                      <p className="text-muted-foreground mt-1">{currentProject.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={handleEditProject}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Pesquisar módulos..."
                className="pl-10 pr-10 bg-input border-border text-foreground placeholder-muted-foreground focus:border-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <Card className="bg-card border-border border-dashed hover:bg-accent hover:border-primary transition-all duration-300 cursor-pointer group">
              <CardContent
                className="flex flex-col items-center justify-center p-8 text-center h-48"
                onClick={handleCreateNewModule}
              >
                <div className="w-12 h-12 flex items-center justify-center mb-4 group-hover:text-primary transition-colors">
                  <Plus className="h-8 w-8 text-muted-foreground group-hover:text-primary" />
                </div>
                <h3 className="text-foreground font-medium mb-2 group-hover:text-primary transition-colors">
                  Criar novo módulo
                </h3>
                <p className="text-muted-foreground text-sm group-hover:text-primary/80 transition-colors">
                  Adicione um novo módulo ao projeto
                </p>
              </CardContent>
            </Card>

            {sortedModules.length > 0 ? (
              sortedModules.map((module: ProjectModule) => (
                <Card
                  key={module.id}
                  className="bg-card border-border hover:bg-accent transition-all duration-300 cursor-pointer group relative"
                >
                  <CardContent className="p-4 h-48 flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-shrink-0">
                        {module.versions.length > 0 && (
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(module.versions[module.versions.length - 1].status)}`}
                          >
                            v{module.versions[module.versions.length - 1].version}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-primary"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditModule(module)
                          }}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteModule(module.id)
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {editingModuleId === module.id ? (
                      <div className="flex-1 flex flex-col space-y-2">
                        <Input
                          value={editedModuleName}
                          onChange={(e) => setEditedModuleName(e.target.value)}
                          className="font-semibold"
                          placeholder="Nome do módulo"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <textarea
                          value={editedModuleDescription}
                          onChange={(e) => setEditedModuleDescription(e.target.value)}
                          className="flex-1 p-2 text-sm bg-background border border-border rounded resize-none"
                          placeholder="Descrição do módulo"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex gap-2 mt-auto">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSaveModule()
                            }}
                            disabled={!editedModuleName.trim()}
                          >
                            Salvar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCancelEditModule()
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Link href={`/requirements-ai/${projectId}/module/${module.id}`} className="flex-1 flex flex-col">
                        <h3 className="text-foreground font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {module.name}
                        </h3>

                        <p className="text-muted-foreground text-sm line-clamp-2 mb-auto">{module.description}</p>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(module.lastModified)}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {module.versions.length} versões
                          </span>
                        </div>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <p className="text-lg">
                  {searchQuery ? `Nenhum módulo encontrado para "${searchQuery}".` : "Nenhum módulo criado ainda."}
                </p>
                <p className="text-sm">
                  {searchQuery ? "Tente ajustar sua pesquisa." : "Clique em 'Criar novo módulo' para começar."}
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      <DeleteConfirmationModal
        isOpen={showDeleteModuleModal}
        onClose={() => setShowDeleteModuleModal(false)}
        onConfirm={confirmDeleteModule}
        title="Confirmar Exclusão do Módulo"
        description="Tem certeza de que deseja apagar este módulo? Todas as versões e dados associados serão perdidos. Esta ação não pode ser desfeita."
      />

      <DeleteConfirmationModal
        isOpen={showDeleteProjectModal}
        onClose={() => setShowDeleteProjectModal(false)}
        onConfirm={confirmDeleteProject}
        title="Confirmar Exclusão do Projeto"
        description="Tem certeza de que deseja apagar este projeto? Todos os módulos, versões e dados associados serão perdidos. Esta ação não pode ser desfeita."
      />
    </div>
  )
}
