import type React from "react"
import { projects as mockData } from "./mockData"

export interface ArtifactUpdateHistory {
  id: string
  date: string
  version: string
  description: string
  author: string
  changeType: "created" | "updated" | "reviewed" | "approved"
}

export interface ProjectArtifact {
  type: "minimundo" | "diagram" | "use-cases" | "requirements"
  title: string
  preview: string
  lastModified: string
  content: string | any // Content can be string (markdown) or object (diagram)
  icon: React.ComponentType<{ className?: string }>
  updateHistory: ArtifactUpdateHistory[]
}

export interface ProjectVersion {
  id: string
  version: string
  date: string
  status: "draft" | "review" | "approved"
  artifacts: ProjectArtifact[] // Moved artifacts here
}

export interface MeetingTranscription {
  id: string
  date: string // YYYY-MM-DD
  title: string // e.g., "Reunião de Kick-off", "Reunião de Refinamento"
  content: string // The raw text/audio transcription
  generatedArtifacts?: {
    // Optional, store artifacts generated from this transcription
    minimundo?: string
    diagram?: any
    useCases?: string
    requirements?: string
  }
}

export interface ProjectModule {
  id: string
  name: string
  description: string
  createdAt: string
  lastModified: string
  versions: ProjectVersion[]
  transcriptions: MeetingTranscription[]
  tags: string[]
}

export interface HistoryProject {
  id: string
  name: string
  description: string
  createdAt: string
  lastModified: string
  modules: ProjectModule[] // Changed from versions to modules
  tags: string[]
}

export const projects: HistoryProject[] = mockData