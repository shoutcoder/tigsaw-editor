"use client"

import { Button } from "@/components/ui/button"
import { useEditor } from "@/contexts/editor-context"
import {
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  Download,
  Save,
  Undo,
  Redo,
  Edit3,
  MousePointer,
  Settings,
  ChevronDown,
  LayoutGrid,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { exportDesign } from "@/lib/export"
import { useToast } from "@/hooks/use-toast"
import { useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function TopBar() {
  const { state, dispatch } = useEditor()
  const { toast } = useToast()

  // Add keyboard shortcuts (copied from old Toolbar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "z":
            e.preventDefault()
            if (e.shiftKey) {
              dispatch({ type: "REDO" })
            } else {
              dispatch({ type: "UNDO" })
            }
            break
          case "y":
            e.preventDefault()
            dispatch({ type: "REDO" })
            break
          case "e":
            e.preventDefault()
            dispatch({
              type: "SET_EDITING_MODE",
              payload: { mode: state.editingMode === "editing" ? "browsing" : "editing" },
            })
            break
        }
      } else if (e.key === "Delete" && state.selectedElement && state.editingMode === "editing") {
        e.preventDefault()
        dispatch({ type: "DELETE_ELEMENT", payload: { id: state.selectedElement } })
      } else if (e.key === "Escape") {
        if (state.editingMode === "browsing") {
          dispatch({ type: "SET_EDITING_MODE", payload: { mode: "editing" } })
        } else if (state.selectedElement) {
          dispatch({ type: "SELECT_ELEMENT", payload: { id: null } })
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [dispatch, state.selectedElement, state.editingMode])

  const breakpoints = [
    { key: "desktop" as const, icon: Monitor, label: "Desktop" },
    { key: "tablet" as const, icon: Tablet, label: "Tablet" },
    { key: "mobile" as const, icon: Smartphone, label: "Mobile" },
  ]

  const handleExport = () => {
    const files = exportDesign(state.elements, state.globalJs) // Pass globalJs here
    files.forEach((file) => {
      const blob = new Blob([file.content], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = file.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    })
    toast({
      title: "Export Complete",
      description: "Your website files have been downloaded with global JS included.",
    })
  }

  const canUndo = state.historyIndex > 0
  const canRedo = state.historyIndex < state.history.length - 1

  return (
    <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-3 shrink-0">
      {/* Left Section */}
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" className="w-8 h-8 bg-gray-900 text-white hover:bg-gray-700">
          <LayoutGrid className="w-5 h-5" /> {/* Placeholder "T" */}
        </Button>
        <div className="w-px h-6 bg-gray-200" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <span className="text-sm font-medium">Project</span>
              <ChevronDown className="w-4 h-4 ml-1 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>My Project</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Project Settings</DropdownMenuItem>
            <DropdownMenuItem>New Project</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-600 hover:text-gray-900">
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      {/* Center Section - Editing Tools */}
      <div className="flex items-center space-x-1">
        <div className="flex items-center space-x-0.5 bg-gray-100 rounded-md p-0.5">
          <Button
            variant={state.editingMode === "editing" ? "default" : "ghost"}
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => {
              console.log("🔧 Switching to editing mode")
              dispatch({ type: "SET_EDITING_MODE", payload: { mode: "editing" } })
            }}
            title="Editing Mode (Ctrl+E)"
          >
            <Edit3 className="w-3.5 h-3.5 mr-1" />
            Edit
          </Button>
          <Button
            variant={state.editingMode === "browsing" ? "default" : "ghost"}
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => {
              console.log("🌐 Switching to browsing mode")
              dispatch({ type: "SET_EDITING_MODE", payload: { mode: "browsing" } })
            }}
            title="Browsing Mode (Ctrl+E)"
          >
            <MousePointer className="w-3.5 h-3.5 mr-1" />
            Browse
          </Button>
        </div>
        <div className="w-px h-5 bg-gray-200 mx-1.5" />
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7 text-gray-600 hover:text-gray-900"
          disabled={!canUndo}
          onClick={() => dispatch({ type: "UNDO" })}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7 text-gray-600 hover:text-gray-900"
          disabled={!canRedo}
          onClick={() => dispatch({ type: "REDO" })}
          title="Redo (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </Button>
        <div className="w-px h-5 bg-gray-200 mx-1.5" />
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-gray-600 hover:text-gray-900">
          <Save className="w-3.5 h-3.5 mr-1" />
          Save
        </Button>
      </div>

      {/* Right Section - View & Export */}
      <div className="flex items-center space-x-1">
        <div
          className={cn(
            "px-2.5 py-1 rounded-md text-xs font-medium h-7 flex items-center",
            state.editingMode === "editing" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700",
          )}
        >
          {state.editingMode === "editing" ? "Editing" : "Browsing"}
        </div>
        <div className="w-px h-5 bg-gray-200 mx-1.5" />
        <div className="flex items-center space-x-0.5 bg-gray-100 rounded-md p-0.5">
          {breakpoints.map(({ key, icon: Icon, label }) => (
            <Button
              key={key}
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7",
                state.currentBreakpoint === key && "bg-white shadow-sm text-blue-600",
                state.currentBreakpoint !== key && "text-gray-600 hover:text-gray-900",
              )}
              onClick={() => dispatch({ type: "SET_BREAKPOINT", payload: { breakpoint: key } })}
              title={label}
            >
              <Icon className="w-4 h-4" />
            </Button>
          ))}
        </div>
        <div className="w-px h-5 bg-gray-200 mx-1.5" />
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-gray-600 hover:text-gray-900"
          onClick={() => dispatch({ type: "TOGGLE_PREVIEW" })}
        >
          <Eye className="w-3.5 h-3.5 mr-1" />
          {state.isPreviewMode ? "Editing" : "Preview"}
        </Button>
        <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={handleExport}>
          <Download className="w-3.5 h-3.5 mr-1" />
          Export
        </Button>
      </div>
    </div>
  )
}
