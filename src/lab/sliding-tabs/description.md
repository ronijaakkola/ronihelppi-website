<!-- PLACEHOLDER COPY — rewrite before publishing. Everything below is a stand-in
     so the build and E2E tests have a heading and a code block to check. -->

## How it works

The active tab is a single indicator element that slides between positions rather than
each tab drawing its own background. Measuring the target tab's offset and width once per
change, then animating `transform` and `width`, keeps the motion on the compositor and
avoids re-laying out the row.

```tsx
const target = tabRefs.current[activeIndex];
setIndicator({ x: target.offsetLeft, width: target.offsetWidth });
```

Placeholder copy: this paragraph will be replaced with the actual write-up covering the
easing choice, how the demo handles keyboard navigation, and what changes under
`prefers-reduced-motion`.
