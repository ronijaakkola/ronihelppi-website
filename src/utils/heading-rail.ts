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
 */
export function pickActiveHeadingId(
  headings: HeadingPosition[],
  offset: number
): string | null {
  if (headings.length === 0) return null;

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
