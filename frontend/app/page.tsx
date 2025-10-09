"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GitBranch, Calendar, Plus, Search, X, Settings, ChevronDown } from "lucide-react"
import { projects, type HistoryProject } from "@/lib/data"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { formatDate } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function ProjectHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOrder, setSortOrder] = useState<"recent" | "alphabetical" | "oldest">("recent")

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

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const sortedProjects = [...filteredProjects].sort((a, b) => {
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

  const getLatestVersionStatus = (project: HistoryProject) => {
    if (!project.modules || project.modules.length === 0) return null

    let latestVersion = null
    let latestDate = ""

    project.modules.forEach((module) => {
      if (module.versions && module.versions.length > 0) {
        module.versions.forEach((version) => {
          if (!latestDate || version.date > latestDate) {
            latestDate = version.date
            latestVersion = version
          }
        })
      }
    })

    return latestVersion
  }

  const getTotalVersionsCount = (project: HistoryProject) => {
    if (!project.modules) return 0

    return project.modules.reduce((total, module) => {
      return total + (module.versions ? module.versions.length : 0)
    }, 0)
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
                <Link href="/" className="text-foreground hover:text-primary transition-colors font-medium">
                  Todos os projetos
                </Link>
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
            <h2 className="text-2xl font-semibold text-foreground">Projetos recentes</h2>
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Pesquisar projetos..."
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
              <Link href="/requirements-ai/new">
                <CardContent className="flex flex-col items-center justify-center p-8 text-center h-48">
                  <div className="w-12 h-12 flex items-center justify-center mb-4 group-hover:text-primary transition-colors">
                    <Plus className="h-8 w-8 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <h3 className="text-foreground font-medium mb-2 group-hover:text-primary transition-colors">
                    Criar novo projeto
                  </h3>
                  <p className="text-muted-foreground text-sm group-hover:text-primary/80 transition-colors">
                    Inicie uma nova análise de requisitos
                  </p>
                </CardContent>
              </Link>
            </Card>

            {sortedProjects.length > 0 ? (
              sortedProjects.map((project: HistoryProject) => {
                const latestVersion = getLatestVersionStatus(project)
                const totalVersions = getTotalVersionsCount(project)

                return (
                  <Card
                    key={project.id}
                    className="bg-card border-border hover:bg-accent transition-all duration-300 cursor-pointer group"
                  >
                    <Link href={`/requirements-ai/${project.id}`}>
                      <CardContent className="p-4 h-48 flex flex-col">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-shrink-0">
                            {latestVersion && (
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(latestVersion.status)}`}
                              >
                                v{latestVersion.version}
                              </span>
                            )}
                          </div>
                        </div>

                        <h3 className="text-foreground font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {project.name}
                        </h3>

                        <p className="text-muted-foreground text-sm line-clamp-2 mb-auto">{project.description}</p>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(project.lastModified)}
                          </span>
                          <span className="flex items-center gap-1">
                            <GitBranch className="h-3 w-3" />
                            {project.modules.length} módulos
                          </span>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                )
              })
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <p className="text-lg">Nenhum projeto encontrado para "{searchQuery}".</p>
                <p className="text-sm">Tente ajustar sua pesquisa ou crie uma nova análise.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
