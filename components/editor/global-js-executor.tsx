"use client"

import { useEditor } from "@/contexts/editor-context"
import { useEffect, useRef } from "react"

export function GlobalJsExecutor() {
  const { state } = useEditor()
  const hasExecutedRef = useRef(false)
  const lastJsRef = useRef("")

  useEffect(() => {
    // Only execute in browse mode and when JS has changed or mode just switched
    if (state.editingMode === "browsing" && state.globalJs && state.globalJs.trim() !== "") {
      const jsChanged = lastJsRef.current !== state.globalJs
      const shouldExecute = jsChanged || !hasExecutedRef.current

      if (shouldExecute) {
        try {
          console.log("🚀 Executing global JS in browse mode:", state.globalJs)

          // Execute in a setTimeout to ensure DOM is ready and in proper context
          setTimeout(() => {
            try {
              // Execute the code in the global window context
              const script = document.createElement("script")
              script.textContent = state.globalJs
              document.head.appendChild(script)

              // Clean up the script element after execution
              setTimeout(() => {
                if (script.parentNode) {
                  script.parentNode.removeChild(script)
                }
              }, 100)

              hasExecutedRef.current = true
              lastJsRef.current = state.globalJs
              console.log("✅ Global JS executed successfully in browse mode")
            } catch (error) {
              console.error("❌ Error executing global JS:", error)
            }
          }, 100)
        } catch (error) {
          console.error("❌ Error setting up global JS execution:", error)
        }
      }
    }

    // Reset execution flag when switching back to editing mode
    if (state.editingMode === "editing") {
      hasExecutedRef.current = false
    }
  }, [state.globalJs, state.editingMode])

  // This component doesn't render anything
  return null
}
