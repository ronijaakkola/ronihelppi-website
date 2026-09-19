import { describe, it, expect } from 'vitest';
import { initialState, reduce, type SearchState } from './machine';

const submit = (s: SearchState, query = 'tabs') => reduce(s, { type: 'submit', query });

describe('expanding search machine', () => {
  it('starts idle with no query and no results', () => {
    expect(initialState).toEqual({ status: 'idle', query: '', results: [], request: 0 });
  });

  it('ignores a blank submit while idle', () => {
    expect(submit(initialState, '   ')).toBe(initialState);
  });

  it('idle → expanding on submit, trimming the query and bumping the request id', () => {
    const s = submit(initialState, '  tabs ');
    expect(s).toMatchObject({ status: 'expanding', query: 'tabs', request: 1 });
  });

  it('expanding → loading once the card has expanded', () => {
    const s = reduce(submit(initialState), { type: 'expanded' });
    expect(s.status).toBe('loading');
  });

  it('loading → results only for the current request', () => {
    const loading = reduce(submit(initialState), { type: 'expanded' });
    const stale = reduce(loading, { type: 'loaded', request: 99, results: [{ id: 'x', title: 'X', meta: '' }] });
    expect(stale).toBe(loading);
    const fresh = reduce(loading, { type: 'loaded', request: loading.request, results: [{ id: 'x', title: 'X', meta: '' }] });
    expect(fresh.status).toBe('results');
    expect(fresh.results).toHaveLength(1);
  });

  it('re-submitting from results skips expanding and goes straight to loading', () => {
    let s = reduce(submit(initialState), { type: 'expanded' });
    s = reduce(s, { type: 'loaded', request: s.request, results: [{ id: 'x', title: 'X', meta: '' }] });
    const again = submit(s, 'herdr');
    expect(again).toMatchObject({ status: 'loading', query: 'herdr', request: 2, results: [] });
  });

  it('re-submitting while loading restarts with a new request id so the old response is dropped', () => {
    const first = reduce(submit(initialState), { type: 'expanded' });
    const second = submit(first, 'other');
    expect(second.request).toBe(first.request + 1);
    expect(reduce(second, { type: 'loaded', request: first.request, results: [] })).toBe(second);
  });

  it('"expanded" is ignored outside the expanding state', () => {
    expect(reduce(initialState, { type: 'expanded' })).toBe(initialState);
  });

  it('reset returns to idle from any state but keeps the request counter', () => {
    const s = reduce(submit(initialState), { type: 'expanded' });
    const reset = reduce(s, { type: 'reset' });
    expect(reset).toMatchObject({ status: 'idle', query: '', results: [], request: 1 });
    // A late response for the old request cannot re-open the card.
    expect(reduce(reset, { type: 'loaded', request: 1, results: [] })).toBe(reset);
  });
});
