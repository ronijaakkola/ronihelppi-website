import { describe, it, expect } from 'vitest';
import { resolveDefaults, useDialKit, DialRoot } from './dialkit-stub';

describe('dialkit production stub', () => {
  it('returns the first array element for ranged sliders', () => {
    expect(resolveDefaults({ radius: [24, 0, 64] })).toEqual({ radius: 24 });
  });

  it('passes numbers, booleans and hex strings through', () => {
    expect(resolveDefaults({ n: 3, b: true, c: '#ff0000' })).toEqual({ n: 3, b: true, c: '#ff0000' });
  });

  it('keeps spring configs intact', () => {
    const spring = { type: 'spring' as const, stiffness: 300, damping: 20 };
    expect(resolveDefaults({ spring })).toEqual({ spring });
  });

  it('resolves select and color controls to their default', () => {
    expect(
      resolveDefaults({
        mode: { type: 'select', options: ['a', 'b'] },
        mode2: { type: 'select', options: [{ value: 'x', label: 'X' }], default: 'x' },
        tint: { type: 'color', default: '#abc' },
      }),
    ).toEqual({ mode: 'a', mode2: 'x', tint: '#abc' });
  });

  it('recurses into nested folders', () => {
    expect(resolveDefaults({ folder: { size: [10, 0, 20], on: false } })).toEqual({
      folder: { size: 10, on: false },
    });
  });

  it('useDialKit ignores name and options', () => {
    expect(useDialKit('panel', { x: [1, 0, 2] }, { persist: true, id: 'p' })).toEqual({ x: 1 });
  });

  it('DialRoot renders nothing', () => {
    expect(DialRoot({})).toBeNull();
  });
});
