"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  Database,
  Users,
  FileText,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  RefreshCcw,
  Loader2,
  Move,
} from "lucide-react"
import type { ProjectArtifact } from "@/lib/data"

interface Relationship {
  id: string
  from: number
  to: number
  type: "association" | "inheritance" | "composition" | "aggregation" | "dependency"
  label?: string
  fromCardinality?: string
  toCardinality?: string
}

interface MainContentViewerProps {
  artifact: ProjectArtifact
  onEdit: () => void
  onSave: (content: string | any) => void
}

export default function MainContentViewer({ artifact, onEdit, onSave }: MainContentViewerProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(artifact.content)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [regeneratePrompt, setRegeneratePrompt] = useState("")

  const [isDiagramInteractive, setIsDiagramInteractive] = useState(false)
  const [classPositions, setClassPositions] = useState<{ [key: number]: { x: number; y: number } }>({})
  const [draggedClass, setDraggedClass] = useState<number | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [editingText, setEditingText] = useState<{ classIndex: number; field: string; itemIndex?: number } | null>(null)

  const [relationships, setRelationships] = useState<Relationship[]>([])
  const [isCreatingRelationship, setIsCreatingRelationship] = useState(false)
  const [relationshipStart, setRelationshipStart] = useState<{ classIndex: number; x: number; y: number } | null>(null)
  const [currentMousePos, setCurrentMousePos] = useState({ x: 0, y: 0 })
  const [selectedRelationshipType, setSelectedRelationshipType] = useState<Relationship["type"]>("association")
  const [showRelationshipMenu, setShowRelationshipMenu] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })

  const svgRef = useRef<SVGSVGElement>(null)

  const getClassPosition = useCallback((index: number, total: number) => {
    const cols = Math.min(4, Math.ceil(Math.sqrt(total)))
    const col = index % cols
    const row = Math.floor(index / cols)

    const baseX = 80
    const baseY = 60
    const spacingX = 220
    const spacingY = 180

    return {
      x: baseX + col * spacingX,
      y: baseY + row * spacingY,
    }
  }, [])

  const getConnectionPoints = (classIndex: number, totalClasses: number) => {
    const position = classPositions[classIndex] || getClassPosition(classIndex, totalClasses)
    const classWidth = 200
    const classHeight = 120 // Approximate height

    return {
      top: { x: position.x + classWidth / 2, y: position.y },
      bottom: { x: position.x + classWidth / 2, y: position.y + classHeight },
      left: { x: position.x, y: position.y + classHeight / 2 },
      right: { x: position.x + classWidth, y: position.y + classHeight / 2 },
    }
  }

  const startRelationshipCreation = (classIndex: number, e: React.MouseEvent) => {
    if (!isDiagramInteractive) return
    e.stopPropagation()

    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return

    const connectionPoints = getConnectionPoints(classIndex, editedContent?.classes?.length || 0)
    setRelationshipStart({
      classIndex,
      x: connectionPoints.right.x,
      y: connectionPoints.right.y,
    })
    setIsCreatingRelationship(true)
  }

  const finishRelationshipCreation = (targetClassIndex: number, e: React.MouseEvent) => {
    if (!isCreatingRelationship || !relationshipStart || targetClassIndex === relationshipStart.classIndex) return
    e.stopPropagation()

    const newRelationship: Relationship = {
      id: `rel-${Date.now()}`,
      from: relationshipStart.classIndex,
      to: targetClassIndex,
      type: selectedRelationshipType,
      fromCardinality: "1",
      toCardinality: "*",
    }

    setRelationships((prev) => [...prev, newRelationship])
    setIsCreatingRelationship(false)
    setRelationshipStart(null)
  }

  const getRelationshipStyle = (type: Relationship["type"]) => {
    switch (type) {
      case "inheritance":
        return { stroke: "#4CAF50", strokeWidth: 2, markerEnd: "url(#inheritance-arrow)" }
      case "composition":
        return { stroke: "#F44336", strokeWidth: 2, markerEnd: "url(#composition-diamond)" }
      case "aggregation":
        return { stroke: "#FF9800", strokeWidth: 2, markerEnd: "url(#aggregation-diamond)" }
      case "dependency":
        return { stroke: "#9C27B0", strokeWidth: 1, strokeDasharray: "5,5", markerEnd: "url(#dependency-arrow)" }
      default: // association
        return { stroke: "#666", strokeWidth: 1, markerEnd: "url(#association-arrow)" }
    }
  }

  const handleSave = () => {
    onSave(editedContent)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedContent(artifact.content)
    setIsEditing(false)
  }

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, classIndex: number) => {
      if (!isDiagramInteractive) return

      const rect = svgRef.current?.getBoundingClientRect()
      if (!rect) return

      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const classPos = classPositions[classIndex] || getClassPosition(classIndex, editedContent?.classes?.length || 0)

      setDraggedClass(classIndex)
      setDragOffset({
        x: x - classPos.x,
        y: y - classPos.y,
      })
    },
    [isDiagramInteractive, classPositions, editedContent, getClassPosition],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = svgRef.current?.getBoundingClientRect()
      if (!rect) return

      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      setCurrentMousePos({ x, y })

      if (draggedClass === null || !isDiagramInteractive) return

      const newX = x - dragOffset.x
      const newY = y - dragOffset.y

      setClassPositions((prev) => ({
        ...prev,
        [draggedClass]: { x: Math.max(0, newX), y: Math.max(0, newY) },
      }))
    },
    [draggedClass, dragOffset, isDiagramInteractive],
  )

  const handleMouseUp = useCallback(() => {
    setDraggedClass(null)
    if (isCreatingRelationship) {
      setIsCreatingRelationship(false)
      setRelationshipStart(null)
    }
  }, [isCreatingRelationship])

  const handleRightClick = (e: React.MouseEvent) => {
    if (!isDiagramInteractive) return
    e.preventDefault()
    setMenuPosition({ x: e.clientX, y: e.clientY })
    setShowRelationshipMenu(true)
  }

  const handleTextDoubleClick = (classIndex: number, field: string, itemIndex?: number) => {
    if (!isDiagramInteractive) return
    setEditingText({ classIndex, field, itemIndex })
  }

  const handleTextChange = (value: string) => {
    if (!editingText) return

    const newClasses = [...(editedContent?.classes || [])]
    const classIndex = editingText.classIndex

    if (editingText.field === "name") {
      newClasses[classIndex] = { ...newClasses[classIndex], name: value }
    } else if (editingText.field === "attributes" && editingText.itemIndex !== undefined) {
      const newAttributes = [...(newClasses[classIndex].attributes || [])]
      newAttributes[editingText.itemIndex] = value
      newClasses[classIndex] = { ...newClasses[classIndex], attributes: newAttributes }
    } else if (editingText.field === "methods" && editingText.itemIndex !== undefined) {
      const newMethods = [...(newClasses[classIndex].methods || [])]
      newMethods[editingText.itemIndex] = value
      newClasses[classIndex] = { ...newClasses[classIndex], methods: newMethods }
    }

    setEditedContent({ ...editedContent, classes: newClasses })
  }

  const handleTextBlur = () => {
    setEditingText(null)
  }

  const addNewItem = (classIndex: number, type: "attribute" | "method") => {
    const newClasses = [...(editedContent?.classes || [])]
    if (type === "attribute") {
      newClasses[classIndex].attributes = [...(newClasses[classIndex].attributes || []), "novo_atributo: String"]
    } else {
      newClasses[classIndex].methods = [...(newClasses[classIndex].methods || []), "novoMetodo()"]
    }
    setEditedContent({ ...editedContent, classes: newClasses })
  }

  const getIcon = () => {
    switch (artifact.type) {
      case "minimundo":
        return BookOpen
      case "diagram":
        return Database
      case "use-cases":
        return Users
      case "requirements":
        return FileText
      default:
        return FileText
    }
  }

  const getTitle = () => {
    switch (artifact.type) {
      case "minimundo":
        return "Minimundo"
      case "diagram":
        return "Diagrama de Classes"
      case "use-cases":
        return "Casos de Uso"
      case "requirements":
        return "Documento de Requisitos"
      default:
        return "Artefato"
    }
  }

  const Icon = getIcon()

  const renderMinimundoContent = () => (
    <div className="space-y-4">
      {isEditing ? (
        <Textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          className="min-h-[400px] font-mono text-sm resize-none"
          placeholder="Descreva o minimundo do seu projeto..."
        />
      ) : (
        <div className="bg-muted/50 rounded-lg p-6 min-h-[400px]">
          <pre className="whitespace-pre-wrap text-sm text-foreground font-mono leading-relaxed">
            {artifact.content || "Nenhum conteúdo disponível"}
          </pre>
        </div>
      )}
    </div>
  )

  const renderDiagramContent = () => {
    if (isEditing) {
      return (
        <div className="space-y-4">
          {editedContent?.classes?.map((cls: any, classIndex: number) => (
            <Card key={classIndex} className="border border-border">
              <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
                <Input
                  value={cls.name}
                  onChange={(e) => {
                    const newClasses = [...editedContent.classes]
                    newClasses[classIndex] = { ...newClasses[classIndex], name: e.target.value }
                    setEditedContent({ ...editedContent, classes: newClasses })
                  }}
                  placeholder="Nome da Classe"
                  className="font-semibold text-base h-auto py-1 px-2"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const newClasses = editedContent.classes.filter((_: any, i: number) => i !== classIndex)
                    setEditedContent({ ...editedContent, classes: newClasses })
                  }}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-4 pt-2 space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Atributos</Label>
                  <div className="space-y-2">
                    {(cls.attributes || []).map((attr: string, attrIndex: number) => (
                      <div key={attrIndex} className="flex items-center gap-2">
                        <Input
                          value={attr}
                          onChange={(e) => {
                            const newClasses = [...editedContent.classes]
                            newClasses[classIndex].attributes[attrIndex] = e.target.value
                            setEditedContent({ ...editedContent, classes: newClasses })
                          }}
                          placeholder="Ex: id: String"
                          className="flex-1 text-sm"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newClasses = [...editedContent.classes]
                            newClasses[classIndex].attributes = newClasses[classIndex].attributes.filter(
                              (_: string, i: number) => i !== attrIndex,
                            )
                            setEditedContent({ ...editedContent, classes: newClasses })
                          }}
                          className="text-muted-foreground hover:bg-muted"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newClasses = [...editedContent.classes]
                      newClasses[classIndex].attributes.push("")
                      setEditedContent({ ...editedContent, classes: newClasses })
                    }}
                    className="mt-3 w-full flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar Atributo
                  </Button>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Métodos</Label>
                  <div className="space-y-2">
                    {(cls.methods || []).map((method: string, methodIndex: number) => (
                      <div key={methodIndex} className="flex items-center gap-2">
                        <Input
                          value={method}
                          onChange={(e) => {
                            const newClasses = [...editedContent.classes]
                            newClasses[classIndex].methods[methodIndex] = e.target.value
                            setEditedContent({ ...editedContent, classes: newClasses })
                          }}
                          placeholder="Ex: login()"
                          className="flex-1 text-sm"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newClasses = [...editedContent.classes]
                            newClasses[classIndex].methods = newClasses[classIndex].methods.filter(
                              (_: string, i: number) => i !== methodIndex,
                            )
                            setEditedContent({ ...editedContent, classes: newClasses })
                          }}
                          className="text-muted-foreground hover:bg-muted"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newClasses = [...editedContent.classes]
                      newClasses[classIndex].methods.push("")
                      setEditedContent({ ...editedContent, classes: newClasses })
                    }}
                    className="mt-3 w-full flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar Método
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button
            onClick={() => {
              const newClasses = [...(editedContent.classes || []), { name: "", attributes: [], methods: [] }]
              setEditedContent({ ...editedContent, classes: newClasses })
            }}
            className="w-full flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Adicionar Nova Classe
          </Button>
        </div>
      )
    }

    const diagramData = artifact.content
    if (!diagramData || !diagramData.classes || diagramData.classes.length === 0) {
      return (
        <div className="bg-muted/50 rounded-lg p-6 min-h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">Nenhum diagrama disponível</p>
        </div>
      )
    }

    // Function to determine class color based on type/name
    const getClassColor = (className: string, index: number) => {
      const name = className.toLowerCase()
      if (name.includes("user") || name.includes("usuario") || name.includes("cliente") || name.includes("guest")) {
        return { bg: "#E8F5E8", border: "#4CAF50", header: "#4CAF50" } // Green for users
      }
      if (name.includes("manager") || name.includes("admin") || name.includes("gerente") || name.includes("chef")) {
        return { bg: "#F5F5F5", border: "#757575", header: "#757575" } // Gray for management
      }
      if (
        name.includes("room") ||
        name.includes("quarto") ||
        name.includes("bill") ||
        name.includes("conta") ||
        name.includes("receptionist")
      ) {
        return { bg: "#E3F2FD", border: "#2196F3", header: "#2196F3" } // Blue for services/rooms
      }
      // Default colors cycling through different types
      const colors = [
        { bg: "#F5F5F5", border: "#757575", header: "#757575" }, // Gray
        { bg: "#E8F5E8", border: "#4CAF50", header: "#4CAF50" }, // Green
        { bg: "#E3F2FD", border: "#2196F3", header: "#2196F3" }, // Blue
      ]
      return colors[index % colors.length]
    }

    const totalClasses = diagramData.classes.length
    const svgHeight = Math.max(500, Math.ceil(totalClasses / 4) * 180 + 120)

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button
            onClick={() => setIsDiagramInteractive(!isDiagramInteractive)}
            variant={isDiagramInteractive ? "default" : "outline"}
            className="flex items-center gap-2"
          >
            <Move className="h-4 w-4" />
            {isDiagramInteractive ? "Modo Interativo Ativo" : "Ativar Modo Interativo"}
          </Button>
          {isDiagramInteractive && (
            <div className="text-sm text-muted-foreground">
              Arraste as classes • Duplo clique para editar • Ctrl+clique para criar relacionamentos
            </div>
          )}
        </div>

        {isDiagramInteractive && (
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium">Tipo de Relacionamento:</span>
            {(["association", "inheritance", "composition", "aggregation", "dependency"] as const).map((type) => (
              <Button
                key={type}
                variant={selectedRelationshipType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRelationshipType(type)}
                className="text-xs"
              >
                {type === "association" && "Associação"}
                {type === "inheritance" && "Herança"}
                {type === "composition" && "Composição"}
                {type === "aggregation" && "Agregação"}
                {type === "dependency" && "Dependência"}
              </Button>
            ))}
          </div>
        )}

        <div className="bg-white rounded-lg border p-6 min-h-[500px] overflow-auto">
          <svg
            ref={svgRef}
            width="100%"
            height={svgHeight}
            className="font-sans"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onContextMenu={handleRightClick}
            style={{ cursor: isDiagramInteractive ? "crosshair" : "default" }}
          >
            <defs>
              <marker id="association-arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
              </marker>
              <marker id="inheritance-arrow" markerWidth="12" markerHeight="10" refX="11" refY="5" orient="auto">
                <polygon points="0 0, 12 5, 0 10" fill="none" stroke="#4CAF50" strokeWidth="2" />
              </marker>
              <marker id="composition-diamond" markerWidth="12" markerHeight="8" refX="11" refY="4" orient="auto">
                <polygon points="0 4, 6 0, 12 4, 6 8" fill="#F44336" />
              </marker>
              <marker id="aggregation-diamond" markerWidth="12" markerHeight="8" refX="11" refY="4" orient="auto">
                <polygon points="0 4, 6 0, 12 4, 6 8" fill="white" stroke="#FF9800" strokeWidth="1" />
              </marker>
              <marker id="dependency-arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#9C27B0" />
              </marker>
            </defs>

            {relationships.map((rel) => {
              const fromPos = classPositions[rel.from] || getClassPosition(rel.from, totalClasses)
              const toPos = classPositions[rel.to] || getClassPosition(rel.to, totalClasses)
              const style = getRelationshipStyle(rel.type)

              const fromX = fromPos.x + 200 // Right side of from class
              const fromY = fromPos.y + 60 // Middle of from class
              const toX = toPos.x // Left side of to class
              const toY = toPos.y + 60 // Middle of to class

              return (
                <g key={rel.id}>
                  <line
                    x1={fromX}
                    y1={fromY}
                    x2={toX}
                    y2={toY}
                    {...style}
                    style={{ cursor: isDiagramInteractive ? "pointer" : "default" }}
                    onClick={() => {
                      if (isDiagramInteractive) {
                        setRelationships((prev) => prev.filter((r) => r.id !== rel.id))
                      }
                    }}
                  />
                  {rel.fromCardinality && (
                    <text x={fromX + 10} y={fromY - 5} fill="#666" fontSize="10">
                      {rel.fromCardinality}
                    </text>
                  )}
                  {rel.toCardinality && (
                    <text x={toX - 20} y={toY - 5} fill="#666" fontSize="10">
                      {rel.toCardinality}
                    </text>
                  )}
                </g>
              )
            })}

            {isCreatingRelationship && relationshipStart && (
              <line
                x1={relationshipStart.x}
                y1={relationshipStart.y}
                x2={currentMousePos.x}
                y2={currentMousePos.y}
                stroke="#666"
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.7"
              />
            )}

            {diagramData.classes.map((cls: any, index: number) => {
              const position = classPositions[index] || getClassPosition(index, totalClasses)
              const colors = getClassColor(cls.name, index)
              const classWidth = 200
              const headerHeight = 35
              const attributeHeight = (cls.attributes?.length || 0) * 18 + 10
              const methodHeight = (cls.methods?.length || 0) * 18 + 10
              const totalHeight = headerHeight + attributeHeight + methodHeight + 20

              return (
                <g key={index}>
                  {/* Main class rectangle */}
                  <rect
                    x={position.x}
                    y={position.y}
                    width={classWidth}
                    height={totalHeight}
                    fill={colors.bg}
                    stroke={colors.border}
                    strokeWidth="2"
                    rx="8"
                    style={{
                      cursor: isDiagramInteractive ? "move" : "default",
                      opacity: draggedClass === index ? 0.7 : 1,
                    }}
                    onMouseDown={(e) => {
                      if (e.ctrlKey || e.metaKey) {
                        startRelationshipCreation(index, e)
                      } else {
                        handleMouseDown(e, index)
                      }
                    }}
                    onClick={(e) => {
                      if (isCreatingRelationship) {
                        finishRelationshipCreation(index, e)
                      }
                    }}
                  />

                  {isDiagramInteractive && (
                    <>
                      <circle
                        cx={position.x + classWidth}
                        cy={position.y + totalHeight / 2}
                        r="4"
                        fill="#4CAF50"
                        style={{ cursor: "crosshair" }}
                        onMouseDown={(e) => startRelationshipCreation(index, e)}
                      />
                      <circle
                        cx={position.x}
                        cy={position.y + totalHeight / 2}
                        r="4"
                        fill="#2196F3"
                        style={{ cursor: "crosshair" }}
                        onClick={(e) => {
                          if (isCreatingRelationship) {
                            finishRelationshipCreation(index, e)
                          }
                        }}
                      />
                    </>
                  )}

                  {/* Class name header */}
                  <rect
                    x={position.x}
                    y={position.y}
                    width={classWidth}
                    height={headerHeight}
                    fill={colors.header}
                    rx="8"
                    style={{ cursor: isDiagramInteractive ? "move" : "default" }}
                    onMouseDown={(e) => handleMouseDown(e, index)}
                  />
                  <rect
                    x={position.x}
                    y={position.y + 8}
                    width={classWidth}
                    height={headerHeight - 8}
                    fill={colors.header}
                    style={{ cursor: isDiagramInteractive ? "move" : "default" }}
                    onMouseDown={(e) => handleMouseDown(e, index)}
                  />

                  {editingText?.classIndex === index && editingText?.field === "name" ? (
                    <foreignObject x={position.x + 10} y={position.y + 10} width={classWidth - 20} height={25}>
                      <input
                        type="text"
                        value={cls.name || "Nova Classe"}
                        onChange={(e) => handleTextChange(e.target.value)}
                        onBlur={handleTextBlur}
                        onKeyDown={(e) => e.key === "Enter" && handleTextBlur()}
                        className="w-full bg-transparent text-white text-sm font-bold text-center border-none outline-none"
                        autoFocus
                      />
                    </foreignObject>
                  ) : (
                    <text
                      x={position.x + classWidth / 2}
                      y={position.y + 23}
                      textAnchor="middle"
                      fill="white"
                      fontSize="14"
                      fontWeight="bold"
                      style={{ cursor: isDiagramInteractive ? "text" : "default" }}
                      onDoubleClick={() => handleTextDoubleClick(index, "name")}
                    >
                      {cls.name || "Nova Classe"}
                    </text>
                  )}

                  {/* Attributes section */}
                  {cls.attributes && cls.attributes.length > 0 && (
                    <>
                      <line
                        x1={position.x}
                        y1={position.y + headerHeight}
                        x2={position.x + classWidth}
                        y2={position.y + headerHeight}
                        stroke={colors.border}
                        strokeWidth="1"
                      />
                      {cls.attributes.map((attr: string, i: number) => (
                        <g key={i}>
                          {editingText?.classIndex === index &&
                          editingText?.field === "attributes" &&
                          editingText?.itemIndex === i ? (
                            <foreignObject
                              x={position.x + 12}
                              y={position.y + headerHeight + 5 + i * 18}
                              width={classWidth - 24}
                              height={16}
                            >
                              <input
                                type="text"
                                value={attr}
                                onChange={(e) => handleTextChange(e.target.value)}
                                onBlur={handleTextBlur}
                                onKeyDown={(e) => e.key === "Enter" && handleTextBlur()}
                                className="w-full bg-transparent text-xs border-none outline-none"
                                autoFocus
                              />
                            </foreignObject>
                          ) : (
                            <text
                              x={position.x + 12}
                              y={position.y + headerHeight + 18 + i * 18}
                              fill="#333"
                              fontSize="12"
                              style={{ cursor: isDiagramInteractive ? "text" : "default" }}
                              onDoubleClick={() => handleTextDoubleClick(index, "attributes", i)}
                            >
                              +{attr}
                            </text>
                          )}
                        </g>
                      ))}
                      {isDiagramInteractive && (
                        <circle
                          cx={position.x + classWidth - 15}
                          cy={position.y + headerHeight + 15}
                          r="8"
                          fill="#4CAF50"
                          style={{ cursor: "pointer" }}
                          onClick={() => addNewItem(index, "attribute")}
                        />
                      )}
                      {isDiagramInteractive && (
                        <text
                          x={position.x + classWidth - 15}
                          y={position.y + headerHeight + 19}
                          textAnchor="middle"
                          fill="white"
                          fontSize="12"
                          fontWeight="bold"
                          style={{ cursor: "pointer", pointerEvents: "none" }}
                        >
                          +
                        </text>
                      )}
                    </>
                  )}

                  {/* Methods section */}
                  {cls.methods && cls.methods.length > 0 && (
                    <>
                      <line
                        x1={position.x}
                        y1={position.y + headerHeight + attributeHeight}
                        x2={position.x + classWidth}
                        y2={position.y + headerHeight + attributeHeight}
                        stroke={colors.border}
                        strokeWidth="1"
                      />
                      {cls.methods.map((method: string, i: number) => (
                        <g key={i}>
                          {editingText?.classIndex === index &&
                          editingText?.field === "methods" &&
                          editingText?.itemIndex === i ? (
                            <foreignObject
                              x={position.x + 12}
                              y={position.y + headerHeight + attributeHeight + 5 + i * 18}
                              width={classWidth - 24}
                              height={16}
                            >
                              <input
                                type="text"
                                value={method}
                                onChange={(e) => handleTextChange(e.target.value)}
                                onBlur={handleTextBlur}
                                onKeyDown={(e) => e.key === "Enter" && handleTextBlur()}
                                className="w-full bg-transparent text-xs border-none outline-none"
                                autoFocus
                              />
                            </foreignObject>
                          ) : (
                            <text
                              x={position.x + 12}
                              y={position.y + headerHeight + attributeHeight + 18 + i * 18}
                              fill="#333"
                              fontSize="12"
                              style={{ cursor: isDiagramInteractive ? "text" : "default" }}
                              onDoubleClick={() => handleTextDoubleClick(index, "methods", i)}
                            >
                              +{method}
                            </text>
                          )}
                        </g>
                      ))}
                      {isDiagramInteractive && (
                        <circle
                          cx={position.x + classWidth - 15}
                          cy={position.y + headerHeight + attributeHeight + 15}
                          r="8"
                          fill="#2196F3"
                          style={{ cursor: "pointer" }}
                          onClick={() => addNewItem(index, "method")}
                        />
                      )}
                      {isDiagramInteractive && (
                        <text
                          x={position.x + classWidth - 15}
                          y={position.y + headerHeight + attributeHeight + 19}
                          textAnchor="middle"
                          fill="white"
                          fontSize="12"
                          fontWeight="bold"
                          style={{ cursor: "pointer", pointerEvents: "none" }}
                        >
                          +
                        </text>
                      )}
                    </>
                  )}

                  {/* Relationship indicators */}
                  {index < totalClasses - 1 && (
                    <>
                      <line
                        x1={position.x + classWidth}
                        y1={position.y + totalHeight / 2}
                        x2={position.x + classWidth + 40}
                        y2={position.y + totalHeight / 2}
                        stroke="#666"
                        strokeWidth="1"
                        markerEnd="url(#arrowhead)"
                      />
                      <text
                        x={position.x + classWidth + 5}
                        y={position.y + totalHeight / 2 - 5}
                        fill="#666"
                        fontSize="10"
                      >
                        1
                      </text>
                    </>
                  )}
                </g>
              )
            })}
          </svg>
        </div>
      </div>
    )
  }

  const renderUseCasesContent = () => (
    <div className="space-y-4">
      {isEditing ? (
        <Textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          className="min-h-[400px] font-mono text-sm resize-none"
          placeholder="Descreva os casos de uso do seu projeto..."
        />
      ) : (
        <div className="bg-muted/50 rounded-lg p-6 min-h-[400px]">
          <pre className="whitespace-pre-wrap text-sm text-foreground font-mono leading-relaxed">
            {artifact.content || "Nenhum conteúdo disponível"}
          </pre>
        </div>
      )}
    </div>
  )

  const renderRequirementsContent = () => (
    <div className="space-y-4">
      {isEditing ? (
        <Textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          className="min-h-[400px] font-mono text-sm resize-none"
          placeholder="Descreva os requisitos do seu projeto..."
        />
      ) : (
        <div className="bg-muted/50 rounded-lg p-6 min-h-[400px]">
          <pre className="whitespace-pre-wrap text-sm text-foreground font-mono leading-relaxed">
            {artifact.content || "Nenhum conteúdo disponível"}
          </pre>
        </div>
      )}
    </div>
  )

  const renderContent = () => {
    switch (artifact.type) {
      case "minimundo":
        return renderMinimundoContent()
      case "diagram":
        return renderDiagramContent()
      case "use-cases":
        return renderUseCasesContent()
      case "requirements":
        return renderRequirementsContent()
      default:
        return <div>Tipo de conteúdo não suportado</div>
    }
  }

  return (
    <div className="flex-1 p-6 overflow-auto">
      <Card className="max-w-none">
        <CardHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              {getTitle()}
              <Badge variant="secondary" className="text-xs">
                {artifact.lastModified}
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} size="sm" className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Salvar
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 bg-transparent"
                  >
                    <X className="h-4 w-4" />
                    Cancelar
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} size="sm" className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Editar
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {renderContent()}

          {/* Seção de regeneração */}
          {!isEditing && (
            <div className="mt-6 pt-6 border-t border-border space-y-4">
              <Label className="text-sm font-medium">Gerar Novamente com Prompt (Opcional)</Label>
              <Textarea
                placeholder="Ex: 'Foque mais nos requisitos de segurança' ou 'Adicione detalhes sobre a interface do usuário'"
                value={regeneratePrompt}
                onChange={(e) => setRegeneratePrompt(e.target.value)}
                className="min-h-[80px] resize-none"
                disabled={isRegenerating}
              />
              <Button
                onClick={() => {
                  setIsRegenerating(true)
                  // Aqui você implementaria a lógica de regeneração
                  setTimeout(() => setIsRegenerating(false), 2000)
                }}
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
