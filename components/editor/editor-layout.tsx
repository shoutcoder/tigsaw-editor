"use client";

import type React from "react";
import { useState, useCallback } from "react";
import { Sidebar } from "./sidebar";
import { Canvas } from "./canvas";
import { TopBar } from "./top-bar";
import { StylePanel } from "./style-panel";
import { useEditor } from "@/contexts/editor-context";
import { cn } from "@/lib/utils";

export function EditorLayout() {
  const { state } = useEditor();
  const [isLeftPanelExpanded, setIsLeftPanelExpanded] = useState(true);
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(300);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(300);

  // Minimum widths for expanded and collapsed states
  const COLLAPSED_WIDTH = 80; // Width when only showing icons
  const MIN_EXPANDED_WIDTH = 220;
  const MAX_WIDTH = 500;

  const toggleLeftPanel = useCallback(() => {
    setIsLeftPanelExpanded(!isLeftPanelExpanded);
    // Adjust width when toggling
    setLeftSidebarWidth(isLeftPanelExpanded ? COLLAPSED_WIDTH : 400);
  }, [isLeftPanelExpanded]);

  const handleLeftResize = (e: React.MouseEvent) => {
    const startX = e.clientX;
    const startWidth = leftSidebarWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = startWidth + (moveEvent.clientX - startX);
      const minWidth = isLeftPanelExpanded
        ? MIN_EXPANDED_WIDTH
        : COLLAPSED_WIDTH;

      // If width becomes less than collapsed width, automatically collapse
      if (newWidth < MIN_EXPANDED_WIDTH && isLeftPanelExpanded) {
        setIsLeftPanelExpanded(false);
        setLeftSidebarWidth(COLLAPSED_WIDTH);
        return;
      }

      // If width becomes more than collapsed width while collapsed, automatically expand
      if (newWidth > COLLAPSED_WIDTH && !isLeftPanelExpanded) {
        setIsLeftPanelExpanded(true);
      }

      setLeftSidebarWidth(Math.max(minWidth, Math.min(MAX_WIDTH, newWidth)));
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleRightResize = (e: React.MouseEvent) => {
    const startX = e.clientX;
    const startWidth = rightSidebarWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = startWidth - (moveEvent.clientX - startX);
      setRightSidebarWidth(
        Math.max(MIN_EXPANDED_WIDTH, Math.min(MAX_WIDTH, newWidth))
      );
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 text-gray-900">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div
          className="bg-white border-r border-gray-200 flex-shrink-0 transition-width duration-300"
          style={{ width: leftSidebarWidth }}
        >
          <Sidebar
            isExpanded={isLeftPanelExpanded}
            onToggle={toggleLeftPanel}
          />
        </div>

        {/* Resize Handle for Left Sidebar */}
        <div
          className={cn(
            "w-1.5 bg-gray-200 hover:bg-gray-300 cursor-col-resize flex-shrink-0",
            !isLeftPanelExpanded && "opacity-0 pointer-events-none w-1.5"
          )}
          onMouseDown={handleLeftResize}
        />

        {/* Main Content (Canvas) */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Canvas />
        </div>

        {/* Resize Handle for Right Sidebar */}
        <div
          className="w-1.5 bg-gray-200 hover:bg-gray-300 cursor-col-resize flex-shrink-0"
          onMouseDown={handleRightResize}
        />

        {/* Right Sidebar (Style Panel) */}
        <div
          className="mr-3 bg-white border-l border-gray-200 flex-shrink-0"
          style={{ width: rightSidebarWidth }}
        >
          <StylePanel />
        </div>
      </div>
    </div>
  );
}
