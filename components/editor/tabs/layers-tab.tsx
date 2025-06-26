"use client"

import type React from "react"
import { useEditor } from "@/contexts/editor-context"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronDown, Eye, EyeOff, Trash2, GripVertical } from "lucide-react"
import { useState, useRef ,useEffect} from "react"
import { cn } from "@/lib/utils"
import type { Element } from "@/contexts/editor-context"
import { useDrag, useDrop, type XYCoord, useDragLayer } from "react-dnd"

interface LayerItemProps {
  element: Element
  level: number
  index: number
  parentId?: string
  path: string // e.g., "0.1.2" for root[0].children[1].children[2]
}

const ITEM_TYPE = "layer"

function LayerItem({ element, level, index, parentId, path }: LayerItemProps) {
  const { state, dispatch } = useEditor()
  const [isExpanded, setIsExpanded] = useState(true)
  const ref = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const monitor = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    isDragging: monitor.isDragging(),
    clientOffset: monitor.getClientOffset(),
  }))

  const hasChildren = element.children && element.children.length > 0
  const isSelected = state.selectedElement === element.id
  const isVisible = (element.styles.desktop?.display ?? "block") !== "none" // Check desktop display

  // Drag functionality
  const [{ isDragging }, drag, dragPreview] = useDrag(() => ({
    type: ITEM_TYPE,
    item: {
      id: element.id,
      originalPath: path,
      parentId,
      index,
      element, // Pass the whole element for potential deep cloning or inspection
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    // To prevent dragging parent into its own child
    canDrag: () => state.editingMode === "editing",
  }))

  // Drop functionality
  const [{ handlerId, isOverCurrent }, drop] = useDrop({
    accept: ITEM_TYPE,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
        isOverCurrent: monitor.isOver({ shallow: true }),
      }
    },
    hover(item: any, monitor) {
      if (!ref.current || state.editingMode !== "editing") {
        return
      }
      const dragId = item.id
      const hoverId = element.id

      // Don't replace items with themselves
      if (dragId === hoverId) {
        return
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect()
      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      // Determine mouse position
      const clientOffset = monitor.getClientOffset()
      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top

      // We are hovering over an item. We need to decide if we are dropping
      // ON it (if it's a container) or BEFORE/AFTER it.

      // If dropping on a container and mouse is within a central portion, allow nesting.
      // Otherwise, prioritize reordering.
      const isContainer = ["div", "section", "header", "footer", "main", "article", "aside"].includes(element.tag)
      const canNest = isContainer && !item.originalPath.startsWith(path) // Prevent nesting into self or child

      // If trying to nest, and it's a valid nesting target
      if (canNest && hoverClientY > hoverBoundingRect.height * 0.25 && hoverClientY < hoverBoundingRect.height * 0.75) {
        // Mark as potential nesting target
        // The actual nesting dispatch will happen on drop
        if (ref.current) ref.current.dataset.dropTargetType = "nest"
        return
      }
      if (ref.current) ref.current.dataset.dropTargetType = "reorder"

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (item.originalPath < path && hoverClientY < hoverMiddleY) {
        return
      }
      // Dragging upwards
      if (item.originalPath > path && hoverClientY > hoverMiddleY) {
        return
      }

      // Time to actually perform the action if it's a reorder
      // This is a preview move, actual move on drop
      // dispatch({ type: 'PREVIEW_MOVE_ELEMENT_LAYER', payload: { dragPath: item.originalPath, hoverPath: path } });
      // item.originalPath = path; // Update path for continued dragging
    },
    drop: (item: any, monitor) => {
      if (state.editingMode !== "editing") return

      const didDrop = monitor.didDrop()
      if (didDrop) {
        return
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect()
      const clientOffset = monitor.getClientOffset()
      const hoverClientY = (clientOffset as XYCoord).y - (hoverBoundingRect?.top ?? 0)
      const hoverMiddleY = ((hoverBoundingRect?.bottom ?? 0) - (hoverBoundingRect?.top ?? 0)) / 2

      const isContainer = ["div", "section", "header", "footer", "main", "article", "aside"].includes(element.tag)
      const canNest = isContainer && !item.originalPath.startsWith(path)

      let targetParentId = parentId
      let targetIndex = index

      // Determine if nesting or reordering
      if (
        canNest &&
        hoverBoundingRect &&
        hoverClientY > hoverBoundingRect.height * 0.2 &&
        hoverClientY < hoverBoundingRect.height * 0.8
      ) {
        // Nest inside the current element
        targetParentId = element.id
        targetIndex = element.children?.length || 0 // Add to end of children
      } else {
        // Reorder: place before or after the current element
        if (hoverClientY < hoverMiddleY) {
          // Place before
          targetIndex = index
        } else {
          // Place after
          targetIndex = index + 1
        }
      }

      dispatch({
        type: "MOVE_ELEMENT",
        payload: {
          elementId: item.id,
          newParentId: targetParentId,
          index: targetIndex,
        },
      })
    },
  })

  drag(drop(ref)) // Attach both drag and drop to the same ref

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (state.editingMode === "editing") {
      dispatch({ type: "SELECT_ELEMENT", payload: { id: element.id } })
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (state.editingMode === "editing") {
      dispatch({ type: "DELETE_ELEMENT", payload: { id: element.id } })
    }
  }

  const toggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (state.editingMode === "editing") {
      const currentDisplay = element.styles.desktop?.display
      const newDisplay = currentDisplay === "none" ? element.styles.desktop?.originalDisplay || "block" : "none"

      dispatch({
        type: "UPDATE_ELEMENT_STYLES",
        payload: {
          id: element.id,
          breakpoint: "desktop", // Visibility is primarily a desktop concern for layers
          styles: {
            display: newDisplay,
            // Store original display if hiding, to restore it
            ...(newDisplay === "none" && currentDisplay !== "none" && { originalDisplay: currentDisplay }),
          },
        },
      })
    }
  }

  const dropTargetType = ref.current?.dataset.dropTargetType
  const showNestIndicator = isOverCurrent && dropTargetType === "nest"
  const showReorderIndicator = isOverCurrent && dropTargetType === "reorder"
useEffect(() => {
  if (previewRef.current) {
    dragPreview(previewRef)
  }
}, [dragPreview])
  return (
    <div
      ref={previewRef} // Use dragPreview for the outer div to avoid conflicts with the drag handle
      className={cn("group relative", isDragging && "opacity-30")}
    >
      {showReorderIndicator && (
        <div
          className="absolute left-0 right-0 h-0.5 bg-blue-500 z-10"
          style={{
            top:
              ref.current &&
              monitor.clientOffset &&
              (monitor.clientOffset as XYCoord).y - ref.current.getBoundingClientRect().top <
                ref.current.getBoundingClientRect().height / 2
                ? "-1px"
                : "calc(100% - 1px)",
          }}
        />
      )}
      <div
        ref={ref}
        data-handler-id={handlerId}
        className={cn(
          "flex items-center py-2 px-2 hover:bg-gray-100 cursor-pointer rounded text-sm",
          isSelected && "bg-blue-100 text-blue-900",
          showNestIndicator && "bg-green-100 border-2 border-green-400 border-dashed",
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleSelect}
      >
        <GripVertical
          className="w-4 h-4 text-gray-400 mr-1 cursor-grab flex-shrink-0"
          // ref={drag} // Attach drag only to the handle
        />

        {hasChildren && (
          <Button
            variant="ghost"
            size="sm"
            className="w-4 h-4 p-0 mr-1 flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
          >
            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </Button>
        )}
        {!hasChildren && <div className="w-4 mr-1 flex-shrink-0" /> /* Placeholder for alignment */}

        <span className="flex-1 truncate">
          {element.tag}{" "}
          {element.content && `- ${element.content.slice(0, 20)}${element.content.length > 20 ? "..." : ""}`}
        </span>

        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="w-6 h-6 p-0"
            onClick={toggleVisibility}
            title={isVisible ? "Hide" : "Show"}
          >
            {isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 text-gray-400" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-6 h-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={handleDelete}
            title="Delete element"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {element.children.map((child, childIndex) => (
            <LayerItem
              key={child.id}
              element={child}
              level={level + 1}
              index={childIndex}
              parentId={element.id}
              path={`${path}.${childIndex}`}
            />
          ))}
          {element.children.length === 0 && state.editingMode === "editing" && (
            <div
              className="ml-4 my-1 text-xs text-gray-400 italic"
              style={{ paddingLeft: `${(level + 1) * 16 + 8}px` }}
            >
              Empty {element.tag}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function RootDropZone({ children, path }: { children: React.ReactNode; path: string }) {
  const { state, dispatch } = useEditor()
  const ref = useRef<HTMLDivElement>(null)

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ITEM_TYPE,
    drop: (item: any, monitor) => {
      if (!monitor.didDrop() && state.editingMode === "editing") {
        // Dropping at the root level
        dispatch({
          type: "MOVE_ELEMENT",
          payload: {
            elementId: item.id,
            newParentId: undefined, // Root level
            index: state.elements.length, // Add to the end of root elements
          },
        })
      }
    },
    canDrop: (item: any) => state.editingMode === "editing" && !item.originalPath.startsWith(path), // Prevent dropping a parent into itself at root
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  }))

  drop(ref)

  return (
    <div
      ref={ref}
      className={cn(
        "min-h-full py-1", // Added py-1 for a small drop area at top/bottom of root
        isOver && canDrop && "bg-blue-50 border-2 border-blue-300 border-dashed rounded",
      )}
    >
      {children}
    </div>
  )
}

export function LayersTab() {
  const { state } = useEditor()

  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Layers</h3>
      <ScrollArea className="h-[calc(100vh-200px)]">
        <RootDropZone path="root">
          <div className="space-y-0.5">
            {" "}
            {/* Reduced space for tighter look */}
            {state.elements.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No elements yet. Drag elements from the Elements tab to get started.
              </p>
            ) : (
              state.elements.map((element, index) => (
                <LayerItem key={element.id} element={element} level={0} index={index} path={`${index}`} />
              ))
            )}
          </div>
        </RootDropZone>
      </ScrollArea>
    </div>
  )
}
