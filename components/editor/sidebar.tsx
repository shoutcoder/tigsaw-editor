"use client";
import { ElementsTab } from "./tabs/elements-tab";
import { LayersTab } from "./tabs/layers-tab";
import { InteractionsTab } from "./tabs/interactions-tab";
import { AssetsTab } from "./tabs/assets-tab";
import { GlobalJsTab } from "./tabs/global-js-tab";
import {
  Layers,
  Plus,
  Zap,
  ImageIcon,
  HelpCircle,
  Code,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SetStateAction, useState } from "react";
interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
}
const tabConfig = [
  { value: "elements", label: "Add", icon: Plus },
  { value: "layers", label: "Layers", icon: Layers },
  { value: "interactions", label: "Actions", icon: Zap },
  { value: "assets", label: "Assets", icon: ImageIcon },
  { value: "globaljs", label: "JS", icon: Code },
];

export function Sidebar({ isExpanded, onToggle }: SidebarProps) {
  const [activeTab, setActiveTab] = useState("elements");
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  const handleTabChange = (tabValue: string) => {
    if (activeTab !== tabValue && !isExpanded) {
      onToggle();
      setActiveTab(tabValue);
      return;
    }
    if (activeTab === tabValue) {
      onToggle();
    } else {
      setActiveTab(tabValue);
    }
  };

  const activeTabConfig = tabConfig.find((tab) => tab.value === activeTab);

  return (
    <div className={`h-full flex pl-3 flex-row bg-[#F0F0F0] gap-3 `}>
      {/* Left Icon Panel */}
      <div className="bg-white flex flex-col items-center py-6 w-16 shrink-0 rounded-tl-2xl rounded-bl-2xl">
        {/* Toggle Button at the top */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="p-1 h-8 w-8 mb-4 text-gray-600 hover:bg-gray-200 rounded-[6px]"
        >
          {isExpanded ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </Button>

        <div className="flex flex-col items-center gap-4">
          {tabConfig.map((tab) => (
            <div
              onClick={() => handleTabChange(tab.value)}
              key={tab.value}
              className="flex flex-col justify-center items-center gap-1.5 cursor-pointer"
            >
              <Button
                variant="ghost"
                className={cn(
                  "flex flex-col h-7 w-7 items-center justify-center p-2 rounded-[6px] transition-colors",
                  activeTab === tab.value
                    ? "bg-gray-900 text-white hover:bg-black hover:text-white shadow-sm"
                    : "text-[#45556C]   hover:text-gray-700"
                )}
                title={tab.label}
              >
                <tab.icon size={32} />
              </Button>
              <span className="text-[9px] font-medium leading-tight">
                {tab.label}
              </span>
            </div>
          ))}
        </div>

        <div className="flex-grow" />

        <Button
          variant="ghost"
          className="w-14 h-14 flex flex-col items-center justify-center p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          title="Help"
        >
          <HelpCircle className="w-5 h-5 mb-1" />
          <span className="text-[9px] font-medium leading-tight">Help</span>
        </Button>
      </div>

      {/* Main Content Area */}
      {isRightPanelOpen && (
        <div className="flex-1 flex flex-col overflow-hidden  bg-white  rounded-tr-2xl rounded-br-2xl">
          {/* Header with Tab Title */}
          <div className="flex items-center justify-between  p-3 pt-4 mb-4 border-b border-[#FE784E] mx-2">
            {activeTabConfig && (
              <div className="flex items-center gap-2">
                <activeTabConfig.icon className="w-4 h-4 font-semibold  text-gray-700" />
                <h2 className="font-semibold text-gray-900">
                  {activeTabConfig.label}
                </h2>
              </div>
            )}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-auto bg-white">
            {activeTab === "elements" && <ElementsTab />}
            {activeTab === "layers" && <LayersTab />}
            {activeTab === "interactions" && <InteractionsTab />}
            {activeTab === "assets" && <AssetsTab />}
            {activeTab === "globaljs" && <GlobalJsTab />}
          </div>
        </div>
      )}
    </div>
  );
}
