"use client"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { EditorProvider } from "@/contexts/editor-context"
import { EditorLayout } from "@/components/editor/editor-layout"
import { GlobalJsExecutor } from "@/components/editor/global-js-executor"
import { Toaster } from "@/components/ui/toaster"

export default function VisualEditor() {
  return (
    <DndProvider backend={HTML5Backend}>
      <EditorProvider>
        <div className="h-screen bg-gray-50">
          <EditorLayout />
          <GlobalJsExecutor />
          <Toaster />
        </div>
      </EditorProvider>
    </DndProvider>
  )
}
