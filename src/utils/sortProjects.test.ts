import { describe, it, expect } from 'vitest';
import { sortProjects } from './sortProjects';

describe('sortProjects', () => {
  it('sorts explicitly ordered projects before date-only projects', () => {
    const projects = [
      { id: 'newest', data: { date: new Date('2025-12-01') } },
      { id: 'featured', data: { date: new Date('2025-10-01'), order: 1 } },
      { id: 'older', data: { date: new Date('2025-08-01') } },
    ];

    const sorted = sortProjects(projects);

    expect(sorted.map((project) => project.id)).toEqual(['featured', 'newest', 'older']);
  });

  it('sorts explicitly ordered projects by ascending order value', () => {
    const projects = [
      { id: 'second', data: { date: new Date('2025-11-01'), order: 2 } },
      { id: 'first', data: { date: new Date('2025-10-01'), order: 1 } },
      { id: 'third', data: { date: new Date('2025-09-01'), order: 3 } },
    ];

    const sorted = sortProjects(projects);

    expect(sorted.map((project) => project.id)).toEqual(['first', 'second', 'third']);
  });

  it('falls back to descending date order when projects share the same order value', () => {
    const projects = [
      { id: 'newer', data: { date: new Date('2025-12-01'), order: 1 } },
      { id: 'older', data: { date: new Date('2025-10-01'), order: 1 } },
    ];

    const sorted = sortProjects(projects);

    expect(sorted.map((project) => project.id)).toEqual(['newer', 'older']);
  });

  it('falls back to descending date order when no explicit order is set', () => {
    const projects = [
      { id: 'older', data: { date: new Date('2025-09-01') } },
      { id: 'newer', data: { date: new Date('2025-12-01') } },
    ];

    const sorted = sortProjects(projects);

    expect(sorted.map((project) => project.id)).toEqual(['newer', 'older']);
  });

  it('does not mutate the original array', () => {
    const projects = [
      { id: 'first', data: { date: new Date('2025-10-01'), order: 1 } },
      { id: 'second', data: { date: new Date('2025-12-01') } },
    ];

    const original = [...projects];

    sortProjects(projects);

    expect(projects).toEqual(original);
  });
});