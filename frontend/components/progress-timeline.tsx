"use client"

import { CheckCircle, Loader2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type React from "react"

interface TimelineStep {
  id: string
  title: string
  description: string
  status: "pending" | "processing" | "completed" | "failed"
  icon: React.ComponentType<{ className?: string }>
  onAnalyze?: () => void // Optional handler to view/edit artifact
}

interface ProgressTimelineProps {
  steps: TimelineStep[]
}

export default function ProgressTimeline({ steps }: ProgressTimelineProps) {
  return (
    <div className="w-full max-w-3xl mx-auto py-12">
      <h2 className="text-3xl font-bold text-center text-foreground mb-10">Progresso da Análise</h2>
      <div className="relative flex flex-col items-start">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start w-full mb-8 last:mb-0">
            {/* Line and Icon */}
            <div className="flex flex-col items-center mr-4">
              <div
                className={cn("w-10 h-10 rounded-full flex items-center justify-center", {
                  "bg-primary/20 text-primary": step.status === "processing" || step.status === "completed",
                  "bg-muted text-muted-foreground": step.status === "pending",
                  "bg-destructive/20 text-destructive": step.status === "failed",
                })}
              >
                {step.status === "processing" ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : step.status === "completed" ? (
                  <CheckCircle className="h-5 w-5" />
                ) : step.status === "failed" ? (
                  <XCircle className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn("w-0.5 h-16", {
                    "bg-primary/30": step.status === "processing" || step.status === "completed",
                    "bg-border": step.status === "pending" || step.status === "failed",
                  })}
                />
              )}
            </div>

            {/* Content */}
            <div
              className={cn("flex-1 p-4 rounded-lg border", {
                "bg-primary/5 border-primary/20": step.status === "processing" || step.status === "completed",
                "bg-card border-border": step.status === "pending" || step.status === "failed",
              })}
            >
              <h3
                className={cn("font-semibold text-lg", {
                  "text-primary": step.status === "processing" || step.status === "completed",
                  "text-foreground": step.status === "pending" || step.status === "failed",
                })}
              >
                {step.title}
              </h3>
              <p
                className={cn("text-sm mt-1", {
                  "text-primary/80": step.status === "processing" || step.status === "completed",
                  "text-muted-foreground": step.status === "pending" || step.status === "failed",
                })}
              >
                {step.description}
              </p>
              {step.status === "completed" && step.onAnalyze && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={step.onAnalyze}
                  className="mt-3 bg-card text-primary border-primary/30 hover:bg-primary/10"
                >
                  Analisar
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
