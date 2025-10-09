"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, GitCommit } from "lucide-react"
import type { ArtifactUpdateHistory } from "@/lib/data"
import { formatDate } from "@/lib/utils"

interface ArtifactHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  artifactTitle: string
  history: ArtifactUpdateHistory[]
}

export function ArtifactHistoryModal({ isOpen, onClose, artifactTitle, history }: ArtifactHistoryModalProps) {
  const getChangeTypeColor = (changeType: string) => {
    switch (changeType) {
      case "created":
        return "bg-green-100 text-green-800 border-green-200"
      case "updated":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "reviewed":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "approved":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getChangeTypeLabel = (changeType: string) => {
    switch (changeType) {
      case "created":
        return "Criado"
      case "updated":
        return "Atualizado"
      case "reviewed":
        return "Revisado"
      case "approved":
        return "Aprovado"
      default:
        return changeType
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCommit className="h-5 w-5" />
            Histórico de Atualizações - {artifactTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {history.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhum histórico de atualização disponível.</p>
          ) : (
            <div className="space-y-4">
              {history
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((entry) => (
                  <div
                    key={entry.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge className={`${getChangeTypeColor(entry.changeType)} border`}>
                          {getChangeTypeLabel(entry.changeType)}
                        </Badge>
                        <span className="font-medium text-gray-900">v{entry.version}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(entry.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {entry.author}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-700 leading-relaxed">{entry.description}</p>
                  </div>
                ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
