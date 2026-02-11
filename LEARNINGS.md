# Learnings

This file contains learnings from development sessions to help future agents avoid similar mistakes.

---

## Search all files when fixing CSS pattern issues

When fixing a CSS pattern issue (like `overflow: hidden` clipping focus outlines), I initially only fixed the files I identified in my initial exploration. The user had to point out that posts page, about page, and contact page also had the same issue.

**Steps to avoid this:**
1. When identifying a CSS pattern problem, immediately do a project-wide search: `grep -r "pattern" src/`
2. Create a checklist of ALL affected files before making any changes
3. Fix all occurrences in one pass rather than iteratively

---

## Focus borders need width: fit-content in flex containers

Links inside flex column containers stretch to full width by default, causing focus borders to span the entire container width instead of hugging the content.

**Steps to avoid this:**
1. When adding focus styles to links/buttons, check if they're inside a flex container
2. Add `width: fit-content` to prevent stretching
3. Test by tabbing through the page and visually verifying focus borders hug content

---

## Focus-visible should match hover styling

When a component has `:hover` styling (color changes, underlines, background changes), the same visual feedback should apply on `:focus-visible` for keyboard users.

**Steps to avoid this:**
1. When writing hover styles, always add the same rules to focus-visible:
   ```css
   .element:hover,
   .element:focus-visible {
     /* visual feedback styles */
   }
   ```
2. Keep the outline/border-radius for focus-visible separate from the visual feedback styles

---

## Lighthouse CI can be flaky for performance metrics

The Lighthouse CI assertion for 100% performance score failed on PR checks (93%) while passing on push checks. This is due to variance in CI environment performance.

**Resolution:**
- Performance threshold lowered to 0.90 (accommodates CI variance while catching real regressions)
- `numberOfRuns` increased to 3 (median of 3 runs smooths outliers)
- Accessibility, best-practices, and SEO remain at 1.0 (deterministic, no CI variance)
- Do NOT use `lighthouse:recommended` preset — it adds strict per-audit assertions (network-dependency-tree-insight, uses-responsive-images, etc.) that are harder to satisfy than category scores and increase flakiness

---

## Always register Astro View Transitions listeners for client-side scripts

This project uses Astro View Transitions (`<ViewTransitions />`). Scripts that run on page load will only execute once — subsequent client-side navigations swap the DOM without re-running `<script>` tags. Multiple components in the codebase already follow this pattern (BackLink, Header, Lightbox).

**Steps to avoid this:**
1. When adding any client-side `<script>` in an Astro component, wrap logic in a named function
2. Call the function immediately for the initial load
3. Also register it on `astro:page-load` for View Transitions navigations:
   ```js
   function init() { /* ... */ }
   init();
   document.addEventListener('astro:page-load', init);
   ```
4. If the function manipulates DOM elements, reset state at the start (e.g. remove classes, move elements back) since the DOM may be in a stale state from the previous page
