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

---

## `gh pr merge --match-head-commit` requires full SHA

When using `gh pr merge` with `--match-head-commit`, passing a short SHA (e.g. `29960dc`) fails with a GraphQL error: `Could not coerce value "29960dc" to GitObjectID`.

**Steps to avoid this:**
1. Always use `git rev-parse HEAD` to get the full 40-character SHA
2. Pass the full SHA to `--match-head-commit`, never a short one from `git log --oneline`

---

## Rebuild AND restart the preview server before re-running Playwright

Playwright's config uses `reuseExistingServer: !CI`, so a `npm run preview` server left running from an earlier E2E run will be reused — even after you `npm run build` fresh output. The server serves stale `dist/` HTML, so new pages/markup appear missing at runtime (e.g. a just-added `<video>` showed `videoCount: 0` in the DOM while the static HTML clearly contained it).

**Steps to avoid this:**
1. After changing anything that affects built output, rebuild: `npm run build`
2. Kill any leftover preview server before re-running tests: `lsof -ti :4321 | xargs kill`
3. Then run `npx playwright test` so it starts a fresh server on the current `dist/`
4. Symptom to watch for: static `dist/*.html` contains your element, but the live DOM in the test does not — suspect a stale reused server, not your code.

---

## Videos ride the same `![[file]]` embed pipeline as images

Inline videos use the Obsidian embed syntax `![[clip.mp4|Caption|WxH]]`. `remark-obsidian-images` detects video extensions and emits a `<video controls loop muted playsinline poster=… data-autoplay>` (served from the public `/images/` path, NOT the `../images/` asset path — Astro's image optimizer only handles stills), and `rehype-image-figure` wraps captioned videos in the same `<figure>`/`<figcaption>` as images. Put the video file in `content/images/` — it is symlinked to `public/images`, so it is served statically at `/images/<name>`.

**Notes:**
- Pass the intrinsic `WxH` (third pipe segment) so the browser reserves space and avoids layout shift before metadata loads.
- **Play on scroll-into-view, not on load:** the `<video>` ships WITHOUT the `autoplay` attribute (marked `data-autoplay`). `writing/[...slug].astro` uses an `IntersectionObserver` (threshold 0.4) to `.play()` when the clip enters the viewport and `.pause()` when it leaves. This keeps it from decoding off-screen AND means the reader meets it at the start of the loop instead of mid-animation. Under `prefers-reduced-motion` it is never played — it sits on its poster, reachable via the native controls. (Starting playback in JS also sidesteps the race where the browser autoplays before a "pause it" script can run.)
- **Every video needs a `<name>-poster.webp` still** next to it (the plugin auto-derives the `poster` path). Without a poster, a not-yet-playing video (`preload="metadata"`, autoplay blocked, or reduced motion) paints as a blank/black box — this was a real "I only see the caption" bug.
- A silent (no audio track) video needs no captions for axe/WCAG 1.2.2; the figcaption serves as the 1.2.1 text alternative. The Lightbox only targets `img`, so videos are left alone.

---

## Optimize videos by hand — Astro does not process them

Astro's asset pipeline (webp, responsive `srcset`, content hashing) only touches images. Video files are served raw from `public/`. Optimize deliberately with `ffmpeg` before committing:
- **Downscale to display size.** `--content-width` is only `750px` (≈1500px @2× retina), so a 2560-wide capture is ~1.7× oversized. `scale=1600:-2` + `-crf 24 -preset slow` took the sample clip from 597KB → 202KB with no visible loss.
- **`-movflags +faststart`** moves the `moov` atom to the front so playback can start before the whole file downloads. Verify with `ffprobe -v trace … | grep "type:'moov'\|type:'mdat'"` — `moov` must come first.
- **Poster:** `ffmpeg -vf "thumbnail=…"` auto-picks a representative frame (frame 0 is often a black fade-in — useless). Convert PNG→webp with `sharp` (already a dep; the engine Astro uses): `sharp(png).webp({quality:80})`.

---

## Changing a remark/rehype plugin needs a clean build — the content layer caches rendered markdown

Astro's content layer caches rendered collection entries in `.astro` / `node_modules/.astro`. After editing `remark-obsidian-images.ts` (or any markdown plugin), `npm run build` re-emitted the OLD HTML (still had the `autoplay` attribute, no `data-autoplay`). Force a clean rebuild when a markdown-processing plugin changes: `rm -rf .astro dist node_modules/.astro && npm run build`. Unit tests on the plugin run the processor directly (no cache), so they turn green while the built page lags — trust the built HTML, not just the unit test, when verifying plugin changes.

---

## Markdown links inside `![[…]]` captions are supported — via embed reassembly

A caption like `![[photo.jpg|See [this post](https://…) by X]]` works, but only because `remark-obsidian-images` explicitly reassembles the embed: remark parses the `[text](url)` into a link node BEFORE plugins run, splitting the `![[…]]` across sibling nodes, so a naive text-node regex never sees a complete embed (symptom: the raw `![[…` syntax renders as literal text and no image appears). The plugin serializes trailing siblings back to source until the `]]` closer is found. Downstream: the raw caption rides on `title`, `rehype-image-figure` renders `[text](url)` as real anchors in the figcaption (rehype-external-links then adds `target`/`rel`), and the image `alt` gets the link-stripped plain text. Only plain text and links are reassembled — an embed caption containing other markdown (emphasis, code) will still break apart and render raw.

---

## Pull quotes are `<aside class="pull-quote" aria-hidden="true">` raw HTML, not blockquotes

A print-style pull quote repeats a sentence that stays in the body text, so it must be `aria-hidden` (otherwise screen readers read it twice) — and markdown `>` cannot carry attributes, so it is authored as a raw HTML `<aside>` block in the post (Astro passes HTML in markdown through). `>` blockquotes remain reserved for actual quotations from other sources. Styling lives in `global.css` under `.prose-content .pull-quote`. Place pull quotes at section boundaries, far from the source sentence, and not adjacent to other bolded emphasis.
