---
name: implement-design
description: Implement Figma designs with pixel-perfect fidelity. Fetches design specs from Figma, creates pages or components following project conventions, compares implementation with design using browser automation, and iterates until satisfied. Use when implementing new UI from Figma or matching existing code to designs.
context: fork
agent: general-purpose
allowed-tools:
  - mcp__figma__*
  - mcp__claude-in-chrome__*
  - Read
  - Write
  - Edit
  - Bash(npm *, astro *)
  - Glob
  - Grep
argument-hint: [figma-url-or-frame-name]
disable-model-invocation: false
user-invocable: true
---

# Implement Figma Design

Implement Figma designs with pixel-perfect fidelity in this Astro project. This skill automates the complete design-to-code workflow: fetching design specifications from Figma, implementing them following project conventions, comparing the implementation against the original design using browser automation, and iteratively refining until satisfied.

## Process Overview

This skill follows a 5-phase workflow:

1. **Design Acquisition** - Fetch design and assets from Figma
2. **Analysis & Planning** - Determine structure and ask clarifying questions
3. **Implementation** - Create the page or component following project conventions
4. **Comparison & Verification** - Compare implementation with design using browser automation
5. **Iteration & Refinement** - Fix differences and iterate until pixel-perfect

## Phase 1: Design Acquisition

### Step 1.1: Validate Figma MCP Server

Before fetching design data, verify the Figma MCP server is running:

```bash
curl -s http://127.0.0.1:3845/mcp || echo "ERROR: Figma MCP server not running"
```

**If server is not running:**

```
Error: Cannot connect to Figma MCP server at http://127.0.0.1:3845/mcp

Please start the Figma MCP server:
1. Ensure .env.figma has your FIGMA_ACCESS_TOKEN
2. Start server: npx @figma/mcp-server
3. Verify connection: curl http://127.0.0.1:3845/mcp
4. Re-run /implement-design

Stopping execution.
```

### Step 1.2: Parse Input Arguments

The user provides a Figma URL or frame name in `$ARGUMENTS`. Parse it to extract:

- **Full URL format**: `https://www.figma.com/file/{FILE_ID}/{NAME}?node-id={NODE_ID}`
- **Frame name format**: `"Frame Name"` (requires default file ID from environment)

### Step 1.3: Fetch Design Context

Use the Figma MCP to fetch design specifications:

```
Use mcp__figma__get_design_context with the Figma URL or frame selection.
Request the output in a format suitable for Astro components.
```

The design context will include:
- HTML structure
- Layout information
- Component hierarchy
- Suggested code structure

### Step 1.4: Extract Design Tokens

Use the Figma MCP to extract design variables and styles:

```
Use mcp__figma__get_variable_defs for the selected frame.
Extract colors, spacing values, typography settings.
```

Document all design tokens:
- **Colors**: Background colors, text colors, border colors (hex values)
- **Spacing**: Padding, margins, gaps (px values)
- **Typography**: Font families, font sizes, font weights, line heights, letter spacing

### Step 1.5: Capture Reference Screenshot

Use the Figma MCP to capture a reference screenshot:

```
Use mcp__figma__get_screenshot for the selected frame.
Store this as the reference image for comparison.
```

This screenshot will be used in Phase 4 for visual comparison.

### Step 1.6: Error Handling

Handle common errors gracefully:

**Invalid Figma URL or Access Denied:**
```
Error: Cannot access Figma frame "$ARGUMENTS"

Verify:
1. URL is complete: https://www.figma.com/file/{FILE_ID}/{NAME}?node-id={NODE_ID}
2. Your token has access to this file
3. Frame/component name is spelled correctly
4. If using frame name, ensure FIGMA_FILE_ID is set in environment

Stopping execution.
```

## Phase 2: Analysis & Planning

### Step 2.1: Analyze Design Structure

Review the fetched design and determine:

1. **Complexity**: Is this a simple component or complex page?
2. **Type**: Full-page layout or reusable UI element?
3. **Dependencies**: Does it reference existing components?
4. **Responsive**: Does the design show multiple breakpoints?

### Step 2.2: Determine Page vs Component

**Decision Logic:**

- **Page indicators**: Multiple sections, navigation, full layout, unique route
- **Component indicators**: Reusable element, self-contained, could be used multiple places

If **clearly a page**:
- Target: `src/pages/`
- Will need route name
- Will wrap with BaseLayout

If **clearly a component**:
- Target: `src/components/` (create directory if doesn't exist)
- Will need component name (PascalCase)
- Standalone .astro file

If **ambiguous**, ask the user:

```
This design could be either a full page or a reusable component.

Should I create:
a) A page in src/pages/ (has its own route)
b) A reusable component in src/components/

What would you like?
```

### Step 2.3: Determine File Name and Location

**If creating a page**, ask for route:

```
Where should this page live?

Examples:
a) src/pages/about.astro (URL: /about)
b) src/pages/portfolio/project.astro (URL: /portfolio/project)
c) src/pages/[slug].astro (dynamic route)
d) src/pages/index.astro (replace homepage)

What route should this be?
```

**If creating a component**, ask for name:

```
What should I name this component?

Use PascalCase convention (e.g., 'HeroSection', 'ContactForm', 'FeatureCard')

Component name:
```

### Step 2.4: Plan Design Token Extraction

Review the design tokens from Step 1.4 and decide:

- **Few tokens (< 5 colors, < 5 spacing values)**: Keep scoped to component
- **Many tokens (> 10 total values)**: Ask user about extraction strategy

If many tokens, ask:

```
I found {X} unique colors and {Y} spacing values in this design.

Should I:
a) Extract as CSS custom properties scoped to this component (default)
b) Create a shared design tokens file (src/styles/tokens.css)
c) Add to BaseLayout.astro as global CSS custom properties

How should I handle design tokens?
```

### Step 2.5: Check for Responsive Breakpoints

If the design context shows multiple sizes or the metadata indicates responsive frames:

```
This design appears to have multiple breakpoints (mobile, tablet, desktop).

Should I:
a) Implement mobile-first with media queries
b) Implement desktop version only
c) Ask about specific breakpoint values

How should I handle responsive design?
```

## Phase 3: Implementation

### Step 3.1: Create Directory Structure

If creating a component and `src/components/` doesn't exist:

```bash
mkdir -p src/components
```

If creating a page in a subdirectory that doesn't exist:

```bash
mkdir -p src/pages/{subdirectory}
```

### Step 3.2: Create the File

Create the file at the determined location from Phase 2.

**For Components** (`src/components/{ComponentName}.astro`):

```astro
---
interface Props {
  // Add props based on design requirements
  // Example: title?: string;
  // Example: items?: Array<{ name: string; value: string }>;
}

const { /* destructure props */ } = Astro.props;
---

<div class="component-name">
  <!-- Semantic HTML structure matching the design -->
  <!-- Use appropriate semantic elements: header, nav, section, article, etc. -->
</div>

<style>
  /* Scoped styles using CSS custom properties for design tokens */
  .component-name {
    /* Design tokens as CSS custom properties */
    --color-background: #...;
    --color-text: #...;
    --spacing-unit: 8px;

    /* Component styles implementing pixel-perfect design */
  }
</style>
```

**For Pages** (`src/pages/{route}.astro`):

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
// Import any needed components

// Add any data fetching or logic here
---

<BaseLayout title="Page Title">
  <main>
    <!-- Semantic HTML structure matching the design -->
  </main>
</BaseLayout>

<style>
  /* Scoped page styles */
  main {
    /* Design tokens as CSS custom properties */
    --color-background: #...;
    --color-text: #...;
    --spacing-unit: 8px;

    /* Page styles implementing pixel-perfect design */
  }
</style>
```

### Step 3.3: Implement Semantic HTML Structure

Follow these guidelines:

1. **Use semantic HTML elements**: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`
2. **Match the design hierarchy**: Headings (`<h1>` to `<h6>`), paragraphs (`<p>`), lists (`<ul>`, `<ol>`, `<li>`)
3. **Avoid unnecessary divs**: Only use `<div>` when no semantic element fits
4. **Follow existing patterns**: Review `src/pages/index.astro` for reference

### Step 3.4: Implement Styles with Pixel-Perfect Fidelity

Extract design specifications and implement as scoped CSS:

**Colors** (from design tokens):
```css
.component-name {
  --color-primary: #1a1a2e;
  --color-secondary: #16213e;
  --color-accent: #0f3460;
  --color-text: #eee;
  --color-text-muted: #888;

  background-color: var(--color-primary);
  color: var(--color-text);
}
```

**Spacing** (match Figma exactly):
```css
.component-name {
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  padding: var(--spacing-lg) var(--spacing-md);
  gap: var(--spacing-sm);
}
```

**Typography** (exact font specifications):
```css
.component-name {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: 0;
}

.component-name h1 {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
}
```

**Layout** (flexbox/grid matching design):
```css
.component-name {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: var(--spacing-md);
}
```

**Visual Elements** (borders, shadows, radius):
```css
.component-name {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--color-secondary);
}
```

### Step 3.5: TypeScript Props Interface

If the component accepts props, define a strict TypeScript interface:

```typescript
interface Props {
  title: string;                    // Required prop
  subtitle?: string;                // Optional prop
  items?: Array<{                   // Optional array of objects
    id: string;
    name: string;
    value: number;
  }>;
  variant?: 'primary' | 'secondary'; // Union type for variants
}
```

### Step 3.6: Follow Project Conventions

Based on codebase analysis, follow these patterns:

- **No global styles**: Keep all styles scoped to the component/page
- **No CSS framework**: Don't use Tailwind or other frameworks
- **TypeScript strict mode**: Ensure all types are defined
- **Content collections**: If the page uses content, follow the pattern from `src/pages/posts/[...slug].astro`
- **BaseLayout usage**: All pages should wrap content with BaseLayout

## Phase 4: Comparison & Verification

### Step 4.1: Start Development Server

Start the Astro dev server if not already running:

```bash
npm run dev
```

**Expected output:**
```
  🚀  astro  v5.17.1 started in Xms

  ┃ Local    http://localhost:4321/
  ┃ Network  use --host to expose
```

**If port 4321 is already in use:**
```
Port 4321 is already in use. Using existing dev server.
```

### Step 4.2: Initialize Chrome Browser Automation

Get or create a Chrome tab using the Chrome MCP:

```
Use mcp__claude-in-chrome__tabs_context_mcp with createIfEmpty: true
This returns available tab IDs or creates a new tab if needed
```

Store the tab ID for subsequent operations.

### Step 4.3: Navigate to Implementation

Navigate to the implemented page or component:

**For pages:**
```
Use mcp__claude-in-chrome__navigate with:
- tabId: {stored tab ID}
- url: "http://localhost:4321/{route}"
```

**For components:**
Create a temporary test page to view the component:

```astro
---
import ComponentName from '../components/ComponentName.astro';
---
<!doctype html>
<html>
  <head><title>Component Test</title></head>
  <body>
    <ComponentName />
  </body>
</html>
```

Save as `src/pages/_test-component.astro` and navigate to `http://localhost:4321/_test-component`

### Step 4.4: Take Implementation Screenshot

Capture a screenshot of the live implementation:

```
Use mcp__claude-in-chrome__computer with:
- action: "screenshot"
- tabId: {stored tab ID}
```

This returns a screenshot of the current page state.

### Step 4.5: Compare with Figma Reference

Compare the implementation screenshot (Step 4.4) with the Figma reference screenshot (Phase 1, Step 1.5).

Use Claude's multimodal vision capabilities to analyze both images side-by-side.

### Step 4.6: Generate Detailed Difference Report

Create a structured comparison checklist:

```markdown
## Visual Comparison Report

### Layout Structure
- [ ] Container widths match
- [ ] Flexbox/Grid alignment correct
- [ ] Element positioning accurate
- [ ] Vertical spacing between sections

### Spacing (Critical for Pixel-Perfect)
**Padding:**
- [ ] Top padding: {expected}px vs {actual}px
- [ ] Right padding: {expected}px vs {actual}px
- [ ] Bottom padding: {expected}px vs {actual}px
- [ ] Left padding: {expected}px vs {actual}px

**Margins:**
- [ ] Top margin: {expected}px vs {actual}px
- [ ] Bottom margin: {expected}px vs {actual}px
- [ ] Gap between elements: {expected}px vs {actual}px

### Typography
- [ ] Font family matches
- [ ] Font sizes match ({expected} vs {actual})
- [ ] Font weights match ({expected} vs {actual})
- [ ] Line heights match ({expected} vs {actual})
- [ ] Letter spacing matches
- [ ] Text alignment correct

### Colors
- [ ] Background color: {expected hex} vs {actual hex}
- [ ] Text color: {expected hex} vs {actual hex}
- [ ] Border colors match
- [ ] Accent colors match

### Visual Elements
- [ ] Border radius: {expected}px vs {actual}px
- [ ] Box shadows match
- [ ] Border widths correct
- [ ] Icon sizes and positioning
- [ ] Image aspect ratios

### Identified Differences:
1. {Specific difference with expected vs actual values}
2. {Specific difference with expected vs actual values}
3. ...
```

### Step 4.7: Extract Computed Styles

For precise measurements, use JavaScript to extract computed styles:

```
Use mcp__claude-in-chrome__javascript_tool with:
- tabId: {stored tab ID}
- text: JavaScript code to extract styles
```

**Example JavaScript:**
```javascript
const target = document.querySelector('.component-name');
const styles = window.getComputedStyle(target);
({
  width: styles.width,
  height: styles.height,
  padding: styles.padding,
  paddingTop: styles.paddingTop,
  paddingRight: styles.paddingRight,
  paddingBottom: styles.paddingBottom,
  paddingLeft: styles.paddingLeft,
  margin: styles.margin,
  fontSize: styles.fontSize,
  fontWeight: styles.fontWeight,
  lineHeight: styles.lineHeight,
  color: styles.color,
  backgroundColor: styles.backgroundColor
})
```

Compare these computed values against the Figma specifications.

## Phase 5: Iteration & Refinement

### Step 5.1: Apply Fixes for Each Difference

For each identified difference from Phase 4:

1. **Locate the issue** in the component/page file
2. **Apply the fix** using the Edit tool
3. **Verify the change** by checking the updated code

**Example fix for spacing:**
```
If padding-top is 20px but should be 24px:

Edit the file:
- Old: padding-top: 20px;
- New: padding-top: 24px;
```

**Example fix for color:**
```
If background color is #1a1a1a but should be #1a1a2e:

Edit the file:
- Old: --color-background: #1a1a1a;
- New: --color-background: #1a1a2e;
```

### Step 5.2: Refresh Browser and Verify

After applying fixes:

1. **Refresh the browser** (Astro has hot reload, but ensure changes are visible)
2. **Take new screenshot** using the same method as Phase 4, Step 4.4
3. **Compare again** with the Figma reference

### Step 5.3: Track Iteration Progress

Maintain a log of iterations:

```
Iteration 1: Fixed 5 spacing issues, 2 color mismatches
Iteration 2: Fixed 3 typography issues, 1 layout issue
Iteration 3: Fixed 2 remaining spacing issues
```

**Progress indicators:**
- ✅ **Making progress**: Number of differences decreasing
- ⚠️ **No progress**: Same differences persist for 2 iterations
- 🛑 **Regressing**: New differences introduced

### Step 5.4: Stopping Conditions

Continue iterating until one of these conditions is met:

**✅ Success (Exit with Completion):**
- All checklist items pass
- Visual inspection shows no significant differences
- Spacing within 1-2px tolerance (browsers round differently)
- Colors match exactly (hex values verified)
- Typography matches specified values

**⚠️ Need Help (Exit for User Input):**
- No progress in last 2 iterations (same errors persist)
- Fundamental design ambiguity (e.g., responsive breakpoints unclear)
- Missing design information (e.g., hover states not specified in Figma)
- Technical blockers (e.g., custom fonts need to be added to project)

**🛑 Maximum Iterations (Stop and Summarize):**
- Reached 5 iteration cycles without full resolution
- Summarize current status and remaining issues
- Request user guidance on how to proceed

### Step 5.5: Handle "No Progress" Situations

If stuck after 2 iterations with same issues:

```
I've attempted {N} iterations but can't resolve the following issues:

1. {Specific issue with details}
2. {Specific issue with details}

Would you like me to:
a) Continue trying alternative approaches
b) Document the issues and mark implementation as complete
c) Stop and wait for your input on how to proceed

What should I do?
```

### Step 5.6: Handle Ambiguous Differences

For differences where tolerance is unclear:

```
I notice a potential difference:
- Expected: {value from Figma}
- Actual: {value in implementation}
- Difference: {delta}

This is within typical browser rounding tolerance. Should I:
a) Adjust to match exactly
b) Keep current value (acceptable tolerance)

What would you like?
```

## Project-Specific Conventions

### File Structure

```
src/
├── pages/          # Full pages with routes (existing)
│   ├── index.astro
│   ├── posts/[...slug].astro
│   └── work/[...slug].astro
├── components/     # Reusable components (CREATE if needed)
│   └── {ComponentName}.astro
└── layouts/        # Layout wrappers (existing)
    └── BaseLayout.astro
```

### Astro Component Patterns

**Scoped Styles:**
- Use `<style>` tags within .astro files (Astro's default scoping)
- Styles are automatically scoped to the component
- No global styles (project currently has none)

**TypeScript:**
- Define Props interface in frontmatter section
- Use strict type checking (already configured)
- Destructure props: `const { title } = Astro.props;`

**Semantic HTML:**
- Follow existing pattern from `src/pages/index.astro`
- Use semantic elements, minimal classes
- Currently no CSS framework - keep it that way

**BaseLayout Usage:**
- All pages should wrap content with `<BaseLayout title="...">`
- BaseLayout is minimal (HTML structure, meta tags, title)
- Don't add global styles to BaseLayout unless user explicitly approves

### CSS Custom Properties Convention

Use CSS custom properties for design tokens:

```css
.component {
  /* Define tokens at component root */
  --color-primary: #1a1a2e;
  --spacing-md: 16px;

  /* Use tokens in properties */
  background-color: var(--color-primary);
  padding: var(--spacing-md);
}
```

**Benefits:**
- Easy to update values
- Clear semantic meaning
- Enables theming if needed later

### Responsive Design Pattern

If implementing responsive design:

```css
.component {
  /* Mobile-first base styles */
  padding: 16px;

  /* Tablet breakpoint */
  @media (min-width: 768px) {
    padding: 24px;
  }

  /* Desktop breakpoint */
  @media (min-width: 1024px) {
    padding: 32px;
  }
}
```

## Troubleshooting

### Figma MCP Server Not Running

**Error:**
```
Error: Cannot connect to Figma MCP server at http://127.0.0.1:3845/mcp
```

**Solution:**
1. Ensure `.env.figma` has your `FIGMA_ACCESS_TOKEN`
2. Start server: `npx @figma/mcp-server`
3. Verify connection: `curl http://127.0.0.1:3845/mcp`
4. Re-run `/implement-design`

### Invalid Figma URL or Access Denied

**Error:**
```
Error: Cannot access Figma frame "$ARGUMENTS"
```

**Solution:**
1. Verify URL format: `https://www.figma.com/file/{FILE_ID}/{NAME}?node-id={NODE_ID}`
2. Check your Figma token has access to this file
3. Verify frame/component name is spelled correctly
4. If using frame name, ensure `FIGMA_FILE_ID` is set in environment

### Dev Server Port Already in Use

**Symptom:**
Port 4321 is already in use when trying to start `npm run dev`

**Solution:**
- Note that an existing dev server is running
- Use the existing server instead
- Proceed with browser automation

### Chrome MCP Not Working

**Error:**
```
Error: Cannot control browser via Chrome MCP
```

**Solution:**
1. Verify Chrome browser is installed
2. Check `.mcp.json` has the Chrome MCP configuration
3. Verify Chrome MCP extension is working
4. Re-run the skill

### Styles Not Applying

**Symptom:**
Styles defined in `<style>` tags don't appear in browser

**Solution:**
1. Verify `<style>` tags are within the .astro file
2. Check for syntax errors in CSS
3. Inspect element in browser DevTools to see if styles are loaded
4. Ensure class names match between HTML and CSS

### Layout Breaking on Refresh

**Symptom:**
Layout looks correct initially but breaks after page refresh

**Solution:**
1. Check for JavaScript-dependent layout (avoid if possible)
2. Ensure all styles are in `<style>` tags, not inline
3. Verify no conflicting global styles
4. Test with hard refresh (Cmd+Shift+R / Ctrl+Shift+R)

## Additional Considerations

### Accessibility

Ensure the implementation is accessible:

- **Semantic HTML**: Use appropriate elements (`<button>`, `<nav>`, etc.)
- **ARIA labels**: Add where needed for screen readers
- **Keyboard navigation**: Verify tab order and focus states
- **Color contrast**: Ensure text meets WCAG guidelines (use browser DevTools)

### Performance

Optimize for performance:

- **Images**: If design includes images, use Astro's Image component
- **CSS**: Keep styles scoped to minimize bundle size
- **Lazy loading**: Consider for images below the fold

### Browser Compatibility

- **CSS features**: Use widely supported properties
- **Flexbox/Grid**: Safe to use (good browser support)
- **Custom properties**: Safe to use (good browser support)
- **Test**: Verify in multiple browsers if critical

### Future Enhancements

This implementation can be extended:

- **Design system**: Extract tokens to shared file (`src/styles/tokens.css`)
- **Component library**: Generate multiple components from Figma frames
- **Variants**: Handle component states (hover, active, disabled)
- **Animations**: Implement transitions from Figma prototypes
- **Dark mode**: Support multiple color themes

## Summary

This skill provides a complete workflow for implementing Figma designs with pixel-perfect fidelity:

1. **Fetches** design specifications and assets from Figma
2. **Analyzes** the design and asks clarifying questions
3. **Implements** using Astro conventions and scoped styles
4. **Compares** implementation with design using browser automation
5. **Iterates** until satisfied or stopping conditions are met

The goal is to minimize manual work while ensuring the implementation exactly matches the design intent.
