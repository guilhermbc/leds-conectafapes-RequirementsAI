"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Github,
  GitBranch,
  Settings2,
  Key,
  Database,
  Shield,
  Trash2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react"
import { useState } from "react"

export default function SettingsPage() {
  const [githubConnected, setGithubConnected] = useState(false)
  const [autoSync, setAutoSync] = useState(true)
  const [selectedRepo, setSelectedRepo] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [currentBranch, setCurrentBranch] = useState("main")

  // Mock data for connected repository
  const connectedRepo = {
    name: "meu-projeto-requirements",
    owner: "usuario",
    url: "https://github.com/usuario/meu-projeto-requirements",
    lastSync: "2024-01-15T10:30:00Z",
    branches: ["main", "develop", "feature/new-requirements"],
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="backdrop-blur-xl bg-card/95 border-b border-border shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              
              <h1 className="text-xl font-semibold text-foreground">Configurações</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="grid gap-6">
          <Card className="bg-card backdrop-blur-sm border-border shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Github className="h-5 w-5" />
                Integração GitHub
              </CardTitle>
              <CardDescription>Conecte e gerencie seu repositório GitHub para controle de versões</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status da conexão */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {githubConnected ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  )}
                  <div>
                    <p className="font-medium">{githubConnected ? "GitHub Conectado" : "GitHub Desconectado"}</p>
                    <p className="text-sm text-muted-foreground">
                      {githubConnected
                        ? `Conectado ao repositório: ${connectedRepo.owner}/${connectedRepo.name}`
                        : "Configure sua API key para conectar"}
                    </p>
                  </div>
                </div>
                <Badge variant={githubConnected ? "default" : "secondary"}>
                  {githubConnected ? "Ativo" : "Inativo"}
                </Badge>
              </div>

              {/* Configuração da API Key */}
              <div className="space-y-2">
                <Label htmlFor="github-token" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  GitHub Personal Access Token
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="github-token"
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <Button onClick={() => setGithubConnected(!!apiKey)} disabled={!apiKey}>
                    {githubConnected ? "Atualizar" : "Conectar"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Crie um token em{" "}
                  <a
                    href="https://github.com/settings/tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    GitHub Settings
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </p>
              </div>

              {githubConnected && (
                <>
                  {/* Repositório conectado */}
                  <div className="space-y-2">
                    <Label>Repositório Conectado</Label>
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Github className="h-4 w-4" />
                        <span className="font-medium">
                          {connectedRepo.owner}/{connectedRepo.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={connectedRepo.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Ver no GitHub
                          </a>
                        </Button>
                        <Button variant="outline" size="sm">
                          Alterar Repo
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Controle de Branch */}
                  <div className="space-y-2">
                    <Label htmlFor="branch-select" className="flex items-center gap-2">
                      <GitBranch className="h-4 w-4" />
                      Branch Ativa
                    </Label>
                    <Select value={currentBranch} onValueChange={setCurrentBranch}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {connectedRepo.branches.map((branch) => (
                          <SelectItem key={branch} value={branch}>
                            {branch}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Configurações de Sincronização */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="auto-sync">Sincronização Automática</Label>
                        <p className="text-sm text-muted-foreground">
                          Sincronizar alterações automaticamente com o GitHub
                        </p>
                      </div>
                      <Switch id="auto-sync" checked={autoSync} onCheckedChange={setAutoSync} />
                    </div>
                  </div>

                  {/* Ações do Repositório */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                      <GitBranch className="h-4 w-4" />
                      Criar Nova Branch
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                      <Database className="h-4 w-4" />
                      Sincronizar Agora
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                      <ExternalLink className="h-4 w-4" />
                      Ver Commits
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card backdrop-blur-sm border-border shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                Configurações Gerais
              </CardTitle>
              <CardDescription>Configurações básicas da aplicação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="export-format">Formato de exportação padrão</Label>
                <Select defaultValue="pdf">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="docx">Word (DOCX)</SelectItem>
                    <SelectItem value="md">Markdown</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Segurança */}
          <Card className="bg-card backdrop-blur-sm border-border shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Segurança
              </CardTitle>
              <CardDescription>Configurações de segurança e tokens de acesso</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline">Gerenciar Tokens de API</Button>
              <Button variant="outline">Revogar Acesso GitHub</Button>
            </CardContent>
          </Card>

          <Card className="bg-card backdrop-blur-sm border-destructive/20 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                Zona de Perigo
              </CardTitle>
              <CardDescription>Ações irreversíveis - use com cuidado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="text-destructive border-destructive/20 hover:bg-destructive/10 bg-transparent"
              >
                Desconectar GitHub
              </Button>
              <Button
                variant="outline"
                className="text-destructive border-destructive/20 hover:bg-destructive/10 bg-transparent"
              >
                Limpar todos os projetos
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
