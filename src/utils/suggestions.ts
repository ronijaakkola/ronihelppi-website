/**
 * Suggests related content entries ("Read next" / "More projects") by scoring
 * candidates against the current entry. Kept intentionally simple and
 * authoring-light: it reuses the tags and manual `relatedPosts` references that
 * already live in frontmatter, and falls back to recency so a reader is always
 * offered something to click when other entries exist.
 */

/** Minimal shape a content entry needs to be scored. */
export interface SuggestionEntry {
  id: string;
  data: {
    date: Date;
    tags?: string[];
    relatedPosts?: string[];
  };
}

/** A manual reference is the strongest possible signal. */
const MANUAL_REFERENCE_WEIGHT = 100;
/** Each shared tag nudges an entry up the list. */
const SHARED_TAG_WEIGHT = 10;

/**
 * Normalizes a tag for comparison: strips a leading `#`, trims, and lowercases.
 * Tags in this project are authored like `#games`, so raw string comparison
 * would miss casing/prefix differences.
 */
export function normalizeTag(tag: string): string {
  return tag.trim().replace(/^#/, '').trim().toLowerCase();
}

function sharedTagCount(a: string[] = [], b: string[] = []): number {
  const setB = new Set(b.map(normalizeTag));
  let count = 0;
  for (const tag of new Set(a.map(normalizeTag))) {
    if (setB.has(tag)) count++;
  }
  return count;
}

/**
 * Scores a single candidate against the current entry. Higher is more relevant.
 * Exposed for testing; callers should use {@link getSuggestions}.
 */
export function scoreSuggestion(current: SuggestionEntry, candidate: SuggestionEntry): number {
  let score = 0;

  if (current.data.relatedPosts?.includes(candidate.id)) {
    score += MANUAL_REFERENCE_WEIGHT;
  }

  score += SHARED_TAG_WEIGHT * sharedTagCount(current.data.tags, candidate.data.tags);

  return score;
}

/**
 * Returns up to `limit` suggested entries for `current`, most relevant first.
 *
 * Ranking: score descending (manual references, then shared tags), with newer
 * entries winning ties. The current entry is always excluded. Entries with no
 * shared signal are still eligible as a recency fallback so the section can
 * reach its target count when enough content exists — the caller decides how
 * many to show and hides the section entirely when the result is empty.
 */
export function getSuggestions<T extends SuggestionEntry>(
  current: T,
  candidates: T[],
  limit = 2
): T[] {
  return candidates
    .filter((candidate) => candidate.id !== current.id)
    .map((candidate) => ({ candidate, score: scoreSuggestion(current, candidate) }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      // Tie-break on recency (newest first), then id for deterministic output.
      const dateDiff = b.candidate.data.date.getTime() - a.candidate.data.date.getTime();
      if (dateDiff !== 0) return dateDiff;
      return a.candidate.id.localeCompare(b.candidate.id);
    })
    .slice(0, Math.max(0, limit))
    .map((entry) => entry.candidate);
}
