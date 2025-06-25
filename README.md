# Next.js Visual Editor

This project is a powerful, extendable visual website editor built with Next.js, React, and TypeScript. It provides a drag-and-drop interface to build web pages, a robust styling panel for fine-grained control, and an export feature to generate clean HTML, CSS, and JavaScript.

## Core Concepts

The editor is built around a few key concepts:

-   **Elements**: The entire webpage is represented as a tree of `Element` objects. Each object contains its ID, tag type, styles, attributes, and children. This structure is defined in `contexts/editor-context.tsx`.
-   **Editor Context**: A global state management system using React's Context API and `useReducer` hook. It manages the element tree, selected element, undo/redo history, and other editor-wide states.
-   **Canvas**: The main area where the webpage is rendered. It's a live preview that allows for direct interaction and element selection.
-   **Sidebar/Style Panel**: The primary interface for adding new elements and modifying the styles of the selected element.

## Getting Started

1.  **Clone the repository:**
    \`\`\`bash
    git clone <repository-url>
    cd <repository-name>
    \`\`\`

2.  **Install dependencies:**
    \`\`\`bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    \`\`\`

3.  **Run the development server:**
    \`\`\`bash
    npm run dev
    \`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## How to Load an Existing Design

You can initialize the editor with pre-existing HTML, CSS, and JavaScript content. This is useful for loading saved designs or importing templates.

We have provided a utility function `importDesign` located in `lib/import.ts` to handle this.

### Usage

The `importDesign` function takes HTML, CSS, and JS strings and converts the HTML into the editor's `Element` tree structure. You can then load this structure into the editor using the `LOAD_DESIGN` and `SET_GLOBAL_JS` dispatch actions.

Here is an example of how you might use it in a component:

\`\`\`tsx
import { useEffect } from 'react';
import { useEditor } from '@/contexts/editor-context';
import { importDesign } from '@/lib/import';

const DesignLoader = () => {
  const { dispatch } = useEditor();

  useEffect(() => {
    // Your existing HTML, CSS, and JS content
    const htmlContent = `
      <div style="padding: 20px; background-color: #f0f0f0;">
        <h1 style="color: #333;">Hello, World!</h1>
        <p>This is an imported design.</p>
      </div>
    `;
    const cssContent = `/* p { font-weight: bold; } */`; // Note: Currently ignored
    const jsContent = `console.log('Imported script loaded!');`;

    // Parse the content
    const { elements, globalJs } = importDesign(htmlContent, cssContent, jsContent);

    // Load the parsed elements and JS into the editor
    if (elements.length > 0) {
      dispatch({ type: 'LOAD_DESIGN', payload: { elements } });
      dispatch({ type: 'SET_GLOBAL_JS', payload: { js: globalJs } });
    }
  }, [dispatch]);

  return null; // This component is only for loading data
};
\`\`\`

### Current Limitations

-   **CSS Parsing**: The current implementation of `importDesign` **only parses inline `style` attributes** from the HTML. The `css` string parameter is reserved for future use and is currently ignored. Styles defined in `<style>` tags or external stylesheets linked in the HTML will not be imported.
-   **JavaScript**: The `js` string is preserved and will be included in the final export, but it is not executed or parsed for interactions within the editor.

---

## How to Add New Elements

You can extend the editor by adding new draggable elements to the "Elements" tab in the sidebar.

1.  **Navigate to `components/editor/tabs/elements-tab.tsx`**.
2.  Find the `ELEMENTS` constant array.
3.  Add a new object to this array with the required properties.

### Element Object Structure

\`\`\`ts
{
  id: string, // Unique identifier (e.g., 'element-link')
  label: string, // Display name in the sidebar (e.g., 'Link')
  icon: React.ElementType, // Icon component from lucide-react
  // --- Element Data ---
  type: string, // A category for the element (e.g., 'link', 'container')
  tag: string, // The HTML tag to be rendered (e.g., 'a', 'div')
  defaultStyles: Record<string, any>, // Default CSS styles (camelCase)
  defaultContent?: string, // Default text content
  defaultAttributes?: Record<string, any> // Default HTML attributes
}
\`\`\`

### Example: Adding a `<pre>` Element

\`\`\`tsx
// In components/editor/tabs/elements-tab.tsx
import { Code } from 'lucide-react'; // 1. Import an icon

// ... inside the ELEMENTS array
{
  id: 'element-pre',
  label: 'Code Block',
  icon: Code,
  type: 'code-block',
  tag: 'pre',
  defaultStyles: {
    padding: '16px',
    backgroundColor: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: '4px',
    whiteSpace: 'pre-wrap', // To wrap long lines
    fontFamily: 'monospace',
  },
  defaultContent: 'Your code here.',
},
\`\`\`

For most elements, this is all you need. The `RenderElement` component will automatically handle rendering. For elements with very specific rendering logic, you may need to update `components/editor/render-element.tsx`.

---

## How to Add New Style Properties

You can add new styling controls (e.g., for `text-transform` or `letter-spacing`) to the "Styles" tab.

1.  **Navigate to `components/editor/tabs/styles-tab.tsx`**.
2.  The UI is organized into control components like `LayoutControls`, `TypographyControls`, etc. Decide which section your new property belongs to, or create a new one.
3.  Add your new input control (e.g., a `Select`, `Input`, or `Slider`).

### General Pattern

-   **Get Current Value**: Read the current style value from the `computedStyles` object. This object contains all styles for the selected element at the current breakpoint.
    \`\`\`ts
    const currentValue = computedStyles.myNewProperty || 'default-value';
    \`\`\`
-   **Update Value**: Use the `handleStyleChange` function to update the style. This function correctly dispatches the update to the editor context.
    \`\`\`ts
    <Input
      value={computedStyles.letterSpacing || ''}
      onChange={(e) => handleStyleChange('letterSpacing', e.target.value)}
    />
    \`\`\`

### Example: Adding a `text-transform` Control

Let's add a dropdown to `TypographyControls` to manage `text-transform`.

\`\`\`tsx
// In components/editor/tabs/styles-tab.tsx, inside TypographyControls

// ... other controls for font, color, etc.

<div className="grid grid-cols-2 gap-2 items-center">
  <Label>Transform</Label>
  <Select
    value={computedStyles.textTransform || 'none'}
    onValueChange={(value) => handleStyleChange('textTransform', value)}
  >
    <SelectTrigger>
      <SelectValue placeholder="Transform" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="none">None</SelectItem>
      <SelectItem value="capitalize">Capitalize</SelectItem>
      <SelectItem value="uppercase">Uppercase</SelectItem>
      <SelectItem value="lowercase">Lowercase</SelectItem>
    </SelectContent>
  </Select>
</div>
\`\`\`

That's it! The `handleStyleChange` function and the export process are generic, so they will automatically handle this new `text-transform` property without any further changes.
