"use client";

import type React from "react";
import { useState, useCallback } from "react";
import { Sidebar } from "./sidebar";
import { Canvas } from "./canvas";
import { TopBar } from "./top-bar";
import { StylePanel } from "./style-panel";
import { useEditor } from "@/contexts/editor-context";
import { cn } from "@/lib/utils";
import { SettingsModal } from "../ui/settingModal";

export function EditorLayout() {
  const { state } = useEditor();
  const [isLeftPanelExpanded, setIsLeftPanelExpanded] = useState(true);
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(320);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(320);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state

  // Constants
  const COLLAPSED_WIDTH = 80;
  const MIN_EXPANDED_WIDTH = 320;
  const MAX_WIDTH = 500;

  // Left panel toggle
  const toggleLeftPanel = useCallback(() => {
    setIsLeftPanelExpanded(!isLeftPanelExpanded);
    setLeftSidebarWidth(isLeftPanelExpanded ? COLLAPSED_WIDTH : 400);
  }, [isLeftPanelExpanded]);

  // Left panel resize
  const handleLeftResize = (e: React.MouseEvent) => {
    const startX = e.clientX;
    const startWidth = leftSidebarWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = startWidth + (moveEvent.clientX - startX);
      const minWidth = isLeftPanelExpanded
        ? MIN_EXPANDED_WIDTH
        : COLLAPSED_WIDTH;

      if (newWidth < MIN_EXPANDED_WIDTH && isLeftPanelExpanded) {
        setIsLeftPanelExpanded(false);
        setLeftSidebarWidth(COLLAPSED_WIDTH);
        return;
      }

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

  // Right panel resize
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
      {/* TopBar with button */}

      <TopBar setIsModalOpen={setIsModalOpen} isModalOpen={isModalOpen} />

      {/* Main editor layout */}
      <div className="flex flex-1 overflow-hidden mb-3">
        {/* Left Sidebar */}
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

        {/* Left Resize Handle */}
        {!state.isPreviewMode && (
          <div
            className={cn(
              "w-3 cursor-col-resize flex-shrink-0",
              !isLeftPanelExpanded && "opacity-0 pointer-events-none"
            )}
            onMouseDown={handleLeftResize}
          />
        )}

        {/* Main content (Canvas + Right Panel) */}
        <div className="relative flex flex-1 overflow-hidden transition-all duration-300">
          <div className="relative flex-1 overflow-hidden">
            <Canvas />
          </div>

          {/* Resize handle */}
          {/* ... right panel ... */}

          {!state.isPreviewMode && (
            <div
              className="mr-3 bg-white rounded-2xl flex-shrink-0"
              style={{ width: rightSidebarWidth }}
            >
              <StylePanel />
            </div>
          )}

          {/* 🔥 Modal covers Canvas + StylePanel */}
          <SettingsModal
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        </div>
      </div>
    </div>
  );
}
