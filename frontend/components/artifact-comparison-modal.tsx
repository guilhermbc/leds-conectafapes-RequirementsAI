"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { GitCompare, CheckCircle, RefreshCcw, Merge } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Artifacts {
  minimundo: string
  diagram: any
  useCases: string
  requirements: string
}

interface ArtifactComparisonModalProps {
  isOpen: boolean
  onClose: () => void
  currentArtifacts: Artifacts
  newArtifacts: Artifacts
  onDecision: (decision: "keep_old" | "update_new" | "merge") => void
}

export default function ArtifactComparisonModal({
  isOpen,
  onClose,
  currentArtifacts,
  newArtifacts,
  onDecision,
}: ArtifactComparisonModalProps) {
  const renderDiagram = (diagramData: any) => {
    if (!diagramData || !diagramData.classes || diagramData.classes.length === 0) {
      return <p className="text-gray-500">Nenhum diagrama disponível.</p>
    }
    return (
      <div className="relative bg-white rounded-lg border border-gray-200 p-4 min-h-[150px] overflow-auto">
        <svg width="100%" height="150" className="absolute inset-0">
          {diagramData.classes.slice(0, 2).map((cls: any, index: number) => {
            const positions = [
              { x: 20, y: 20 },
              { x: 250, y: 20 },
            ]
            const pos = positions[index] || { x: 20 + index * 150, y: 20 }

            return (
              <g key={index}>
                <rect
                  x={pos.x}
                  y={pos.y}
                  width="120"
                  height="80"
                  fill="white"
                  stroke="#3B82F6"
                  strokeWidth="1"
                  rx="4"
                />
                <rect x={pos.x} y={pos.y} width="120" height="20" fill="#3B82F6" rx="4" />
                <text x={pos.x + 60} y={pos.y + 14} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
                  {cls.name}
                </text>
                <text x={pos.x + 5} y={pos.y + 35} fill="#374151" fontSize="8" fontWeight="600">
                  Attrs:
                </text>
                {cls.attributes?.slice(0, 1).map((attr: string, i: number) => (
                  <text key={i} x={pos.x + 5} y={pos.y + 45 + i * 10} fill="#6B7280" fontSize="7">
                    • {attr.length > 15 ? attr.substring(0, 15) + "..." : attr}
                  </text>
                ))}
                <text x={pos.x + 5} y={pos.y + 65} fill="#374151" fontSize="8" fontWeight="600">
                  Methods:
                </text>
                {cls.methods?.slice(0, 1).map((method: string, i: number) => (
                  <text key={i} x={pos.x + 5} y={pos.y + 75} fill="#6B7280" fontSize="7">
                    • {method.length > 15 ? method.substring(0, 15) + "..." : method}
                  </text>
                ))}
              </g>
            )
          })}
        </svg>
      </div>
    )
  }

  const summarizeText = (text: string, maxLength = 500) => {
    if (!text) return "Nenhum conteúdo disponível."
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col bg-white">
        <DialogHeader className="border-b border-gray-200 pb-4 flex-shrink-0">
          <DialogTitle className="flex items-center gap-3 text-xl text-gray-900">
            <div className="p-2 bg-orange-50 rounded-lg">
              <GitCompare className="h-5 w-5 text-orange-600" />
            </div>
            Comparar Artefatos de Requisitos
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto py-6 grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Versão Atual</h3>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Minimundo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg text-sm min-h-[80px] overflow-auto">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{summarizeText(currentArtifacts.minimundo)}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Diagrama de Classes</CardTitle>
              </CardHeader>
              <CardContent>{renderDiagram(currentArtifacts.diagram)}</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Casos de Uso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg text-sm min-h-[80px] overflow-auto">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{summarizeText(currentArtifacts.useCases)}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Documento de Requisitos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg text-sm min-h-[80px] overflow-auto">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {summarizeText(currentArtifacts.requirements)}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Nova Reunião</h3>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Minimundo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm min-h-[80px] overflow-auto">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{summarizeText(newArtifacts.minimundo)}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Diagrama de Classes</CardTitle>
              </CardHeader>
              <CardContent>{renderDiagram(newArtifacts.diagram)}</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Casos de Uso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm min-h-[80px] overflow-auto">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{summarizeText(newArtifacts.useCases)}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Documento de Requisitos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm min-h-[80px] overflow-auto">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{summarizeText(newArtifacts.requirements)}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter className="flex justify-end border-t border-gray-200 pt-4 flex-shrink-0 gap-3">
          <Button
            variant="outline"
            onClick={() => onDecision("keep_old")}
            className="flex items-center gap-2 bg-transparent"
          >
            <RefreshCcw className="h-4 w-4" />
            Manter versão anterior
          </Button>
          <Button
            onClick={() => onDecision("update_new")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <CheckCircle className="h-4 w-4" />
            Atualizar com a nova
          </Button>
          <Button
            onClick={() => onDecision("merge")}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
          >
            <Merge className="h-4 w-4" />
            Mesclar (WIP)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
