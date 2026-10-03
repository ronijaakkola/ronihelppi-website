# Coding standards

Review rules for this repo. A reviewer checks the diff against every rule and flags each violation by the rule's heading. Each rule exists because an agent once got it wrong; the **Why** line names the incident.

Only judgement calls belong here. A mistake a tool can catch deterministically (a fixed pattern, a missing file, a banned API) gets a test, lint rule or hook instead. Tooling and environment gotchas go to `TESTING.md` or the README beside the code.

**Adding a rule:** the heading states the behaviour the reviewer should see in the diff. One to three lines say what to check, then **Why** gives the incident (with a PR number when there is one). File it under the matching area. If a rule already covers the mistake, sharpen that rule instead of adding a near-duplicate. Delete a rule once a check enforces it or the code it names is gone.

## Interaction and accessibility

### `:focus-visible` gets the same feedback as `:hover`
Every `:hover` rule that changes colour, underline or background lists `:focus-visible` beside it. Outline and radius stay in their own focus-visible rule.
**Why:** keyboard users got no feedback on links that changed on hover.

### Focusable items in a flex column hug their content
A link or button in a flex column gets `width: fit-content`, so its focus outline wraps the text, not the column.
**Why:** focus rings stretched across the whole container.

### Hover motion is gated to hover-capable pointers
Hover effects that move, scale or would stick after a tap sit inside `@media (hover: hover)` (Lab demos use `(hover: hover) and (pointer: fine)`). Tap targets in Lab demos reach a 44px hit area.
**Why:** sliding tabs shipped ungated hover and 34px tabs (#117 review).

### Lists you pick from work with the arrow keys
A result list or option set supports Up/Down, Home/End and Escape behind one tab stop. Keyboard position comes from the focused item, never from hover state. A `type="search"` input that must keep its value calls `preventDefault` on Escape, because Chrome clears it natively.
**Why:** expanding search shipped Tab-only, then started arrow navigation from the hovered row (#125).

### Matches are shown by emphasis
Mark the matched text (an underline, a weight change) and leave the rest at full contrast.
**Why:** dimming the unmatched letters made non-matching results look like the hits (#125).

### Pull quotes are hidden from screen readers
A pull quote repeats body text, so it is raw `<aside class="pull-quote" aria-hidden="true">` HTML at a section boundary, far from its source sentence. `>` blockquotes are for quoting other sources.
**Why:** a blockquote pull quote is read aloud twice.

## CSS and layout

### A pattern fix covers every occurrence
When a diff fixes a CSS pattern (clipping, borders, stagger delays), `src/` is searched for the same pattern and every copy is fixed in the same change.
**Why:** `overflow: hidden` clipping focus outlines was fixed on some pages and the user found it on three more; #109 and #110 fixed article borders and left the cards broken.

### Media cards draw their border with `.card-frame`
An element that clips media (`overflow: hidden` + `border-radius` over an image or video) has no `border` of its own. It takes the `card-frame` class, whose `::after` paints the hairline above the media.
**Why:** on WebKit at DPR 3 a 0.5px border on the clipping box thinned at the corners and doubled on fractional edges (#123).

### Staggered items take their delay from an index
Each item carries its position (`style="--i: 3"`) and the delay is computed from it, so items added later join the cascade.
**Why:** hard-coded `:nth-child(1..5)` delays silently dropped Contact from the mobile menu once Lab was added (#119).

### Skeletons match the content box
A loading placeholder reuses the real row's padding, gap and line height, so the container keeps its height when content arrives.
**Why:** the expanding-search card changed height when results replaced the skeleton (#125).

### One layer animates each entrance
Either a container or its children animate in, not both.
**Why:** the results wrapper and its rows both faded in, which muddied the stagger (#125).

### View-transition clip paths use percentages
`clip-path` shapes on view-transition snapshots give positions and radii in `%`.
**Why:** a px `circle()` covered only half the screen on 2x displays, so the theme wipe stalled mid-way; it was misdiagnosed twice as easing (#116).

### Visibility of primary content has a non-`:has()` path
Content that must become visible (a demo under its poster) is revealed by a state the script sets directly, with `:has()` as an enhancement at most.
**Why:** a `:has()`-only poster fade would leave the demo covered forever where `:has()` is unsupported (#133 review).

## Astro

### Page scripts run once per page
Per-page client logic goes through `onPage` from `src/utils/page-lifecycle.ts`, with no guards or `astro:page-load`/`astro:after-swap` listeners of its own. A setup that binds to `document`/`window`, observers or timers returns a cleanup. Session-wide wiring (document-level delegation) is bound once at the top of the script. `is:inline` scripts that must run before first paint (the BaseLayout theme script, `CascadeAnimation`) cannot import it and keep their window flags.
**Why:** the old `init(); addEventListener('astro:page-load', init)` recipe bound "Copy post" twice; Header listened to both `after-swap` and `page-load` and ran its work twice (#132).

### `transition:persist` sits on an element or a `client:*` island
On an Astro component tag it compiles to a prop the component ignores. Check for `data-astro-transition-persist` in the built HTML.
**Why:** `<Header transition:persist />` never persisted anything, and three comments described a header that did (#132).

### `client:only` islands sit in a server-rendered shell
The shell has the final size (`aspect-ratio`) and a static stand-in such as the poster; the island fills it with `position: absolute; inset: 0`. The stand-in hides from mount state, not a timer. A list preview that morphs into it shares its `transition:name`.
**Why:** the Lab stage popped in after hydration with three separate snaps and a layout shift (#121).

### Component modules export only components
A `.tsx` file that exports a React component exports nothing else; helpers live in a sibling `.ts`.
**Why:** exporting `hasDemo` from `LabStage.tsx` turned Fast Refresh into full reloads (#134 review).

## Lab demos

### Recorded demos animate on the frame loop
A demo previewed with `lab:record` animates with `motion/react`. CSS transitions and `setTimeout` run on the wall clock and record wrong; fake latency uses `--timers`.
**Why:** CSS transitions finished in two frames of the expanding-search clip (#125).

### Shell decoration stays out of the capture
Any new decoration on `[data-lab-shell]` is also switched off under `[data-lab-capture]` in the shell's own stylesheet in `src/pages/lab/[slug].astro`. The recorder only sets the attribute and knows nothing about the shell's internals.
**Why:** the shell's `::after` hairline got baked into every preview clip, so each Lab card drew two borders (#126).

### Demos ship only the chosen variant
Once a variant or tuned value is final, the alternative code paths, their DialKit controls and decision-history comments are removed in the same change. Comments that remain explain what would break.
**Why:** with `lag: false` tuned in, the dead two-spring path stayed until the user asked twice; expanding search needed the same cleanup (#125).

### Demos keep their full motion
A Lab demo has no reduced-motion variant of its own: a visitor who opens a demo has chosen to see it. The list previews already sit on their poster under `prefers-reduced-motion`.
**Why:** the user's stated policy when the Lab was built (#117).

## Tests

### Tests import the code under test
A test never re-declares the schema or function it checks.
**Why:** `config.test.ts` tested a hand-copied schema that had drifted from `content.config.ts` (#130).

### Every assertion can fail
For each new assertion, ask whether it would still pass with the bug present; red-check it by breaking the implementation once.
**Why:** the read-time "strips HTML" test passed whether or not tags were counted (#130).

### Assertions hold regardless of how much content exists
No `if (count > 1)` guards around assertions, and no assertions on authored prose. Cover the missing case with a fixture.
**Why:** Lab prev/next nav has been untested since its check was wrapped in `demoCount > 1` (#117); `description.md` tests broke when the user rewrote their note (#122).

### Generic Lab checks wait on the stage's readiness signal
Mount detection in shared Lab specs and `lab:record` waits on `STAGE_READY` from `src/lab/stage-contract.mjs`, never on which elements a demo renders.
**Why:** "a `button` is visible" timed out on the input-only expanding-search demo (#125).

### Short accessible names use `exact: true`
`getByRole` with a short name inside a container that renders content text passes `exact: true`.
**Why:** `{ name: 'Search' }` also matched a result row and failed strict mode (#125).

### Fast timing is sampled inside the page
Behaviour that lasts under ~200ms, or a sequenced swap, is measured with `page.evaluate` sampling every animation frame (opacity, computed style), not with repeated locator reads or element counts.
**Why:** Playwright round trips swallowed a 120ms hold (#125); `AnimatePresence mode="wait"` swaps children in one commit, so an element-count check never saw the gap.

### Built HTML is parsed, not regex-matched
Tests over `dist/` HTML select elements with a DOM parser.
**Why:** regexes broke on attribute order and ran into an inline script (#121, #122).

## Change hygiene

### Consumers change with the contract
When a diff changes a data attribute, selector or DOM contract, its consumers in `scripts/` and `tests/` change in the same diff.
**Why:** #121 kept the poster in the DOM, and `lab:record` hung for 30s on its stale readiness check.

### Comments and docs follow changed values
When a constant or convention changes, every comment and doc that states the old value changes too.
**Why:** CRF went from 24 to 22 while the script header still said 24, and a prev/next comment described the opposite order (#117 review).

### Prose describes code as it is
Comments, write-ups, placeholders and PR bodies make technical claims only about code that was read, and label guesses as guesses.
**Why:** a Lab description placeholder invented an implementation and a code sample (#122); a PR body stated a guessed minifier cause as fact (#130).

### Working files stay out of the diff
Motion briefs, prototype variants, scratch scripts and throwaway pages live in the scratchpad or a `prototype/<slug>` branch.
**Why:** the expanding-search motion brief and prototype page were committed to the feature branch (#125).
