"use client";

import { useSearchParams } from 'next/navigation';
import type React from "react";
import { createContext, useContext, useEffect, useReducer, useState, type ReactNode } from "react";

export interface Element {
  id: string;
  type: string;
  tag: string;
  content?: string;
  // Responsive styles - desktop is base, others only override when specifically set
  styles: {
    desktop: Record<string, any> & {
      // Ensure other styles are still allowed
      fontFamily?: string;
      fontFaceUrl?: string;
    };
    tablet?: Record<string, any> & {
      fontFamily?: string;
      fontFaceUrl?: string;
    };
    mobile?: Record<string, any> & {
      fontFamily?: string;
      fontFaceUrl?: string;
    };
  };
  attributes: Record<string, any>;
  children: Element[];
  parent?: string;
  // Interactive states
  states?: {
    default: {
      styles: Record<string, any>;
      content?: string;
      visible: boolean;
    };
    hover?: {
      styles: Record<string, any>;
      content?: string;
    };
    active?: {
      styles: Record<string, any>;
      content?: string;
    };
    [key: string]: any;
  };
  currentState?: string;
  interactions?: {
    onClick?: {
      action: "toggle" | "show" | "hide" | "navigate";
      target?: string;
      value?: any;
    };
    onHover?: {
      action: "show" | "hide";
      target?: string;
    };
  };
}

export interface Asset {
  id: string;
  name: string;
  url: string;
  type: "image" | "video";
}

export interface EditorState {
  elements: Element[];
  selectedElement: string | null;
  currentBreakpoint: "desktop" | "tablet" | "mobile";
  isPreviewMode: boolean;
  editingMode: "editing" | "browsing";
  history: Element[][];
  historyIndex: number;
  activeTab:
    | "elements"
    | "layers"
    | "styles"
    | "interactions"
    | "assets"
    | "globaljs";
  interactionStates: Record<string, any>;
  draggedElement: string | null;
  assets: Asset[];
  selectedAssetForStyle: Asset | null;
  globalJs: string;
}

type EditorAction =
 | { type: "INITIALIZE_STATE"; payload: { elements: Element[]; globalJs: string; initialInteractionStates: Record<string, any> } }
 
  | {
      type: "ADD_ELEMENT";
      payload: { element: Element; parentId?: string; index?: number };
    }
  | {
      type: "UPDATE_ELEMENT";
      payload: { id: string; updates: Partial<Element> };
    }
  | {
      type: "UPDATE_ELEMENT_STYLES";
      payload: {
        id: string;
        breakpoint: "desktop" | "tablet" | "mobile";
        styles: Record<string, any>;
      };
    }
  | { type: "DELETE_ELEMENT"; payload: { id: string } }
  | { type: "SELECT_ELEMENT"; payload: { id: string | null } }
  | {
      type: "SET_BREAKPOINT";
      payload: { breakpoint: "desktop" | "tablet" | "mobile" };
    }
  | { type: "TOGGLE_PREVIEW" }
  | { type: "SET_EDITING_MODE"; payload: { mode: "editing" | "browsing" } }
  | {
      type: "MOVE_ELEMENT";
      payload: { elementId: string; newParentId?: string; index: number };
    }
  | { type: "LOAD_DESIGN"; payload: { elements: Element[] } }
  | { type: "SET_GLOBAL_JS"; payload: { js: string } }
  | { type: "UNDO" }
  | { type: "REDO" }
  | {
      type: "SET_ACTIVE_TAB";
      payload: {
        tab:
          | "elements"
          | "layers"
          | "styles"
          | "interactions"
          | "assets"
          | "globaljs";
      };
    }
  | {
      type: "UPDATE_INTERACTION_STATE";
      payload: { elementId: string; state: any };
    }
  | {
      type: "TRIGGER_INTERACTION";
      payload: { elementId: string; interaction: string; event?: any };
    }
  | { type: "SET_DRAGGED_ELEMENT"; payload: { elementId: string | null } }
  | { type: "ADD_ASSET"; payload: { asset: Asset } }
  | { type: "DELETE_ASSET"; payload: { id: string } }
  | { type: "SELECT_ASSET_FOR_STYLE"; payload: { asset: Asset | null } };

// Initialize with default hero banner
// const defaultContent = importDesign("", "", "");

const initialState: EditorState = {
  // elements: defaultContent.elements,
  elements: [],
  selectedElement: null,
  currentBreakpoint: "desktop",
  isPreviewMode: false,
  editingMode: "editing",
  // history: [defaultContent.elements],
  history: [[]],
  historyIndex: 0,
  activeTab: "elements",
  // interactionStates: defaultContent.initialInteractionStates || {}, // Use initial states if provided
   interactionStates:{}, 
  draggedElement: null,
  assets: [],
  selectedAssetForStyle: null,
  // globalJs: defaultContent.globalJs,
  globalJs: "",
};

function findElementById(
  elements: Element[],
  id: string | null
): Element | null {
  if (!id) return null;

  for (const element of elements) {
    if (element.id === id) return element;
    if (element.children && element.children.length > 0) {
      const found = findElementById(element.children, id);
      if (found) return found;
    }
  }
  return null;
}

// Helper function to get computed styles for an element at a specific breakpoint
export function getComputedStyles(
  element: Element,
  breakpoint: "desktop" | "tablet" | "mobile"
): Record<string, any> {
  const desktopStyles = element.styles.desktop || {};

  if (breakpoint === "desktop") {
    return desktopStyles;
  }

  // For tablet and mobile, merge desktop styles with breakpoint-specific overrides
  const breakpointStyles = element.styles[breakpoint] || {};

  return {
    ...desktopStyles,
    ...breakpointStyles,
  };
}

// Helper function to check if a breakpoint has specific styles
export function hasBreakpointStyles(
  element: Element,
  breakpoint: "tablet" | "mobile"
): boolean {
  return (
    element.styles[breakpoint] !== undefined &&
    Object.keys(element.styles[breakpoint] || {}).length > 0
  );
}

function updateElementInTree(
  elements: Element[],
  id: string,
  updates: Partial<Element>
): Element[] {
  return elements.map((element) => {
    if (element.id === id) {
      return { ...element, ...updates };
    }
    if (element.children && element.children.length > 0) {
      return {
        ...element,
        children: updateElementInTree(element.children, id, updates),
      };
    }
    return element;
  });
}

function updateElementStylesInTree(
  elements: Element[],
  id: string,
  breakpoint: "desktop" | "tablet" | "mobile",
  styles: Record<string, any>
): Element[] {
  return elements.map((element) => {
    if (element.id === id) {
      const updatedElement = { ...element };

      if (breakpoint === "desktop") {
        // Update desktop styles directly
        updatedElement.styles = {
          ...element.styles,
          desktop: {
            ...element.styles.desktop,
            ...styles,
          },
        };
      } else {
        // For tablet/mobile, create breakpoint-specific styles if they don't exist
        const currentBreakpointStyles = element.styles[breakpoint] || {};
        updatedElement.styles = {
          ...element.styles,
          [breakpoint]: {
            ...currentBreakpointStyles,
            ...styles,
          },
        };
      }

      return updatedElement;
    }
    if (element.children && element.children.length > 0) {
      return {
        ...element,
        children: updateElementStylesInTree(
          element.children,
          id,
          breakpoint,
          styles
        ),
      };
    }
    return element;
  });
}

function deleteElementFromTree(elements: Element[], id: string): Element[] {
  return elements
    .map((element) => {
      if (element.id === id) {
        return null; // Mark for removal
      }
      if (element.children && element.children.length > 0) {
        const updatedChildren = deleteElementFromTree(element.children, id);
        return { ...element, children: updatedChildren };
      }
      return element;
    })
    .filter(Boolean) as Element[]; // Remove null elements
}

function removeElementFromTree(
  elements: Element[],
  id: string
): { elements: Element[]; element: Element | null } {
  let removedElement: Element | null = null;

  const newElements = elements
    .map((element) => {
      if (element.id === id) {
        removedElement = element;
        return null; // Mark for removal
      }
      if (element.children && element.children.length > 0) {
        const result = removeElementFromTree(element.children, id);
        if (result.element) {
          removedElement = result.element;
        }
        // Return a new element with updated children (immutable)
        return {
          ...element,
          children: result.elements,
        };
      }
      return element;
    })
    .filter(Boolean) as Element[]; // Remove null elements

  return { elements: newElements, element: removedElement };
}

function insertElementInTree(
  elements: Element[],
  element: Element,
  parentId?: string,
  index?: number
): Element[] {
  if (!parentId) {
    // Insert at root level
    if (index !== undefined) {
      const newElements = [...elements];
      newElements.splice(index, 0, element);
      return newElements;
    }
    return [...elements, element];
  }

  return elements.map((el) => {
    if (el.id === parentId) {
      const newChildren = [...el.children];
      if (index !== undefined) {
        newChildren.splice(index, 0, element);
      } else {
        newChildren.push(element);
      }
      return { ...el, children: newChildren };
    }
    if (el.children && el.children.length > 0) {
      return {
        ...el,
        children: insertElementInTree(el.children, element, parentId, index),
      };
    }
    return el;
  });
}

function addToHistory(state: EditorState): EditorState {
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(JSON.parse(JSON.stringify(state.elements)));

  return {
    ...state,
    history: newHistory.slice(-50), // Keep only last 50 states
    historyIndex: Math.min(newHistory.length - 1, 49),
  };
}

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
     case "INITIALIZE_STATE": {
      const { elements, globalJs, initialInteractionStates } = action.payload
      return {
        ...state,
        elements,
        globalJs,
        interactionStates: initialInteractionStates,
        history: [elements],
        historyIndex: 0,
      }
    }
    case "ADD_ELEMENT": {
      console.log("🚀 ADD_ELEMENT dispatched:", action.payload);
      const newState = addToHistory(state);
      const { element, parentId, index } = action.payload;

      // Initialize with only desktop styles (no tablet/mobile until specifically edited)
      const elementWithResponsiveStyles = {
        ...element,
        styles: {
          desktop: element.styles?.desktop || element.styles || {},
          // Don't initialize tablet/mobile - they'll be created when first edited
        },
      };

      const newElements = insertElementInTree(
        newState.elements,
        elementWithResponsiveStyles,
        parentId,
        index
      );

      return {
        ...newState,
        elements: newElements,
        selectedElement: elementWithResponsiveStyles.id,
        activeTab: "styles",
      };
    }

    case "UPDATE_ELEMENT": {
      const newState = addToHistory(state);
      return {
        ...newState,
        elements: updateElementInTree(
          newState.elements,
          action.payload.id,
          action.payload.updates
        ),
      };
    }

    case "UPDATE_ELEMENT_STYLES": {
      const newState = addToHistory(state);
      const { id, breakpoint, styles } = action.payload;
      return {
        ...newState,
        elements: updateElementStylesInTree(
          newState.elements,
          id,
          breakpoint,
          styles
        ),
      };
    }

    case "DELETE_ELEMENT": {
      console.log("🚀 DELETE_ELEMENT dispatched:", action.payload);
      const newState = addToHistory(state);
      return {
        ...newState,
        elements: deleteElementFromTree(newState.elements, action.payload.id),
        selectedElement:
          newState.selectedElement === action.payload.id
            ? null
            : newState.selectedElement,
      };
    }

    case "SELECT_ELEMENT":
      console.log("🚀 SELECT_ELEMENT dispatched:", action.payload);
      return {
        ...state,
        selectedElement: action.payload.id,
        activeTab: action.payload.id ? "styles" : state.activeTab,
      };

    case "SET_BREAKPOINT":
      return {
        ...state,
        currentBreakpoint: action.payload.breakpoint,
      };

    case "TOGGLE_PREVIEW":
      return {
        ...state,
        isPreviewMode: !state.isPreviewMode,
      };

    case "SET_EDITING_MODE":
      return {
        ...state,
        editingMode: action.payload.mode,
        selectedElement:
          action.payload.mode === "browsing" ? null : state.selectedElement,
      };

    case "MOVE_ELEMENT": {
      console.log("🚀 MOVE_ELEMENT dispatched:", action.payload);
      const newState = addToHistory(state);
      const { elementId, newParentId, index } = action.payload;

      // Validate elementId exists
      if (!elementId) {
        console.error("❌ MOVE_ELEMENT: elementId is required");
        return newState;
      }

      // Prevent moving element to itself or its children to avoid infinite loops
      if (elementId === newParentId) {
        console.error("❌ MOVE_ELEMENT: Cannot move element to itself");
        return newState;
      }

      // Remove element from current position
      const { elements: elementsAfterRemoval, element } = removeElementFromTree(
        newState.elements,
        elementId
      );

      if (!element) {
        console.error("❌ MOVE_ELEMENT: Element not found with id:", elementId);
        return newState;
      }

      console.log("✅ Element found and removed:", element.id);

      // Update element's parent reference (only set if newParentId is provided)
      const updatedElement = {
        ...element,
        parent: newParentId || undefined, // Clear parent if moving to root
      };

      // Insert element at new position
      const newElements = insertElementInTree(
        elementsAfterRemoval,
        updatedElement,
        newParentId,
        index
      );

      console.log("✅ Element moved successfully");

      return {
        ...newState,
        elements: newElements,
        draggedElement: null, // Clear dragged element
      };
    }

    case "SET_DRAGGED_ELEMENT":
      return {
        ...state,
        draggedElement: action.payload.elementId,
      };

    case "UPDATE_INTERACTION_STATE": {
      return {
        ...state,
        interactionStates: {
          ...state.interactionStates,
          [action.payload.elementId]: action.payload.state,
        },
      };
    }

    case "TRIGGER_INTERACTION": {
      const { elementId, interaction } = action.payload;
      console.log("🚀 TRIGGER_INTERACTION dispatched:", {
        elementId,
        interaction,
      });

      const element = findElementById(state.elements, elementId);
      console.log("🔍 Found element:", element);

      if (!element) {
        console.log("❌ Element not found!");
        return state;
      }

      if (!element.interactions) {
        console.log("❌ Element has no interactions!");
        return state;
      }

      const interactionConfig =
        element.interactions[interaction as keyof typeof element.interactions];
      console.log("🎮 Interaction config:", interactionConfig);

      if (!interactionConfig) {
        console.log("❌ No interaction config found for:", interaction);
        return state;
      }

      console.log("📊 Current interaction states:", state.interactionStates);

      let newInteractionStates = { ...state.interactionStates };

      switch (interactionConfig.action) {
        case "toggle":
          console.log("🔄 Toggle action for target:", interactionConfig.target);
          if (interactionConfig.target) {
            const targetElement = findElementById(
              state.elements,
              interactionConfig.target
            );
            console.log("🎯 Target element found:", targetElement);
            if (targetElement) {
              const currentVisibility =
                state.interactionStates[interactionConfig.target]?.visible;
              const newVisibility = currentVisibility === false ? true : false;
              console.log(
                "👁️ Current visibility:",
                currentVisibility,
                "-> Setting to:",
                newVisibility
              );
              newInteractionStates = {
                ...state.interactionStates,
                [interactionConfig.target]: { visible: newVisibility },
              };
            }
          }
          break;
        case "show":
          console.log("👁️ Show action for target:", interactionConfig.target);
          if (interactionConfig.target) {
            const targetElement = findElementById(
              state.elements,
              interactionConfig.target
            );
            console.log("🎯 Target element found:", targetElement);
            newInteractionStates = {
              ...state.interactionStates,
              [interactionConfig.target]: { visible: true },
            };
            console.log(
              "✅ Setting visibility to true for:",
              interactionConfig.target
            );
          }
          break;
        case "hide":
          console.log("🙈 Hide action for target:", interactionConfig.target);
          if (interactionConfig.target) {
            newInteractionStates = {
              ...state.interactionStates,
              [interactionConfig.target]: { visible: false },
            };
            console.log(
              "✅ Setting visibility to false for:",
              interactionConfig.target
            );
          }
          break;
        default:
          console.log("❓ Unknown action:", interactionConfig.action);
      }

      console.log("🔄 New interaction states:", newInteractionStates);

      return {
        ...state,
        interactionStates: newInteractionStates,
      };
    }

    case "UNDO": {
      if (state.historyIndex > 0) {
        const newIndex = state.historyIndex - 1;
        return {
          ...state,
          elements: JSON.parse(JSON.stringify(state.history[newIndex])),
          historyIndex: newIndex,
        };
      }
      return state;
    }

    case "REDO": {
      if (state.historyIndex < state.history.length - 1) {
        const newIndex = state.historyIndex + 1;
        return {
          ...state,
          elements: JSON.parse(JSON.stringify(state.history[newIndex])),
          historyIndex: newIndex,
        };
      }
      return state;
    }

    case "SET_ACTIVE_TAB":
      return {
        ...state,
        activeTab: action.payload.tab,
      };

    case "ADD_ASSET":
      return {
        ...state,
        assets: [...state.assets, action.payload.asset],
      };

    case "DELETE_ASSET":
      return {
        ...state,
        assets: state.assets.filter((asset) => asset.id !== action.payload.id),
      };

    case "LOAD_DESIGN":
      // Note: This action does not handle JS. Use SET_GLOBAL_JS for that.
      return {
        ...state,
        elements: action.payload.elements,
      };

    case "SET_GLOBAL_JS":
      return {
        ...state,
        globalJs: action.payload.js,
      };

    case "SELECT_ASSET_FOR_STYLE":
      return {
        ...state,
        selectedAssetForStyle: action.payload.asset,
      };

    default:
      return state;
  }
}

const EditorContext = createContext<{
  state: EditorState;
  dispatch: React.Dispatch<EditorAction>;
} | null>(null);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(editorReducer, initialState);
    const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId') || ''; // Default to a specific template ID if not provided
  const [isInitialized, setIsInitialized] = useState(false)

useEffect(() => {
    const initializeEditor = async () => {
      try {
        // Your direct API call approach
        const res = await fetch(`http://localhost:3000/api/templates/${templateId}`)
        const data = await res.json()
        console.log("Data api", data)
        const elements: Element[] = Array.isArray(data.editableCode) ? data.editableCode : []
        const globalJs: string = typeof data.js === 'string' ? data.js : ""
        
        // const {editableCode:Element[]} = data
        dispatch({
          type: "INITIALIZE_STATE",
          payload: {
            elements,
            globalJs,
            initialInteractionStates: {},
          },
        })
        
        setIsInitialized(true)
        if(data.js && data.js.trim() !== "") {
          const executeJs = new Function(data.js)
          executeJs()
        }
      } catch (error) {
        console.error("Failed to initialize editor:", error)
        setIsInitialized(true) // Still mark as initialized to show the empty state
      }
    }

    initializeEditor()
  }, [])
  if (!isInitialized) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading editor...
      </div>
    )
  }
  return (
    <EditorContext.Provider value={{ state, dispatch }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditor must be used within EditorProvider");
  }
  return context;
}

export { findElementById };

