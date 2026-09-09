import { useEffect, useLayoutEffect, useReducer, useRef, useState, type FormEvent, type KeyboardEvent, type RefObject } from 'react';
import { AnimatePresence, motion, useReducedMotion, type Transition } from 'motion/react';
import { initialState, reduce, type SearchResult } from './machine';
import { matchRange, rankResults } from './mockSearch';
import styles from './ExpandingSearch.module.css';

export type LoadingStyle = 'skeleton' | 'spinner';
export type HoverStyle = 'shared' | 'row';
export type EntranceStyle = 'stagger' | 'once';
export type HighlightMotion = 'instant' | 'slide';

export interface ExpandingSearchProps {
  /** Seconds the card takes to grow. */
  expandDuration: number;
  /** Fake network delay in ms before results land. */
  loadDelay: number;
  /** Seconds each result's entrance lasts, and the gap between rows. */
  resultDuration: number;
  stagger: number;
  /** How the shared highlight reaches the hovered row: a jump (brief) or a short tween. */
  highlightMotion: HighlightMotion;
  /** Seconds for the 'slide' variant's travel. */
  highlightDuration: number;
  loading: LoadingStyle;
  hover: HoverStyle;
  entrance: EntranceStyle;
}

// The "sheet" curve for the expansion (fast start, long settle) and a
// steeper ease-out for the rows rising into place.
const SHEET: Transition['ease'] = [0.32, 0.72, 0, 1];
const RISE: Transition['ease'] = [0.19, 1, 0.22, 1];

/**
 * A search input that turns into a results card. The card is pinned by its
 * top edge, so growing its body reveals the results *below* the input while
 * the input itself never moves. See MOTION-BRIEF.md for the decisions (320ms
 * sheet curve, skeleton, instant highlight, 35ms stagger).
 */
export default function ExpandingSearch(props: ExpandingSearchProps) {
  const { expandDuration, loadDelay, resultDuration, stagger, highlightMotion, highlightDuration, loading, hover, entrance } = props;
  const reduced = useReducedMotion() ?? false;
  const [state, dispatch] = useReducer(reduce, initialState);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const open = state.status !== 'idle';

  // Fake fetch. Keyed on the request id so a re-search or reset mid-flight
  // clears the pending timer, and a slow response for an old id is refused by
  // the reducer anyway.
  useEffect(() => {
    if (state.status !== 'loading') return;
    const { request, query } = state;
    const timer = window.setTimeout(() => dispatch({ type: 'loaded', request, results: rankResults(query) }), loadDelay);
    return () => window.clearTimeout(timer);
  }, [state.status, state.request, state.query, loadDelay]);

  // Body height is measured, not guessed: the skeleton and the result list
  // are the same height, so the card grows once and then stays put.
  const innerRef = useRef<HTMLDivElement>(null);
  const [bodyHeight, setBodyHeight] = useState(0);
  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const measure = () => setBodyHeight(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [open]);

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    dispatch({ type: 'submit', query: value });
  };
  // Choosing a result ends the search: back to an empty, focused input.
  const reset = () => {
    dispatch({ type: 'reset' });
    setValue('');
    inputRef.current?.focus();
  };
  // Escape backs out but keeps the term, selected, so it can be typed over.
  const escape = () => {
    dispatch({ type: 'reset' });
    const input = inputRef.current;
    input?.focus();
    input?.select();
  };
  const listRef = useRef<HTMLUListElement>(null);
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      // Browsers clear a type="search" input on Escape; keep the term instead.
      e.preventDefault();
      escape();
    }
    // Down from the input walks into the results, like a combobox.
    if (e.key === 'ArrowDown' && state.status === 'results') {
      e.preventDefault();
      listRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    }
  };

  // Exits are shorter than entries: the user has already decided, so the
  // collapse gets out of the way at three quarters of the growth time.
  const grow: Transition = reduced ? { duration: 0 } : { duration: open ? expandDuration : expandDuration * 0.75, ease: SHEET };
  const fade: Transition = { duration: 0.15, ease: 'linear' };

  return (
    <div className={styles.search}>
      <div className={styles.card} data-search-card data-state={state.status}>
        <form className={styles.bar} role="search" onSubmit={submit}>
          <input
            ref={inputRef}
            className={styles.input}
            type="search"
            placeholder="Search fruit…"
            aria-label="Search"
            autoComplete="off"
            spellCheck={false}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <button type="submit" className={styles.go} aria-label="Search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M17 17L21 21" />
              <path d="M3 11C3 15.4183 6.58172 19 11 19C13.213 19 15.2161 18.1015 16.6644 16.6493C18.1077 15.2022 19 13.2053 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11Z" />
            </svg>
          </button>
        </form>

        <motion.div
          className={styles.body}
          data-search-body
          initial={false}
          animate={{ height: open ? bodyHeight : 0 }}
          transition={grow}
          onAnimationComplete={() => {
            if (state.status === 'expanding') dispatch({ type: 'expanded' });
          }}
        >
          {/* Rendered in every state so its height is known before the card grows. */}
          <div className={styles.bodyInner} ref={innerRef}>
            <AnimatePresence initial={false}>
              {(state.status === 'expanding' || state.status === 'loading') && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: state.status === 'loading' ? 1 : 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.12 } }}
                  transition={fade}
                  aria-hidden={state.status !== 'loading'}
                >
                  {loading === 'skeleton' ? <Skeleton /> : <Spinner />}
                  {state.status === 'loading' && (
                    <span className={styles.visuallyHidden} role="status">
                      Searching for {state.query}
                    </span>
                  )}
                </motion.div>
              )}
              {state.status === 'results' && (
                <Results
                  key={`results-${state.request}`}
                  listRef={listRef}
                  onEscape={escape}
                  onSelect={reset}
                  onLeaveUp={() => inputRef.current?.focus()}
                  results={state.results}
                  query={state.query}
                  hover={hover}
                  entrance={reduced ? 'once' : entrance}
                  reduced={reduced}
                  duration={resultDuration}
                  stagger={stagger}
                  highlightMotion={highlightMotion}
                  highlightDuration={highlightDuration}
                />
              )}
              {state.status === 'idle' && (
                // Placeholder that gives the body its future height while collapsed.
                <div key="ghost" aria-hidden="true" style={{ visibility: 'hidden' }}>
                  <Skeleton />
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <ul className={styles.skeleton} aria-hidden="true" data-search-skeleton>
      {[0, 1, 2, 3].map((i) => (
        <li key={i} className={styles.skeletonRow}>
          <span className={styles.bone} />
          <span className={styles.bone} />
        </li>
      ))}
    </ul>
  );
}

function Spinner() {
  return (
    <div className={styles.spinnerWrap} aria-hidden="true">
      <span className={styles.spinner} />
    </div>
  );
}

interface ResultsProps {
  listRef: RefObject<HTMLUListElement | null>;
  /** Escape on a row: collapse and hand focus back to the input. */
  onEscape: () => void;
  /** A result was chosen (click, or Enter on a focused row): the search is done. */
  onSelect: (result: SearchResult) => void;
  /** ArrowUp on the first row: focus goes back to the input. */
  onLeaveUp: () => void;
  results: SearchResult[];
  query: string;
  hover: HoverStyle;
  entrance: EntranceStyle;
  reduced: boolean;
  duration: number;
  stagger: number;
  highlightMotion: HighlightMotion;
  highlightDuration: number;
}

function Results({ listRef, onEscape, onSelect, onLeaveUp, results, query, hover, entrance, reduced, duration, stagger, highlightMotion, highlightDuration }: ResultsProps) {
  const [active, setActive] = useState<number | null>(null);
  // Roving tabindex: only the last focused row is in the tab order, so Tab
  // leaves the list and the arrow keys move within it.
  const [tabStop, setTabStop] = useState(0);
  const focusRow = (i: number) => {
    const row = listRef.current?.children[i]?.querySelector<HTMLButtonElement>('button');
    row?.focus();
  };
  const onListKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    // Start from the focused row (tabStop), never from where the pointer rests.
    const i = tabStop;
    const last = results.length - 1;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        focusRow(Math.min(i + 1, last));
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (i === 0) onLeaveUp();
        else focusRow(i - 1);
        break;
      case 'Home':
        e.preventDefault();
        focusRow(0);
        break;
      case 'End':
        e.preventDefault();
        focusRow(last);
        break;
      case 'Escape':
        e.preventDefault();
        onEscape();
        break;
    }
  };
  const [rect, setRect] = useState<{ top: number; height: number } | null>(null);

  // Position the shared highlight from the hovered/focused row's box.
  useLayoutEffect(() => {
    if (hover !== 'shared' || active === null) return;
    const row = listRef.current?.children[active] as HTMLElement | undefined;
    if (row) setRect({ top: row.offsetTop, height: row.offsetHeight });
  }, [active, hover]);

  const rowTransition = (i: number): Transition =>
    entrance === 'stagger' ? { duration, ease: RISE, delay: i * stagger } : { duration: reduced ? 0.15 : 0.18, ease: 'linear' };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.1 } }} transition={{ duration: 0.12 }}>
      <span className={styles.visuallyHidden} role="status">
        {results.length} results for {query}
      </span>
      <ul
        className={styles.list}
        ref={listRef}
        data-search-results
        onKeyDown={onListKeyDown}
        onPointerLeave={(e) => {
          // Leaving with the pointer only clears the highlight if no row holds focus.
          if (!e.currentTarget.contains(document.activeElement)) setActive(null);
        }}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setActive(null);
        }}
      >
        {results.map((r, i) => (
          <motion.li
            key={r.id}
            className={styles.row}
            initial={{ opacity: 0, y: entrance === 'stagger' ? 6 : 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={rowTransition(i)}
          >
            {hover === 'row' && (
              <motion.span
                className={styles.rowBackground}
                aria-hidden="true"
                initial={false}
                animate={{ opacity: active === i ? 1 : 0, scale: active === i || reduced ? 1 : 0.96 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
              />
            )}
            <button
              type="button"
              className={styles.rowButton}
              tabIndex={i === tabStop ? 0 : -1}
              onClick={() => onSelect(r)}
              onPointerEnter={() => setActive(i)}
              onFocus={() => {
                setActive(i);
                setTabStop(i);
              }}
            >
              <span className={styles.title}>
                <Highlighted title={r.title} query={query} />
              </span>
              <span className={styles.meta}>{r.meta}</span>
            </button>
          </motion.li>
        ))}
        {hover === 'shared' && rect && (
          <motion.span
            className={styles.highlight}
            data-search-highlight
            aria-hidden="true"
            initial={{ opacity: 0, top: rect.top, height: rect.height }}
            animate={{ opacity: active === null ? 0 : 1, top: rect.top, height: rect.height }}
            // Per the brief the highlight jumps: position changes instantly and
            // only opacity eases, so skimming the list never shows it in transit.
            transition={
              highlightMotion === 'slide' && !reduced
                ? { duration: highlightDuration, ease: [0.25, 1, 0.5, 1], opacity: { duration: 0.1 } }
                : { duration: 0, opacity: { duration: 0.1 } }
            }
            style={{ zIndex: -1 }}
          />
        )}
      </ul>
    </motion.div>
  );
}

// The matched letters are set heavier than the rest of the name, which is all
// the explanation the ranking needs; a row with no hit shows a plain name.
function Highlighted({ title, query }: { title: string; query: string }) {
  const range = matchRange(title, query);
  if (!range) return <>{title}</>;
  const [start, end] = range;
  return (
    <>
      {title.slice(0, start)}
      <span className={styles.hit}>{title.slice(start, end)}</span>
      {title.slice(end)}
    </>
  );
}
