"use client"

import type React from "react"
import { useRef,useEffect } from "react"
import { useDrop } from "react-dnd"
import { useEditor } from "@/contexts/editor-context"
import { cn } from "@/lib/utils"
import { generateId } from "@/lib/utils"

interface DragDropZoneProps {
  parentId?: string
  children: React.ReactNode
  className?: string
  minHeight?: string
}

export function DragDropZone({ parentId, children, className, minHeight = "60px" }: DragDropZoneProps) {
  const { state, dispatch } = useEditor()
const dropRef = useRef<HTMLDivElement>(null)
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ["element", "layer"],
    drop: (item: any, monitor) => {
      if (!monitor.didDrop()) {
        if (item.elementType) {
          // Dropping a new element from the elements tab
          const newElement = {
            id: generateId(),
            type: item.elementType.type,
            tag: item.elementType.tag,
            content: item.elementType.defaultContent || "",
            styles: { ...item.elementType.defaultStyles },
            attributes:
              item.elementType.tag === "img"
                ? { src: "/placeholder.svg?height=200&width=400", alt: "Placeholder" }
                : {},
            children: [],
            parent: parentId,
          }

          dispatch({
            type: "ADD_ELEMENT",
            payload: { element: newElement, parentId },
          })
        } else if (item.elementId) {
          // Moving an existing element from layers
          dispatch({
            type: "MOVE_ELEMENT",
            payload: {
              elementId: item.elementId,
              newParentId: parentId,
              index: 0,
            },
          })
        }
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

  return (
    <div
      ref={dropRef}
      className={cn(
        "relative transition-all duration-200",
        isOver &&
          canDrop &&
          state.editingMode === "editing" &&
          "bg-blue-50 border-2 border-blue-300 border-dashed rounded",
        className,
      )}
      style={{ minHeight }}
    >
      {children}
      {isOver && canDrop && state.editingMode === "editing" && (
        <div className="absolute inset-0 bg-blue-100 bg-opacity-30 rounded flex items-center justify-center z-10 pointer-events-none">
          <span className="text-blue-600 font-medium bg-white px-2 py-1 rounded shadow text-sm">Drop here</span>
        </div>
      )}
    </div>
  )
}
