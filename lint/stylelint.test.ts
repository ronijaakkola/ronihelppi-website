import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import stylelint from 'stylelint';

const configFile = fileURLToPath(new URL('../stylelint.config.js', import.meta.url));

async function rulesHit(code: string, codeFilename = 'src/x.css') {
  const { results } = await stylelint.lint({ code, codeFilename, configFile });
  return results[0].warnings.map((w) => w.rule);
}

const FOCUS = 'site/focus-visible-like-hover';
const STAGGER = 'rule-selector-property-disallowed-list';

describe('focus-visible-like-hover', () => {
  it('flags a hover that changes colour without a focus-visible twin', async () => {
    expect(await rulesHit('.a:hover { color: red; }')).toEqual([FOCUS]);
  });

  it('flags underline and background changes too', async () => {
    expect(await rulesHit('.a:hover { text-decoration-color: red; }')).toEqual([FOCUS]);
    expect(await rulesHit('.a:hover { background: red; }')).toEqual([FOCUS]);
  });

  it('passes when the same rule lists the focus-visible twin', async () => {
    expect(await rulesHit('.a:hover, .a:focus-visible { color: red; }')).toEqual([]);
  });

  it('passes a :focus-within twin for container hovers', async () => {
    expect(await rulesHit('.rail:hover .list, .rail:focus-within .list { background: red; }')).toEqual([]);
  });

  it('keeps commas inside :is() within one selector', async () => {
    const code = ':is(.a, .b):hover::after, :is(.a, .b):focus-visible::after { background-color: red; }';
    expect(await rulesHit(code)).toEqual([]);
  });

  it('flags each hover selector in a list that lacks its twin', async () => {
    expect(await rulesHit('.a:hover, .b:hover, .a:focus-visible { color: red; }')).toEqual([FOCUS]);
  });

  it('ignores hovers that only move, scale or fade', async () => {
    expect(await rulesHit('.a:hover { transform: scale(1.1); opacity: 0.5; }')).toEqual([]);
  });

  it('does not count an outline-only focus-visible rule', async () => {
    const code = '.a:hover { color: red; } .a:focus-visible { outline: 2px solid; }';
    expect(await rulesHit(code)).toEqual([FOCUS]);
  });

  it('passes a hover gated by @media (hover: hover) whose twin sets the same properties outside the gate', async () => {
    const code = `
      .a:focus-visible .t { text-decoration-color: red; }
      @media (hover: hover) { .a:hover .t { text-decoration-color: red; } }`;
    expect(await rulesHit(code)).toEqual([]);
  });

  it('flags a gated hover with no matching focus-visible rule', async () => {
    expect(await rulesHit('@media (hover: hover) { .a:hover { color: red; } }')).toEqual([FOCUS]);
  });

  it('checks <style> blocks in .astro files', async () => {
    const code = '---\n---\n<a class="a">x</a>\n<style>\n  .a:hover { color: red; }\n</style>\n';
    expect(await rulesHit(code, 'src/x.astro')).toEqual([FOCUS]);
  });
});

describe('stagger delays come from an index', () => {
  it('flags animation-delay and transition-delay on :nth-child / :nth-of-type rules', async () => {
    expect(await rulesHit('.item:nth-child(2) { animation-delay: 50ms; }')).toEqual([STAGGER]);
    expect(await rulesHit('li:nth-of-type(3) { transition-delay: 50ms; }')).toEqual([STAGGER]);
  });

  it('passes a delay computed from --i', async () => {
    expect(await rulesHit('.item { animation-delay: calc(var(--i) * 50ms); }')).toEqual([]);
  });

  it('checks <style> blocks in .astro files', async () => {
    const code = '<ul><li>x</li></ul>\n<style>\n  li:nth-child(1) { animation-delay: 0ms; }\n</style>\n';
    expect(await rulesHit(code, 'src/x.astro')).toEqual([STAGGER]);
  });
});
