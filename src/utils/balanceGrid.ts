/**
 * Tablet (2-column) bento-grid balancing.
 *
 * On the 601–960px tablet grid the bento layout is two columns and wide cards
 * (`span: 2`) occupy a full row. In author order — never dense — a narrow card
 * can end up alone in a one-slot row: it starts a fresh row in the left column
 * and nothing fills the right column, because either there is no following
 * visible card or the following card is wide (a wide card needs both columns, so
 * it wraps to its own row instead of backfilling the gap).
 *
 * Given the visible cards in author order (`isWide[i]` true = spans 2 columns),
 * this returns, for each card, whether it must be promoted to full width so it
 * fills its row instead of stranding a single-column gap. The result depends
 * only on the visible sequence, so it must be recomputed whenever filtering
 * changes which cards are visible.
 */
export function balanceTabletGrid(isWide: boolean[]): boolean[] {
  const promote = new Array(isWide.length).fill(false);
  // Column cursor across the 2-column grid: 0 = left (fresh row), 1 = right.
  let col = 0;

  for (let i = 0; i < isWide.length; i++) {
    if (isWide[i]) {
      // A wide card always claims a whole row; the next card starts fresh.
      col = 0;
      continue;
    }

    if (col === 0) {
      // Narrow card starting a fresh row — does the next visible card share it?
      const next = i + 1 < isWide.length ? isWide[i + 1] : null;
      if (next === null || next === true) {
        // Nothing pairs into the right column, so this card would be alone.
        // Promote it to fill the row; it now behaves like a full-row card.
        promote[i] = true;
        col = 0;
      } else {
        // The next narrow card pairs into the right column.
        col = 1;
      }
    } else {
      // Narrow card filling the right column completes the row.
      col = 0;
    }
  }

  return promote;
}
