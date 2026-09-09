## Motion brief — Expanding search

Every decision below was made by the implementing agent as the recommended
default and is marked **assumed**; the user was not available to answer live.
Swap any of them by editing the DialKit defaults in `index.tsx` or the
variant flags in `ExpandingSearch.tsx`.

**Verdict:** animate
**Trigger:** Enter in the search input (or the search button once the card is open).
**Frequency (assumed):** a Lab demo — seen a handful of times per visit, never 100+/day. Motion is the point of the piece, so the keyboard-trigger cut rule does not apply here. Were this a product search, the expansion would be cut and only the result entrance kept.
**Purpose:** spatial consistency. The card grows *out of* the input so the results are read as belonging to the query, not as a separate panel that appeared.

**States**
- A `idle`: 1 input, pill shaped, nothing else.
- B `expanding`: the same input, now the bottom edge of a card; the card body above it is empty.
- C `loading`: card body shows a skeleton of 4 rows.
- D `results`: skeleton is replaced by 4 mock results; a hover highlight follows the pointer.
- `results → expanding` on re-search re-uses C→D without collapsing.
- Escape / clearing the input returns to A (mirror of enter, shorter).

**Enter (A→B, assumed):** card `height` from the input's own height to its final height, anchored on the **bottom** edge so the input does not move and the body reveals upward. Implemented with a grid-row `0fr → 1fr` track (interruptible, no measuring) rather than `clip-path`, because the card also gains padding and a border radius change (pill → 20px). The search button fades/slides in alongside the input (`opacity 0→1`, `translateX(8px→0)`), starting at 40% of the expansion.
**B→C:** skeleton rows fade in at once (`opacity 0→1`, 150ms). No stagger: loading should feel instant and quiet.
**C→D (assumed):** skeleton fades out (120ms) and results rise in with a **stagger of 35ms**, each `opacity 0→1`, `translateY(6px→0)`, 260ms. Stagger is short so 4 rows finish inside ~400ms.
**Exit (assumed):** mirrors enter at 70% of the duration; body content fades before the track collapses.
**Origin:** bottom-anchored; the input is the fixed point of the whole composition.
**Easing:** expansion `cubic-bezier(0.32, 0.72, 0, 1)` (the "sheet" curve — strong start, long settle so the rising edge reads as controlled) · **Duration:** 420ms. Results `cubic-bezier(0.19, 1, 0.22, 1)` · 260ms. Hover highlight: spring, `visualDuration 0.22, bounce 0`.
**Interrupt:** CSS transitions and Motion springs only, never keyframes, so a re-search or Escape mid-flight retargets from the current position. The mock fetch is cancelled by id so a stale response cannot land in a newer query's card.
**Hover (assumed):** one **shared highlight** element behind the list, springing between rows (matches the site's sliding-tabs demo vocabulary). It fades in on first hover and out on leave, gated behind `(hover: hover) and (pointer: fine)`. Keyboard focus moves the same highlight.
**Reduced motion:** the track still changes size but with `transition: none` (instant); skeleton and results use a 150ms opacity crossfade only, no translate, no stagger; the shared highlight jumps without spring. Nothing is removed that carries meaning.
**Stack:** CSS transitions for the expansion and entrances (CSS Modules, `data-state` attribute); `motion/react` only for the shared hover highlight's spring.
**Loading style (assumed):** skeleton over spinner. It pre-announces the shape of the results so C→D is a fill-in, not a swap, and it reads better on the dark stage.

**Open risk:** `grid-template-rows: 0fr → 1fr` transitions are smooth in Chromium/Firefox/Safari 16+, but the bottom-anchoring depends on the card being laid out from its bottom edge (the stage centres the input and the card grows above it). Check on a 375px stage that the fully open card fits the 4:3 box and does not clip at the top. Second risk: 420ms may read slow once the user has seen it twice; DialKit exposes it so it can be trimmed to ~320ms live.
