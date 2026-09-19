// State of the expanding search, kept as a pure reducer so the sequence
// idle → expanding → loading → results can be tested without React or timers.
// The component owns the side effects (the height animation that fires
// `expanded`, the fake fetch that fires `loaded`) and threads `request`
// through them so a response from an abandoned search is dropped.

export interface SearchResult {
  id: string;
  title: string;
  meta: string;
}

export type SearchStatus = 'idle' | 'expanding' | 'loading' | 'results';

export interface SearchState {
  status: SearchStatus;
  query: string;
  results: SearchResult[];
  /** Increments on every submit; `loaded` must carry the matching id to land. */
  request: number;
}

export type SearchEvent =
  | { type: 'submit'; query: string }
  | { type: 'expanded' }
  | { type: 'loaded'; request: number; results: SearchResult[] }
  | { type: 'reset' };

export const initialState: SearchState = { status: 'idle', query: '', results: [], request: 0 };

export function reduce(state: SearchState, event: SearchEvent): SearchState {
  switch (event.type) {
    case 'submit': {
      const query = event.query.trim();
      if (!query) return state;
      const request = state.request + 1;
      // The card only needs to grow once; from an open card a new search goes
      // straight back to loading inside the existing body.
      const status: SearchStatus = state.status === 'idle' ? 'expanding' : 'loading';
      return { status, query, results: [], request };
    }
    case 'expanded':
      return state.status === 'expanding' ? { ...state, status: 'loading' } : state;
    case 'loaded':
      if (state.status !== 'loading' || event.request !== state.request) return state;
      return { ...state, status: 'results', results: event.results };
    case 'reset':
      return state.status === 'idle' ? state : { ...initialState, request: state.request };
  }
}
