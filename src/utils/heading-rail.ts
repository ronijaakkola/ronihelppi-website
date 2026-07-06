/**
 * Pure scroll-spy logic for the left-edge heading navigator rail.
 *
 * Extracted from the client script so the "which section am I reading" decision
 * can be unit tested without a DOM. The rail's inline script feeds this the live
 * `getBoundingClientRect().top` of every tracked heading on each scroll frame.
 */

export interface HeadingPosition {
  /** The heading element's fragment id (matches its anchor `href="#id"`). */
  id: string;
  /** Viewport-relative top, i.e. `getBoundingClientRect().top`. */
  top: number;
}

/**
 * Given headings in document order and an activation offset (a horizontal line
 * `offset` pixels below the viewport top), return the id of the section the
 * reader is currently within: the last heading whose top has scrolled at or
 * above that line.
 *
 * Before the first heading crosses the line the first heading is returned, so
 * the rail always has a highlighted section while the article is on screen.
 * Returns `null` only when there are no headings.
 *
 * `atBottom` handles the classic scroll-spy edge case: when the final section is
 * too short to scroll its heading up to the activation line, that heading would
 * never activate on its own. Once the reader reaches the bottom of the page it
 * is the section they are looking at, so pass `atBottom` to force it active.
 */
export function pickActiveHeadingId(
  headings: HeadingPosition[],
  offset: number,
  atBottom = false
): string | null {
  if (headings.length === 0) return null;
  if (atBottom) return headings[headings.length - 1].id;

  let activeId = headings[0].id;
  for (const heading of headings) {
    if (heading.top - offset <= 0) {
      activeId = heading.id;
    } else {
      break;
    }
  }
  return activeId;
}
