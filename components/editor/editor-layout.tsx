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
    <div className="flex flex-col h-screen bg-[#F0F0F0] text-gray-900">
      <TopBar />

      {/* Main Content Layout */}
      <div className="flex flex-1 overflow-hidden mb-3">
        {/* Left Sidebar - only shown when preview mode is off */}
        {!state.isPreviewMode && (
          <div
            className="bg-white flex-shrink-0 transition-all duration-300"
            style={{ width: leftSidebarWidth }}
          >
            <Sidebar
              isExpanded={isLeftPanelExpanded}
              onToggle={toggleLeftPanel}
            />
          </div>
        )}

        {/* Resize handle for Left Sidebar */}
        {!state.isPreviewMode && (
          <div
            className={cn(
              "w-3 cursor-col-resize flex-shrink-0",
              !isLeftPanelExpanded && "opacity-0 pointer-events-none"
            )}
            onMouseDown={handleLeftResize}
          />
        )}

        {/* Main Content - Always rendered */}
        <div
          className={cn(
            "relative flex flex-col overflow-hidden transition-all duration-300",
            state.isPreviewMode ? "flex-1 px-3" : "flex-1"
          )}
        >
          <Canvas />
        </div>

        {/* Resize handle for right panel */}
        {!state.isPreviewMode && (
          <div
            className="w-3 cursor-col-resize flex-shrink-0"
            onMouseDown={handleRightResize}
          />
        )}

        {/* Right Sidebar */}
        {!state.isPreviewMode && (
          <div
            className="mr-3 bg-white rounded-2xl flex-shrink-0"
            style={{ width: rightSidebarWidth }}
          >
            <StylePanel />
          </div>
        )}
      </div>
    </div>
  );
}
