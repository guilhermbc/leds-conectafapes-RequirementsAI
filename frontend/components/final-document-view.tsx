"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Check, Pencil, Eye } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import FullRequirementsDocumentModal from "./full-requirements-document-modal"

interface FinalDocumentViewProps {
  document: string
  onNewProject: () => void
  onStartNewMeetingForExistingProject?: () => void
  isExistingProject: boolean
  showFullDocumentModal: boolean
  setShowFullDocumentModal: (show: boolean) => void
}

export default function FinalDocumentView({
  document,
  onNewProject,
  onStartNewMeetingForExistingProject,
  isExistingProject,
  showFullDocumentModal,
  setShowFullDocumentModal,
}: FinalDocumentViewProps) {
  const [copied, setCopied] = useState(false)
  const [projectName, setProjectName] = useState("Novo Projeto")
  const [editableTitle, setEditableTitle] = useState("Edital")
  const [isTitleEditing, setIsTitleEditing] = useState(false)
  const [version, setVersion] = useState("1.0")

  const handleDownloadPDF = () => {
    console.log("Download PDF")
  }

  const handleDownloadMarkdown = () => {
    const element = document.createElement("a")
    const file = new Blob([document], { type: "text/markdown" })
    element.href = URL.createObjectURL(file)
    element.download = `${projectName}-v${version}.md`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(document)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Erro ao copiar:", err)
    }
  }

  const handleViewFullDocument = () => {
    setShowFullDocumentModal(true)
  }

  const handleCloseFullDocumentModal = () => {
    setShowFullDocumentModal(false)
  }

  const summarizedDocument = document.length > 800 ? document.substring(0, 800) + "..." : document

  return (
    <div className="max-w-7xl space-y-6 px-0 border-0 leading-7 my-0 mx-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Documento de Requisitos</h1>
          <p className="text-muted-foreground">Revise, versione e exporte seu documento</p>
        </div>
      </div>

      <div className="w-full">
        <Card className="bg-card border border-border shadow-sm">
          <CardHeader className="border-b border-border">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {isTitleEditing ? (
                  <Input
                    value={editableTitle}
                    onChange={(e) => setEditableTitle(e.target.value)}
                    onBlur={() => setIsTitleEditing(false)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setIsTitleEditing(false)
                      }
                    }}
                    className="text-lg font-semibold text-foreground h-auto py-1 px-2"
                    autoFocus
                  />
                ) : (
                  <CardTitle className="text-lg text-foreground">{editableTitle}</CardTitle>
                )}
                <Button variant="ghost" size="icon" onClick={() => setIsTitleEditing(!isTitleEditing)}>
                  <Pencil className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
              <Button
                onClick={handleCopyToClipboard}
                size="sm"
                variant="outline"
                className="flex items-center gap-2 bg-transparent"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="min-h-[400px] font-mono text-sm border-0 resize-none focus:ring-0 rounded-none p-6 prose prose-sm max-w-none prose-invert">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{summarizedDocument}</ReactMarkdown>
            </div>
            <div className="p-6 pt-0">
              <Button onClick={handleViewFullDocument} className="w-full bg-blue-600 hover:bg-blue-700">
                <Eye className="h-4 w-4 mr-2" />
                Ver Documento Completo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <FullRequirementsDocumentModal
        isOpen={showFullDocumentModal}
        data={document}
        onClose={handleCloseFullDocumentModal}
      />
    </div>
  )
}
