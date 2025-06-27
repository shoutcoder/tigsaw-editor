"use client";

import type React from "react";
import { useEditor } from "@/contexts/editor-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  Trash2,
  GripVertical,
  Layers,
  Plus,
  FolderIcon,
  FileIcon,
  ImageIcon,
  Link2,
  FileInput,
  FileText,
  List,
  Table,
  Video,
  Volume2,
  MoveUp,
  MoveDown,
  ChevronsUp,
  ChevronsDown,
  Square,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { Element } from "@/contexts/editor-context";
import { useDrag, useDrop, type XYCoord, useDragLayer } from "react-dnd";

interface LayerItemProps {
  element: Element;
  level: number;
  index: number;
  parentId?: string;
  path: string;
}

const ITEM_TYPE = "layer";

const CONTAINER_ELEMENTS = [
  "div",
  "section",
  "header",
  "footer",
  "main",
  "article",
  "aside",
];

function RootDropZone({
  children,
  path,
}: {
  children: React.ReactNode;
  path: string;
}) {
  const { state, dispatch } = useEditor();
  const ref = useRef<HTMLDivElement>(null);

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ITEM_TYPE,
    drop: (item: any, monitor) => {
      if (!monitor.didDrop() && state.editingMode === "editing") {
        dispatch({
          type: "MOVE_ELEMENT",
          payload: {
            elementId: item.id,
            newParentId: undefined,
            index: state.elements.length,
          },
        });
      }
    },
    canDrop: (item: any) =>
      state.editingMode === "editing" && !item.originalPath.startsWith(path),
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  }));

  drop(ref);

  return (
    <div
      ref={ref}
      className={cn(
        "min-h-full py-1",
        isOver &&
          canDrop &&
          "bg-gray-50 border border-gray-200 border-dashed rounded"
      )}
    >
      {children}
    </div>
  );
}

function LayerItem({ element, level, index, parentId, path }: LayerItemProps) {
  const { state, dispatch } = useEditor();
  const [isExpanded, setIsExpanded] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const hasChildren = element.children && element.children.length > 0;
  const isContainer = CONTAINER_ELEMENTS.includes(element.tag);
  const isSelected = state.selectedElement === element.id;
  const isVisible = (element.styles.desktop?.display ?? "block") !== "none";

  const monitor = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    isDragging: monitor.isDragging(),
    clientOffset: monitor.getClientOffset(),
  }));

  const getElementIcon = () => {
    if (hasChildren || isContainer) {
      return <FolderIcon color="#FE784E" className="w-4 h-4" />;
    }
    switch (element.tag.toLowerCase()) {
      case "img":
        return <ImageIcon color="#FE784E" className="w-4 h-4" />;
      case "button":
        return <Square color="#FE784E" className="w-4 h-4" />;
      case "input":
        return <FileInput color="#FE784E" className="w-4 h-4" />;
      case "link":
      case "a":
        return <Link2 color="#FE784E" className="w-4 h-4" />;
      case "text":
      case "p":
      case "span":
        return <FileText color="#FE784E" className="w-4 h-4" />;
      case "list":
      case "ul":
      case "ol":
        return <List color="#FE784E" className="w-4 h-4" />;
      case "table":
        return <Table color="#FE784E" className="w-4 h-4" />;
      case "video":
        return <Video color="#FE784E" className="w-4 h-4" />;
      case "audio":
        return <Volume2 color="#FE784E" className="w-4 h-4" />;
      default:
        return <FileIcon color="#FE784E" className="w-4 h-4" />;
    }
  };

  // const handleMoveElement = (direction: "up" | "down" | "top" | "bottom") => {
  //   if (state.editingMode !== "editing") return;

  //   let newIndex: number;
  //   const parentChildren = parentId
  //     ? state.elements.find((el) => el.id === parentId)?.children
  //     : state.elements;
  //   const maxIndex = (parentChildren?.length ?? 0) - 1;

  //   switch (direction) {
  //     case "up":
  //       newIndex = Math.max(0, index - 1);
  //       break;
  //     case "down":
  //       newIndex = Math.min(maxIndex, index + 1);
  //       break;
  //     case "top":
  //       newIndex = 0;
  //       break;
  //     case "bottom":
  //       newIndex = maxIndex;
  //       break;
  //     default:
  //       return;
  //   }

  //   if (newIndex !== index) {
  //     dispatch({
  //       type: "MOVE_ELEMENT",
  //       payload: {
  //         elementId: element.id,
  //         newParentId: parentId,
  //         index: newIndex,
  //       },
  //     });
  //   }
  // };
  const [{ isDragging }, drag, dragPreview] = useDrag(() => ({
    type: ITEM_TYPE,
    item: {
      id: element.id,
      originalPath: path,
      parentId,
      index,
      element,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: () => state.editingMode === "editing",
  }));

  const [{ handlerId, isOverCurrent }, drop] = useDrop({
    accept: ITEM_TYPE,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
        isOverCurrent: monitor.isOver({ shallow: true }),
      };
    },
    hover(item: any, monitor) {
      if (!ref.current || state.editingMode !== "editing") return;

      const dragId = item.id;
      const hoverId = element.id;

      if (dragId === hoverId) return;

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      const canNest = isContainer && !item.originalPath.startsWith(path);

      if (
        canNest &&
        hoverClientY > hoverBoundingRect.height * 0.25 &&
        hoverClientY < hoverBoundingRect.height * 0.75
      ) {
        if (ref.current) ref.current.dataset.dropTargetType = "nest";
        return;
      }

      if (ref.current) ref.current.dataset.dropTargetType = "reorder";
    },
    drop: (item: any, monitor) => {
      if (state.editingMode !== "editing") return;
      if (monitor.didDrop()) return;

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const clientOffset = monitor.getClientOffset();
      const hoverClientY =
        (clientOffset as XYCoord).y - (hoverBoundingRect?.top ?? 0);
      const hoverMiddleY =
        ((hoverBoundingRect?.bottom ?? 0) - (hoverBoundingRect?.top ?? 0)) / 2;

      let targetParentId = parentId;
      let targetIndex = index;

      if (
        isContainer &&
        !item.originalPath.startsWith(path) &&
        hoverBoundingRect &&
        hoverClientY > hoverBoundingRect.height * 0.2 &&
        hoverClientY < hoverBoundingRect.height * 0.8
      ) {
        targetParentId = element.id;
        targetIndex = element.children?.length || 0;
      } else {
        targetIndex = hoverClientY < hoverMiddleY ? index : index + 1;
      }

      dispatch({
        type: "MOVE_ELEMENT",
        payload: {
          elementId: item.id,
          newParentId: targetParentId,
          index: targetIndex,
        },
      });
    },
  });

  drag(drop(ref));

  useEffect(() => {
    if (previewRef.current) {
      dragPreview(previewRef);
    }
  }, [dragPreview]);

  const dropTargetType = ref.current?.dataset.dropTargetType;
  const showNestIndicator = isOverCurrent && dropTargetType === "nest";
  const showReorderIndicator = isOverCurrent && dropTargetType === "reorder";

  return (
    <div
      ref={previewRef}
      className={cn("group relative", isDragging && "opacity-30")}
    >
      {showReorderIndicator && (
        <div
          className="absolute left-0 right-0 h-0.5 bg-blue-500 z-10"
          style={{
            top:
              ref.current &&
              monitor.clientOffset &&
              (monitor.clientOffset as XYCoord).y -
                ref.current.getBoundingClientRect().top <
                ref.current.getBoundingClientRect().height / 2
                ? "-1px"
                : "calc(100% - 1px)",
          }}
        />
      )}
      <div
        ref={ref}
        data-handler-id={handlerId}
        className={cn(
          "flex items-center py-2 px-2 hover:bg-gray-50 cursor-pointer text-sm",
          isSelected && "bg-gray-50",
          showNestIndicator && "bg-gray-50 border border-gray-200 border-dashed"
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() =>
          dispatch({ type: "SELECT_ELEMENT", payload: { id: element.id } })
        }
      >
        <div className="w-4 h-4 mr-1 cursor-grab opacity-0 group-hover:opacity-100">
          <GripVertical className="w-4 h-4 text-gray-400" ref={drag} />
        </div>

        {(hasChildren || isContainer) && (
          <Button
            variant="ghost"
            size="sm"
            className="w-4 h-4 p-0 mr-1 flex-shrink-0 text-gray-400 hover:text-gray-600"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </Button>
        )}

        {!hasChildren && !isContainer && <div className="w-4 mr-1" />}

        <div className="w-4 h-4 mr-2 flex-shrink-0 text-gray-400">
          {getElementIcon()}
        </div>

        <span className="flex-1 truncate text-sm">
          {element.tag}
          {element.tag === "footer" && (
            <span className="ml-2 text-xs bg-gray-100 px-1.5 py-0.5 rounded">
              block
            </span>
          )}
        </span>

        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="w-6 h-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              const currentDisplay = element.styles.desktop?.display;
              const newDisplay =
                currentDisplay === "none"
                  ? element.styles.desktop?.originalDisplay || "block"
                  : "none";
              dispatch({
                type: "UPDATE_ELEMENT_STYLES",
                payload: {
                  id: element.id,
                  breakpoint: "desktop",
                  styles: {
                    display: newDisplay,
                    ...(newDisplay === "none" &&
                      currentDisplay !== "none" && {
                        originalDisplay: currentDisplay,
                      }),
                  },
                },
              });
            }}
          >
            {isVisible ? (
              <Eye className="w-3 h-3" />
            ) : (
              <EyeOff className="w-3 h-3 text-gray-400" />
            )}
          </Button>
          {/* Add delete button here */}
          <Button
            variant="ghost"
            size="sm"
            className="w-6 h-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={(e) => {
              e.stopPropagation();
              dispatch({ type: "DELETE_ELEMENT", payload: { id: element.id } });
            }}
            title="Delete element"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {(hasChildren || isContainer) && isExpanded && (
        <div>
          {element.children?.map((child, childIndex) => (
            <LayerItem
              key={child.id}
              element={child}
              level={level + 1}
              index={childIndex}
              parentId={element.id}
              path={`${path}.${childIndex}`}
            />
          ))}
          {(!element.children || element.children.length === 0) && (
            <div
              className="py-2 px-2 text-sm text-gray-400 italic"
              style={{ paddingLeft: `${(level + 1) * 16 + 24}px` }}
            >
              Empty {element.tag}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function LayersTab() {
  const { state } = useEditor();

  return (
    <div className="p-4">
      <ScrollArea className="h-[calc(100vh-200px)]">
        <RootDropZone path="root">
          <div className="space-y-0.5">
            {state.elements.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No elements yet. Drag elements from the Elements tab to get
                started.
              </p>
            ) : (
              state.elements.map((element, index) => (
                <LayerItem
                  key={element.id}
                  element={element}
                  level={0}
                  index={index}
                  path={`${index}`}
                />
              ))
            )}
          </div>
        </RootDropZone>
      </ScrollArea>
    </div>
  );
}
