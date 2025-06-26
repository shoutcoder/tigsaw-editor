"use client"

import type React from "react"
import { useDrag, useDrop } from "react-dnd"
import { useEditor, getComputedStyles } from "@/contexts/editor-context"
import { cn } from "@/lib/utils"
import { generateId } from "@/lib/utils"
import type { Element } from "@/contexts/editor-context"
import type { JSX } from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown, Copy, Trash2, GripVertical } from "lucide-react"

// Define which elements can have children
const CONTAINER_ELEMENTS = [
  "div",
  "section",
  "header",
  "footer",
  "nav",
  "main",
  "article",
  "aside",
  "figure",
  "form",
  "fieldset",
]

// Define void elements (cannot have children)
const VOID_ELEMENTS = [
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]

interface RenderElementProps {
  element: Element
  parentId?: string
  index?: number
}

interface DropIndicatorProps {
  position: "top" | "bottom"
  parentId?: string
  index: number
}

function DropIndicator({ position, parentId, index }: DropIndicatorProps) {
  const { state, dispatch } = useEditor()

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ["dragging-element", "element"],
    drop: (item: any, monitor) => {
      console.log("DropIndicator drop triggered:", { item, position, parentId, index })

      if (monitor.didDrop()) {
        console.log("Drop already handled by child")
        return // Prevent multiple drops
      }

      if (item.elementId) {
        // Moving existing element
        const targetIndex = position === "top" ? index : index + 1
        console.log("Moving element to index:", targetIndex)

        dispatch({
          type: "MOVE_ELEMENT",
          payload: {
            elementId: item.elementId,
            newParentId: parentId,
            index: targetIndex,
          },
        })
      } else if (item.elementType) {
        // Adding new element
        const targetIndex = position === "top" ? index : index + 1
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
          parent: parentId,
        }

        dispatch({
          type: "ADD_ELEMENT",
          payload: { element: newElement, parentId, index: targetIndex },
        })
      }
    },
    canDrop: (item) => {
      // Don't allow dropping an element on itself or its children
      if (item.elementId && parentId) {
        return item.elementId !== parentId
      }
      return true
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  }))

  // Show drop indicators when something is being dragged and we're in editing mode
  const shouldShow = state.editingMode === "editing" && (state.draggedElement || canDrop)

  if (!shouldShow) return null

  return (
    <div
      ref={(node) => {
        drop(node)
      }}
      className={cn("relative w-full transition-all duration-150 flex-shrink-0 z-10", isOver ? "h-3" : "h-1")}
      style={{
        minHeight: "12px", // Increase drop zone size
        margin: "2px 0",
      }}
    >
      {isOver && canDrop && (
        <>
          {/* Main drop line */}
          <div
            className="absolute left-0 right-0 bg-blue-500 rounded-full shadow-lg z-20"
            style={{
              height: "4px",
              top: "50%",
              transform: "translateY(-50%)",
              boxShadow: "0 0 8px rgba(59, 130, 246, 0.6)",
            }}
          />
          {/* Drop indicator dots on the sides */}
          <div
            className="absolute left-0 w-3 h-3 bg-blue-500 rounded-full shadow-lg z-20"
            style={{
              top: "50%",
              transform: "translate(-50%, -50%)",
              boxShadow: "0 0 4px rgba(59, 130, 246, 0.8)",
            }}
          />
          <div
            className="absolute right-0 w-3 h-3 bg-blue-500 rounded-full shadow-lg z-20"
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

export function RenderElement({ element, parentId, index = 0 }: RenderElementProps) {
  const { state, dispatch } = useEditor()
  const [showToolbar, setShowToolbar] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)
  const dragHandleRef = useRef<HTMLDivElement>(null)

  // Create drag item function that returns the current drag data
  const getDragItem = () => {
    console.log("Creating drag item for element:", element.id)
    return {
      elementId: element.id,
      sourceParentId: parentId,
      sourceIndex: index,
    }
  }

  const [{ isDragging }, drag, dragPreview] = useDrag(() => ({
    type: "dragging-element",
    item: getDragItem,
    canDrag: () => {
      console.log("canDrag check for element:", element.id, "editing mode:", state.editingMode)
      return state.editingMode === "editing"
    },
    collect: (monitor) => {
      const dragging = monitor.isDragging()
      if (dragging) {
        console.log("Element is being dragged:", element.id)
      }
      return {
        isDragging: dragging,
      }
    },
    end: (item, monitor) => {
      const didDrop = monitor.didDrop()
      console.log("Drag END for element:", element.id, "didDrop:", didDrop)

      // Clean up drag state when drag ends
      dispatch({ type: "SET_DRAGGED_ELEMENT", payload: { elementId: null } })

      if (!didDrop) {
        console.log("Drop was not successful - element not moved")
      }
    },
  }))

  // Handle drag state changes with useEffect
  useEffect(() => {
    if (isDragging) {
      console.log("Setting dragged element:", element.id)
      dispatch({ type: "SET_DRAGGED_ELEMENT", payload: { elementId: element.id } })
      setShowToolbar(false)
    }
  }, [isDragging, dispatch, element.id])

  // Add this useEffect after the existing drag state useEffect
  useEffect(() => {
    // Create a custom drag preview that shows the element being dragged
    if (elementRef.current) {
      dragPreview(elementRef.current, {
        anchorX: 0.5,
        anchorY: 0.5,
      })
    }
  }, [dragPreview])

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: "element",
    drop: (item: any, monitor) => {
      if (monitor.didDrop()) return // Prevent multiple drops

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
        parent: element.id,
      }

      dispatch({
        type: "ADD_ELEMENT",
        payload: { element: newElement, parentId: element.id },
      })
    },
    canDrop: () => canHaveChildren && state.editingMode === "editing",
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  }))

  const isSelected = state.selectedElement === element.id && state.editingMode === "editing"
  const canHaveChildren = CONTAINER_ELEMENTS.includes(element.tag) && element.type !== "custom-html"

  // Check if element should be visible based on interaction states
  const interactionState = state.interactionStates[element.id]
  // Default to visible (true) unless explicitly set to false
  const isVisible = interactionState?.visible !== false

  console.log(`👁️ Element ${element.id} (${element.content || element.tag}) visibility:`, {
    interactionState,
    isVisible,
    hasInteractionState: !!interactionState,
    visibleValue: interactionState?.visible,
    allInteractionStates: state.interactionStates,
  })

  // Get computed styles for current breakpoint (desktop + overrides)
  const computedStyles = getComputedStyles(element, state.currentBreakpoint)

  // Apply interaction-based styles - be more explicit about display logic
  let finalDisplay = computedStyles.display || "block"
  if (interactionState && interactionState.visible === false) {
    finalDisplay = "none"
  } else if (interactionState && interactionState.visible === true) {
    finalDisplay = computedStyles.display || "block"
  }

  const elementStyles = {
    ...computedStyles,
    display: finalDisplay,
    opacity: isDragging ? 0.3 : computedStyles.opacity || 1,
  }

  console.log(`🎨 Element ${element.id} final styles:`, {
    originalDisplay: computedStyles.display,
    finalDisplay,
    isVisible,
    interactionState,
  })

  const handleClick = (e: React.MouseEvent) => {
    console.log("🔥 Element clicked:", {
      elementId: element.id,
      elementType: element.type,
      elementTag: element.tag,
      content: element.content,
      editingMode: state.editingMode,
      interactions: element.interactions,
    })

    if (state.editingMode === "editing") {
      e.stopPropagation() // Only stop propagation in editing mode
      dispatch({ type: "SELECT_ELEMENT", payload: { id: element.id } })
      setShowToolbar(true)
    } else if (state.editingMode === "browsing") {
      console.log("🎯 Browsing mode - checking for interactions...")

      // Check for React-based interactions first
      if (element.interactions?.onClick) {
        console.log("✅ Found onClick interaction:", element.interactions.onClick)
        dispatch({
          type: "TRIGGER_INTERACTION",
          payload: { elementId: element.id, interaction: "onClick" },
        })
      } else {
        console.log("❌ No onClick interaction found")
      }

      // Don't stop propagation in browsing mode - let custom JS event listeners work
      // The custom JavaScript event listeners will handle the event after React
    }
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (
      state.editingMode === "editing" &&
      ["p", "h1", "h2", "h3", "h4", "h5", "h6", "button", "a", "span", "label"].includes(element.tag)
    ) {
      const target = e.target as HTMLElement
      // Ensure we are not trying to make an image contentEditable
      if (element.tag !== "img") {
        target.contentEditable = "true"
        target.focus()
        setShowToolbar(false)

        const handleBlur = () => {
          target.contentEditable = "false"
          dispatch({
            type: "UPDATE_ELEMENT",
            payload: {
              id: element.id,
              updates: { content: target.textContent || "" },
            },
          })
          target.removeEventListener("blur", handleBlur)
          setShowToolbar(true)
        }
        target.addEventListener("blur", handleBlur)
      }
    }
  }

  const handleMouseEnter = () => {
    if (state.editingMode === "browsing" && element.interactions?.onHover) {
      dispatch({
        type: "TRIGGER_INTERACTION",
        payload: { elementId: element.id, interaction: "onHover" },
      })
    }
  }

  // Toolbar actions
  const handleMoveUp = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (index > 0) {
      dispatch({
        type: "MOVE_ELEMENT",
        payload: {
          elementId: element.id,
          newParentId: parentId,
          index: index - 1,
        },
      })
    }
  }

  const handleMoveDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Find the parent element to determine the number of siblings
    let siblingsCount = 0
    if (parentId) {
      const parentElement = findElementById(state.elements, parentId)
      if (parentElement) {
        siblingsCount = parentElement.children.length
      }
    } else {
      siblingsCount = state.elements.length
    }

    if (index < siblingsCount - 1) {
      dispatch({
        type: "MOVE_ELEMENT",
        payload: {
          elementId: element.id,
          newParentId: parentId,
          index: index + 1,
        },
      })
    }
  }

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Deep clone styles and interactions to prevent shared references
    const newStyles = JSON.parse(JSON.stringify(element.styles))
    const newInteractions = element.interactions ? JSON.parse(JSON.stringify(element.interactions)) : undefined

    const duplicatedElement: Element = {
      ...element,
      id: generateId(),
      content: element.content ? `${element.content}` : undefined,
      styles: newStyles,
      interactions: newInteractions,
      children: [],
    }

    dispatch({
      type: "ADD_ELEMENT",
      payload: {
        element: duplicatedElement,
        parentId: parentId,
        index: index + 1,
      },
    })
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    dispatch({ type: "DELETE_ELEMENT", payload: { id: element.id } })
  }

  const elementProps: any = {
    ref: (node: HTMLElement | null) => {
      // Avoid assigning to .current if it's readonly, just use node directly
      if (node) {
        drop(node)
      }
    },
    onClick: handleClick,
    onDoubleClick: handleDoubleClick,
    onMouseEnter: handleMouseEnter,
    style: elementStyles,
    className: cn(
      "relative",
      // Only show hover effects when no element is selected and not dragging
      state.editingMode === "editing" &&
        !state.selectedElement &&
        !isDragging &&
        "hover:outline hover:outline-2 hover:outline-blue-300 transition-all",
      isSelected && !isDragging && "outline outline-2 outline-blue-500 outline-offset-1",
      isDragging && "outline outline-2 outline-green-500 outline-offset-1",
      state.editingMode === "browsing" && element.interactions && "cursor-pointer",
    ),
    ...element.attributes,
  }

  // Add key for custom HTML iframe to force re-render on content change
  if (element.type === "custom-html") {
    elementProps.key = element.content
  }

  const renderChildren = () => {
    if (element.children && element.children.length > 0) {
      return element.children.map((child, childIndex) => (
        <div key={child.id}>
          {/* Drop indicator above each child */}
          <DropIndicator position="top" parentId={element.id} index={childIndex} />
          <RenderElement element={child} parentId={element.id} index={childIndex} />
          {/* Drop indicator below last child */}
          {childIndex === element.children.length - 1 && (
            <DropIndicator position="bottom" parentId={element.id} index={childIndex} />
          )}
        </div>
      ))
    }
    return null
  }

  // Floating Toolbar
  const FloatingToolbar = () => {
    if (!isSelected || state.editingMode !== "editing" || !showToolbar || isDragging) return null

    return (
      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-blue-500 rounded-lg shadow-lg z-50 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-white hover:bg-blue-600 rounded-l-lg"
          onClick={handleMoveUp}
          disabled={index === 0}
          title="Move up"
        >
          <ArrowUp className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-white hover:bg-blue-600"
          onClick={handleMoveDown}
          title="Move down"
        >
          <ArrowDown className="w-4 h-4" />
        </Button>

        <div
          ref={(node) => {
            if (node) {
              console.log("Connecting drag to handle for element:", element.id)
              drag(node)
            }
          }}
          className="h-8 w-8 flex items-center justify-center text-white hover:bg-blue-600 cursor-move select-none"
          title="Drag to move element"
          onMouseDown={(e) => {
            console.log("Grip handle mouseDown for element:", element.id)
            e.stopPropagation()
          }}
          style={{
            touchAction: "none",
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
        >
          <GripVertical className="w-4 h-4" />
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-white hover:bg-blue-600"
          onClick={handleDuplicate}
          title="Duplicate"
        >
          <Copy className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-white hover:bg-red-500 rounded-r-lg"
          onClick={handleDelete}
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  // Mode indicator for interactive elements
  const InteractionIndicator = () => {
    if (state.editingMode !== "browsing" || !element.interactions) return null

    return (
      <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center z-10">
        ⚡
      </div>
    )
  }

  const ElementComponent = element.tag as keyof JSX.IntrinsicElements

  if (element.type === "custom-html") {
    const iframeContent = `
      <html>
        <head>
          <style>
            body { margin: 0; font-family: sans-serif; }
            /* Include Tailwind base styles if needed, or link to a CDN for preview */
          </style>
        </head>
        <body>
          ${element.content || ""}
        
        </body>
      </html>
    `
    return (
      <div className="relative">
        <DropIndicator position="top" parentId={parentId} index={index} />
        <FloatingToolbar />
        <InteractionIndicator />
        {/* Use an iframe for custom HTML to isolate styles and scripts */}
        <iframe
          key={element.content} // Force re-render if content changes
          srcDoc={iframeContent}
          style={{ ...elementStyles, width: "100%", border: "none", display: elementStyles.display }}
          className={elementProps.className.replace("relative", "")} // Remove relative from iframe itself
          sandbox="allow-scripts allow-same-origin" // Adjust sandbox as needed
          title={`custom-html-${element.id}`}
          // onClick and other handlers might not work as expected on iframe directly from parent
        />
        <DropIndicator position="bottom" parentId={parentId} index={index} />
      </div>
    )
  }

  if (canHaveChildren) {
    return (
      <div className="relative">
        {/* Drop indicator above this container */}
        <DropIndicator position="top" parentId={parentId} index={index} />

        <FloatingToolbar />
        <InteractionIndicator />

        <ElementComponent {...elementProps}>
          {/* For container elements, content is usually direct text, children are separate */}
          {!VOID_ELEMENTS.includes(element.tag) ? element.content : null}

          {/* Drop indicator at the beginning of children for empty containers */}
          {element.children.length === 0 && <DropIndicator position="top" parentId={element.id} index={0} />}

          {renderChildren()}

          {/* Show drop zone message ONLY for empty containers when NOT dragging */}
          {element.children.length === 0 && state.editingMode === "editing" && !state.draggedElement && (
            <div className="min-h-[60px] flex items-center justify-center text-gray-400 text-sm pointer-events-none border-2 border-dashed border-gray-300 rounded-md m-2">
              Drop elements here
            </div>
          )}
        </ElementComponent>

        {/* Drop indicator below this container */}
        <DropIndicator position="bottom" parentId={parentId} index={index} />
      </div>
    )
  }

  // For non-container elements (like p, h1, img, button)
  return (
    <div className="relative">
      {/* Drop indicator above this element */}
      <DropIndicator position="top" parentId={parentId} index={index} />

      <FloatingToolbar />
      <InteractionIndicator />
      {/* Conditionally render content only if not a void element */}
      {VOID_ELEMENTS.includes(element.tag) ? (
        <ElementComponent {...elementProps} />
      ) : (
        <ElementComponent {...elementProps}>{element.content}</ElementComponent>
      )}

      {/* Drop indicator below this element */}
      <DropIndicator position="bottom" parentId={parentId} index={index} />
    </div>
  )
}

function findElementById(elements: Element[], id: string): Element | undefined {
  for (const element of elements) {
    if (element.id === id) {
      return element
    }
    if (element.children && element.children.length > 0) {
      const found = findElementById(element.children, id)
      if (found) {
        return found
      }
    }
  }
  return undefined
}
