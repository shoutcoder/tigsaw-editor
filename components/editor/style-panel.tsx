"use client";

import { StylesTab } from "./tabs/styles-tab";
import { useEditor } from "@/contexts/editor-context";
import { Palette } from "lucide-react";

export function StylePanel() {
  const { state } = useEditor();

  return (
    <div className="h-full overflow-y-auto scrollbar-hide ">
      {state.selectedElement ? (
        <StylesTab />
      ) : (
        <div className="p-4 text-center text-sm text-gray-500 h-full flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Palette className="w-8 h-8 text-gray-400" />
          </div>
          <p>Select an element on the canvas to see its styles.</p>
        </div>
      )}
    </div>
  );
}
