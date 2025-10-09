"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, X, FileText, Mic, Video, FileAudio } from "lucide-react"

interface MeetingUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    file?: File
    meetingDate: string
    participants: string
    notes: string
    meetingTitle: string
  }) => void
  moduleName: string
}

export default function MeetingUploadModal({ isOpen, onClose, onSubmit, moduleName }: MeetingUploadModalProps) {
  const [meetingTitle, setMeetingTitle] = useState("")
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split("T")[0])
  const [participants, setParticipants] = useState("")
  const [notes, setNotes] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isDragActive, setIsDragActive] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFile(file)
    }
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragActive(false)
      setIsDragOver(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      const allowedTypes = [".wav", ".mp3", ".mp4", ".pdf", ".doc", ".docx", ".txt"]
      const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()

      if (allowedTypes.includes(fileExtension)) {
        setUploadedFile(file)
      } else {
        alert("Tipo de arquivo não suportado. Use: .wav, .mp3, .mp4, .pdf, .doc, .docx, .txt")
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!meetingTitle.trim() && !notes.trim() && !uploadedFile) {
      alert("Por favor, forneça pelo menos um título, notas ou arquivo para a reunião.")
      return
    }

    onSubmit({
      file: uploadedFile || undefined,
      meetingDate,
      participants,
      notes,
      meetingTitle,
    })

    // Reset form
    setMeetingTitle("")
    setMeetingDate(new Date().toISOString().split("T")[0])
    setParticipants("")
    setNotes("")
    setUploadedFile(null)
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()
    switch (extension) {
      case "mp3":
      case "wav":
        return <FileAudio className="h-6 w-6 text-blue-600" />
      case "mp4":
        return <Video className="h-6 w-6 text-purple-600" />
      case "pdf":
      case "doc":
      case "docx":
      case "txt":
        return <FileText className="h-6 w-6 text-green-600" />
      default:
        return <FileText className="h-6 w-6 text-gray-600" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Nova Reunião - {moduleName}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="meetingTitle" className="text-sm font-medium">
                Título da Reunião *
              </Label>
              <Input
                id="meetingTitle"
                placeholder="Ex: Reunião de Levantamento de Requisitos"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="meetingDate" className="text-sm font-medium">
                  Data da Reunião
                </Label>
                <Input
                  id="meetingDate"
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="participants" className="text-sm font-medium">
                  Participantes
                </Label>
                <Input
                  id="participants"
                  placeholder="Ex: João, Maria, Carlos"
                  value={participants}
                  onChange={(e) => setParticipants(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes" className="text-sm font-medium">
                Notas da Reunião
              </Label>
              <Textarea
                id="notes"
                placeholder="Descreva os pontos discutidos, decisões tomadas, novos requisitos identificados..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 min-h-[100px] resize-none"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Arquivo da Reunião (Opcional)</Label>
              <div
                className={`mt-1 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer min-h-[120px] flex flex-col items-center justify-center transition-all duration-300 ease-in-out ${
                  isDragOver
                    ? "border-primary bg-primary/5 scale-105 shadow-lg"
                    : isDragActive
                      ? "border-primary/70 bg-primary/3"
                      : "border-border hover:border-primary"
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".wav,.mp3,.mp4,.pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {uploadedFile ? (
                  <div className="flex flex-col items-center gap-3">
                    {getFileIcon(uploadedFile.name)}
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">{uploadedFile.name}</p>
                      <p className="text-xs text-muted-foreground">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setUploadedFile(null)
                      }}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remover
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isDragOver ? "bg-primary/20 scale-110" : isDragActive ? "bg-primary/10" : "bg-blue-50"
                      }`}
                    >
                      <Upload
                        className={`h-6 w-6 transition-all duration-300 ${
                          isDragOver ? "text-primary scale-110" : isDragActive ? "text-primary/80" : "text-blue-600"
                        }`}
                      />
                    </div>
                    <div className="text-center">
                      <p
                        className={`text-sm font-medium transition-colors duration-300 ${
                          isDragOver ? "text-primary" : isDragActive ? "text-primary/80" : "text-foreground"
                        }`}
                      >
                        {isDragOver
                          ? "Solte o arquivo aqui!"
                          : isDragActive
                            ? "Arraste o arquivo aqui"
                            : "Clique para fazer upload"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">ou arraste e solte seu arquivo aqui</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Formatos: .wav, .mp3, .mp4, .pdf, .doc, .docx, .txt (máx. 50MB)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              <Mic className="h-4 w-4 mr-2" />
              Processar Reunião
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
