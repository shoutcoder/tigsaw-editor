import { generateId } from "./utils"
import type { Element } from "@/contexts/editor-context"

// Helper to convert kebab-case to camelCase (e.g., 'background-color' -> 'backgroundColor')
function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
}

// Main parsing function for a single HTML node
function parseNodeToElement(node: HTMLElement): Element {
  const styles: Record<string, any> = {}
  for (let i = 0; i < node.style.length; i++) {
    const property = node.style[i]
    const value = node.style.getPropertyValue(property)
    styles[toCamelCase(property)] = value
  }

  const attributes: Record<string, any> = {}
  for (const attr of Array.from(node.attributes)) {
    if (attr.name !== "style" && attr.name !== "class") {
      attributes[attr.name] = attr.value
    }
  }

  // Extract direct text content of the node, ignoring text from children elements
  const content = Array.from(node.childNodes)
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent)
    .join("")
    .trim()

  const children = Array.from(node.children)
    .map((child) => parseNodeToElement(child as HTMLElement))
    .filter(Boolean) as Element[]

  // Infer element type from tag name (can be expanded)
  let type = "container"
  const tag = node.tagName.toLowerCase()
  if (tag === "p") type = "paragraph"
  else if (tag.match(/^h[1-6]$/)) type = "heading"
  else if (tag === "img") type = "image"
  else if (tag === "a") type = "link"
  else if (tag === "button") type = "button"

  return {
    id: generateId(),
    tag,
    type,
    content: content || undefined,
    styles: {
      desktop: styles,
    },
    attributes,
    children,
  }
}

// Create a default hero banner layout
function createDefaultHeroBanner(): Element[] {
  // Generate IDs upfront so we can reference them in interactions
  const alertId = generateId()
  const getStartedButtonId = generateId()
  const closeButtonId = generateId()

  return [
    {
      id: generateId(),
      type: "section",
      tag: "section",
      content: undefined,
      styles: {
        desktop: {
          minHeight: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          position: "relative",
          overflow: "hidden",
        },
      },
      attributes: {},
      children: [
        {
          id: generateId(),
          type: "container",
          tag: "div",
          content: undefined,
          styles: {
            desktop: {
              textAlign: "center",
              color: "white",
              maxWidth: "800px",
              zIndex: "2",
              position: "relative",
            },
          },
          attributes: {},
          children: [
            {
              id: generateId(),
              type: "heading",
              tag: "h1",
              content: "Welcome to Your Website",
              styles: {
                desktop: {
                  fontSize: "3.5rem",
                  fontWeight: "bold",
                  marginBottom: "1.5rem",
                  lineHeight: "1.2",
                  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  color: "white",
                },
              },
              attributes: {},
              children: [],
            },
            {
              id: generateId(),
              type: "text",
              tag: "p",
              content:
                "Create something amazing with our powerful visual editor. Drag, drop, and customize to build your perfect website.",
              styles: {
                desktop: {
                  fontSize: "1.25rem",
                  marginBottom: "2rem",
                  opacity: "0.9",
                  lineHeight: "1.6",
                  color: "white",
                },
              },
              attributes: {},
              children: [],
            },
            {
              id: generateId(),
              type: "container",
              tag: "div",
              content: undefined,
              styles: {
                desktop: {
                  display: "flex",
                  gap: "1rem",
                  justifyContent: "center",
                  flexWrap: "wrap",
                },
              },
              attributes: {},
              children: [
                {
                  id: getStartedButtonId,
                  type: "button",
                  tag: "button",
                  content: "Get Started",
                  styles: {
                    desktop: {
                      backgroundColor: "#ffffff",
                      color: "#667eea",
                      padding: "0.75rem 2rem",
                      borderRadius: "0.5rem",
                      border: "none",
                      fontSize: "1.1rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    },
                  },
                  attributes: {},
                  children: [],
                  interactions: {
                    onClick: {
                      action: "show",
                      target: alertId,
                    },
                  },
                },
                {
                  id: generateId(),
                  type: "button",
                  tag: "button",
                  content: "Learn More",
                  styles: {
                    desktop: {
                      backgroundColor: "transparent",
                      color: "#ffffff",
                      padding: "0.75rem 2rem",
                      borderRadius: "0.5rem",
                      border: "2px solid rgba(255,255,255,0.3)",
                      fontSize: "1.1rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    },
                  },
                  attributes: {},
                  children: [],
                },
              ],
            },
          ],
        },
        // Decorative background elements
        {
          id: generateId(),
          type: "container",
          tag: "div",
          content: undefined,
          styles: {
            desktop: {
              position: "absolute",
              top: "10%",
              right: "10%",
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.1)",
              zIndex: "1",
              pointerEvents: "none",
            },
          },
          attributes: {},
          children: [],
        },
        {
          id: generateId(),
          type: "container",
          tag: "div",
          content: undefined,
          styles: {
            desktop: {
              position: "absolute",
              bottom: "15%",
              left: "5%",
              width: "150px",
              height: "150px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.05)",
              zIndex: "1",
              pointerEvents: "none",
            },
          },
          attributes: {},
          children: [],
        },
      ],
    },
    // Alert popup element as a separate root-level element
    {
      id: alertId,
      type: "alert",
      tag: "div",
      content: undefined,
      styles: {
        desktop: {
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "12px",
          boxShadow: "0 20px 25px rgba(0,0,0,0.3)",
          zIndex: "1000",
          display: "block", // Change from "none" to "block" - we'll control visibility via interaction states
          minWidth: "300px",
          textAlign: "center",
          border: "1px solid #e5e7eb",
        },
      },
      attributes: {},
      children: [
        {
          id: generateId(),
          type: "heading",
          tag: "h3",
          content: "Hello from Hero Component! 👋",
          styles: {
            desktop: {
              fontSize: "1.5rem",
              fontWeight: "bold",
              marginBottom: "1rem",
              color: "#1f2937",
            },
          },
          attributes: {},
          children: [],
        },
        {
          id: generateId(),
          type: "text",
          tag: "p",
          content:
            "This alert was triggered by clicking the 'Get Started' button in the hero section. The interaction system is working perfectly!",
          styles: {
            desktop: {
              fontSize: "1rem",
              color: "#6b7280",
              lineHeight: "1.6",
              marginBottom: "1.5rem",
            },
          },
          attributes: {},
          children: [],
        },
        {
          id: closeButtonId,
          type: "button",
          tag: "button",
          content: "Close",
          styles: {
            desktop: {
              backgroundColor: "#667eea",
              color: "white",
              padding: "0.5rem 1.5rem",
              borderRadius: "0.375rem",
              border: "none",
              fontSize: "0.875rem",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s",
            },
          },
          attributes: {},
          children: [],
          interactions: {
            onClick: {
              action: "hide",
              target: alertId,
            },
          },
        },
      ],
    },
    // Add a content section below the hero for easier element dropping
    {
      id: generateId(),
      type: "section",
      tag: "section",
      content: undefined,
      styles: {
        desktop: {
          padding: "4rem 2rem",
          backgroundColor: "#ffffff",
          minHeight: "400px",
        },
      },
      attributes: {},
      children: [
        {
          id: generateId(),
          type: "container",
          tag: "div",
          content: undefined,
          styles: {
            desktop: {
              maxWidth: "1200px",
              margin: "0 auto",
              textAlign: "center",
            },
          },
          attributes: {},
          children: [
            {
              id: generateId(),
              type: "heading",
              tag: "h2",
              content: "Start Building Your Content",
              styles: {
                desktop: {
                  fontSize: "2.5rem",
                  fontWeight: "bold",
                  marginBottom: "1rem",
                  color: "#333333",
                },
              },
              attributes: {},
              children: [],
            },
            {
              id: generateId(),
              type: "text",
              tag: "p",
              content:
                "Drag elements from the sidebar to add content here. You can edit any text by double-clicking on it.",
              styles: {
                desktop: {
                  fontSize: "1.1rem",
                  color: "#666666",
                  lineHeight: "1.6",
                  marginBottom: "2rem",
                },
              },
              attributes: {},
              children: [],
            },
          ],
        },
      ],
    },
  ]
}
// function createDefaultHeroBanner(): Element[] {
//   const popupId = "valentineOfferPopup9173"
//   const closeBtnId = "closeValentineOfferBtn9173"
//   const imageId = generateId()
//   const pretitleId = generateId()
//   const titleId = generateId()
//   const contentContainerId = generateId()

//   return [
//     {
//       id: popupId,
//       type: "popup",
//       tag: "div",
//       content: undefined,
//       styles: {
//         desktop: {
//           position: "fixed",
//           bottom: "20px",
//           left: "50%",
//           transform: "translateX(-50%) translateX(-110%)",
//           width: "calc(100% - 40px)",
//           maxWidth: "380px",
//           backgroundColor: "#ffffff",
//           border: "2px solid #ffc2d1",
//           borderRadius: "16px",
//           boxShadow: "0 10px 30px rgba(255, 105, 180, 0.2)",
//           textAlign: "center",
//           padding: "25px 20px 20px",
//           zIndex: 1000,
//           opacity: 0,
//           transition: "opacity 0.6s ease-out, transform 0.8s cubic-bezier(0.19, 1, 0.22, 1)",
//           boxSizing: "border-box",
//         },
//         tablet: {
//           left: "25px",
//           transform: "translateX(-110%)",
//         },
//         mobile: {},
//       },
//       attributes: {
//         class: "cu-offer-popup-valentine-9173",
//         "data-date": "2025-08-14T23:59:00",
//       },
//       children: [
//         {
//           id: closeBtnId,
//           type: "button",
//           tag: "button",
//           content: "×",
//           styles: {
//             desktop: {
//               position: "absolute",
//               top: "10px",
//               right: "10px",
//               background: "none",
//               color: "#e91e63",
//               border: "none",
//               fontSize: "20px",
//               cursor: "pointer",
//               padding: "5px",
//               transition: "color 0.2s",
//               lineHeight: "1",
//             },
//           },
//           attributes: {
//             class: "cu-offer-popup-valentine-9173-close",
//             "aria-label": "Close offer",
//           },
//           children: [],
//           states: {
//             default: {
//               styles: {},
//               content: "×",
//               visible: true,
//             },
//             hover: {
//               styles: {
//                 color: "#c2185b",
//               },
//             },
//           },
//           currentState: "default",
//         },
//         {
//           id: contentContainerId,
//           type: "container",
//           tag: "div",
//           content: undefined,
//           styles: {
//             desktop: {
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "center",
//             },
//           },
//           attributes: {
//             class: "cu-offer-popup-valentine-9173-content",
//           },
//           children: [
//             {
//               id: imageId,
//               type: "image",
//               tag: "img",
//               content: undefined,
//               styles: {
//                 desktop: {
//                   maxWidth: "100px",
//                   width: "100%",
//                   marginBottom: "15px",
//                 },
//                 tablet: {
//                   maxWidth: "120px",
//                   marginBottom: "20px",
//                 },
//               },
//               attributes: {
//                 src: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3...",
//                 alt: "Valentine's gift with hearts",
//                 class: "cu-offer-popup-valentine-9173-image",
//               },
//               children: [],
//             },
//             {
//               id: pretitleId,
//               type: "text",
//               tag: "p",
//               content: "Spread The Love",
//               styles: {
//                 desktop: {
//                   fontSize: "0.85rem",
//                   color: "#d81b60",
//                   fontWeight: "700",
//                   marginBottom: "6px",
//                   letterSpacing: "0.5px",
//                 },
//               },
//               attributes: {
//                 class: "cu-offer-popup-valentine-9173-pretitle",
//               },
//               children: [],
//             },
//             {
//               id: titleId,
//               type: "heading",
//               tag: "h2",
//               content: "Valentine's Specials",
//               styles: {
//                 desktop: {
//                   fontFamily: "Playfair Display, serif",
//                   fontSize: "1.7rem",
//                   fontWeight: "700",
//                   color: "#ad1457",
//                   marginBottom: "10px",
//                   lineHeight: "1.2",
//                 },
//                 tablet: {
//                   fontSize: "1.9rem",
//                 },
//               },
//               attributes: {
//                 class: "cu-offer-popup-valentine-9173-title",
//               },
//               children: [],
//             },
//           ],
//         },
//       ],
//       states: {
//         default: {
//           styles: {},
//           visible: true,
//         },
//       },
//       currentState: "default",
//     },
//   ]
// }


/**
 * Imports an existing design from HTML, CSS, and JS strings into the editor's element structure.
 * If no HTML is provided or HTML is empty, returns a default hero banner layout.
 *
 * @param html The HTML string to parse. If empty, a default hero banner will be created.
 * @param css The CSS string. NOTE: Currently, only inline styles are parsed. This is for future use.
 * @param js The JS string. NOTE: This is preserved for export but not executed or parsed.
 * @returns An object containing the array of parsed elements and the original JS string.
 */
export function importDesign(
  html = "",
  css = "", // Not used yet, but here for future implementation
  js = "",
): { elements: Element[]; globalJs: string; initialInteractionStates?: Record<string, any> } {
  // Declare alertId variable before using it
  const alertId = generateId()

  // If no HTML provided or HTML is empty/whitespace, return default hero banner
  if (!html || html.trim() === "") {
    const elements = createDefaultHeroBanner()

    return {
      elements,
      globalJs: js,
      // Add initial interaction states to hide the alert
      initialInteractionStates: {
        [alertId]: { visible: false },
      },
    }
  }

  if (typeof window === "undefined") {
    console.error("importDesign can only be run in a browser environment.")
    return { elements: createDefaultHeroBanner(), globalJs: js }
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(html, "text/html")
  const body = doc.body

  const elements = Array.from(body.children)
    .map((child) => parseNodeToElement(child as HTMLElement))
    .filter(Boolean) as Element[]

  // If parsing resulted in no elements, return default hero banner
  if (elements.length === 0) {
    return {
      elements: createDefaultHeroBanner(),
      globalJs: js,
    }
  }

  // TODO: Implement CSS parsing to apply styles from the CSS string to the elements.
  // This is a complex task. A potential approach is to use a library like css.js
  // or to temporarily render the HTML and CSS in a hidden iframe to use getComputedStyle.
  console.warn(
    "CSS import is not fully implemented. Only inline styles from the HTML are currently parsed. The provided CSS string is ignored.",
  )

  return { elements, globalJs: js }
}

/**
 * Get the default hero banner layout
 * This can be used independently if you want to add a hero banner to an existing design
 */
export function getDefaultHeroBanner(): Element[] {
  return createDefaultHeroBanner()
}
