"use client"

import { useEditor, findElementById } from "@/contexts/editor-context"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"

export function InteractionsTab() {
  const { state, dispatch } = useEditor()

  const selectedElement = findElementById(state.elements, state.selectedElement)

  if (!state.selectedElement || !selectedElement) {
    return (
      <div className="p-4">
        <p className="text-sm text-gray-500 text-center py-8">Select an element to add interactions</p>
      </div>
    )
  }

  const updateInteraction = (interactionType: string, updates: any) => {
    const currentInteractions = selectedElement.interactions || {}

    dispatch({
      type: "UPDATE_ELEMENT",
      payload: {
        id: state.selectedElement!,
        updates: {
          interactions: {
            ...currentInteractions,
            [interactionType]: {
              ...currentInteractions[interactionType],
              ...updates,
            },
          },
        },
      },
    })
  }

  const removeInteraction = (interactionType: string) => {
    const currentInteractions = selectedElement.interactions || {}
    const newInteractions = { ...currentInteractions }
    delete newInteractions[interactionType]

    dispatch({
      type: "UPDATE_ELEMENT",
      payload: {
        id: state.selectedElement!,
        updates: {
          interactions: newInteractions,
        },
      },
    })
  }

  const getAllElements = (elements: any[]): any[] => {
    let allElements: any[] = []
    elements.forEach((element) => {
      allElements.push(element)
      if (element.children && element.children.length > 0) {
        allElements = allElements.concat(getAllElements(element.children))
      }
    })
    return allElements
  }

  const allElements = getAllElements(state.elements)
  const targetElements = allElements.filter((el) => el.id !== selectedElement.id)

  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        Interactions - {selectedElement.tag} #{selectedElement.id.slice(0, 6)}
      </h3>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-4">
          {/* Click Interactions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Click Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedElement.interactions?.onClick ? (
                <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium">Action Type</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-red-500"
                      onClick={() => removeInteraction("onClick")}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>

                  <Select
                    value={selectedElement.interactions.onClick.action}
                    onValueChange={(value) => updateInteraction("onClick", { action: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="toggle">Toggle Element</SelectItem>
                      <SelectItem value="show">Show Element</SelectItem>
                      <SelectItem value="hide">Hide Element</SelectItem>
                    </SelectContent>
                  </Select>

                  {selectedElement.interactions.onClick.action !== "navigate" && (
                    <div>
                      <Label className="text-xs">Target Element</Label>
                      <Select
                        value={selectedElement.interactions.onClick.target || ""}
                        onValueChange={(value) => updateInteraction("onClick", { target: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select target element" />
                        </SelectTrigger>
                        <SelectContent>
                          {targetElements.map((element) => (
                            <SelectItem key={element.id} value={element.id}>
                              {element.tag} - {element.content?.slice(0, 20) || element.id.slice(0, 8)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => updateInteraction("onClick", { action: "toggle", target: "" })}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Click Action
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Hover Interactions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Hover Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedElement.interactions?.onHover ? (
                <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium">Action Type</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-red-500"
                      onClick={() => removeInteraction("onHover")}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>

                  <Select
                    value={selectedElement.interactions.onHover.action}
                    onValueChange={(value) => updateInteraction("onHover", { action: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="show">Show Element</SelectItem>
                      <SelectItem value="hide">Hide Element</SelectItem>
                    </SelectContent>
                  </Select>

                  <div>
                    <Label className="text-xs">Target Element</Label>
                    <Select
                      value={selectedElement.interactions.onHover.target || ""}
                      onValueChange={(value) => updateInteraction("onHover", { target: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select target element" />
                      </SelectTrigger>
                      <SelectContent>
                        {targetElements.map((element) => (
                          <SelectItem key={element.id} value={element.id}>
                            {element.tag} - {element.content?.slice(0, 20) || element.id.slice(0, 8)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => updateInteraction("onHover", { action: "show", target: "" })}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Hover Action
                </Button>
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* Quick Presets */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Quick Presets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  // Create a popup element
                  const popupId = `popup-${Date.now()}`
                  const popup = {
                    id: popupId,
                    type: "popup",
                    tag: "div",
                    content: "",
                    styles: {
                      position: "fixed",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      backgroundColor: "white",
                      padding: "20px",
                      borderRadius: "8px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                      zIndex: "1000",
                      display: "none",
                    },
                    attributes: {},
                    children: [],
                  }

                  dispatch({ type: "ADD_ELEMENT", payload: { element: popup } })
                  updateInteraction("onClick", { action: "toggle", target: popupId })
                }}
              >
                Create Popup
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  // Create a dropdown element
                  const dropdownId = `dropdown-${Date.now()}`
                  const dropdown = {
                    id: dropdownId,
                    type: "dropdown",
                    tag: "div",
                    content: "Dropdown content",
                    styles: {
                      position: "absolute",
                      top: "100%",
                      left: "0",
                      backgroundColor: "white",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      padding: "10px",
                      display: "none",
                      minWidth: "150px",
                    },
                    attributes: {},
                    children: [],
                  }

                  dispatch({ type: "ADD_ELEMENT", payload: { element: dropdown, parentId: selectedElement.id } })
                  updateInteraction("onClick", { action: "toggle", target: dropdownId })
                }}
              >
                Create Dropdown
              </Button>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  )
}
