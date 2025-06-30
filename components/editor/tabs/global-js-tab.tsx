"use client";

import { useEditor } from "@/contexts/editor-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Play, RotateCcw } from "lucide-react";
import { useState} from "react";

export function GlobalJsTab() {
  const { state, dispatch } = useEditor();
  const [jsCode, setJsCode] = useState(state.globalJs || "");

  const handleSave = () => {
    dispatch({ type: "SET_GLOBAL_JS", payload: { js: jsCode } });
  };

  const handleReset = () => {
    setJsCode("");
    dispatch({ type: "SET_GLOBAL_JS", payload: { js: "" } });
  };

  const handleExecute = () => {
    try {
      console.log("🚀 Manually executing JS:", jsCode);
      const executeJs = new Function(jsCode);
      executeJs();
      console.log("✅ JS executed successfully");
    } catch (error) {
      console.error("❌ Error executing JS:", error);
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        Global JavaScript
      </h3>
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-4">
          <div>
            <div className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Code className="w-4 h-4" />
                JavaScript Code
              </CardTitle>
            </div>
            <div className="space-y-4">
              <Textarea
                value={jsCode}
                onChange={(e) => setJsCode(e.target.value)}
                placeholder="// Enter your JavaScript code here
console.log('Hello from global JS!');

// Example: Add custom interactions
document.addEventListener('DOMContentLoaded', function() {
  console.log('Page loaded with global JS!');
  
  // Example: Add a custom alert when page loads
  // alert('Welcome to my website!');
  
  // Example: Add custom styling
  // document.body.style.cursor = 'crosshair';
  
  // Example: Add event listeners to any element
  // const buttons = document.querySelectorAll('button');
  // buttons.forEach(btn => {
  //   btn.addEventListener('mouseover', () => {
  //     btn.style.transform = 'scale(1.1)';
  //   });
  // });
});

// This code will run in browse mode and be included in export"
                className="font-mono text-xs h-64 bg-gray-50"
              />

              <div className="flex gap-1.5 flex-wrap">
                <Button onClick={handleSave} size="sm">
                  Save & Apply
                </Button>
                <Button onClick={handleExecute} variant="outline" size="sm">
                  <Play className="w-4 h-4 mr-1" />
                  Test Run
                </Button>
                <Button onClick={handleReset} variant="outline" size="sm">
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Reset
                </Button>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                 <p>• <i className="text-red-500">Click <span>"Save & Apply"</span> to save your changes to the database </i> </p>
                <p>
                  • This JavaScript will be executed in the editor environment
                </p>
                <p>
                  • Code runs when switching to browse mode or when manually
                  executed
                </p>
                <p>• Use console.log() to debug - check browser console</p>
                <p>• This code will also be included in the exported website</p>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
