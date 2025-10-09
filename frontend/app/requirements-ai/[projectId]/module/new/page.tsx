"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { projects, type ProjectModule } from "@/lib/data"
import Breadcrumb from "@/components/breadcrumb"

interface NewModulePageProps {
  params: {
    projectId: string
  }
}

export default function NewModulePage({ params }: NewModulePageProps) {
  const { projectId } = params
  const [moduleName, setModuleName] = useState("")
  const [moduleDescription, setModuleDescription] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()

  const currentProject = projects.find((p) => p.id === projectId)

  const handleCreateModule = async () => {
    if (!moduleName.trim() || !currentProject || isCreating) return

    setIsCreating(true)

    try {
      const newModule: ProjectModule = {
        id: `module_${Date.now()}`,
        name: moduleName,
        description: moduleDescription,
        createdAt: new Date().toISOString().split("T")[0],
        lastModified: new Date().toISOString().split("T")[0],
        versions: [],
        transcriptions: [],
        tags: [],
      }

      await new Promise((resolve) => setTimeout(resolve, 1000))

      const projectIndex = projects.findIndex((p) => p.id === projectId)
      if (projectIndex !== -1) {
        if (!projects[projectIndex].modules) {
          projects[projectIndex].modules = []
        }
        projects[projectIndex].modules = [...projects[projectIndex].modules, newModule]
      }

      router.push(`/requirements-ai/${projectId}/module/${newModule.id}`)
    } catch (error) {
      console.error("Erro ao criar módulo:", error)
      setIsCreating(false)
    }
  }

  if (!currentProject) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Projeto não encontrado</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border py-4 px-6 flex-shrink-0">
        <div className="container mx-auto">
          <Breadcrumb
            items={[
              {
                label: currentProject.name,
                href: `/requirements-ai/${projectId}`,
              },
              { label: "Novo Módulo" },
            ]}
          />
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground">Criar Novo Módulo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="moduleName" className="text-sm font-medium text-foreground">
                  Nome do Módulo
                </Label>
                <Input
                  id="moduleName"
                  placeholder="Ex: Sistema de Autenticação"
                  value={moduleName}
                  onChange={(e) => setModuleName(e.target.value)}
                  className="text-base"
                  disabled={isCreating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="moduleDescription" className="text-sm font-medium text-foreground">
                  Descrição do Módulo
                </Label>
                <Textarea
                  id="moduleDescription"
                  placeholder="Descreva o propósito e funcionalidades deste módulo..."
                  value={moduleDescription}
                  onChange={(e) => setModuleDescription(e.target.value)}
                  className="min-h-[100px] resize-none text-base"
                  disabled={isCreating}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/requirements-ai/${projectId}`)}
                  className="flex-1"
                  disabled={isCreating}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateModule}
                  disabled={!moduleName.trim() || isCreating}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  {isCreating ? "Criando..." : "Criar Módulo"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
