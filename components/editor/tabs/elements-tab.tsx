"use client";

import type React from "react";
import { useRef, useEffect } from "react";
import { useDrag } from "react-dnd";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Square,
  Type,
  ImageIcon,
  Layout,
  Columns,
  Grid,
  Navigation,
  CreditCardIcon as Card,
  List,
  FileText,
  Layers2,
  Box,
  Code,
  Video,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ElementType {
  type: string;
  label: string;
  icon: React.ComponentType<any>;
  tag: string;
  defaultStyles: Record<string, any>;
  defaultContent?: string;
  category: string;
}

const elementTypes: ElementType[] = [
  // Layout Elements
  {
    type: "container",
    label: "Container",
    icon: Square,
    tag: "div",
    category: "Layout",
    defaultStyles: {
      padding: "20px",
      backgroundColor: "#f9fafb",
      borderRadius: "8px",
      minHeight: "100px",
      border: "2px dashed #e5e7eb",
    },
  },
  {
    type: "section",
    label: "Section",
    icon: Layout,
    tag: "section",
    category: "Layout",
    defaultStyles: {
      padding: "40px 20px",
      backgroundColor: "white",
      minHeight: "200px",
    },
  },
  {
    type: "header",
    label: "Header",
    icon: Box,
    tag: "header",
    category: "Layout",
    defaultStyles: {
      padding: "20px",
      backgroundColor: "#f8fafc",
      borderBottom: "1px solid #e2e8f0",
      minHeight: "80px",
    },
  },
  {
    type: "footer",
    label: "Footer",
    icon: Box,
    tag: "footer",
    category: "Layout",
    defaultStyles: {
      padding: "20px",
      backgroundColor: "#f1f5f9",
      borderTop: "1px solid #e2e8f0",
      minHeight: "80px",
    },
  },
  {
    type: "main",
    label: "Main",
    icon: FileText,
    tag: "main",
    category: "Layout",
    defaultStyles: {
      padding: "20px",
      minHeight: "400px",
    },
  },
  {
    type: "aside",
    label: "Sidebar",
    icon: Layers2,
    tag: "aside",
    category: "Layout",
    defaultStyles: {
      padding: "20px",
      backgroundColor: "#fafafa",
      borderLeft: "1px solid #e5e7eb",
      minHeight: "300px",
      width: "250px",
    },
  },
  {
    type: "article",
    label: "Article",
    icon: FileText,
    tag: "article",
    category: "Layout",
    defaultStyles: {
      padding: "24px",
      backgroundColor: "white",
      borderRadius: "8px",
      border: "1px solid #e5e7eb",
      minHeight: "200px",
    },
  },
  {
    type: "columns",
    label: "2 Columns",
    icon: Columns,
    tag: "div",
    category: "Layout",
    defaultStyles: {
      display: "flex",
      gap: "20px",
      flexWrap: "wrap",
      minHeight: "150px",
    },
  },
  {
    type: "grid",
    label: "Grid",
    icon: Grid,
    tag: "div",
    category: "Layout",
    defaultStyles: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "20px",
      minHeight: "200px",
    },
  },

  // Content Elements
  {
    type: "heading",
    label: "Heading",
    icon: Type,
    tag: "h2",
    category: "Content",
    defaultStyles: {
      fontSize: "32px",
      fontWeight: "bold",
      color: "#111827",
      marginBottom: "16px",
      lineHeight: "1.2",
    },
    defaultContent: "Your Heading Here",
  },
  {
    type: "text",
    label: "Paragraph",
    icon: Type,
    tag: "p",
    category: "Content",
    defaultStyles: {
      fontSize: "16px",
      color: "#374151",
      lineHeight: "1.6",
      marginBottom: "16px",
    },
    defaultContent:
      "Add your text content here. You can edit this text by selecting the element and using the styles panel.",
  },
  {
    type: "button",
    label: "Button",
    icon: Square,
    tag: "button",
    category: "Content",
    defaultStyles: {
      padding: "12px 24px",
      backgroundColor: "#3b82f6",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "16px",
      fontWeight: "500",
      transition: "all 0.2s",
    },
    defaultContent: "Click me",
  },
  {
    type: "image",
    label: "Image",
    icon: ImageIcon,
    tag: "img",
    category: "Content",
    defaultStyles: {
      width: "100%",
      height: "auto",
      aspectRatio: "16 / 9",
      objectFit: "cover",
      borderRadius: "8px",
    },
  },
  {
    type: "video",
    label: "Video",
    icon: Video,
    tag: "video",
    category: "Content",
    defaultStyles: {
      width: "100%",
      height: "auto",
      borderRadius: "8px",
    },
  },
  {
    type: "custom-html",
    label: "Custom HTML",
    icon: Code,
    tag: "div",
    category: "Content",
    defaultStyles: {
      padding: "20px",
      minHeight: "50px",
      border: "2px dashed #d1d5db",
    },
    defaultContent:
      "<!-- Your HTML here -->\n<p>This is a custom HTML block. Edit the code in the Styles panel.</p>",
  },

  // Navigation Elements
  {
    type: "navbar",
    label: "Navigation",
    icon: Navigation,
    tag: "nav",
    category: "Navigation",
    defaultStyles: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "16px 24px",
      backgroundColor: "white",
      borderBottom: "1px solid #e5e7eb",
    },
  },

  // Advanced Elements
  {
    type: "card",
    label: "Card",
    icon: Card,
    tag: "div",
    category: "Components",
    defaultStyles: {
      backgroundColor: "white",
      borderRadius: "12px",
      padding: "24px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      border: "1px solid #e5e7eb",
    },
  },
  {
    type: "list",
    label: "List",
    icon: List,
    tag: "ul",
    category: "Content",
    defaultStyles: {
      listStyle: "disc",
      paddingLeft: "20px",
      color: "#374151",
    },
  },
];

function DraggableElement({ elementType }: { elementType: ElementType }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "element",
    item: { elementType },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      drag(ref);
    }
  }, [ref, drag]);

  const Icon = elementType.icon;

  return (
    <div
      ref={ref}
      className={`group px-3  py-2 border border-gray-200 rounded-lg cursor-move hover:bg-gray-50 hover:border-[#FB354C] transition-all ${
        isDragging ? "opacity-50 scale-95" : ""
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-[#FFD6DA] transition-colors">
          <Icon className="w-4 h-4 text-gray-600 group-hover:text-[#FB354C]" />
        </div>
        <div>
          <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900">
            {elementType.label}
          </span>
          <p className="text-xs text-gray-500 mt-0.5">{elementType.tag}</p>
        </div>
      </div>
    </div>
  );
}

export function ElementsTab() {
  const categories = Array.from(new Set(elementTypes.map((el) => el.category)));

  return (
    <div className="p-4">
      <h3 className="text-xs font-semibold text-gray-900 mb-4">Add Elements</h3>
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category}>
              {/* <h4 className="text-xs font-medium text-gray-600 mb-3 uppercase tracking-wide">
                {category}
              </h4> */}
              <div className="space-y-2">
                {elementTypes
                  .filter((el) => el.category === category)
                  .map((elementType) => (
                    <DraggableElement
                      key={elementType.type}
                      elementType={elementType}
                    />
                  ))}
              </div>
              {category !== categories[categories.length - 1] && (
                <Separator className="mt-4" />
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
