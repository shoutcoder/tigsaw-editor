"use client"
import { ElementsTab } from "./tabs/elements-tab"
import { LayersTab } from "./tabs/layers-tab"
import { InteractionsTab } from "./tabs/interactions-tab"
import { AssetsTab } from "./tabs/assets-tab"
import { GlobalJsTab } from "./tabs/global-js-tab"
import { Layers, Plus, Zap, ImageIcon, HelpCircle, Code } from "lucide-react"
import { useEditor } from "@/contexts/editor-context"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const tabConfig = [
  { value: "elements", label: "Add", icon: Plus },
  { value: "layers", label: "Layers", icon: Layers },
  // Styles tab is now in its own panel
  { value: "interactions", label: "Actions", icon: Zap },
  { value: "assets", label: "Assets", icon: ImageIcon },
  { value: "globaljs", label: "JS", icon: Code }, // Add this line
]

export function Sidebar() {
  const { state, dispatch } = useEditor()

  return (
    <div className="h-full flex flex-row">
      {/* Vertical Icon Tabs List */}
      <div className="w-16 bg-gray-50 border-r border-gray-200 flex flex-col items-center py-4 space-y-1 shrink-0">
        {tabConfig.map((tab) => (
          <Button
            key={tab.value}
            variant="ghost"
            className={cn(
              "w-12 h-12 flex flex-col items-center justify-center p-0 rounded-lg",
              state.activeTab === tab.value
                ? "bg-blue-100 text-blue-600"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700",
            )}
            onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: { tab: tab.value as any } })}
            title={tab.label}
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{tab.label}</span>
          </Button>
        ))}
        <div className="flex-grow" /> {/* Spacer */}
        <Button
          variant="ghost"
          className="w-12 h-12 flex flex-col items-center justify-center p-0 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          title="Help"
        >
          <HelpCircle className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Help</span>
        </Button>
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-hidden bg-white">
        {state.activeTab === "elements" && <ElementsTab />}
        {state.activeTab === "layers" && <LayersTab />}
        {state.activeTab === "interactions" && <InteractionsTab />}
        {state.activeTab === "assets" && <AssetsTab />}
        {state.activeTab === "globaljs" && <GlobalJsTab />}
        {/* StylesTab is no longer here */}
      </div>
    </div>
  )
}
