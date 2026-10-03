import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { onPage } from './page-lifecycle';

// The module only needs `document` as an event target; Node's EventTarget
// stands in for it, so no DOM environment is required.
describe('onPage', () => {
  beforeEach(() => {
    vi.stubGlobal('document', new EventTarget());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const fire = (name: string) => document.dispatchEvent(new Event(name));

  it('runs setup once, immediately, for the page the script loaded on', () => {
    const setup = vi.fn();
    onPage(setup);
    expect(setup).toHaveBeenCalledTimes(1);
  });

  it('does not run setup again when astro:page-load fires for that same page', () => {
    // The router fires astro:page-load on the initial window load too, and
    // right after a script first executes during a navigation.
    const setup = vi.fn();
    onPage(setup);
    fire('astro:page-load');
    expect(setup).toHaveBeenCalledTimes(1);
  });

  it('tears down the previous run before setting up the next page', () => {
    const calls: string[] = [];
    let run = 0;
    onPage(() => {
      const n = ++run;
      calls.push(`setup ${n}`);
      return () => calls.push(`cleanup ${n}`);
    });

    fire('astro:after-swap');
    fire('astro:after-swap');

    expect(calls).toEqual(['setup 1', 'cleanup 1', 'setup 2', 'cleanup 2', 'setup 3']);
  });

  it('accepts a setup that returns no cleanup', () => {
    const setup = vi.fn(() => undefined);
    onPage(setup);
    expect(() => fire('astro:after-swap')).not.toThrow();
    expect(setup).toHaveBeenCalledTimes(2);
  });
});
