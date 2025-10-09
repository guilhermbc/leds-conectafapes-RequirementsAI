"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, Database, Loader2, CheckCircle, RefreshCcw, Plus, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DiagramModalProps {
  isOpen: boolean
  data: any // Expects { classes: [{ name: string, attributes: string[], methods: string[] }] }
  isProcessing: boolean
  onConfirm: (updatedContent: any) => void // Used for "Usar na Versão Atual"
  onCancel: () => void // Used for "Cancelar"
  onRegenerate: (prompt: string) => void // New prop for regeneration
}

export default function DiagramModal({
  isOpen,
  data,
  isProcessing,
  onConfirm,
  onCancel,
  onRegenerate,
}: DiagramModalProps) {
  const [editedData, setEditedData] = useState(data || { classes: [] })
  const [regeneratePrompt, setRegeneratePrompt] = useState("")
  const [isRegenerating, setIsRegenerating] = useState(false)

  useEffect(() => {
    const initialData = data || {}
    setEditedData({
      classes: Array.isArray(initialData.classes) ? initialData.classes : [],
    })
    setRegeneratePrompt("") // Clear prompt when data changes
    setIsRegenerating(false) // Reset regenerating state
  }, [data])

  const handleUseInCurrentVersion = () => {
    onConfirm(editedData)
  }

  const handleRegenerateClick = async () => {
    setIsRegenerating(true)
    await onRegenerate(regeneratePrompt)
  }

  // --- Class Management ---
  const handleAddClass = () => {
    setEditedData((prev: any) => ({
      ...prev,
      classes: [...prev.classes, { name: "", attributes: [], methods: [] }],
    }))
  }

  const handleUpdateClass = (index: number, field: string, value: string) => {
    setEditedData((prev: any) => {
      const newClasses = [...prev.classes]
      newClasses[index] = { ...newClasses[index], [field]: value }
      return { ...prev, classes: newClasses }
    })
  }

  const handleRemoveClass = (index: number) => {
    setEditedData((prev: any) => ({
      ...prev,
      classes: prev.classes.filter((_: any, i: number) => i !== index),
    }))
  }

  // --- Attribute Management ---
  const handleAddAttribute = (classIndex: number) => {
    setEditedData((prev: any) => {
      const newClasses = [...prev.classes]
      newClasses[classIndex].attributes.push("")
      return { ...prev, classes: newClasses }
    })
  }

  const handleUpdateAttribute = (classIndex: number, attrIndex: number, value: string) => {
    setEditedData((prev: any) => {
      const newClasses = [...prev.classes]
      newClasses[classIndex].attributes[attrIndex] = value
      return { ...prev, classes: newClasses }
    })
  }

  const handleRemoveAttribute = (classIndex: number, attrIndex: number) => {
    setEditedData((prev: any) => {
      const newClasses = [...prev.classes]
      newClasses[classIndex].attributes = newClasses[classIndex].attributes.filter(
        (_: string, i: number) => i !== attrIndex,
      )
      return { ...prev, classes: newClasses }
    })
  }

  // --- Method Management ---
  const handleAddMethod = (classIndex: number) => {
    setEditedData((prev: any) => {
      const newClasses = [...prev.classes]
      newClasses[classIndex].methods.push("")
      return { ...prev, classes: newClasses }
    })
  }

  const handleUpdateMethod = (classIndex: number, methodIndex: number, value: string) => {
    setEditedData((prev: any) => {
      const newClasses = [...prev.classes]
      newClasses[classIndex].methods[methodIndex] = value
      return { ...prev, classes: newClasses }
    })
  }

  const handleRemoveMethod = (classIndex: number, methodIndex: number) => {
    setEditedData((prev: any) => {
      const newClasses = [...prev.classes]
      newClasses[classIndex].methods = newClasses[classIndex].methods.filter(
        (_: string, i: number) => i !== methodIndex,
      )
      return { ...prev, classes: newClasses }
    })
  }

  const renderDiagramPreview = (diagramData: any) => {
    if (!diagramData || !diagramData.classes || diagramData.classes.length === 0) {
      return <p className="text-gray-500">Nenhum diagrama disponível para pré-visualização.</p>
    }

    return (
      <div className="relative bg-white rounded-lg border border-gray-200 p-4 min-h-[200px] overflow-auto">
        <svg width="100%" height={Math.max(200, diagramData.classes.length * 150)} className="absolute inset-0">
          {diagramData.classes.map((cls: any, index: number) => {
            const x = 50 + (index % 3) * 200
            const y = 50 + Math.floor(index / 3) * 150
            const classHeight = 20 + (cls.attributes?.length || 0) * 15 + (cls.methods?.length || 0) * 15 + 20 // Dynamic height
            const pos = { x, y }

            return (
              <g key={index}>
                <rect
                  x={x}
                  y={y}
                  width="150"
                  height={classHeight}
                  fill="white"
                  stroke="#3B82F6"
                  strokeWidth="1"
                  rx="4"
                />
                <rect x={x} y={y} width="150" height="20" fill="#3B82F6" rx="4" />
                <text x={x + 75} y={y + 14} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                  {cls.name || "Nova Classe"}
                </text>

                {cls.attributes && cls.attributes.length > 0 && (
                  <>
                    <line x1={x} y1={y + 20} x2={x + 150} y2={y + 20} stroke="#E5E7EB" strokeWidth="1" />
                    {(cls.attributes || []).slice(0, 1).map((attr: string, i: number) => (
                      <text key={i} x={pos.x + 5} y={pos.y + 35 + i * 8} fill="#6B7280" fontSize="5">
                        • {attr.length > 10 ? attr.substring(0, 10) + "..." : attr}
                      </text>
                    ))}
                  </>
                )}

                {cls.methods && cls.methods.length > 0 && (
                  <>
                    <line
                      x1={x}
                      y1={y + 20 + (cls.attributes?.length || 0) * 15}
                      x2={x + 150}
                      y2={y + 20 + (cls.attributes?.length || 0) * 15}
                      stroke="#E5E7EB"
                      strokeWidth="1"
                    />
                    {(cls.methods || []).slice(0, 1).map((method: string, i: number) => (
                      <text key={i} x={pos.x + 5} y={pos.y + 75} fill="#6B7280" fontSize="7">
                        • {method.length > 15 ? method.substring(0, 15) + "..." : method}
                      </text>
                    ))}
                  </>
                )}
              </g>
            )
          })}
        </svg>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col bg-white">
        <DialogHeader className="border-b border-gray-200 pb-4 flex-shrink-0">
          <DialogTitle className="flex items-center gap-3 text-xl text-gray-900">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Database className="h-5 w-5 text-blue-600" />
            </div>
            Diagrama de Classes Gerado
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto py-6 px-4 space-y-6">
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p>Gerando Diagrama de Classes...</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Editar Classes</h3>
                <div className="space-y-4">
                  {editedData.classes.map((cls: any, classIndex: number) => (
                    <Card key={classIndex} className="border border-gray-200 shadow-sm">
                      <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
                        <CardTitle className="text-base">
                          <Input
                            value={cls.name}
                            onChange={(e) => handleUpdateClass(classIndex, "name", e.target.value)}
                            placeholder="Nome da Classe"
                            className="font-semibold text-gray-900 text-base h-auto py-1 px-2"
                          />
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveClass(classIndex)}
                          className="text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardHeader>
                      <CardContent className="p-4 pt-2 space-y-4">
                        {/* Attributes */}
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">Atributos</Label>
                          <div className="space-y-2">
                            {(cls.attributes || []).map((attr: string, attrIndex: number) => (
                              <div key={attrIndex} className="flex items-center gap-2">
                                <Input
                                  value={attr}
                                  onChange={(e) => handleUpdateAttribute(classIndex, attrIndex, e.target.value)}
                                  placeholder="Ex: id: String"
                                  className="flex-1 text-sm"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveAttribute(classIndex, attrIndex)}
                                  className="text-gray-400 hover:bg-gray-100"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddAttribute(classIndex)}
                            className="mt-3 w-full flex items-center gap-2 text-blue-600 border-blue-300 hover:bg-blue-50"
                          >
                            <Plus className="h-4 w-4" />
                            Adicionar Atributo
                          </Button>
                        </div>

                        {/* Methods */}
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">Métodos</Label>
                          <div className="space-y-2">
                            {(cls.methods || []).map((method: string, methodIndex: number) => (
                              <div key={methodIndex} className="flex items-center gap-2">
                                <Input
                                  value={method}
                                  onChange={(e) => handleUpdateMethod(classIndex, methodIndex, e.target.value)}
                                  placeholder="Ex: login()"
                                  className="flex-1 text-sm"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveMethod(classIndex, methodIndex)}
                                  className="text-gray-400 hover:bg-gray-100"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddMethod(classIndex)}
                            className="mt-3 w-full flex items-center gap-2 text-blue-600 border-blue-300 hover:bg-blue-50"
                          >
                            <Plus className="h-4 w-4" />
                            Adicionar Método
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Button
                    onClick={handleAddClass}
                    className="w-full bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar Nova Classe
                  </Button>
                </div>
              </div>

              <div className="space-y-2 mt-6">
                <Label className="text-sm font-medium text-gray-700">Pré-visualização do Diagrama</Label>
                {renderDiagramPreview(editedData)}
              </div>

              <div className="space-y-2 mt-6">
                <Label htmlFor="regenerate-prompt" className="text-sm font-medium text-gray-700">
                  Gerar Novamente com Prompt (Opcional)
                </Label>
                <Textarea
                  id="regenerate-prompt"
                  placeholder="Ex: 'Adicione uma classe de Pagamento' ou 'Remova a classe de Notificação'"
                  value={regeneratePrompt}
                  onChange={(e) => setRegeneratePrompt(e.target.value)}
                  className="min-h-[80px] resize-none text-base"
                  disabled={isRegenerating}
                />
                <Button
                  onClick={handleRegenerateClick}
                  disabled={isRegenerating}
                  className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200"
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

        <div className="flex justify-end border-t border-gray-200 pt-4 flex-shrink-0 gap-3">
          <Button variant="outline" onClick={onCancel} className="flex items-center gap-2 bg-transparent">
            <X className="h-4 w-4" />
            Cancelar
          </Button>
          <Button
            onClick={handleUseInCurrentVersion}
            disabled={isProcessing || isRegenerating}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <CheckCircle className="h-4 w-4" />
            Usar na Versão Atual
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
