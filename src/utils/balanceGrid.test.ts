import { describe, it, expect } from 'vitest';
import { balanceTabletGrid } from './balanceGrid';

const W = true; // wide (span 2)
const N = false; // narrow (span 1)

describe('balanceTabletGrid', () => {
  it('returns an empty result for no cards', () => {
    expect(balanceTabletGrid([])).toEqual([]);
  });

  it('never promotes a lone wide card', () => {
    expect(balanceTabletGrid([W])).toEqual([false]);
  });

  it('promotes a single narrow card that has no row partner', () => {
    expect(balanceTabletGrid([N])).toEqual([true]);
  });

  it('pairs two adjacent narrow cards without promoting either', () => {
    expect(balanceTabletGrid([N, N])).toEqual([false, false]);
  });

  it('promotes a trailing narrow card left alone after a wide card', () => {
    expect(balanceTabletGrid([W, N])).toEqual([false, true]);
  });

  it('promotes an interior narrow card sandwiched between two wide cards (the live all-projects order)', () => {
    // vuoro (wide), clear-skies (narrow), resokill (wide)
    expect(balanceTabletGrid([W, N, W])).toEqual([false, true, false]);
  });

  it('promotes a leading narrow card followed by a wide card (the live games-filter order)', () => {
    // clear-skies (narrow), resokill (wide)
    expect(balanceTabletGrid([N, W])).toEqual([true, false]);
  });

  it('promotes only the stranded narrow in a narrow-narrow-narrow run', () => {
    // first two pair into a row; the third is alone
    expect(balanceTabletGrid([N, N, N])).toEqual([false, false, true]);
  });

  it('promotes both narrows in a narrow-wide-narrow run', () => {
    expect(balanceTabletGrid([N, W, N])).toEqual([true, false, true]);
  });

  it('leaves every card unpromoted when narrows always pair up', () => {
    expect(balanceTabletGrid([N, N, W, N, N])).toEqual([false, false, false, false, false]);
  });

  it('promotes the mid narrow when a pair is split by a wide card', () => {
    // N,N pair (row1); W (row2); N alone before W; W
    expect(balanceTabletGrid([N, N, W, N, W])).toEqual([false, false, false, true, false]);
  });
});
