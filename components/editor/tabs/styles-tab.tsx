"use client";

import type React from "react";

import {
  useEditor,
  findElementById,
  getComputedStyles,
  hasBreakpointStyles,
} from "@/contexts/editor-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Palette,
  Layout,
  AlignVerticalSpaceBetweenIcon as SpacingIcon,
  Type,
  ArrowLeftRight,
  ArrowUpDown,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  Monitor,
  Tablet,
  Smartphone,
  RotateCcw,
  Square,
  Code,
  PanelTopClose,
  ImageIcon,
  Video,
  PlusCircle,
  Trash2,
  Edit2,
  ImageIcon as ImageIconLucide,
  MinusCircle,
  Settings,
  Layers,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"; // For inset/outset shadow
import { ActionControls } from "./actionControll";

// Define which elements can have layout controls
const LAYOUT_ELEMENTS = [
  "div",
  "section",
  "header",
  "footer",
  "nav",
  "main",
  "article",
  "aside",
  "figure",
  "form",
  "fieldset",
];

const FONT_SIZES = [
  { name: "XS", value: "12px" },
  { name: "SM", value: "14px" },
  { name: "Base", value: "16px" },
  { name: "LG", value: "18px" },
  { name: "XL", value: "20px" },
  { name: "2XL", value: "24px" },
  { name: "3XL", value: "30px" },
  { name: "4XL", value: "36px" },
  { name: "5XL", value: "48px" },
];

const WEB_SAFE_FONTS = [
  {
    name: "Default",
    value:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
  },
  { name: "Arial", value: "Arial, Helvetica, sans-serif" },
  { name: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { name: "Georgia", value: "Georgia, serif" },
  { name: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { name: "Courier New", value: "'Courier New', Courier, monospace" },
  { name: "Lucida Console", value: "'Lucida Console', Monaco, monospace" },
  { name: "Tahoma", value: "Tahoma, Geneva, sans-serif" },
  { name: "Trebuchet MS", value: "'Trebuchet MS', Helvetica, sans-serif" },
  { name: "Impact", value: "Impact, Charcoal, sans-serif" },
];
const CUSTOM_FONT_KEY = "custom-font";

const COLOR_PRESETS = [
  "transparent",
  "#000000",
  "#ffffff",
  "#f3f4f6",
  "#e5e7eb",
  "#d1d5db",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
  "#f59e0b",
];

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  isInherited?: boolean;
  onReset?: () => void;
  className?: string;
  popoverSide?: "top" | "right" | "bottom" | "left";
  popoverAlign?: "start" | "center" | "end";
}

interface ShadowProps {
  offsetX: string;
  offsetY: string;
  blurRadius: string;
  spreadRadius?: string; // Optional for text-shadow
  color: string;
  inset: boolean;
}

function ColorPicker({
  value,
  onChange,
  label,
  isInherited = false,
  onReset,
  className,
  popoverSide = "bottom",
  popoverAlign = "center",
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(true);
  const displayValue = value || (isInherited ? "Inherited" : "#000000");

  return (
    <div className={className}>
      {label && (
        <div className="flex items-center justify-between mb-1">
          <Label className="text-[10px] text-gray-600">{label}</Label>
          {isInherited && onReset && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
              onClick={onReset}
              title="Reset to inherit from desktop"
            >
              <RotateCcw className="w-3 h-3" />
            </Button>
          )}
        </div>
      )}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full h-9 justify-start text-left font-normal text-[10px]",
              isInherited && "border-blue-300 border-dashed"
            )}
          >
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-4 h-4 rounded border",
                  displayValue === "transparent" &&
                    "bg-transparent bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20width%3D'8'%20height%3D'8'%20viewBox%3D'0%200%208%208'%3E%3Cpath%20d%3D'M0%200h4v4H0zM4%204h4v4H4z'%20fill%3D'%23d1d5db'%2F%3E%3C%2Fsvg%3E')]"
                )}
                style={{
                  backgroundColor:
                    displayValue === "transparent" ? undefined : displayValue,
                }}
              />
              <span className="truncate">{displayValue}</span>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 border-none"
          side={popoverSide}
          align={popoverAlign}
        >
          <div className="p-3 rounded-md shadow-lg bg-white border border-gray-200">
            <Input
              type="color"
              value={value === "transparent" ? "#000000" : value} // Input type color doesn't support "transparent"
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-8 mb-2"
            />
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className={cn(
                "w-full text-[10px] h-8 mb-2",
                isInherited && "border-blue-300 border-dashed"
              )}
              placeholder="#000000 or transparent"
            />
            <div className="grid grid-cols-8 gap-1">
              {COLOR_PRESETS.map((color) => (
                <div
                  key={color}
                  className={cn(
                    "w-6 h-6 rounded cursor-pointer border border-gray-200 hover:scale-110 transition-transform",
                    color === "transparent" &&
                      "bg-transparent bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20width%3D'8'%20height%3D'8'%20viewBox%3D'0%200%208%208'%3E%3Cpath%20d%3D'M0%200h4v4H0zM4%204h4v4H4z'%20fill%3D'%23d1d5db'%2F%3E%3C%2Fsvg%3E')]"
                  )}
                  style={{
                    backgroundColor:
                      color === "transparent" ? undefined : color,
                  }}
                  onClick={() => onChange(color)}
                  title={color}
                />
              ))}
            </div>
            {isInherited && (
              <p className="text-[10px] text-blue-600 mt-1">
                Inherited from desktop
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function AttributesControl({ selectedElement, updateAttribute }: any) {
  const [isOpen, setIsOpen] = useState(true); // Initial state (open or collapsed)

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const commonAttributes = [
    { key: "id", label: "ID", placeholder: "unique-element-id" },
    { key: "class", label: "CSS Class", placeholder: "my-custom-class" },
    { key: "title", label: "Title", placeholder: "Tooltip text" },
    { key: "data-testid", label: "Test ID", placeholder: "test-element" },
  ];

  const getElementSpecificAttributes = () => {
    switch (selectedElement.tag) {
      case "a":
        return [
          {
            key: "href",
            label: "Link URL",
            placeholder: "https://example.com",
          },
          { key: "target", label: "Target", placeholder: "_blank" },
          { key: "rel", label: "Rel", placeholder: "noopener noreferrer" },
        ];
      case "img":
        return [
          { key: "alt", label: "Alt Text", placeholder: "Image description" },
          { key: "loading", label: "Loading", placeholder: "lazy" },
        ];
      case "input":
        return [
          { key: "type", label: "Type", placeholder: "text" },
          {
            key: "placeholder",
            label: "Placeholder",
            placeholder: "Enter text...",
          },
          { key: "name", label: "Name", placeholder: "field-name" },
          { key: "required", label: "Required", placeholder: "true" },
        ];
      case "button":
        return [
          { key: "type", label: "Type", placeholder: "button" },
          { key: "disabled", label: "Disabled", placeholder: "false" },
        ];
      case "form":
        return [
          { key: "action", label: "Action", placeholder: "/submit" },
          { key: "method", label: "Method", placeholder: "POST" },
        ];
      default:
        return [];
    }
  };

  const elementSpecificAttributes = getElementSpecificAttributes();
  const allAttributes = [...commonAttributes, ...elementSpecificAttributes];

  return (
    <div className=" py-2">
      <CardHeader className="p-0 cursor-pointer" onClick={toggleOpen}>
        <CardTitle className="text-[11px] font-normal flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">HTML Attributes</div>
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
        </CardTitle>
      </CardHeader>

      {isOpen && (
        <div className="space-y-3 pt-4">
          {allAttributes.map((attr) => (
            <div key={attr.key}>
              <Label className="text-[10px] text-gray-600">{attr.label}</Label>
              <Input
                value={selectedElement.attributes?.[attr.key] || ""}
                onChange={(e) => updateAttribute(attr.key, e.target.value)}
                placeholder={attr.placeholder}
                className="mt-1 text-[10px]"
              />
            </div>
          ))}

          <div className="pt-2 border-t border-gray-200">
            <p className="text-[10px] text-gray-500 mb-2">
              💡 Tip: Add an ID to target elements with JavaScript
            </p>
            <div className="bg-gray-50 p-2 rounded text-[10px] font-mono">
              document.getElementById('your-id')
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LayoutBuilder() {
  const { state, dispatch } = useEditor();
  const [isOpen, setIsOpen] = useState(true);
  const toggleOpen = () => setIsOpen((prev) => !prev);

  const currentElement = findElementById(state.elements, state.selectedElement);
  if (!currentElement) return null;

  const computedStyles = getComputedStyles(
    currentElement,
    state.currentBreakpoint
  );
  const hasSpecificStyles =
    state.currentBreakpoint !== "desktop" &&
    hasBreakpointStyles(currentElement, state.currentBreakpoint);

  const currentDisplay = computedStyles.display || "block";
  const isStack = currentDisplay === "flex";
  const isGrid = currentDisplay === "grid";

  const updateStyle = (property: string, value: string | number) => {
    dispatch({
      type: "UPDATE_ELEMENT_STYLES",
      payload: {
        id: state.selectedElement!,
        breakpoint: state.currentBreakpoint,
        styles: {
          [property]: value,
        },
      },
    });
  };

  const updateAllStyles = (newStyles: Record<string, any>) => {
    dispatch({
      type: "UPDATE_ELEMENT_STYLES",
      payload: {
        id: state.selectedElement!,
        breakpoint: state.currentBreakpoint,
        styles: newStyles,
      },
    });
  };

  const resetStyleToDesktop = (property: string | string[]) => {
    if (state.currentBreakpoint === "desktop") return;

    const currentBreakpointStyles =
      currentElement.styles[state.currentBreakpoint] || {};
    const newBreakpointStyles = { ...currentBreakpointStyles };

    const propsToReset = Array.isArray(property) ? property : [property];
    propsToReset.forEach((prop) => delete newBreakpointStyles[prop]);

    dispatch({
      type: "UPDATE_ELEMENT",
      payload: {
        id: state.selectedElement!,
        updates: {
          styles: {
            ...currentElement.styles,
            [state.currentBreakpoint]:
              Object.keys(newBreakpointStyles).length > 0
                ? newBreakpointStyles
                : undefined,
          },
        },
      },
    });
  };

  const setLayoutType = (type: "stack" | "grid") => {
    if (type === "stack") {
      const flexStyles = {
        display: "flex",
        flexDirection: computedStyles.flexDirection || "column",
        gap: computedStyles.gap || "16px",
        alignItems: computedStyles.alignItems || "stretch",
        justifyContent: computedStyles.justifyContent || "flex-start",
        flexWrap: computedStyles.flexWrap || "nowrap",
        gridTemplateColumns: "",
        gridTemplateRows: "",
        justifyItems: "",
      };
      updateAllStyles(flexStyles);
    } else if (type === "grid") {
      const gridStyles = {
        display: "grid",
        gridTemplateColumns: computedStyles.gridTemplateColumns || "1fr 1fr",
        gap: computedStyles.gap || "16px",
        alignItems: computedStyles.alignItems || "stretch",
        justifyItems: computedStyles.justifyItems || "stretch",
        flexDirection: "",
        justifyContent: "",
        flexWrap: "",
      };
      updateAllStyles(gridStyles);
    }
  };

  const getGapValue = () => {
    const gap = computedStyles.gap || "16px";
    return Number.parseFloat(gap.replace("px", "")) || 16;
  };

  const setGap = (value: number) => {
    updateStyle("gap", `${value}px`);
  };

  const isDisplayInherited =
    state.currentBreakpoint !== "desktop" &&
    !currentElement.styles[state.currentBreakpoint]?.display;
  const isGapInherited =
    state.currentBreakpoint !== "desktop" &&
    !currentElement.styles[state.currentBreakpoint]?.gap;

  return (
    <div className="py-2">
      <CardHeader className="p-0 cursor-pointer" onClick={toggleOpen}>
        <CardTitle className="text-xs font-normal flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layout className="w-4 h-4" />
            Layout
          </div>
          <div className="flex items-center gap-2">
            {hasSpecificStyles && (
              <Badge variant="secondary" className="text-[10px]">
                Custom
              </Badge>
            )}
            {/* <Badge variant="outline" className="text-[10px]">
              {state.currentBreakpoint}
            </Badge> */}
            {isOpen ? (
              <ChevronDown className="w-[14px] h-[14px] text-gray-500" />
            ) : (
              <ChevronRight className="w-[14px] h-[14px] text-gray-500" />
            )}
          </div>
        </CardTitle>
      </CardHeader>

      {isOpen && (
        <div className="space-y-4 pt-4">
          {/* Layout Type */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-gray-700">Type</Label>
              {isDisplayInherited && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-gray-400 "
                  onClick={() => resetStyleToDesktop("display")}
                  title="Reset to inherit from desktop"
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
              )}
            </div>
            <div className="flex gap-0 bg-gray-100 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "flex-1 h-9 rounded-md transition-all",
                  isStack
                    ? "bg-[#FE784E] text-white shadow-sm hover:bg-[#FE784E]"
                    : "text-gray-600  ",
                  isDisplayInherited && "border-blue-300 border-dashed"
                )}
                onClick={() => setLayoutType("stack")}
              >
                Stack
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "flex-1 h-9 rounded-md transition-all",
                  isGrid
                    ? "bg-[#FE784E] text-white shadow-sm hover:bg-[#FE784E]"
                    : "text-gray-600  ",
                  isDisplayInherited && "border-blue-300 border-dashed"
                )}
                onClick={() => setLayoutType("grid")}
              >
                Grid
              </Button>
            </div>
            {isDisplayInherited && (
              <p className="text-[10px] text-blue-600">
                Inherited from desktop
              </p>
            )}
          </div>

          {/* Stack Layout Controls */}
          {isStack && (
            <>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-700">
                  Direction
                </Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "flex-1 h-10",
                      computedStyles.flexDirection === "row"
                        ? "border-[#FE784E] bg-orange-50 text-[#FE784E]"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                    onClick={() => updateStyle("flexDirection", "row")}
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "flex-1 h-10",
                      !computedStyles.flexDirection ||
                        computedStyles.flexDirection === "column"
                        ? "border-[#FE784E] bg-orange-50 text-[#FE784E]"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                    onClick={() => updateStyle("flexDirection", "column")}
                  >
                    <ArrowUpDown className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-700">
                  Distribute
                </Label>
                <Select
                  value={computedStyles.justifyContent || "flex-start"}
                  onValueChange={(value) =>
                    updateStyle("justifyContent", value)
                  }
                >
                  <SelectTrigger className="h-10 border-gray-200 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flex-start">Start</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="flex-end">End</SelectItem>
                    <SelectItem value="space-between">Space Between</SelectItem>
                    <SelectItem value="space-around">Space Around</SelectItem>
                    <SelectItem value="space-evenly">Space Evenly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-700">
                  Align
                </Label>
                <div className="flex gap-2">
                  {/* Align Start */}
                  <Button
                    size="sm"
                    variant="outline"
                    className={cn(
                      "flex-1 h-10",
                      computedStyles.alignItems === "flex-start"
                        ? "border-[#FE784E] bg-orange-50 text-[#FE784E]"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                    onClick={() => updateStyle("alignItems", "flex-start")}
                  >
                    {computedStyles.flexDirection === "row" ? (
                      <AlignStartVertical className="w-4 h-4" />
                    ) : (
                      <AlignStartHorizontal className="w-4 h-4" />
                    )}
                  </Button>
                  {/* Align Center */}
                  <Button
                    size="sm"
                    variant="outline"
                    className={cn(
                      "flex-1 h-10",
                      computedStyles.alignItems === "center"
                        ? "border-[#FE784E] bg-orange-50 text-[#FE784E]"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                    onClick={() => updateStyle("alignItems", "center")}
                  >
                    {computedStyles.flexDirection === "row" ? (
                      <AlignCenterVertical className="w-4 h-4" />
                    ) : (
                      <AlignCenterHorizontal className="w-4 h-4" />
                    )}
                  </Button>
                  {/* Align End */}
                  <Button
                    size="sm"
                    variant="outline"
                    className={cn(
                      "flex-1 h-10",
                      computedStyles.alignItems === "flex-end"
                        ? "border-[#FE784E] bg-orange-50 text-[#FE784E]"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                    onClick={() => updateStyle("alignItems", "flex-end")}
                  >
                    {computedStyles.flexDirection === "row" ? (
                      <AlignEndVertical className="w-4 h-4" />
                    ) : (
                      <AlignEndHorizontal className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Grid Controls */}
          {isGrid && (
            <div className="space-y-2">
              <Label className="text-xs font-medium text-gray-700">
                Columns
              </Label>
              <div className="grid grid-cols-2 gap-1 mb-2">
                {[
                  { label: "1", value: "1fr" },
                  { label: "2", value: "1fr 1fr" },
                  { label: "3", value: "1fr 1fr 1fr" },
                  { label: "4", value: "1fr 1fr 1fr 1fr" },
                ].map((opt) => (
                  <Button
                    key={opt.value}
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-10 text-xs",
                      computedStyles.gridTemplateColumns === opt.value
                        ? "border-[#FE784E] bg-orange-50 text-[#FE784E]"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                    onClick={() =>
                      updateStyle("gridTemplateColumns", opt.value)
                    }
                  >
                    {opt.label} Col
                  </Button>
                ))}
              </div>
              <Input
                value={computedStyles.gridTemplateColumns || ""}
                onChange={(e) =>
                  updateStyle("gridTemplateColumns", e.target.value)
                }
                placeholder="1fr 1fr"
                className="h-10 border-gray-200 text-xs"
              />
            </div>
          )}

          {/* Gap Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-gray-700">Gap</Label>
              {isGapInherited && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                  onClick={() => resetStyleToDesktop("gap")}
                  title="Reset Gap"
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Input
                value={getGapValue()}
                onChange={(e) => setGap(Number.parseFloat(e.target.value) || 0)}
                type="number"
                step="1"
                className={cn(
                  "h-10 text-center w-20 text-xs",
                  isGapInherited && "border-blue-300 border-dashed"
                )}
              />
              <Slider
                value={[getGapValue()]}
                onValueChange={([val]) => setGap(val)}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
            {isGapInherited && (
              <p className="text-[10px] text-blue-600">
                Inherited from desktop
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CustomHtmlEditor({ selectedElement, updateContent }: any) {
  const [htmlContent, setHtmlContent] = useState(selectedElement.content || "");

  useEffect(() => {
    setHtmlContent(selectedElement.content || "");
  }, [selectedElement.content]);

  const handleBlur = () => {
    updateContent(htmlContent);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xs font-normal flex items-center gap-2">
          <Code className="w-4 h-4" /> Custom HTML
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Label className="text-[10px] text-gray-600">HTML Code</Label>
        <Textarea
          value={htmlContent}
          onChange={(e) => setHtmlContent(e.target.value)}
          onBlur={handleBlur}
          placeholder="<div>Your HTML here</div>"
          className="mt-1 font-mono text-[10px] h-48 bg-gray-50"
        />
        <p className="text-[10px] text-gray-500 mt-2">
          Note: Scripts may not run in the editor but will be included in the
          export.
        </p>
      </CardContent>
    </Card>
  );
}

function TypographyControls({
  selectedElement,
  updateStyle,
  updateContent,
}: any) {
  const { state, dispatch } = useEditor();
  const computedStyles = getComputedStyles(
    selectedElement,
    state.currentBreakpoint
  );
  const hasSpecificStyles =
    state.currentBreakpoint !== "desktop" &&
    hasBreakpointStyles(selectedElement, state.currentBreakpoint);

  const [isOpen, setIsOpen] = useState(true);
  const toggleOpen = () => setIsOpen((prev) => !prev);

  const [isCustomFont, setIsCustomFont] = useState(false);
  const [customFontName, setCustomFontName] = useState("");
  const [customFontUrl, setCustomFontUrl] = useState("");

  useEffect(() => {
    const currentFontFamily =
      computedStyles.fontFamily || WEB_SAFE_FONTS[0].value;
    const isWebSafe = WEB_SAFE_FONTS.some(
      (font) => font.value === currentFontFamily
    );
    if (!isWebSafe && currentFontFamily) {
      setIsCustomFont(true);
      setCustomFontName(currentFontFamily);
      setCustomFontUrl(computedStyles.fontFaceUrl || "");
    } else {
      setIsCustomFont(false);
    }
  }, [
    computedStyles.fontFamily,
    computedStyles.fontFaceUrl,
    state.selectedElement,
    state.currentBreakpoint,
  ]);

  const resetStyleToDesktop = (property: string | string[]) => {
    if (state.currentBreakpoint === "desktop") return;

    const currentBreakpointStyles =
      selectedElement.styles[state.currentBreakpoint] || {};
    const newBreakpointStyles = { ...currentBreakpointStyles };

    const propsToReset = Array.isArray(property) ? property : [property];
    propsToReset.forEach((prop) => delete newBreakpointStyles[prop]);

    dispatch({
      type: "UPDATE_ELEMENT",
      payload: {
        id: selectedElement.id,
        updates: {
          styles: {
            ...selectedElement.styles,
            [state.currentBreakpoint]:
              Object.keys(newBreakpointStyles).length > 0
                ? newBreakpointStyles
                : undefined,
          },
        },
      },
    });
  };

  const handleFontFamilyChange = (value: string) => {
    if (value === CUSTOM_FONT_KEY) {
      setIsCustomFont(true);
    } else {
      setIsCustomFont(false);
      updateStyle("fontFamily", value);
      updateStyle("fontFaceUrl", undefined);
    }
  };

  const applyCustomFont = () => {
    if (customFontName.trim() !== "") {
      updateStyle("fontFamily", customFontName.trim());
      updateStyle("fontFaceUrl", customFontUrl.trim() || undefined);
    }
  };

  const isColorInherited =
    state.currentBreakpoint !== "desktop" &&
    !selectedElement.styles[state.currentBreakpoint]?.color;
  const isFontSizeInherited =
    state.currentBreakpoint !== "desktop" &&
    !selectedElement.styles[state.currentBreakpoint]?.fontSize;
  const isFontFamilyInherited =
    state.currentBreakpoint !== "desktop" &&
    !selectedElement.styles[state.currentBreakpoint]?.fontFamily;
  const isFontUrlInherited =
    state.currentBreakpoint !== "desktop" &&
    !selectedElement.styles[state.currentBreakpoint]?.fontFaceUrl;

  return (
    <div className="py-2">
      <CardHeader className="p-0 cursor-pointer" onClick={toggleOpen}>
        <CardTitle className="text-xs font-normal flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4" />
            Typography
          </div>
          <div className="flex items-center gap-2">
            {hasSpecificStyles && (
              <Badge variant="secondary" className="text-[10px]">
                Custom
              </Badge>
            )}
            {/* <Badge variant="outline" className="text-[10px]">
              {state.currentBreakpoint}
            </Badge> */}
            {isOpen ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </div>
        </CardTitle>
      </CardHeader>

      {isOpen && (
        <div className="space-y-4 pt-4">
          {(selectedElement.tag === "p" ||
            selectedElement.tag.startsWith("h") ||
            selectedElement.tag === "button") && (
            <div>
              <Label className="text-[10px] text-gray-600">Content</Label>
              <Input
                value={selectedElement.content || ""}
                onChange={(e) => updateContent(e.target.value)}
                className="mt-1 text-[10px]"
                placeholder="Enter text..."
              />
            </div>
          )}

          {/* Font Family */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label className="text-[10px] text-gray-600">Font Family</Label>
              {isFontFamilyInherited && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                  onClick={() =>
                    resetStyleToDesktop(["fontFamily", "fontFaceUrl"])
                  }
                  title="Reset Font Family"
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
              )}
            </div>
            <Select
              value={
                isCustomFont
                  ? CUSTOM_FONT_KEY
                  : computedStyles.fontFamily || WEB_SAFE_FONTS[0].value
              }
              onValueChange={handleFontFamilyChange}
            >
              <SelectTrigger
                className={cn(
                  "text-[10px]",
                  isFontFamilyInherited && "border-blue-300 border-dashed"
                )}
              >
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                {WEB_SAFE_FONTS.map((font) => (
                  <SelectItem
                    key={font.value}
                    value={font.value}
                    style={{ fontFamily: font.value }}
                  >
                    {font.name}
                  </SelectItem>
                ))}
                <SelectItem value={CUSTOM_FONT_KEY}>Custom...</SelectItem>
              </SelectContent>
            </Select>
            {isFontFamilyInherited && (
              <p className="text-[10px] text-blue-600 mt-1">
                Inherited from desktop
              </p>
            )}
          </div>

          {isCustomFont && (
            <div className="space-y-3 p-3 border border-dashed border-gray-300 rounded-md mt-2">
              <div>
                <Label className="text-[10px] text-gray-600">
                  Custom Font Name
                </Label>
                <Input
                  value={customFontName}
                  onChange={(e) => setCustomFontName(e.target.value)}
                  placeholder="e.g., MyCustomFont"
                  className={cn(
                    "text-[10px] mt-1",
                    isFontFamilyInherited && "border-blue-300 border-dashed"
                  )}
                  onBlur={applyCustomFont}
                />
              </div>
              <div>
                <Label className="text-[10px] text-gray-600">
                  Font File URL (.woff2, .woff, .ttf)
                </Label>
                <Input
                  value={customFontUrl}
                  onChange={(e) => setCustomFontUrl(e.target.value)}
                  placeholder="https://example.com/font.woff2"
                  className={cn(
                    "text-[10px] mt-1",
                    isFontUrlInherited && "border-blue-300 border-dashed"
                  )}
                  onBlur={applyCustomFont}
                />
              </div>
            </div>
          )}

          {/* Font Size Block */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-[10px] text-gray-600">Font Size</Label>
              {isFontSizeInherited && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                  onClick={() => resetStyleToDesktop("fontSize")}
                  title="Reset Font Size"
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-1 mb-2">
              {FONT_SIZES.map((size) => (
                <Button
                  key={size.value}
                  variant={
                    computedStyles.fontSize === size.value
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  className={cn(
                    "h-8 text-[10px]",
                    isFontSizeInherited && "border-blue-300 border-dashed"
                  )}
                  onClick={() => updateStyle("fontSize", size.value)}
                >
                  {size.name}
                </Button>
              ))}
            </div>
            <Input
              value={computedStyles.fontSize || "16px"}
              onChange={(e) => updateStyle("fontSize", e.target.value)}
              placeholder="16px"
              className={cn(
                "text-[10px]",
                isFontSizeInherited && "border-blue-300 border-dashed"
              )}
            />
          </div>

          {/* Toggle Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={
                computedStyles.fontWeight === "bold" ? "default" : "outline"
              }
              size="sm"
              onClick={() =>
                updateStyle(
                  "fontWeight",
                  computedStyles.fontWeight === "bold" ? "normal" : "bold"
                )
              }
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              variant={
                computedStyles.fontStyle === "italic" ? "default" : "outline"
              }
              size="sm"
              onClick={() =>
                updateStyle(
                  "fontStyle",
                  computedStyles.fontStyle === "italic" ? "normal" : "italic"
                )
              }
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              variant={
                computedStyles.textDecoration === "underline"
                  ? "default"
                  : "outline"
              }
              size="sm"
              onClick={() =>
                updateStyle(
                  "textDecoration",
                  computedStyles.textDecoration === "underline"
                    ? "none"
                    : "underline"
                )
              }
            >
              <Underline className="w-4 h-4" />
            </Button>
          </div>

          {/* Text Align */}
          <div>
            <Label className="text-[10px] text-gray-600 mb-2 block">
              Text Alignment
            </Label>
            <div className="grid grid-cols-4 gap-1">
              {[
                { value: "left", icon: AlignLeft },
                { value: "center", icon: AlignCenter },
                { value: "right", icon: AlignRight },
                { value: "justify", icon: AlignJustify },
              ].map(({ value, icon: Icon }) => (
                <Button
                  key={value}
                  variant={
                    computedStyles.textAlign === value ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => updateStyle("textAlign", value)}
                >
                  <Icon className="w-4 h-4" />
                </Button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <ColorPicker
            value={computedStyles.color || "#000000"}
            onChange={(value) => updateStyle("color", value)}
            label="Text Color"
            isInherited={isColorInherited}
            onReset={() => resetStyleToDesktop("color")}
          />
        </div>
      )}
    </div>
  );
}

interface AdvancedSpacingControlProps {
  label: string;
  type: "padding" | "margin";
  selectedElement: any;
  updateStyle: (property: string, value: string | number) => void;
  computedStyles: Record<string, any>;
  resetStyle: (property: string | string[]) => void;
}

function AdvancedSpacingControl({
  label,
  type,
  selectedElement,
  updateStyle,
  computedStyles,
  resetStyle,
}: AdvancedSpacingControlProps) {
  const { state, dispatch } = useEditor();
  const [isLinked, setIsLinked] = useState(true);

  const sides = ["Top", "Right", "Bottom", "Left"] as const;

  const handleShorthandChange = (value: string) => {
    const updates: Record<string, string> = { [type]: value };
    sides.forEach((side) => {
      updates[`${type}${side}`] = value;
    });
    dispatch({
      type: "UPDATE_ELEMENT_STYLES",
      payload: {
        id: selectedElement.id,
        breakpoint: state.currentBreakpoint,
        styles: updates,
      },
    });
  };

  const handleIndividualChange = (
    side: "Top" | "Right" | "Bottom" | "Left",
    value: string
  ) => {
    updateStyle(`${type}${side}`, value);
  };

  const getSideValue = (side: "Top" | "Right" | "Bottom" | "Left"): string => {
    return computedStyles[`${type}${side}`] || computedStyles[type] || "0px";
  };

  const isSideInherited = (
    side: "Top" | "Right" | "Bottom" | "Left"
  ): boolean => {
    if (state.currentBreakpoint === "desktop") return false;
    const breakpointStyles = selectedElement.styles[state.currentBreakpoint];
    return (
      !breakpointStyles || breakpointStyles[`${type}${side}`] === undefined
    );
  };

  const isShorthandInherited = (): boolean => {
    if (state.currentBreakpoint === "desktop") return false;
    const breakpointStyles = selectedElement.styles[state.currentBreakpoint];
    return !breakpointStyles || breakpointStyles[type] === undefined;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label className="text-xs font-medium text-gray-700">{label}</Label>
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
          <Button
            variant={isLinked ? "default" : "ghost"}
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setIsLinked(true)}
            title="Edit all sides together"
          >
            <Square className="w-4 h-4" />
          </Button>
          <Button
            variant={!isLinked ? "default" : "ghost"}
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setIsLinked(false)}
            title="Edit individual sides"
          >
            <PanelTopClose className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {isLinked ? (
        <div className="relative">
          <Input
            type="text"
            value={computedStyles[type] || "0px"}
            onChange={(e) => handleShorthandChange(e.target.value)}
            className={cn(
              "text-xs h-9",
              isShorthandInherited() && "border-blue-300 border-dashed"
            )}
          />
          {isShorthandInherited() && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
              onClick={() => resetStyle(type)}
              title={`Reset ${label}`}
            >
              <RotateCcw className="w-3 h-3" />
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {sides.map((side) => (
            <div key={side} className="relative text-center">
              <Input
                type="text"
                value={getSideValue(side)}
                onChange={(e) => handleIndividualChange(side, e.target.value)}
                className={cn(
                  "text-xs h-9 text-center",
                  isSideInherited(side) && "border-blue-300 border-dashed"
                )}
              />
              <Label className="text-[10px] text-gray-500 mt-1">
                {side[0]}
              </Label>
              {isSideInherited(side) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute -top-1 -right-1 h-4 w-4 p-0 text-gray-400 hover:text-gray-600 bg-white rounded-full"
                  onClick={() => resetStyle(`${type}${side}`)}
                  title={`Reset ${side}`}
                >
                  <RotateCcw className="w-2 h-2" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SpacingControls({ selectedElement, updateStyle }: any) {
  const { state, dispatch } = useEditor();
  const [isOpen, setIsOpen] = useState(true); // make it toggleable like others
  const toggleOpen = () => setIsOpen((prev) => !prev);

  const computedStyles = getComputedStyles(
    selectedElement,
    state.currentBreakpoint
  );

  const hasSpecificStyles =
    state.currentBreakpoint !== "desktop" &&
    hasBreakpointStyles(selectedElement, state.currentBreakpoint);

  const resetStyle = (property: string | string[]) => {
    if (state.currentBreakpoint === "desktop") return;

    const currentBreakpointStyles =
      selectedElement.styles[state.currentBreakpoint] || {};
    const newBreakpointStyles = { ...currentBreakpointStyles };

    const propsToReset = Array.isArray(property) ? property : [property];
    propsToReset.forEach((prop) => delete newBreakpointStyles[prop]);

    dispatch({
      type: "UPDATE_ELEMENT",
      payload: {
        id: selectedElement.id,
        updates: {
          styles: {
            ...selectedElement.styles,
            [state.currentBreakpoint]:
              Object.keys(newBreakpointStyles).length > 0
                ? newBreakpointStyles
                : undefined,
          },
        },
      },
    });
  };

  return (
    <div className="py-2">
      <CardHeader className="p-0 cursor-pointer" onClick={toggleOpen}>
        <CardTitle className="text-xs font-normal flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* <SpacingIcon className="w-4 h-4" /> */}
            Spacing
          </div>
          <div className="flex items-center gap-2">
            {hasSpecificStyles && (
              <Badge variant="secondary" className="text-[10px]">
                Custom
              </Badge>
            )}
            {/* <Badge variant="outline" className="text-[10px]">
              {state.currentBreakpoint}
            </Badge> */}
            {isOpen ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </div>
        </CardTitle>
      </CardHeader>
      {isOpen && (
        <div className="space-y-4 pt-4">
          <AdvancedSpacingControl
            label="Padding"
            type="padding"
            selectedElement={selectedElement}
            updateStyle={updateStyle}
            computedStyles={computedStyles}
            resetStyle={resetStyle}
          />
          <AdvancedSpacingControl
            label="Margin"
            type="margin"
            selectedElement={selectedElement}
            updateStyle={updateStyle}
            computedStyles={computedStyles}
            resetStyle={resetStyle}
          />
        </div>
      )}
    </div>
  );
}
function ImageControl({ selectedElement, updateAttribute, updateStyle }: any) {
  const { state, dispatch } = useEditor();
  const src = selectedElement.attributes?.src || "";
  const alt = selectedElement.attributes?.alt || "";
  const computedStyles = getComputedStyles(
    selectedElement,
    state.currentBreakpoint
  );

  useEffect(() => {
    if (
      state.selectedAssetForStyle &&
      selectedElement.id === state.selectedElement
    ) {
      if (state.selectedAssetForStyle.type === "image") {
        updateAttribute("src", state.selectedAssetForStyle.url);
        dispatch({ type: "SELECT_ASSET_FOR_STYLE", payload: { asset: null } }); // Reset
      }
    }
  }, [
    state.selectedAssetForStyle,
    selectedElement.id,
    state.selectedElement,
    updateAttribute,
    dispatch,
  ]);

  const objectFitOptions = ["fill", "contain", "cover", "none", "scale-down"];
  const currentObjectFit = computedStyles.objectFit || "cover";
  const currentObjectPosition =
    computedStyles.objectPosition || "center center";

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xs font-normal flex items-center gap-2">
          <ImageIcon className="w-4 h-4" /> Image Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-[10px] text-gray-600 mb-2 block">
            Image Source
          </Label>
          <div className="flex items-center gap-2">
            <div className="w-16 h-16 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden">
              {src ? (
                <img
                  src={src || "/placeholder.svg"}
                  alt={alt}
                  className="w-full h-full"
                  style={{
                    objectFit: currentObjectFit,
                    objectPosition: currentObjectPosition,
                  }}
                />
              ) : (
                <ImageIcon className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() =>
                dispatch({ type: "SET_ACTIVE_TAB", payload: { tab: "assets" } })
              }
            >
              Choose from Assets
            </Button>
          </div>
        </div>
        <div>
          <Label htmlFor="alt-text" className="text-[10px] text-gray-600">
            Alt Text
          </Label>
          <Input
            id="alt-text"
            value={alt}
            onChange={(e) => updateAttribute("alt", e.target.value)}
            placeholder="Describe the image"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="object-fit" className="text-[10px] text-gray-600">
            Object Fit
          </Label>
          <Select
            value={currentObjectFit}
            onValueChange={(value) => updateStyle("objectFit", value)}
          >
            <SelectTrigger id="object-fit" className="mt-1">
              <SelectValue placeholder="Select fit" />
            </SelectTrigger>
            <SelectContent>
              {objectFitOptions.map((fit) => (
                <SelectItem key={fit} value={fit}>
                  {fit.charAt(0).toUpperCase() + fit.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label
            htmlFor="object-position"
            className="text-[10px] text-gray-600"
          >
            Object Position
          </Label>
          <Input
            id="object-position"
            value={currentObjectPosition}
            onChange={(e) => updateStyle("objectPosition", e.target.value)}
            placeholder="center center"
            className="mt-1"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function VideoControl({ selectedElement, updateAttribute }: any) {
  const { state, dispatch } = useEditor();
  const src = selectedElement.attributes?.src || "";

  useEffect(() => {
    if (
      state.selectedAssetForStyle &&
      selectedElement.id === state.selectedElement
    ) {
      if (state.selectedAssetForStyle.type === "video") {
        updateAttribute("src", state.selectedAssetForStyle.url);
        dispatch({ type: "SELECT_ASSET_FOR_STYLE", payload: { asset: null } }); // Reset
      }
    }
  }, [
    state.selectedAssetForStyle,
    selectedElement.id,
    state.selectedElement,
    updateAttribute,
    dispatch,
  ]);

  const videoAttributes = {
    controls: selectedElement.attributes?.controls ?? true,
    autoplay: selectedElement.attributes?.autoplay ?? false,
    loop: selectedElement.attributes?.loop ?? false,
    muted: selectedElement.attributes?.muted ?? false,
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xs font-normal flex items-center gap-2">
          <Video className="w-4 h-4" /> Video Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-[10px] text-gray-600 mb-2 block">
            Video Source
          </Label>
          <div className="aspect-video rounded-md bg-black flex items-center justify-center overflow-hidden mb-2">
            {src ? (
              <video
                src={src}
                controls={videoAttributes.controls}
                className="w-full h-full object-cover"
              />
            ) : (
              <Video className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() =>
              dispatch({ type: "SET_ACTIVE_TAB", payload: { tab: "assets" } })
            }
          >
            Choose from Assets
          </Button>
        </div>
        <div className="space-y-3">
          {Object.entries(videoAttributes).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <Label htmlFor={`video-${key}`} className="text-xs capitalize">
                {key}
              </Label>
              <Switch
                id={`video-${key}`}
                checked={value as boolean}
                onCheckedChange={(checked) => updateAttribute(key, checked)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ShadowEditorPopover({
  shadow,
  onSave,
  onClose,
  trigger,
}: {
  shadow: Partial<ShadowProps>;
  onSave: (newShadow: ShadowProps) => void;
  onClose: () => void;
  trigger: React.ReactNode;
}) {
  const [editedShadow, setEditedShadow] = useState<ShadowProps>({
    offsetX: shadow.offsetX || "0px",
    offsetY: shadow.offsetY || "0px",
    blurRadius: shadow.blurRadius || "5px",
    spreadRadius: shadow.spreadRadius || "0px",
    color: shadow.color || "rgba(0,0,0,0.5)",
    inset: shadow.inset || false,
  });

  // Add this useEffect to re-initialize state when the shadow prop changes
  useEffect(() => {
    setEditedShadow({
      offsetX: shadow.offsetX || "0px",
      offsetY: shadow.offsetY || "0px",
      blurRadius: shadow.blurRadius || "5px",
      spreadRadius: shadow.spreadRadius || "0px",
      color: shadow.color || "rgba(0,0,0,0.5)",
      inset: shadow.inset || false,
    });
  }, [shadow]); // Dependency array includes 'shadow'

  const handleSave = () => {
    onSave(editedShadow);
    onClose();
  };

  const handleChange = (field: keyof ShadowProps, value: string | boolean) => {
    setEditedShadow((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Popover open={true} onOpenChange={(open) => !open && onClose()}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-80 p-0" side="right" align="start">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium leading-none">Edit Shadow</h4>
            <Button variant="ghost" size="sm" onClick={onClose}>
              X
            </Button>
          </div>

          <Tabs
            defaultValue={editedShadow.inset ? "inside" : "outside"}
            onValueChange={(val) => handleChange("inset", val === "inside")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="outside">Outside</TabsTrigger>
              <TabsTrigger value="inside">Inside</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="offsetX" className="text-[10px]">
                X Offset
              </Label>
              <Input
                id="offsetX"
                value={editedShadow.offsetX}
                onChange={(e) => handleChange("offsetX", e.target.value)}
                className="mt-1 h-8 text-[10px]"
                placeholder="0px"
              />
            </div>
            <div>
              <Label htmlFor="offsetY" className="text-[10px]">
                Y Offset
              </Label>
              <Input
                id="offsetY"
                value={editedShadow.offsetY}
                onChange={(e) => handleChange("offsetY", e.target.value)}
                className="mt-1 h-8 text-[10px]"
                placeholder="0px"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="blurRadius" className="text-[10px]">
                Blur
              </Label>
              <Input
                id="blurRadius"
                value={editedShadow.blurRadius}
                onChange={(e) => handleChange("blurRadius", e.target.value)}
                className="mt-1 h-8 text-[10px]"
                placeholder="5px"
              />
            </div>
            {/* Only show spread for box-shadow, assuming text-shadow won't pass spreadRadius here */}
            {editedShadow.spreadRadius !== undefined && (
              <div>
                <Label htmlFor="spreadRadius" className="text-[10px]">
                  Spread
                </Label>
                <Input
                  id="spreadRadius"
                  value={editedShadow.spreadRadius}
                  onChange={(e) => handleChange("spreadRadius", e.target.value)}
                  className="mt-1 h-8 text-[10px]"
                  placeholder="0px"
                />
              </div>
            )}
          </div>
          <div>
            <Label className="text-[10px]">Color</Label>
            <ColorPicker
              value={editedShadow.color}
              onChange={(color) => handleChange("color", color)}
              label=""
            />
          </div>
          <Button onClick={handleSave} className="w-full h-9">
            Apply Shadow
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ShadowsControl({
  label,
  styleKey, // 'boxShadow' or 'textShadow'
  selectedElement,
  updateStyle,
  computedStyles,
  resetStyle,
}: {
  label: string;
  styleKey: "boxShadow" | "textShadow";
  selectedElement: any;
  updateStyle: (property: string, value: string | number | undefined) => void;
  computedStyles: Record<string, any>;
  resetStyle: (property: string | string[]) => void;
}) {
  const { state } = useEditor();
  const [editingShadow, setEditingShadow] = useState<{
    index: number;
    shadow: Partial<ShadowProps>;
  } | null>(null);

  const parseShadowString = useCallback(
    (shadowStr: string): Partial<ShadowProps>[] => {
      if (!shadowStr || shadowStr === "none" || typeof shadowStr !== "string")
        return [];

      // More robust splitting for multiple shadows, handling colors like rgba()
      // This regex splits by comma, but not if the comma is inside parentheses.
      const shadowEntries = shadowStr.split(/,(?![^(]*\))/g);

      return shadowEntries
        .map((sEntry) => {
          let s = sEntry.trim();
          let inset = false;
          if (styleKey === "boxShadow" && s.startsWith("inset")) {
            inset = true;
            s = s.substring(5).trim();
          }

          // Try to extract color first (rgb, rgba, hsl, hsla, hex, named)
          // This regex is a bit more greedy for colors.
          const colorRegex =
            /(rgba?$$.+?$$|hsla?$$.+?$$|#[0-9a-fA-F]{3,8}|[a-zA-Z]+(-[a-zA-Z]+)?)$/i;
          const colorMatch = s.match(colorRegex);

          let color = "rgba(0,0,0,0.5)"; // Default color
          let remainingStr = s;

          if (colorMatch && colorMatch[0]) {
            // Check if the matched color is a valid CSS color and not a length value
            const potentialColor = colorMatch[0].trim();
            if (
              CSS.supports("color", potentialColor) &&
              !potentialColor.match(/px|em|rem|%|vw|vh$/)
            ) {
              color = potentialColor;
              remainingStr = s
                .substring(0, s.lastIndexOf(potentialColor))
                .trim();
            }
          }

          const parts = remainingStr.split(/\s+/).filter(Boolean);

          const shadow: Partial<ShadowProps> = {
            inset,
            color,
            offsetX: parts[0] || "0px",
            offsetY: parts[1] || "0px",
            blurRadius: parts[2] || "0px",
          };

          if (styleKey === "boxShadow") {
            shadow.spreadRadius = parts[3] || "0px";
          }
          return shadow;
        })
        .filter(
          (shadow) => shadow.offsetX || shadow.offsetY || shadow.blurRadius
        ); // Filter out empty/invalid shadows
    },
    [styleKey]
  );

  const formatShadowToString = useCallback(
    (shadow: ShadowProps): string => {
      let str = "";
      if (styleKey === "boxShadow" && shadow.inset) {
        str += "inset ";
      }
      str += `${shadow.offsetX || "0px"} ${shadow.offsetY || "0px"} ${
        shadow.blurRadius || "0px"
      }`;
      if (styleKey === "boxShadow") {
        str += ` ${shadow.spreadRadius || "0px"}`;
      }
      str += ` ${shadow.color || "rgba(0,0,0,0.5)"}`;
      return str;
    },
    [styleKey]
  );

  const shadows = parseShadowString(computedStyles[styleKey] || "");

  const handleSaveShadow = (index: number, newShadowData: ShadowProps) => {
    const newShadowsArray = [...shadows];
    const completeShadowData = {
      offsetX: newShadowData.offsetX || "0px",
      offsetY: newShadowData.offsetY || "0px",
      blurRadius: newShadowData.blurRadius || "0px",
      spreadRadius:
        styleKey === "boxShadow"
          ? newShadowData.spreadRadius || "0px"
          : undefined,
      color: newShadowData.color || "rgba(0,0,0,0.5)",
      inset: styleKey === "boxShadow" ? newShadowData.inset || false : false,
    };

    if (index === -1) {
      newShadowsArray.push(completeShadowData);
    } else {
      newShadowsArray[index] = completeShadowData;
    }
    const newShadowString = newShadowsArray
      .map((s) => formatShadowToString(s as ShadowProps))
      .join(", ");
    updateStyle(styleKey, newShadowString || "none");
    setEditingShadow(null);
  };

  const handleRemoveShadow = (index: number) => {
    const newShadowsArray = shadows.filter((_, i) => i !== index);
    const newShadowString = newShadowsArray
      .map((s) => formatShadowToString(s as ShadowProps))
      .join(", ");
    updateStyle(styleKey, newShadowString || "none");
  };

  const handleAddNewShadow = () => {
    const defaultShadow: Partial<ShadowProps> = {
      offsetX: "0px",
      offsetY: "2px",
      blurRadius: "4px",
      color: "rgba(0,0,0,0.1)",
      inset: false,
    };
    if (styleKey === "boxShadow") {
      defaultShadow.spreadRadius = "0px";
    }
    setEditingShadow({ index: -1, shadow: defaultShadow });
  };

  const isInherited =
    state.currentBreakpoint !== "desktop" &&
    !selectedElement.styles[state.currentBreakpoint]?.[styleKey];

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label className="text-xs font-medium text-gray-700">{label}</Label>
        <div className="flex items-center">
          {isInherited && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 mr-1"
              onClick={() => resetStyle(styleKey)}
              title={`Reset ${label}`}
            >
              <RotateCcw className="w-3 h-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={handleAddNewShadow}
          >
            <PlusCircle className="w-4 h-4" />
          </Button>
        </div>
      </div>
      {shadows.length === 0 && (
        <p className="text-[10px] text-gray-400">
          No {label.toLowerCase()} applied.
        </p>
      )}
      <div className="space-y-2">
        {shadows.map((shadow, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 bg-gray-50 rounded text-[10px]"
          >
            <span
              className="truncate w-40"
              title={formatShadowToString(shadow as ShadowProps)}
            >
              {styleKey === "boxShadow" && shadow.inset && "Inset "}
              {shadow.offsetX} {shadow.offsetY} {shadow.blurRadius}{" "}
              {styleKey === "boxShadow" && shadow.spreadRadius}
            </span>
            <div className="flex items-center gap-1">
              <div
                className="w-4 h-4 rounded border"
                style={{ backgroundColor: shadow.color }}
              ></div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() =>
                  setEditingShadow({
                    index,
                    shadow: {
                      ...shadow,
                      spreadRadius:
                        styleKey === "boxShadow"
                          ? shadow.spreadRadius
                          : undefined,
                    },
                  })
                }
              >
                <Edit2 className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleRemoveShadow(index)}
              >
                <Trash2 className="w-3 h-3 text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      {isInherited && shadows.length > 0 && (
        <p className="text-[10px] text-blue-600 mt-1">Inherited from desktop</p>
      )}
      {editingShadow !== null && (
        <ShadowEditorPopover
          shadow={{
            ...editingShadow.shadow,
            spreadRadius:
              styleKey === "boxShadow"
                ? editingShadow.shadow.spreadRadius
                : undefined,
          }}
          onSave={(newShadowData) =>
            handleSaveShadow(editingShadow.index, newShadowData)
          }
          onClose={() => setEditingShadow(null)}
          trigger={<></>}
        />
      )}
    </div>
  );
}

function AdvancedBorderControl({
  selectedElement,
  updateStyle,
  computedStyles,
  resetStyle,
}: {
  selectedElement: any;
  updateStyle: (property: string, value: string | number | undefined) => void;
  computedStyles: Record<string, any>;
  resetStyle: (property: string | string[]) => void;
}) {
  const { state, dispatch } = useEditor(); // Use dispatch from context
  const [isLinked, setIsLinked] = useState(true);
  const sides = ["Top", "Right", "Bottom", "Left"] as const;
  const borderStyles = [
    "solid",
    "dashed",
    "dotted",
    "double",
    "groove",
    "ridge",
    "inset",
    "outset",
    "none",
  ];

  const handleShorthandChange = (
    property: "borderWidth" | "borderStyle" | "borderColor",
    value: string
  ) => {
    const updates: Record<string, string | undefined> = {};

    // Determine the base property being changed
    if (property === "borderWidth") {
      updates.borderWidth = value;
      updates.borderStyle = computedStyles.borderStyle || "solid";
      updates.borderColor = computedStyles.borderColor || "#000000";
    } else if (property === "borderStyle") {
      updates.borderWidth = computedStyles.borderWidth || "0px";
      updates.borderStyle = value;
      updates.borderColor = computedStyles.borderColor || "#000000";
    } else {
      // borderColor
      updates.borderWidth = computedStyles.borderWidth || "0px";
      updates.borderStyle = computedStyles.borderStyle || "solid";
      updates.borderColor = value;
    }

    // If value is '0px' for width or 'none' for style, reset all border properties
    if (
      (property === "borderWidth" && value === "0px") ||
      (property === "borderStyle" && value === "none")
    ) {
      updates.borderWidth = property === "borderWidth" ? value : "0px";
      updates.borderStyle = property === "borderStyle" ? value : "none";
      updates.borderColor = "transparent"; // Or keep existing color? User expectation might vary.
      // For now, let's make it transparent if width is 0 or style is none.
      sides.forEach((side) => {
        updates[`border${side}Width`] = updates.borderWidth;
        updates[`border${side}Style`] = updates.borderStyle;
        updates[`border${side}Color`] = updates.borderColor;
      });
    } else {
      // Apply to all sides if linked
      sides.forEach((side) => {
        updates[`border${side}Width`] = updates.borderWidth;
        updates[`border${side}Style`] = updates.borderStyle;
        updates[`border${side}Color`] = updates.borderColor;
      });
    }

    dispatch({
      type: "UPDATE_ELEMENT_STYLES",
      payload: {
        id: selectedElement.id,
        breakpoint: state.currentBreakpoint,
        styles: updates,
      },
    });
  };

  const handleIndividualChange = (
    side: (typeof sides)[number],
    propertySuffix: "Width" | "Style" | "Color",
    value: string
  ) => {
    updateStyle(`border${side}${propertySuffix}`, value);
  };

  const getShorthandValue = (
    property: "borderWidth" | "borderStyle" | "borderColor"
  ): string => {
    return (
      computedStyles[property] ||
      (property === "borderWidth"
        ? "0px"
        : property === "borderStyle"
        ? "solid"
        : "#000000")
    );
  };

  const getSideValue = (
    side: (typeof sides)[number],
    propertySuffix: "Width" | "Style" | "Color"
  ): string => {
    return (
      computedStyles[`border${side}${propertySuffix}`] ||
      getShorthandValue(`border${propertySuffix}` as any)
    );
  };

  const isShorthandInherited = (property: string) =>
    state.currentBreakpoint !== "desktop" &&
    !selectedElement.styles[state.currentBreakpoint]?.[property];
  const isSideInherited = (side: string, propertySuffix: string) =>
    state.currentBreakpoint !== "desktop" &&
    !selectedElement.styles[state.currentBreakpoint]?.[
      `border${side}${propertySuffix}`
    ];

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label className="text-xs font-medium text-gray-700">Border</Label>
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
          <Button
            variant={isLinked ? "default" : "ghost"}
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setIsLinked(true)}
            title="Edit all sides together"
          >
            <Square className="w-4 h-4" />
          </Button>
          <Button
            variant={!isLinked ? "default" : "ghost"}
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setIsLinked(false)}
            title="Edit individual sides"
          >
            <PanelTopClose className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {isLinked ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={getShorthandValue("borderWidth")}
              onChange={(e) =>
                handleShorthandChange("borderWidth", e.target.value)
              }
              className={cn(
                "text-xs h-9 w-1/3",
                isShorthandInherited("borderWidth") &&
                  "border-blue-300 border-dashed"
              )}
              placeholder="0px"
            />
            <Select
              value={getShorthandValue("borderStyle")}
              onValueChange={(val) => handleShorthandChange("borderStyle", val)}
            >
              <SelectTrigger
                className={cn(
                  "text-xs h-9 w-1/3",
                  isShorthandInherited("borderStyle") &&
                    "border-blue-300 border-dashed"
                )}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {borderStyles.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ColorPicker
              value={getShorthandValue("borderColor")}
              onChange={(val) => handleShorthandChange("borderColor", val)}
              label=""
              className="w-1/3"
              isInherited={isShorthandInherited("borderColor")}
              onReset={() => resetStyle("borderColor")}
              popoverSide="bottom"
              popoverAlign="end"
            />
          </div>
          {(isShorthandInherited("borderWidth") ||
            isShorthandInherited("borderStyle") ||
            isShorthandInherited("borderColor")) && (
            <p className="text-[10px] text-blue-600 mt-1">
              One or more border properties inherited.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {sides.map((side) => (
            <div key={side}>
              <Label className="text-[10px] text-gray-500 mb-1 block">
                {side} Border
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={getSideValue(side, "Width")}
                  onChange={(e) =>
                    handleIndividualChange(side, "Width", e.target.value)
                  }
                  className={cn(
                    "text-xs h-9 w-1/3",
                    isSideInherited(side, "Width") &&
                      "border-blue-300 border-dashed"
                  )}
                  placeholder="Width"
                />
                <Select
                  value={getSideValue(side, "Style")}
                  onValueChange={(val) =>
                    handleIndividualChange(side, "Style", val)
                  }
                >
                  <SelectTrigger
                    className={cn(
                      "text-xs h-9 w-1/3",
                      isSideInherited(side, "Style") &&
                        "border-blue-300 border-dashed"
                    )}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {borderStyles.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <ColorPicker
                  value={getSideValue(side, "Color")}
                  onChange={(val) => handleIndividualChange(side, "Color", val)}
                  label=""
                  className="w-1/3"
                  isInherited={isSideInherited(side, "Color")}
                  onReset={() => resetStyle(`border${side}Color`)}
                  popoverSide="bottom"
                  popoverAlign="end"
                />
              </div>
              {(isSideInherited(side, "Width") ||
                isSideInherited(side, "Style") ||
                isSideInherited(side, "Color")) && (
                <p className="text-[10px] text-blue-600 mt-1">
                  {side} border properties may be inherited.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdvancedBorderRadiusControl({
  selectedElement,
  updateStyle,
  computedStyles,
  resetStyle,
}: {
  selectedElement: any;
  updateStyle: (property: string, value: string | number | undefined) => void;
  computedStyles: Record<string, any>;
  resetStyle: (property: string | string[]) => void;
}) {
  const { state, dispatch } = useEditor(); // Use dispatch from context
  const [isLinked, setIsLinked] = useState(true);
  const corners = ["TopLeft", "TopRight", "BottomRight", "BottomLeft"] as const;

  const handleShorthandChange = (value: string) => {
    const updates: Record<string, string> = { borderRadius: value };
    corners.forEach((corner) => {
      updates[`border${corner}Radius`] = value;
    });
    dispatch({
      // Correctly use dispatch from context
      type: "UPDATE_ELEMENT_STYLES",
      payload: {
        id: selectedElement.id,
        breakpoint: state.currentBreakpoint,
        styles: updates,
      },
    });
  };

  const handleIndividualChange = (
    corner: (typeof corners)[number],
    value: string
  ) => {
    updateStyle(`border${corner}Radius`, value);
  };

  const getShorthandValue = (): string => computedStyles.borderRadius || "0px";
  const getCornerValue = (corner: (typeof corners)[number]): string =>
    computedStyles[`border${corner}Radius`] || getShorthandValue();

  const isShorthandInherited = () =>
    state.currentBreakpoint !== "desktop" &&
    !selectedElement.styles[state.currentBreakpoint]?.borderRadius;
  const isCornerInherited = (corner: string) =>
    state.currentBreakpoint !== "desktop" &&
    !selectedElement.styles[state.currentBreakpoint]?.[`border${corner}Radius`];

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label className="text-xs font-medium text-gray-700">
          Border Radius
        </Label>
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
          <Button
            variant={isLinked ? "default" : "ghost"}
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setIsLinked(true)}
            title="Edit all corners together"
          >
            <Square className="w-4 h-4" />
          </Button>
          <Button
            variant={!isLinked ? "default" : "ghost"}
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setIsLinked(false)}
            title="Edit individual corners"
          >
            <PanelTopClose className="w-4 h-4" />
          </Button>
        </div>
      </div>
      {isLinked ? (
        <div className="relative">
          <Input
            type="text"
            value={getShorthandValue()}
            onChange={(e) => handleShorthandChange(e.target.value)}
            className={cn(
              "text-xs h-9",
              isShorthandInherited() && "border-blue-300 border-dashed"
            )}
          />
          {isShorthandInherited() && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
              onClick={() => resetStyle("borderRadius")}
              title="Reset Border Radius"
            >
              <RotateCcw className="w-3 h-3" />
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-2 gap-y-3">
          {corners.map((corner) => (
            <div key={corner} className="relative">
              <Label className="text-[10px] text-gray-500 mb-1 block">
                {corner.replace(/([A-Z])/g, " $1").trim()}
              </Label>
              <Input
                type="text"
                value={getCornerValue(corner)}
                onChange={(e) => handleIndividualChange(corner, e.target.value)}
                className={cn(
                  "text-xs h-9",
                  isCornerInherited(corner) && "border-blue-300 border-dashed"
                )}
              />
              {isCornerInherited(corner) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 bottom-1 h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                  onClick={() => resetStyle(`border${corner}Radius`)}
                  title={`Reset ${corner} Radius`}
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const filterTypes = [
  { value: "blur", label: "Blur", unit: "px", default: "5" },
  { value: "brightness", label: "Brightness", unit: "%", default: "100" },
  { value: "contrast", label: "Contrast", unit: "%", default: "100" },
  { value: "grayscale", label: "Grayscale", unit: "%", default: "0" },
  { value: "hue-rotate", label: "Hue Rotate", unit: "deg", default: "0" },
  { value: "invert", label: "Invert", unit: "%", default: "0" },
  { value: "opacity", label: "Opacity", unit: "%", default: "100" },
  { value: "saturate", label: "Saturate", unit: "%", default: "100" },
  { value: "sepia", label: "Sepia", unit: "%", default: "0" },
  {
    value: "drop-shadow",
    label: "Drop Shadow",
    unit: "",
    default: "0px 0px 0px #000",
  }, // More complex
] as const;

type FilterTypeValue = (typeof filterTypes)[number]["value"];

interface FilterItem {
  id: string;
  type: FilterTypeValue;
  value: string;
  unit: string;
}

function FiltersControl({
  selectedElement,
  updateStyle,
  computedStyles,
  resetStyle,
}: {
  selectedElement: any;
  updateStyle: (property: string, value: string | undefined) => void;
  computedStyles: Record<string, any>;
  resetStyle: (property: string) => void;
}) {
  const { state } = useEditor();
  const [filters, setFilters] = useState<FilterItem[]>([]);

  useEffect(() => {
    const filterString = computedStyles.filter || "";
    if (filterString === "none" || !filterString) {
      setFilters([]);
      return;
    }
    const parsedFilters: FilterItem[] = filterString
      .split(/\)\s+/) // Split by closing parenthesis followed by space
      .map((fStr: string) => {
        if (!fStr.includes("(")) return null;
        const [typeMatch, valueMatch] = fStr.split("(");
        if (!typeMatch || !valueMatch) return null;

        const type = typeMatch.trim() as FilterTypeValue;
        const valueWithUnit = valueMatch.replace(")", "").trim();

        const filterDefinition = filterTypes.find((ft) => ft.value === type);
        if (!filterDefinition) return null;

        const unit = filterDefinition.unit;
        const value = valueWithUnit.replace(unit, "");

        return {
          id: Math.random().toString(36).substr(2, 9),
          type,
          value,
          unit,
        };
      })
      .filter((f: FilterItem | null): f is FilterItem => f !== null);
    setFilters(parsedFilters);
  }, [computedStyles.filter]);

  const updateFilterString = (updatedFilters: FilterItem[]) => {
    const newFilterString = updatedFilters
      .map((f) => `${f.type}(${f.value}${f.unit})`)
      .join(" ");
    updateStyle("filter", newFilterString || "none");
  };

  const handleAddFilter = () => {
    const defaultFilterType = filterTypes[0];
    setFilters([
      ...filters,
      {
        id: Math.random().toString(36).substr(2, 9),
        type: defaultFilterType.value,
        value: defaultFilterType.default,
        unit: defaultFilterType.unit,
      },
    ]);
  };

  const handleRemoveFilter = (id: string) => {
    const updatedFilters = filters.filter((f) => f.id !== id);
    setFilters(updatedFilters);
    updateFilterString(updatedFilters);
  };

  const handleFilterChange = (
    id: string,
    field: "type" | "value",
    newValue: string
  ) => {
    const updatedFilters = filters.map((f) => {
      if (f.id === id) {
        if (field === "type") {
          const newTypeDefinition = filterTypes.find(
            (ft) => ft.value === newValue
          );
          return {
            ...f,
            type: newValue as FilterTypeValue,
            value: newTypeDefinition?.default || f.value,
            unit: newTypeDefinition?.unit || f.unit,
          };
        }
        return { ...f, [field]: newValue };
      }
      return f;
    });
    setFilters(updatedFilters);
    updateFilterString(updatedFilters);
  };

  const isInherited =
    state.currentBreakpoint !== "desktop" &&
    !selectedElement.styles[state.currentBreakpoint]?.filter;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label className="text-xs font-medium text-gray-700">Filters</Label>
        <div className="flex items-center">
          {isInherited && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 mr-1"
              onClick={() => resetStyle("filter")}
              title="Reset Filters"
            >
              <RotateCcw className="w-3 h-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={handleAddFilter}
          >
            <PlusCircle className="w-4 h-4" />
          </Button>
        </div>
      </div>
      {filters.length === 0 && (
        <p className="text-[10px] text-gray-400">No filters applied.</p>
      )}
      <div className="space-y-3">
        {filters.map((filter) => (
          <div
            key={filter.id}
            className="flex items-center gap-2 p-2 bg-gray-50 rounded"
          >
            <Select
              value={filter.type}
              onValueChange={(val) =>
                handleFilterChange(filter.id, "type", val)
              }
            >
              <SelectTrigger className="text-[10px] h-8 w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {filterTypes.map((ft) => (
                  <SelectItem key={ft.value} value={ft.value}>
                    {ft.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="text" // Changed to text to allow easier input of various values
              value={filter.value}
              onChange={(e) =>
                handleFilterChange(filter.id, "value", e.target.value)
              }
              className="text-[10px] h-8 flex-grow"
              placeholder={
                filterTypes.find((f) => f.value === filter.type)?.default ||
                "value"
              }
            />
            {filter.unit && (
              <span className="text-[10px] text-gray-500">{filter.unit}</span>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => handleRemoveFilter(filter.id)}
            >
              <MinusCircle className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        ))}
      </div>
      {isInherited && filters.length > 0 && (
        <p className="text-[10px] text-blue-600 mt-1">Inherited from desktop</p>
      )}
    </div>
  );
}

function AppearanceControls({ selectedElement, updateStyle }: any) {
  const { state, dispatch } = useEditor();
  const [isOpen, setIsOpen] = useState(true);
  const toggleOpen = () => setIsOpen((prev) => !prev);

  const computedStyles = getComputedStyles(
    selectedElement,
    state.currentBreakpoint
  );

  const hasSpecificStyles =
    state.currentBreakpoint !== "desktop" &&
    hasBreakpointStyles(selectedElement, state.currentBreakpoint);

  const resetStyleToDesktop = (property: string | string[]) => {
    if (state.currentBreakpoint === "desktop") return;

    const currentBreakpointStyles =
      selectedElement.styles[state.currentBreakpoint] || {};
    const newBreakpointStyles = { ...currentBreakpointStyles };

    const propsToReset = Array.isArray(property) ? property : [property];
    propsToReset.forEach((prop) => delete newBreakpointStyles[prop]);

    dispatch({
      type: "UPDATE_ELEMENT",
      payload: {
        id: selectedElement.id,
        updates: {
          styles: {
            ...selectedElement.styles,
            [state.currentBreakpoint]:
              Object.keys(newBreakpointStyles).length > 0
                ? newBreakpointStyles
                : undefined,
          },
        },
      },
    });
  };

  const isBgColorInherited =
    state.currentBreakpoint !== "desktop" &&
    !selectedElement.styles[state.currentBreakpoint]?.backgroundColor;

  const handleBgImageFromAssets = () => {
    dispatch({ type: "SET_ACTIVE_TAB", payload: { tab: "assets" } });
  };

  useEffect(() => {
    if (
      state.selectedAssetForStyle &&
      selectedElement.id === state.selectedElement
    ) {
      updateStyle(
        "backgroundImage",
        `url('${state.selectedAssetForStyle.url}')`
      );
      dispatch({ type: "SELECT_ASSET_FOR_STYLE", payload: { asset: null } });
    }
  }, [
    state.selectedAssetForStyle,
    selectedElement.id,
    state.selectedElement,
    updateStyle,
    dispatch,
  ]);

  return (
    <div className="py-2">
      <CardHeader className="p-0 cursor-pointer" onClick={toggleOpen}>
        <CardTitle className="text-xs font-normal flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* <Palette className="w-4 h-4" /> */}
            Appearance
          </div>
          <div className="flex items-center gap-2">
            {hasSpecificStyles && (
              <Badge variant="secondary" className="text-[10px]">
                Custom
              </Badge>
            )}
            {/* <Badge variant="outline" className="text-[10px]">
              {state.currentBreakpoint}
            </Badge> */}
            {isOpen ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </div>
        </CardTitle>
      </CardHeader>

      {isOpen && (
        <div className="space-y-4 pt-4">
          <ColorPicker
            value={computedStyles.backgroundColor || "transparent"}
            onChange={(value) => updateStyle("backgroundColor", value)}
            label="Background Color"
            isInherited={isBgColorInherited}
            onReset={() => resetStyleToDesktop("backgroundColor")}
          />

          <AdvancedBorderControl
            selectedElement={selectedElement}
            updateStyle={updateStyle}
            computedStyles={computedStyles}
            resetStyle={resetStyleToDesktop}
          />

          <AdvancedBorderRadiusControl
            selectedElement={selectedElement}
            updateStyle={updateStyle}
            computedStyles={computedStyles}
            resetStyle={resetStyleToDesktop}
          />

          <ShadowsControl
            label="Box Shadow"
            styleKey="boxShadow"
            selectedElement={selectedElement}
            updateStyle={updateStyle}
            computedStyles={computedStyles}
            resetStyle={resetStyleToDesktop}
          />

          <ShadowsControl
            label="Text Shadow"
            styleKey="textShadow"
            selectedElement={selectedElement}
            updateStyle={updateStyle}
            computedStyles={computedStyles}
            resetStyle={resetStyleToDesktop}
          />

          <div>
            <Label className="text-xs font-medium text-gray-700 mb-2 block">
              Background Image
            </Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="url(...)"
                  value={computedStyles.backgroundImage || ""}
                  onChange={(e) =>
                    updateStyle("backgroundImage", e.target.value)
                  }
                  className="text-[10px] h-9 flex-grow"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-2"
                  onClick={handleBgImageFromAssets}
                  title="Choose from Assets"
                >
                  <ImageIconLucide className="w-3.5 h-3.5" />
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Select
                  value={computedStyles.backgroundSize || "auto"}
                  onValueChange={(v) => updateStyle("backgroundSize", v)}
                >
                  <SelectTrigger className="text-[10px] h-9">
                    <SelectValue placeholder="Size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="cover">Cover</SelectItem>
                    <SelectItem value="contain">Contain</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={computedStyles.backgroundRepeat || "repeat"}
                  onValueChange={(v) => updateStyle("backgroundRepeat", v)}
                >
                  <SelectTrigger className="text-[10px] h-9">
                    <SelectValue placeholder="Repeat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="repeat">Repeat</SelectItem>
                    <SelectItem value="no-repeat">No Repeat</SelectItem>
                    <SelectItem value="repeat-x">Repeat X</SelectItem>
                    <SelectItem value="repeat-y">Repeat Y</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="text"
                  placeholder="Position"
                  value={computedStyles.backgroundPosition || ""}
                  onChange={(e) =>
                    updateStyle("backgroundPosition", e.target.value)
                  }
                  className="text-[10px] h-9"
                />
              </div>
            </div>
          </div>

          {/* Overflow Controls */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label className="text-xs font-medium text-gray-700">
                Overflow
              </Label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label
                  htmlFor="overflow-all"
                  className="text-[10px] text-gray-500 mb-1 block"
                >
                  Overall
                </Label>
                <Select
                  value={computedStyles.overflow || "visible"}
                  onValueChange={(v) => updateStyle("overflow", v)}
                >
                  <SelectTrigger id="overflow-all" className="text-[10px] h-9">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visible">Visible</SelectItem>
                    <SelectItem value="hidden">Hidden</SelectItem>
                    <SelectItem value="scroll">Scroll</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="clip">Clip</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label
                  htmlFor="overflow-x"
                  className="text-[10px] text-gray-500 mb-1 block"
                >
                  X-Axis
                </Label>
                <Select
                  value={computedStyles.overflowX || "visible"}
                  onValueChange={(v) => updateStyle("overflowX", v)}
                >
                  <SelectTrigger id="overflow-x" className="text-[10px] h-9">
                    <SelectValue placeholder="X Axis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visible">Visible</SelectItem>
                    <SelectItem value="hidden">Hidden</SelectItem>
                    <SelectItem value="scroll">Scroll</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="clip">Clip</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label
                  htmlFor="overflow-y"
                  className="text-[10px] text-gray-500 mb-1 block"
                >
                  Y-Axis
                </Label>
                <Select
                  value={computedStyles.overflowY || "visible"}
                  onValueChange={(v) => updateStyle("overflowY", v)}
                >
                  <SelectTrigger id="overflow-y" className="text-[10px] h-9">
                    <SelectValue placeholder="Y Axis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visible">Visible</SelectItem>
                    <SelectItem value="hidden">Hidden</SelectItem>
                    <SelectItem value="scroll">Scroll</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="clip">Clip</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Filters */}
          <FiltersControl
            selectedElement={selectedElement}
            updateStyle={updateStyle}
            computedStyles={computedStyles}
            resetStyle={resetStyleToDesktop}
          />
        </div>
      )}
    </div>
  );
}

function SizeControls({
  selectedElement,
  updateStyle,
  computedStyles,
  state,
}: {
  selectedElement: any;
  updateStyle: (key: string, value: any) => void;
  computedStyles: any;
  state: any;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const toggleOpen = () => setIsOpen((prev) => !prev);

  const currentBreakpointStyles =
    selectedElement.styles[state.currentBreakpoint] || {};
  const hasSpecificStyles =
    state.currentBreakpoint !== "desktop" &&
    (currentBreakpointStyles?.width ||
      currentBreakpointStyles?.height ||
      currentBreakpointStyles?.minWidth ||
      currentBreakpointStyles?.maxWidth);

  return (
    <div className="py-2">
      <CardHeader className="p-0 cursor-pointer" onClick={toggleOpen}>
        <CardTitle className="text-xs font-normal flex items-center justify-between">
          <span className="flex items-center gap-1">Size</span>
          <div className="flex items-center gap-2">
            {hasSpecificStyles && (
              <Badge variant="secondary" className="text-[10px]">
                Custom
              </Badge>
            )}
            {/* <Badge variant="outline" className="text-[10px]">
              {state.currentBreakpoint}
            </Badge> */}
            {isOpen ? (
              <ChevronDown className="w-[14px] h-[14px] text-gray-500" />
            ) : (
              <ChevronRight className="w-[14px] h-[14px] text-gray-500" />
            )}
          </div>
        </CardTitle>
      </CardHeader>

      {isOpen && (
        <div className="space-y-3 pt-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-gray-600">Width</Label>
              <Input
                value={computedStyles.width || ""}
                onChange={(e) => updateStyle("width", e.target.value)}
                placeholder="auto"
                className="mt-1 text-[10px]"
              />
            </div>
            <div>
              <Label className="text-[10px] text-gray-600">Height</Label>
              <Input
                value={computedStyles.height || ""}
                onChange={(e) => updateStyle("height", e.target.value)}
                placeholder="auto"
                className="mt-1 text-[10px]"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-gray-600">Min Width</Label>
              <Input
                value={computedStyles.minWidth || ""}
                onChange={(e) => updateStyle("minWidth", e.target.value)}
                placeholder="0"
                className="mt-1 text-[10px]"
              />
            </div>
            <div>
              <Label className="text-[10px] text-gray-600">Max Width</Label>
              <Input
                value={computedStyles.maxWidth || ""}
                onChange={(e) => updateStyle("maxWidth", e.target.value)}
                placeholder="none"
                className="mt-1 text-[10px]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function StylesTab() {
  const { state, dispatch } = useEditor();
  const [activeTab, setActiveTab] = useState("style");

  const selectedElement = findElementById(
    state.elements,
    state.selectedElement
  );

  if (!state.selectedElement || !selectedElement) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Palette className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-xs text-gray-500 mb-2">No element selected</p>
          <p className="text-[10px] text-gray-400">
            Click on an element to start styling
          </p>
        </div>
      </div>
    );
  }

  const updateStyle = (
    property: string,
    value: string | number | undefined
  ) => {
    dispatch({
      type: "UPDATE_ELEMENT_STYLES",
      payload: {
        id: state.selectedElement!,
        breakpoint: state.currentBreakpoint,
        styles: {
          [property]: value,
        },
      },
    });
  };

  const updateContent = (content: string) => {
    dispatch({
      type: "UPDATE_ELEMENT",
      payload: {
        id: state.selectedElement!,
        updates: { content },
      },
    });
  };

  const updateAttribute = (key: string, value: any) => {
    dispatch({
      type: "UPDATE_ELEMENT",
      payload: {
        id: state.selectedElement!,
        updates: {
          attributes: {
            ...selectedElement.attributes,
            [key]: value,
          },
        },
      },
    });
  };

  const canHaveLayout = LAYOUT_ELEMENTS.includes(selectedElement.tag);
  const computedStyles = getComputedStyles(
    selectedElement,
    state.currentBreakpoint
  );
  const hasSpecificStyles =
    state.currentBreakpoint !== "desktop" &&
    hasBreakpointStyles(selectedElement, state.currentBreakpoint);
  const isCustomHtml = selectedElement.type === "custom-html";
  const isImage = selectedElement.tag === "img";
  const isVideo = selectedElement.tag === "video";

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-[10px] text-[#4F5C68]">Selected</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-[#F4F6F8] py-1 px-2 rounded-md text-[10px] text-[#000000]">
            {selectedElement.type}
          </div>

          {hasSpecificStyles && (
            <div className="bg-[#F4F6F8] py-1 px-2 rounded-md text-[10px] text-[#000000]">
              Custom {state.currentBreakpoint}
            </div>
          )}

          <div className="bg-[#F4F6F8] py-1 px-2 rounded-md text-[10px] text-[#000000] flex items-center gap-1">
            {state.currentBreakpoint === "desktop" && (
              <Monitor className="w-3 h-3" />
            )}
            {state.currentBreakpoint === "tablet" && (
              <Tablet className="w-3 h-3" />
            )}
            {state.currentBreakpoint === "mobile" && (
              <Smartphone className="w-3 h-3" />
            )}
            {state.currentBreakpoint}
          </div>
        </div>
      </div>

      <div className="bg-[#F4F6F8] py-1.5 mb-6 px-2 items-center flex gap-2 text-[10px] rounded-md text-[#000000]">
        <Layers size={12} />
        <h3>
          {selectedElement.tag} #{selectedElement.id.slice(0, 8)}
        </h3>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-4">
        <button
          onClick={() => setActiveTab("style")}
          className={`px-4 py-2 text-xs rounded-md flex-1 ${
            activeTab === "style"
              ? "bg-[#F4F6F8] text-black font-medium"
              : "text-[#4F5C68] hover:bg-[#F4F6F8]/50"
          }`}
        >
          Style
        </button>
        <button
          onClick={() => setActiveTab("action")}
          className={`px-4 py-2 text-xs rounded-md flex-1 ${
            activeTab === "action"
              ? "bg-[#F4F6F8] text-black font-medium"
              : "text-[#4F5C68] hover:bg-[#F4F6F8]/50"
          }`}
        >
          Action
        </button>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        {activeTab === "style" ? (
          <div className="space-y-4 pb-4">
            <AttributesControl
              selectedElement={selectedElement}
              updateAttribute={updateAttribute}
            />
            {isImage && (
              <ImageControl
                selectedElement={selectedElement}
                updateAttribute={updateAttribute}
                updateStyle={updateStyle}
              />
            )}
            {isVideo && (
              <VideoControl
                selectedElement={selectedElement}
                updateAttribute={updateAttribute}
              />
            )}
            {isCustomHtml && (
              <CustomHtmlEditor
                selectedElement={selectedElement}
                updateContent={updateContent}
              />
            )}
            {canHaveLayout && <LayoutBuilder />}
            {!isCustomHtml && !isImage && !isVideo && (
              <TypographyControls
                selectedElement={selectedElement}
                updateStyle={updateStyle}
                updateContent={updateContent}
              />
            )}
            <SpacingControls
              selectedElement={selectedElement}
              updateStyle={updateStyle}
            />
            <AppearanceControls
              selectedElement={selectedElement}
              updateStyle={updateStyle}
            />
            {/* Size Card */}
            <SizeControls
              selectedElement={selectedElement}
              updateStyle={updateStyle}
              computedStyles={computedStyles}
              state={state}
            />
          </div>
        ) : (
          <ActionControls
            selectedElement={selectedElement}
            updateAttribute={updateAttribute}
          />
        )}
      </ScrollArea>
    </div>
  );
}
