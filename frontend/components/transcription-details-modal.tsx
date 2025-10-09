"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, Mic, FileText, Eye, Send } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { MeetingTranscription, ProjectArtifact } from "@/lib/data"

interface TranscriptionDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  transcriptionData: MeetingTranscription
  onUseTranscription: (content: string) => void
  onViewArtifacts: (transcription: MeetingTranscription) => void
  onOpenArtifactFromTranscription: (type: ProjectArtifact["type"], content: string | any) => void // New prop
}

export default function TranscriptionDetailsModal({
  isOpen,
  onClose,
  transcriptionData,
  onUseTranscription,
  onViewArtifacts,
  onOpenArtifactFromTranscription, // Use the new prop
}: TranscriptionDetailsModalProps) {
  const summarizeText = (text: string, maxLength = 300) => {
    if (!text) return "Nenhum conteúdo disponível."
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
  }

  const renderDiagram = (diagramData: any) => {
    if (!diagramData || !diagramData.classes || diagramData.classes.length === 0) {
      return <p className="text-gray-500">Nenhum diagrama disponível.</p>
    }
    return (
      <div className="relative bg-white rounded-lg border border-gray-200 p-2 min-h-[100px] overflow-auto">
        <svg width="100%" height="100" className="absolute inset-0">
          {diagramData.classes.slice(0, 2).map((cls: any, index: number) => {
            const positions = [
              { x: 10, y: 10 },
              { x: 150, y: 10 },
            ]
            const pos = positions[index] || { x: 10 + index * 100, y: 10 }

            return (
              <g key={index}>
                <rect x={pos.x} y={pos.y} width="80" height="60" fill="white" stroke="#3B82F6" strokeWidth="1" rx="2" />
                <rect x={pos.x} y={pos.y} width="80" height="15" fill="#3B82F6" rx="2" />
                <text x={pos.x + 40} y={pos.y + 10} textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">
                  {cls.name}
                </text>
                <text x={pos.x + 5} y={pos.y + 25} fill="#374151" fontSize="6" fontWeight="600">
                  Attrs:
                </text>
                {cls.attributes?.slice(0, 1).map((attr: string, i: number) => (
                  <text key={i} x={pos.x + 5} y={pos.y + 35 + i * 8} fill="#6B7280" fontSize="5">
                    • {attr.length > 10 ? attr.substring(0, 10) + "..." : attr}
                  </text>
                ))}
              </g>
            )
          })}
        </svg>
      </div>
    )
  }

  const handleArtifactPreviewClick = (artifactType: ProjectArtifact["type"], content: string | any) => {
    onOpenArtifactFromTranscription(artifactType, content) // Use the new prop to delegate opening
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-white">
        <DialogHeader className="border-b border-gray-200 pb-4 flex-shrink-0">
          <DialogTitle className="flex items-center gap-3 text-xl text-gray-900">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Mic className="h-5 w-5 text-purple-600" />
            </div>
            Detalhes da Transcrição: {transcriptionData.title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto py-6 px-4 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-600" /> Conteúdo da Transcrição
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg text-sm min-h-[100px] max-h-[200px] overflow-auto">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{transcriptionData.content}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>

          {transcriptionData.generatedArtifacts && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye className="h-4 w-4 text-gray-600" /> Artefatos Gerados
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div
                  className="cursor-pointer hover:bg-blue-100 rounded-lg transition-colors p-2"
                  onClick={() =>
                    handleArtifactPreviewClick("minimundo", transcriptionData.generatedArtifacts?.minimundo || "")
                  }
                >
                  <h4 className="font-semibold text-sm mb-1">Minimundo</h4>
                  <div className="bg-blue-50 border border-blue-200 p-2 rounded-lg text-xs min-h-[80px] max-h-[150px] overflow-auto">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {summarizeText(transcriptionData.generatedArtifacts.minimundo || "")}
                    </ReactMarkdown>
                  </div>
                </div>
                <div
                  className="cursor-pointer hover:bg-blue-100 rounded-lg transition-colors p-2"
                  onClick={() =>
                    handleArtifactPreviewClick("diagram", transcriptionData.generatedArtifacts?.diagram || null)
                  }
                >
                  <h4 className="font-semibold text-sm mb-1">Diagrama de Classes</h4>
                  {renderDiagram(transcriptionData.generatedArtifacts.diagram)}
                </div>
                <div
                  className="cursor-pointer hover:bg-blue-100 rounded-lg transition-colors p-2"
                  onClick={() =>
                    handleArtifactPreviewClick("use-cases", transcriptionData.generatedArtifacts?.useCases || "")
                  }
                >
                  <h4 className="font-semibold text-sm mb-1">Casos de Uso</h4>
                  <div className="bg-blue-50 border border-blue-200 p-2 rounded-lg text-xs min-h-[80px] max-h-[150px] overflow-auto">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {summarizeText(transcriptionData.generatedArtifacts.useCases || "")}
                    </ReactMarkdown>
                  </div>
                </div>
                <div
                  className="cursor-pointer hover:bg-blue-100 rounded-lg transition-colors p-2"
                  onClick={() =>
                    handleArtifactPreviewClick("requirements", transcriptionData.generatedArtifacts?.requirements || "")
                  }
                >
                  <h4 className="font-semibold text-sm mb-1">Documento de Requisitos</h4>
                  <div className="bg-blue-50 border border-blue-200 p-2 rounded-lg text-xs min-h-[80px] max-h-[150px] overflow-auto">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {summarizeText(transcriptionData.generatedArtifacts.requirements || "")}
                    </ReactMarkdown>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="flex justify-end border-t border-gray-200 pt-4 flex-shrink-0 gap-3">
          <Button variant="outline" onClick={onClose} className="flex items-center gap-2 bg-transparent">
            <X className="h-4 w-4" />
            Fechar
          </Button>
          <Button
            onClick={() => onUseTranscription(transcriptionData.content)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
          >
            <Send className="h-4 w-4" />
            Usar para Nova Análise
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
