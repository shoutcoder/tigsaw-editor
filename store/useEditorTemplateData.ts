import { create } from "zustand";
interface Element {
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

interface EditorStore {
  id: string;
  templateName: string;
  templateURL: string;
  js: string;
  locationType: string;
  deviceType: string;
  editableCode:Element[];
  hasUnsavedChanges: boolean;

  setTemplateData: (
    data: Partial<Omit<EditorStore, 'setTemplateData' | 'setHasUnsavedChanges'>>
  ) => void;

  setHasUnsavedChanges: (val: boolean) => void;
  resetTemplateData: () => void;
}

export const useEditorTemplateData = create<EditorStore>((set) => ({
  id: "",
  templateName: "",
  templateURL: "",
  js: "",
  locationType: "",
  deviceType: "",
  editableCode: [],
  hasUnsavedChanges: false,

  setTemplateData: (data) =>
    set((state) => ({
      ...state,
      ...data,
    })),

  setHasUnsavedChanges: (val) => set({ hasUnsavedChanges: val }),

  resetTemplateData: () =>
    set({
      id: "",
      templateName: "",
      templateURL: "",
      js: "",
      locationType: "",
      deviceType: "",
      editableCode: [],
      hasUnsavedChanges: false,
    }),
}));
