"use client";

import { useEditor, findElementById } from "@/contexts/editor-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

export function InteractionsTab() {
  const { state, dispatch } = useEditor();

  const selectedElement = findElementById(
    state.elements,
    state.selectedElement
  );

  if (!state.selectedElement || !selectedElement) {
    return (
      <div className="p-3">
        <p className="text-xs text-gray-500 text-center py-6">
          Select an element to add interactions
        </p>
      </div>
    );
  }

  const updateInteraction = (interactionType: string, updates: any) => {
    const currentInteractions = selectedElement.interactions || {};

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
    });
  };

  const removeInteraction = (interactionType: string) => {
    const currentInteractions = selectedElement.interactions || {};
    const newInteractions = { ...currentInteractions };
    delete newInteractions[interactionType];

    dispatch({
      type: "UPDATE_ELEMENT",
      payload: {
        id: state.selectedElement!,
        updates: {
          interactions: newInteractions,
        },
      },
    });
  };

  const getAllElements = (elements: any[]): any[] => {
    let allElements: any[] = [];
    elements.forEach((element) => {
      allElements.push(element);
      if (element.children?.length)
        allElements = allElements.concat(getAllElements(element.children));
    });
    return allElements;
  };

  const allElements = getAllElements(state.elements);
  const targetElements = allElements.filter(
    (el) => el.id !== selectedElement.id
  );

  return (
    <div className="p-3 text-xs">
      <h3 className="text-xs font-semibold text-gray-900 mb-3">
        Interactions — {selectedElement.tag} #{selectedElement.id.slice(0, 6)}
      </h3>

      <ScrollArea className="h-[calc(100vh-170px)] pr-1">
        <div className="space-y-3">
          {/* ==== Click Actions ==== */}
          <StyledCard title="Click Actions">
            {selectedElement.interactions?.onClick ? (
              <ActionForm
                type="onClick"
                value={selectedElement.interactions.onClick}
                targetElements={targetElements}
                update={updateInteraction}
                remove={removeInteraction}
              />
            ) : (
              <AddActionButton
                label="Add Click Action"
                onClick={() =>
                  updateInteraction("onClick", {
                    action: "toggle",
                    target: "",
                  })
                }
              />
            )}
          </StyledCard>

          {/* ==== Hover Actions ==== */}
          <StyledCard title="Hover Actions">
            {selectedElement.interactions?.onHover ? (
              <ActionForm
                type="onHover"
                value={selectedElement.interactions.onHover}
                targetElements={targetElements}
                update={updateInteraction}
                remove={removeInteraction}
              />
            ) : (
              <AddActionButton
                label="Add Hover Action"
                onClick={() =>
                  updateInteraction("onHover", { action: "show", target: "" })
                }
              />
            )}
          </StyledCard>

          <Separator />

          {/* ==== Quick Presets ==== */}
          <StyledCard title="Quick Presets">
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => {
                  const popupId = `popup-${Date.now()}`;
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
                  };

                  dispatch({
                    type: "ADD_ELEMENT",
                    payload: { element: popup },
                  });
                  updateInteraction("onClick", {
                    action: "toggle",
                    target: popupId,
                  });
                }}
              >
                Create Popup
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => {
                  const dropdownId = `dropdown-${Date.now()}`;
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
                  };

                  dispatch({
                    type: "ADD_ELEMENT",
                    payload: {
                      element: dropdown,
                      parentId: selectedElement.id,
                    },
                  });
                  updateInteraction("onClick", {
                    action: "toggle",
                    target: dropdownId,
                  });
                }}
              >
                Create Dropdown
              </Button>
            </div>
          </StyledCard>
        </div>
      </ScrollArea>
    </div>
  );
}

// 🟡 Shared Block Components

function AddActionButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full text-xs py-1"
      onClick={onClick}
    >
      <Plus className="w-3 h-3 mr-2" />
      {label}
    </Button>
  );
}

function StyledCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-2 pt-3 px-3">
        <CardTitle className="text-xs font-semibold text-gray-800">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-3 pt-0 pb-3">{children}</CardContent>
    </Card>
  );
}

function ActionForm({
  type,
  value,
  targetElements,
  update,
  remove,
}: {
  type: "onClick" | "onHover";
  value: any;
  targetElements: any[];
  update: (type: string, updates: any) => void;
  remove: (type: string) => void;
}) {
  return (
    <div className="space-y-3 p-2 bg-gray-50 rounded-md text-xs">
      <div className="flex items-center justify-between">
        <Label className="text-[10px] font-medium">Action Type</Label>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-red-500"
          onClick={() => remove(type)}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>

      <Select
        value={value.action}
        onValueChange={(val) => update(type, { action: val })}
      >
        <SelectTrigger className="h-7">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="toggle">Toggle Element</SelectItem>
          <SelectItem value="show">Show Element</SelectItem>
          <SelectItem value="hide">Hide Element</SelectItem>
        </SelectContent>
      </Select>

      <div>
        <Label className="text-[10px]">Target Element</Label>
        <Select
          value={value.target || ""}
          onValueChange={(val) => update(type, { target: val })}
        >
          <SelectTrigger className="mt-1 h-7">
            <SelectValue placeholder="Select element" />
          </SelectTrigger>
          <SelectContent>
            {targetElements.map((el) => (
              <SelectItem key={el.id} value={el.id}>
                {el.tag} — {el.content?.slice(0, 20) || el.id.slice(0, 6)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
