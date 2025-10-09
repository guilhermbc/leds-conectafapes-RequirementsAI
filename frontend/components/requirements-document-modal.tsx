"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, FileText, Loader2, CheckCircle, RefreshCcw } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label" // Import Label

interface RequirementsDocumentModalProps {
  isOpen: boolean
  data: string
  isProcessing: boolean
  onConfirm: (updatedContent: string) => void // Used for "Usar na Versão Atual"
  onCancel: () => void // Used for "Cancelar"
  onRegenerate: (prompt: string) => void // New prop for regeneration
}

export default function RequirementsDocumentModal({
  isOpen,
  data,
  isProcessing,
  onConfirm,
  onCancel,
  onRegenerate,
}: RequirementsDocumentModalProps) {
  const [editedContent, setEditedContent] = useState(data || "")
  const [regeneratePrompt, setRegeneratePrompt] = useState("")
  const [isRegenerating, setIsRegenerating] = useState(false)

  useEffect(() => {
    setEditedContent(data || "")
    setRegeneratePrompt("") // Clear prompt when data changes
    setIsRegenerating(false) // Reset regenerating state
  }, [data])

  const handleUseInCurrentVersion = () => {
    onConfirm(editedContent)
  }

  const handleRegenerateClick = async () => {
    setIsRegenerating(true)
    await onRegenerate(regeneratePrompt)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col bg-card">
        <DialogHeader className="border-b border-border pb-4 flex-shrink-0">
          <DialogTitle className="flex items-center gap-3 text-xl text-foreground">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            Documento de Requisitos
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto py-6 space-y-4">
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p>Gerando Documento de Requisitos...</p>
            </div>
          ) : (
            <>
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[600px] font-mono text-sm border border-border p-4 rounded-lg resize-none focus:ring-primary focus:border-primary bg-background text-foreground"
                // Removed disabled prop to allow editing
              />
              <div className="space-y-2">
                <Label htmlFor="regenerate-prompt" className="text-sm font-medium text-foreground">
                  Gerar Novamente com Prompt (Opcional)
                </Label>
                <Textarea
                  id="regenerate-prompt"
                  placeholder="Ex: 'Adicione mais requisitos não funcionais de performance' ou 'Revise a seção de regras de negócio'"
                  value={regeneratePrompt}
                  onChange={(e) => setRegeneratePrompt(e.target.value)}
                  className="min-h-[80px] resize-none text-base bg-background text-foreground"
                  disabled={isRegenerating}
                />
                <Button
                  onClick={handleRegenerateClick}
                  disabled={isRegenerating}
                  className="w-full bg-muted text-foreground hover:bg-muted/80"
                >
                  {isRegenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      Gerar Novamente
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end border-t border-border pt-4 flex-shrink-0 gap-3">
          <Button variant="outline" onClick={onCancel} className="flex items-center gap-2 bg-transparent">
            <X className="h-4 w-4" />
            Cancelar
          </Button>
          <Button
            onClick={handleUseInCurrentVersion}
            disabled={isProcessing || isRegenerating}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90"
          >
            <CheckCircle className="h-4 w-4" />
            Usar na Versão Atual
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
