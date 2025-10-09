"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, FileText } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface FullRequirementsDocumentModalProps {
  isOpen: boolean
  data: string
  onClose: () => void
}

export default function FullRequirementsDocumentModal({ isOpen, data, onClose }: FullRequirementsDocumentModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col bg-card">
        <DialogHeader className="border-b border-border pb-4 flex-shrink-0">
          <DialogTitle className="flex items-center gap-3 text-xl text-foreground">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            Documento de Requisitos Completo
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto py-6">
          <div className="bg-muted border border-border p-6 rounded-lg min-h-[600px] prose prose-sm max-w-none prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{data}</ReactMarkdown>
          </div>
        </div>

        <div className="flex justify-end border-t border-border pt-4 flex-shrink-0">
          <Button variant="outline" onClick={onClose} className="flex items-center gap-2 bg-transparent">
            <X className="h-4 w-4" />
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
