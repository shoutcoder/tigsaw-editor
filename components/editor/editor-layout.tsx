"use client"

import type React from "react"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { Canvas } from "./canvas"
import { TopBar } from "./top-bar" // New component
import { StylePanel } from "./style-panel" // New component
import { useEditor } from "@/contexts/editor-context"

export function EditorLayout() {
  const { state } = useEditor()
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(300) // Combined width for icons + content
  const [rightSidebarWidth, setRightSidebarWidth] = useState(300)

  const handleResize = (
    e: React.MouseEvent,
    setWidth: React.Dispatch<React.SetStateAction<number>>,
    initialWidth: number,
    minWidth = 200,
    maxWidth = 500,
  ) => {
    const startX = e.clientX
    const startWidth = initialWidth

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = startWidth + (moveEvent.clientX - startX)
      setWidth(Math.max(minWidth, Math.min(maxWidth, newWidth)))
    }

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  const handleRightResize = (
    e: React.MouseEvent,
    setWidth: React.Dispatch<React.SetStateAction<number>>,
    initialWidth: number,
    minWidth = 200,
    maxWidth = 500,
  ) => {
    const startX = e.clientX
    const startWidth = initialWidth

    const handleMouseMove = (moveEvent: MouseEvent) => {
      // For right sidebar, movement to left decreases width, movement to right increases
      const newWidth = startWidth - (moveEvent.clientX - startX)
      setWidth(Math.max(minWidth, Math.min(maxWidth, newWidth)))
    }

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 text-gray-900">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar (Vertical Tabs + Content) */}
        <div className="bg-white border-r border-gray-200 flex-shrink-0" style={{ width: leftSidebarWidth }}>
          <Sidebar />
        </div>

        {/* Resize Handle for Left Sidebar */}
        <div
          className="w-1.5 bg-gray-200 hover:bg-gray-300 cursor-col-resize flex-shrink-0"
          onMouseDown={(e) => handleResize(e, setLeftSidebarWidth, leftSidebarWidth, 220, 500)} // Min width accounts for icon bar
        />

        {/* Main Content (Canvas) */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Canvas />
        </div>

        {/* Resize Handle for Right Sidebar */}
        <div
          className="w-1.5 bg-gray-200 hover:bg-gray-300 cursor-col-resize flex-shrink-0"
          onMouseDown={(e) => handleRightResize(e, setRightSidebarWidth, rightSidebarWidth, 250, 500)}
        />

        {/* Right Sidebar (Style Panel) */}
        <div className="bg-white border-l border-gray-200 flex-shrink-0" style={{ width: rightSidebarWidth }}>
          <StylePanel />
        </div>
      </div>
    </div>
  )
}
