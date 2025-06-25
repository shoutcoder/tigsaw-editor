import type { Element } from "@/contexts/editor-context"

// Helper to get a unique list of font faces
function generateFontFaces(elements: Element[]): string {
  const fontFaces = new Map<string, string>() // Map fontName to URL

  function collectFontFaces(el: Element) {
    const desktopStyles = el.styles.desktop
    if (desktopStyles?.fontFamily && desktopStyles?.fontFaceUrl) {
      if (
        !fontFaces.has(desktopStyles.fontFamily) ||
        fontFaces.get(desktopStyles.fontFamily) !== desktopStyles.fontFaceUrl
      ) {
        fontFaces.set(desktopStyles.fontFamily, desktopStyles.fontFaceUrl)
      }
    }
    // Check tablet and mobile for overrides that might introduce new custom fonts
    ;[el.styles.tablet, el.styles.mobile].forEach((breakpointStyle) => {
      if (breakpointStyle?.fontFamily && breakpointStyle?.fontFaceUrl) {
        if (
          !fontFaces.has(breakpointStyle.fontFamily) ||
          fontFaces.get(breakpointStyle.fontFamily) !== breakpointStyle.fontFaceUrl
        ) {
          fontFaces.set(breakpointStyle.fontFamily, breakpointStyle.fontFaceUrl)
        }
      }
    })

    if (el.children) {
      el.children.forEach(collectFontFaces)
    }
  }

  elements.forEach(collectFontFaces)

  let cssString = ""
  fontFaces.forEach((url, fontFamily) => {
    // Basic format inference from URL extension
    let format = ""
    if (url.endsWith(".woff2")) format = "format('woff2')"
    else if (url.endsWith(".woff")) format = "format('woff')"
    else if (url.endsWith(".ttf")) format = "format('truetype')"
    else if (url.endsWith(".otf")) format = "format('opentype')"
    else if (url.endsWith(".eot")) format = "" // EOT needs special handling, often with ?#iefix

    cssString += `@font-face {\n`
    cssString += `  font-family: '${fontFamily.replace(/'/g, "\\'")}';\n` // Escape single quotes in font name
    cssString += `  src: url('${url}');\n` // Simpler src for now
    // cssString += `  src: url('${url}') ${format};\n` // With format inference
    cssString += `}\n\n`
  })

  return cssString
}

export function exportDesign(elements: Element[], globalJs?: string) {
  const html = generateHTML(elements)
  const css = generateCSS(elements)
  const js = generateJS(elements, globalJs)

  return [
    { name: "index.html", content: html },
    { name: "styles.css", content: css },
    { name: "script.js", content: js },
  ]
}

function generateHTML(elements: Element[]): string {
  const renderElement = (element: Element, indent = 2): string => {
    const spaces = " ".repeat(indent)
    const attributes = Object.entries(element.attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(" ")

    const classAttr = `class="element-${element.id}"`
    const allAttributes = [classAttr, attributes].filter(Boolean).join(" ")

    if (element.children && element.children.length > 0) {
      const childrenHTML = element.children.map((child) => renderElement(child, indent + 2)).join("\n")

      return `${spaces}<${element.tag} ${allAttributes}>
${element.content ? `${spaces}  ${element.content}` : ""}
${childrenHTML}
${spaces}</${element.tag}>`
    } else {
      if (["img", "br", "hr", "input"].includes(element.tag)) {
        return `${spaces}<${element.tag} ${allAttributes} />`
      } else {
        return `${spaces}<${element.tag} ${allAttributes}>${element.content || ""}</${element.tag}>`
      }
    }
  }

  const bodyContent = elements.map((el) => renderElement(el)).join("\n")

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=width, initial-scale=1.0">
    <title>Generated Website</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
${bodyContent}
    <script src="script.js"></script>
</body>
</html>`
}

function generateCSS(elements: Element[]): string {
  const fontFaceStyles = generateFontFaces(elements)

  const collectStyles = (elementsToProcess: Element[]): string[] => {
    const styles: string[] = []

    elementsToProcess.forEach((element) => {
      // Desktop styles (base)
      if (Object.keys(element.styles.desktop).length > 0) {
        const cssProperties = Object.entries(element.styles.desktop)
          .filter(([property]) => property !== "fontFaceUrl") // Don't include fontFaceUrl directly in element styles
          .map(([property, value]) => {
            const cssProperty = property.replace(/([A-Z])/g, "-$1").toLowerCase()
            return `  ${cssProperty}: ${value};`
          })
          .join("\n")
        if (cssProperties) {
          styles.push(`.element-${element.id} {\n${cssProperties}\n}`)
        }
      }

      // Tablet styles (overrides)
      if (element.styles.tablet && Object.keys(element.styles.tablet).length > 0) {
        const tabletCssProperties = Object.entries(element.styles.tablet)
          .filter(([property]) => property !== "fontFaceUrl")
          .map(([property, value]) => {
            const cssProperty = property.replace(/([A-Z])/g, "-$1").toLowerCase()
            return `  ${cssProperty}: ${value};`
          })
          .join("\n")
        if (tabletCssProperties) {
          styles.push(`@media (max-width: 768px) {\n  .element-${element.id} {\n${tabletCssProperties}\n  }\n}`)
        }
      }

      // Mobile styles (overrides)
      if (element.styles.mobile && Object.keys(element.styles.mobile).length > 0) {
        const mobileCssProperties = Object.entries(element.styles.mobile)
          .filter(([property]) => property !== "fontFaceUrl")
          .map(([property, value]) => {
            const cssProperty = property.replace(/([A-Z])/g, "-$1").toLowerCase()
            return `  ${cssProperty}: ${value};`
          })
          .join("\n")
        if (mobileCssProperties) {
          styles.push(`@media (max-width: 480px) {\n  .element-${element.id} {\n${mobileCssProperties}\n  }\n}`)
        }
      }

      if (element.children && element.children.length > 0) {
        styles.push(...collectStyles(element.children))
      }
    })

    return styles
  }

  const elementStyles = collectStyles(elements)

  const baseCSS = `/* Reset and base styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  line-height: 1.6;
  color: #333;
}

/* Generated @font-face rules */
${fontFaceStyles}
/* Generated element styles */
${elementStyles.join("\n\n")}

/* Global Responsive styles (example, can be removed if element-specific is enough) */
/*
@media (max-width: 768px) {
  body {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  body {
    font-size: 12px;
  }
}
*/
`
  return baseCSS
}

function generateJS(elements: Element[], globalJs?: string): string {
  // Collect interactive elements
  const interactiveElements: Element[] = []

  const collectInteractiveElements = (elementsToProcess: Element[]) => {
    elementsToProcess.forEach((element) => {
      if (element.interactions) {
        interactiveElements.push(element)
      }
      if (element.children && element.children.length > 0) {
        collectInteractiveElements(element.children)
      }
    })
  }

  collectInteractiveElements(elements)

  // Generate interaction handlers
  let interactionHandlers = ""

  if (interactiveElements.length > 0) {
    interactionHandlers = `
  // Interaction system
  const interactionStates = {};
  
  function triggerInteraction(elementId, interaction) {
    const element = document.querySelector('.element-' + elementId);
    if (!element) return;
    
    const interactionConfig = window.elementInteractions[elementId] && window.elementInteractions[elementId][interaction];
    if (!interactionConfig) return;
    
    switch (interactionConfig.action) {
      case 'toggle':
        if (interactionConfig.target) {
          const targetElement = document.querySelector('.element-' + interactionConfig.target);
          if (targetElement) {
            const isVisible = targetElement.style.display !== 'none';
            targetElement.style.display = isVisible ? 'none' : 'block';
          }
        }
        break;
      case 'show':
        if (interactionConfig.target) {
          const targetElement = document.querySelector('.element-' + interactionConfig.target);
          if (targetElement) {
            targetElement.style.display = 'block';
          }
        }
        break;
      case 'hide':
        if (interactionConfig.target) {
          const targetElement = document.querySelector('.element-' + interactionConfig.target);
          if (targetElement) {
            targetElement.style.display = 'none';
          }
        }
        break;
    }
  }
  
  // Store interactions data
  window.elementInteractions = ${JSON.stringify(
    interactiveElements.reduce(
      (acc, element) => {
        if (element.interactions) {
          acc[element.id] = element.interactions
        }
        return acc
      },
      {} as Record<string, any>,
    ),
  )};
  
  // Add event listeners for interactive elements
${interactiveElements
  .map((element) => {
    let handlers = ""
    if (element.interactions?.onClick) {
      handlers += `  document.querySelector('.element-${element.id}').addEventListener('click', function(e) {
    e.preventDefault();
    triggerInteraction('${element.id}', 'onClick');
  });\n`
    }
    if (element.interactions?.onHover) {
      handlers += `  document.querySelector('.element-${element.id}').addEventListener('mouseenter', function() {
    triggerInteraction('${element.id}', 'onHover');
  });\n`
    }
    return handlers
  })
  .join("")}
`
  }

  // Include global JS if provided
  const globalJsSection =
    globalJs && globalJs.trim() !== ""
      ? `
  // Global JavaScript
  ${globalJs}
`
      : ""

  return `// Generated JavaScript for exported website
document.addEventListener('DOMContentLoaded', function() {
  console.log('Website loaded successfully!');
${interactionHandlers}${globalJsSection}
});`
}
