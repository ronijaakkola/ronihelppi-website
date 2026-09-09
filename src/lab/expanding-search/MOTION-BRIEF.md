## Motion brief — Expanding search

Confirmed with Roni in an interview on 2026-09-09. An earlier draft of this
brief was self-answered by the agent; every line below now reflects Roni's
choice. Round-two prototypes in `prototypes/variations.html` vary only the
details this brief leaves open.

**Verdict:** animate
**Trigger:** Enter in the search input, or the search button once the card is open.
**Frequency:** a Lab demo, seen a handful of times per visit. Motion is the point of the piece, so the keyboard-trigger cut rule does not apply. In a product this expansion would be cut.
**Purpose:** spatial consistency. The card grows *out of* the input so results read as belonging to the query, not as a separate panel.

**States**
- `idle`: the input alone, pill shaped.
- `expanding`: the input is now the top edge of a card whose empty body is growing downward.
- `loading`: skeleton of four rows in the body.
- `results`: four mock rows; an instant highlight marks the hovered/focused row.
- `results → loading` on re-search, without collapsing. Escape returns to `idle`.

**Enter (idle → expanding):** body height 0 → measured, anchored on the top edge so the input never moves and results reveal below it. (Revised 2026-09-09 from bottom-anchored/upward: with keyboard navigation the best result must be the row nearest the input, reached with ArrowDown.) Card radius stays constant. The search button is always visible (an outline glyph in the text colour, no fill), so nothing else arrives during the growth. (Revised 2026-09-09: it used to fade/slide in at 40% of the growth.)
**Easing:** `cubic-bezier(0.32, 0.72, 0, 1)` · **Duration:** 320ms. Reference: Raycast / Linear, crisp, no bounce.
**expanding → loading:** fires when the height animation completes. Skeleton fades in over 150ms, no stagger.
**loading → results:** skeleton fades out 120ms; rows fade and rise 6px → 0 over 260ms with a 35ms stagger, `cubic-bezier(0.19, 1, 0.22, 1)`.
**Exit:** mirrors enter; body content fades (100ms) while the height collapses at 75% of the growth time (240ms), since exits should be shorter than entries.
**Origin:** top edge of the card; the input is the fixed point.
**Hover:** one shared highlight element that **jumps** to the hovered row with no travel. Only its opacity animates, ~100ms in and out. Keyboard focus moves it the same way.
**Interrupt:** retarget, never restart. A re-search mid-flight keeps the current height and restarts loading in place; Escape collapses from wherever the card is. Responses carry a request id and stale ones are dropped.
**Reduced motion:** the card still opens but instantly; skeleton and results crossfade ~150ms with no rise and no stagger; highlight behaviour is unchanged (it is already instant).
**Stack:** `motion/react` for the height, layer crossfades and row entrances (the Lab recorder only advances rAF time, so CSS transitions would record wrong). Highlight is positioned directly, no spring.
**Loading style:** skeleton, not spinner. It pre-draws the result shape so results feel filled in. The skeleton row is the result row's exact box (same padding, gap and line heights), so the card is pixel-identical in height while loading and once results land. Result count is fixed at four; more would need the body to scroll.
**Keyboard:** ArrowDown from the input enters the list; ArrowUp/ArrowDown, Home and End move within it with a roving tabindex so Tab leaves the list; ArrowUp on the first row returns to the input; Escape anywhere collapses and refocuses the input. Choosing a result (click, or Enter on a focused row) does the same: the search is over, so the card collapses, the field clears and takes focus again. The highlight follows focus.

**Open risk:** at 320ms the growth may be too quick to register as "growing out of" on a large stage. DialKit exposes the duration; compare against 380ms live before locking it.

**Data (decided 2026-09-09):** fruit with kcal per 100 g, placeholder "Search fruit…". Any query returns four rows so the card height never changes; the matched letters in a name are underlined (a heavier weight and a highlighter mark were tried; dimming the rest of the name made unmatched names look like the hits), and a row without a hit shows a plain name. Places-and-weather was considered and dropped because viewers could not guess what to type.
