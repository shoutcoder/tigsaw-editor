"use client";

import { Button } from "@/components/ui/button";
import { useEditor } from "@/contexts/editor-context";
import {
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  Download,
  Save,
  Undo,
  Redo,
  Edit3,
  MousePointer,
  Settings,
  ChevronDown,
  LayoutGrid,
  ArrowLeft,
  TriangleAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { exportDesign } from "@/lib/export";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SettingsModal } from "../ui/settingModal";

interface TopBarProps {
  setIsModalOpen: (open: boolean) => void;
  isModalOpen: boolean;
}
import { useSearchParams } from "next/navigation";

export function TopBar({ setIsModalOpen, isModalOpen }: TopBarProps) {
  // export function TopBar() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId") || ""; // Default to a specific template ID if not provided
  const { state, dispatch } = useEditor();
  const { toast } = useToast();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsConfigured, setSettingsConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Add keyboard shortcuts (copied from old Toolbar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "z":
            e.preventDefault();
            if (e.shiftKey) {
              dispatch({ type: "REDO" });
            } else {
              dispatch({ type: "UNDO" });
            }
            break;
          case "y":
            e.preventDefault();
            dispatch({ type: "REDO" });
            break;
          case "e":
            e.preventDefault();
            dispatch({
              type: "SET_EDITING_MODE",
              payload: {
                mode: state.editingMode === "editing" ? "browsing" : "editing",
              },
            });
            break;
        }
      } else if (
        e.key === "Delete" &&
        state.selectedElement &&
        state.editingMode === "editing"
      ) {
        e.preventDefault();
        dispatch({
          type: "DELETE_ELEMENT",
          payload: { id: state.selectedElement },
        });
      } else if (e.key === "Escape") {
        if (state.editingMode === "browsing") {
          dispatch({ type: "SET_EDITING_MODE", payload: { mode: "editing" } });
        } else if (state.selectedElement) {
          dispatch({ type: "SELECT_ELEMENT", payload: { id: null } });
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [dispatch, state.selectedElement, state.editingMode]);

  const breakpoints = [
    { key: "desktop" as const, icon: Monitor, label: "Desktop" },
    { key: "tablet" as const, icon: Tablet, label: "Tablet" },
    { key: "mobile" as const, icon: Smartphone, label: "Mobile" },
  ];

  const handleExport = async () => {
    setIsLoading(true);
    try {
      const files = exportDesign(state.elements, state.globalJs);
      const parser = new DOMParser();
      const doc = parser.parseFromString(files[0].content, "text/html");
      const body = doc.querySelector("body");
      body?.querySelector("script")?.remove();
      console.log("BODY", body);

      const css = files[1].content;
      const htmlString = body ? body.outerHTML : "";

      console.log("Html", htmlString);
      const res = await fetch(
        "http://localhost:3000/api/templates/updateEditableCode",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: templateId,
            editableCode: state.elements || [],
            js: state.globalJs || "",
            html: htmlString,
            css,
          }),
        }
      );
      if (!res.ok) {
        toast({
          title: "Export Failed",
          description: "There was an error exporting your design.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Export Successful",
        description: "Your design has been saved successfully.",
      });
      // const files = exportDesign(state.elements, state.globalJs); // Pass globalJs here
      // files.forEach((file) => {
      //   const blob = new Blob([file.content], { type: "text/plain" });
      //   const url = URL.createObjectURL(blob);
      //   const a = document.createElement("a");
      //   a.href = url;
      //   a.download = file.name;
      //   document.body.appendChild(a);
      //   a.click();
      //   document.body.removeChild(a);
      //   URL.revokeObjectURL(url);
      // });
    } catch (err) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your design.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  return (
    <div className=" w-full bg-[#F0F0F0]  gap-3  flex  items-center  p-3 shrink-0">
      {/* Left Section */}
      <div className="flex items-center min-w-[220px] md:w-[280px] space-x-2 bg-white p-3 rounded-xl text-sm">
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 bg-gray-900 text-white hover:bg-gray-700"
        >
          <ArrowLeft className="w-5 h-5" /> {/* Placeholder "T" */}
        </Button>

        <p className="border border-[rgba(0,0,0,0.1)] text-sm  py-1 px-2 font-semibold rounded-md">
          Demo Widgets
        </p>
        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <span className="text-sm font-medium">Project</span>
              <ChevronDown className="w-4 h-4 ml-1 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>My Project</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Project Settings</DropdownMenuItem>
            <DropdownMenuItem>New Project</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> */}
        {/* <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 text-gray-600 hover:text-gray-900"
        >
          <Settings className="w-5 h-5" />
        </Button> */}
      </div>

      {/* Center Section - Editing Tools */}
      <div className=" flex-1 bg-white  items-center  flex flex-row justify-between p-3 rounded-xl text-sm">
        <div className="flex flex-row items-center  gap-3 ">
          {" "}
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 text-gray-600 hover:text-gray-900"
            disabled={!canUndo}
            onClick={() => dispatch({ type: "UNDO" })}
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 text-gray-600 hover:text-gray-900"
            disabled={!canRedo}
            onClick={() => dispatch({ type: "REDO" })}
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </Button>
          <div className="w-px h-5 bg-gray-200 mx-1.5" />
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs font-medium text-gray-600 hover:text-gray-900"
          >
            <Save className="w-3.5 h-3.5 mr-1" />
            Save
          </Button>
        </div>

        <div className="flex items-center space-x-1">
          <div className="flex items-center space-x-0.5 bg-gray-100 rounded-md p-0.5">
            <Button
              variant={state.editingMode === "editing" ? "default" : "ghost"}
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => {
                console.log("🔧 Switching to editing mode");
                dispatch({
                  type: "SET_EDITING_MODE",
                  payload: { mode: "editing" },
                });
              }}
              title="Editing Mode (Ctrl+E)"
            >
              <Edit3 className="w-3.5 h-3.5 mr-1" />
              Edit
            </Button>
            <Button
              variant={state.editingMode === "browsing" ? "default" : "ghost"}
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => {
                console.log("🌐 Switching to browsing mode");
                dispatch({
                  type: "SET_EDITING_MODE",
                  payload: { mode: "browsing" },
                });
              }}
              title="Browsing Mode (Ctrl+E)"
            >
              <MousePointer className="w-3.5 h-3.5 mr-1" />
              Browse
            </Button>
          </div>
        </div>

        <div className="flex flex-row gap-3 items-center">
          {" "}
          <div className="flex flex-row items-center gap-3">
            {/* Mode Badge */}
            <div
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-medium h-7 flex items-center",
                state.editingMode === "editing"
                  ? "bg-[#FE784E1A] text-black"
                  : "bg-green-100 text-green-700"
              )}
            >
              {state.editingMode === "editing" ? "Editing" : "Browsing"}
            </div>

            {/* Divider */}
            <div className="w-px h-5 bg-gray-200 mx-1.5" />

            {/* Breakpoint Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-md p-0.5">
              {breakpoints.map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  onClick={() =>
                    dispatch({
                      type: "SET_BREAKPOINT",
                      payload: { breakpoint: key },
                    })
                  }
                  className={cn(
                    "flex items-center gap-2 px-2 py-1 rounded-md transition-colors",
                    state.currentBreakpoint === key
                      ? "bg-white shadow-sm text-black"
                      : "text-gray-600 hover:text-black"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <p className="text-sm font-medium hidden xl:block">{label}</p>
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="w-px h-5 bg-gray-200 mx-1.5" />

            {/* Preview Toggle */}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-gray-600 hover:text-gray-900"
            onClick={() => dispatch({ type: "TOGGLE_PREVIEW" })}
          >
            <Eye className="w-3.5 h-3.5 mr-1" />
            {state.isPreviewMode ? "Editing" : "Preview"}
          </Button>
        </div>
        {/* Right Section - View & Export */}
        <div className="flex items-center space-x-1 gap-2">
          <div className="relative inline-block">
            <button
              onClick={() => setIsModalOpen(!isModalOpen)}
              className="p-2 border border-gray-300 rounded-lg flex items-center justify-center bg-white hover:border-gray-400"
            >
              <Settings className="w-4 h-4 text-gray-700" />
            </button>

            {!settingsConfigured && (
              <TriangleAlert className="absolute -top-1.5 -right-1.5 w-4 h-4 text-orange-500 bg-white rounded-full" />
            )}
          </div>
          <div className="flex items-center space-x-1">
            {/* <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-gray-600 hover:text-gray-900"
            >
              <Settings className="w-5 h-5" />
            </Button> */}

            <Button
              variant="outline"
              size="lg"
              className="h-7 px-6 text-xs"
              onClick={handleExport}
              disabled={isLoading || !settingsConfigured}
            >
              {/* > */}
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 mr-1 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                  Publishing...
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 mr-1" />
                  Publish
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
