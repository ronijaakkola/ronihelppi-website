import { useEffect, useLayoutEffect, useReducer, useRef, useState, type FormEvent, type KeyboardEvent, type RefObject } from 'react';
import { AnimatePresence, motion, useReducedMotion, type Transition } from 'motion/react';
import { initialState, reduce, type SearchResult } from './machine';
import { matchRange, rankResults } from './mockSearch';
import styles from './ExpandingSearch.module.css';

export interface ExpandingSearchProps {
  /** Seconds the card takes to grow. The collapse runs at three quarters of it. */
  expandDuration: number;
  /** Fake network delay in ms before results land. */
  loadDelay: number;
  /** Seconds each result's entrance lasts, and the gap between rows. */
  resultDuration: number;
  stagger: number;
  /** ms the chosen row stays lit before the card collapses. */
  selectHold: number;
}

const HOVER_COLOR = '#2c2c2e';
const SELECTED_COLOR = '#48484c';

const SHEET: Transition['ease'] = [0.32, 0.72, 0, 1];
const RISE: Transition['ease'] = [0.19, 1, 0.22, 1];

/**
 * A search input that turns into a results card. The card is pinned by its
 * top edge, so growing its body reveals the results below the input while the
 * input itself never moves.
 */
export default function ExpandingSearch({ expandDuration, loadDelay, resultDuration, stagger, selectHold }: ExpandingSearchProps) {
  const reduced = useReducedMotion() ?? false;
  const [state, dispatch] = useReducer(reduce, initialState);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const open = state.status !== 'idle';

  useEffect(() => {
    if (state.status !== 'loading') return;
    const { request, query } = state;
    const timer = window.setTimeout(() => dispatch({ type: 'loaded', request, results: rankResults(query) }), loadDelay);
    return () => window.clearTimeout(timer);
  }, [state.status, state.request, state.query, loadDelay]);

  // The skeleton and the result list share one box, so the body is measured
  // once and the card never resizes when results replace the skeleton.
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
  const reset = () => {
    dispatch({ type: 'reset' });
    setValue('');
    inputRef.current?.focus();
  };
  const escape = () => {
    dispatch({ type: 'reset' });
    inputRef.current?.focus();
    inputRef.current?.select();
  };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      // Browsers clear a type="search" input on Escape; keep the term instead.
      e.preventDefault();
      escape();
    }
    if (e.key === 'ArrowDown' && state.status === 'results') {
      e.preventDefault();
      listRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    }
  };

  const grow: Transition = reduced ? { duration: 0 } : { duration: open ? expandDuration : expandDuration * 0.75, ease: SHEET };

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
            {/* viewBox shifted half a unit so the lens, not the bounding box, is centred. */}
            <svg viewBox="0.5 0.5 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
          <div className={styles.bodyInner} ref={innerRef}>
            <AnimatePresence initial={false}>
              {(state.status === 'expanding' || state.status === 'loading') && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: state.status === 'loading' ? 1 : 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.12 } }}
                  transition={{ duration: 0.15, ease: 'linear' }}
                  aria-hidden={state.status !== 'loading'}
                >
                  <Skeleton />
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
                  reduced={reduced}
                  duration={resultDuration}
                  stagger={stagger}
                  selectHold={selectHold}
                />
              )}
              {state.status === 'idle' && (
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

interface ResultsProps {
  listRef: RefObject<HTMLUListElement | null>;
  onEscape: () => void;
  onSelect: (result: SearchResult) => void;
  /** ArrowUp on the first row hands focus back to the input. */
  onLeaveUp: () => void;
  results: SearchResult[];
  query: string;
  reduced: boolean;
  duration: number;
  stagger: number;
  selectHold: number;
}

function Results({ listRef, onEscape, onSelect, onLeaveUp, results, query, reduced, duration, stagger, selectHold }: ResultsProps) {
  const [active, setActive] = useState<number | null>(null);
  // Only the last focused row is in the tab order, so Tab leaves the list.
  const [tabStop, setTabStop] = useState(0);
  // The chosen row stays lit for `selectHold` before the card collapses.
  const [selected, setSelected] = useState<number | null>(null);
  const holdTimer = useRef<number | undefined>(undefined);
  const lit = selected ?? active;

  const choose = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    setActive(i);
    holdTimer.current = window.setTimeout(() => onSelect(results[i]), selectHold);
  };
  useEffect(() => () => window.clearTimeout(holdTimer.current), []);

  const focusRow = (i: number) => listRef.current?.children[i]?.querySelector<HTMLButtonElement>('button')?.focus();
  const onListKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    const last = results.length - 1;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        focusRow(Math.min(tabStop + 1, last));
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (tabStop === 0) onLeaveUp();
        else focusRow(tabStop - 1);
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
  useLayoutEffect(() => {
    if (lit === null) return;
    const row = listRef.current?.children[lit] as HTMLElement | undefined;
    if (row) setRect({ top: row.offsetTop, height: row.offsetHeight });
  }, [lit]);

  const rowTransition = (i: number): Transition =>
    reduced ? { duration: 0.15, ease: 'linear' } : { duration, ease: RISE, delay: i * stagger };

  return (
    <motion.div exit={{ opacity: 0, transition: { duration: 0.1 } }}>
      <span className={styles.visuallyHidden} role="status">
        {results.length} results for {query}
      </span>
      <ul
        className={styles.list}
        ref={listRef}
        data-search-results
        onKeyDown={onListKeyDown}
        onPointerLeave={(e) => {
          if (selected === null && !e.currentTarget.contains(document.activeElement)) setActive(null);
        }}
        onBlur={(e) => {
          if (selected === null && !e.currentTarget.contains(e.relatedTarget as Node | null)) setActive(null);
        }}
      >
        {results.map((r, i) => (
          <motion.li
            key={r.id}
            className={styles.row}
            initial={{ opacity: 0, y: reduced ? 0 : 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={rowTransition(i)}
          >
            <button
              type="button"
              className={styles.rowButton}
              tabIndex={i === tabStop ? 0 : -1}
              onClick={() => choose(i)}
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
        {rect && (
          <motion.span
            className={styles.highlight}
            data-search-highlight
            data-selected={selected !== null}
            aria-hidden="true"
            initial={{ opacity: 0, top: rect.top, height: rect.height, backgroundColor: HOVER_COLOR }}
            animate={{
              opacity: lit === null ? 0 : 1,
              top: rect.top,
              height: rect.height,
              backgroundColor: selected === null ? HOVER_COLOR : SELECTED_COLOR,
            }}
            // The highlight jumps; only its opacity eases.
            transition={{ duration: 0, opacity: { duration: 0.1 } }}
            style={{ zIndex: -1 }}
          />
        )}
      </ul>
    </motion.div>
  );
}

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
