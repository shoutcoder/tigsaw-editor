"use client"

import type React from "react"

import { useDrop } from "react-dnd"
import { useEditor } from "@/contexts/editor-context"
import { RenderElement } from "./render-element"
import { cn } from "@/lib/utils"
import { generateId } from "@/lib/utils"
import { useEffect,useRef } from "react"

// Root level drop indicator
function RootDropIndicator({ position, index }: { position: "top" | "bottom"; index: number }) {
  const { state, dispatch } = useEditor()
  const dropRef = useRef<HTMLDivElement>(null)

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ["dragging-element", "element"],
    drop: (item: any) => {
      const targetIndex = position === "top" ? index : index + 1

      if (item.elementId) {
        // Moving existing element
        dispatch({
          type: "MOVE_ELEMENT",
          payload: {
            elementId: item.elementId,
            newParentId: undefined, // Root level
            index: targetIndex,
          },
        })
      } else if (item.elementType) {
        // Adding new element
        const newElement = {
          id: generateId(),
          type: item.elementType.type,
          tag: item.elementType.tag,
          content: item.elementType.defaultContent || "",
          styles: {
            desktop: { ...item.elementType.defaultStyles },
          },
          attributes:
            item.elementType.tag === "img" ? { src: "/placeholder.svg?height=200&width=400", alt: "Placeholder" } : {},
          children: [],
        }

        dispatch({
          type: "ADD_ELEMENT",
          payload: { element: newElement, index: targetIndex },
        })
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  }))
useEffect(() => {
  if (dropRef.current) {
    drop(dropRef)
  }
}, [drop])
  // Show when something is being dragged
  const shouldShow = state.editingMode === "editing" && (state.draggedElement || canDrop)

  if (!shouldShow) return null

  return (
    <div
      ref={dropRef}
      className={cn("relative w-full transition-all duration-150 flex-shrink-0 z-10", isOver ? "h-2" : "h-1")}
      style={{
        minHeight: "8px",
        margin: "2px 0",
      }}
    >
      {isOver && (
        <>
          {/* Main drop line */}
          <div
            className="absolute left-0 right-0 bg-blue-500 rounded-full shadow-lg z-20"
            style={{
              height: "3px",
              top: "50%",
              transform: "translateY(-50%)",
              boxShadow: "0 0 8px rgba(59, 130, 246, 0.6)",
            }}
          />
          {/* Drop indicator dots on the sides */}
          <div
            className="absolute left-0 w-2 h-2 bg-blue-500 rounded-full shadow-lg z-20"
            style={{
              top: "50%",
              transform: "translate(-50%, -50%)",
              boxShadow: "0 0 4px rgba(59, 130, 246, 0.8)",
            }}
          />
          <div
            className="absolute right-0 w-2 h-2 bg-blue-500 rounded-full shadow-lg z-20"
            style={{
              top: "50%",
              transform: "translate(50%, -50%)",
              boxShadow: "0 0 4px rgba(59, 130, 246, 0.8)",
            }}
          />
        </>
      )}
    </div>
  )
}

export function Canvas() {
  const { state, dispatch } = useEditor()
const cavRef = useRef<HTMLDivElement>(null)
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "element",
    drop: (item: any, monitor) => {
      if (!monitor.didDrop()) {
        const { elementType } = item
        const newElement = {
          id: generateId(),
          type: elementType.type,
          tag: elementType.tag,
          content: elementType.defaultContent || "",
          styles: {
            desktop: { ...elementType.defaultStyles },
          },
          attributes:
            elementType.tag === "img" ? { src: "/placeholder.svg?height=200&width=400", alt: "Placeholder" } : {},
          children: [],
        }

        dispatch({
          type: "ADD_ELEMENT",
          payload: { element: newElement },
        })
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  }))

  const getCanvasWidth = () => {
    switch (state.currentBreakpoint) {
      case "mobile":
        return "375px"
      case "tablet":
        return "768px"
      default:
        return "100%"
    }
  }

  // Handle canvas click to deselect elements
  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only deselect if clicking directly on canvas, not on elements
    if (e.target === e.currentTarget) {
      dispatch({ type: "SELECT_ELEMENT", payload: { id: null } })
    }
  }
  
  useEffect(() => {
  if (cavRef.current) {
    drop(cavRef)
  }
}, [drop])

  return (
    <div className="h-full bg-gray-100 overflow-auto">
      <div className="flex justify-center p-8">
        <div
          ref={cavRef}
          onClick={handleCanvasClick}
          data-canvas="true"
          className={cn(
            "bg-white min-h-[600px] shadow-lg transition-all duration-200 relative",
            state.currentBreakpoint !== "desktop" && "mx-auto",
          )}
          style={{
            width: getCanvasWidth(),
            maxWidth: state.currentBreakpoint === "desktop" ? "none" : getCanvasWidth(),
          }}
        >
          {state.elements.length === 0 ? (
            <div className="flex items-center justify-center h-96 text-gray-500">
              <div className="text-center">
                <p className="text-lg mb-2">Drop elements here to start building</p>
                <p className="text-sm">Drag components from the sidebar to get started</p>
              </div>
            </div>
          ) : (
            <div className="relative">
              {/* Root level drop indicator at the top */}
              <RootDropIndicator position="top" index={0} />

              {state.elements.map((element, index) => (
                <div key={element.id}>
                  <RenderElement element={element} index={index} />
                  {/* Root level drop indicator after each element */}
                  <RootDropIndicator position="bottom" index={index} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
