"use client"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { EditorProvider } from "@/contexts/editor-context"
import { EditorLayout } from "@/components/editor/editor-layout"
import { GlobalJsExecutor } from "@/components/editor/global-js-executor"
import { Toaster } from "@/components/ui/toaster"
import React from "react"
import { useSearchParams } from "next/navigation"

export default function VisualEditor() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId') || '';
  //TODO:Create a global state to manage templateId
  return (
    <DndProvider backend={HTML5Backend}>
      <EditorProvider templateId={templateId}>
          <div className="h-screen bg-gray-50">
        <React.StrictMode>
          <EditorLayout />
          <GlobalJsExecutor />
          <Toaster />
        </React.StrictMode>
        </div>
      </EditorProvider>
    </DndProvider>
  )
}
