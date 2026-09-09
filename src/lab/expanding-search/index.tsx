import { useDialKit } from 'dialkit';
import ExpandingSearch, { type EntranceStyle, type HighlightMotion, type HoverStyle, type LoadingStyle } from './ExpandingSearch';
import styles from './styles.module.css';

// Defaults are what ships: 320ms height reveal, skeleton, a highlight that
// jumps between rows, staggered rows. The selects swap in the alternatives
// that were prototyped (spinner, per-row hover, at-once entrance, sliding
// highlight) live in dev; change the defaults here to ship a different one.
export default function ExpandingSearchDemo() {
  const dial = useDialKit(
    'Expanding search',
    {
      expandDuration: [0.32, 0.15, 1, 0.01],
      loadDelay: [900, 0, 3000, 50],
      resultDuration: [0.26, 0.1, 0.8, 0.01],
      stagger: [0.035, 0, 0.15, 0.005],
      highlightMotion: { type: 'select', options: ['instant', 'slide'] },
      highlightDuration: [0.12, 0.05, 0.4, 0.01],
      loading: { type: 'select', options: ['skeleton', 'spinner'] },
      hover: { type: 'select', options: ['shared', 'row'] },
      entrance: { type: 'select', options: ['stagger', 'once'] },
    },
    { id: 'expanding-search', persist: true },
  );

  return (
    <div className={styles.root}>
      <ExpandingSearch
        expandDuration={dial.expandDuration}
        loadDelay={dial.loadDelay}
        resultDuration={dial.resultDuration}
        stagger={dial.stagger}
        highlightMotion={dial.highlightMotion as HighlightMotion}
        highlightDuration={dial.highlightDuration}
        loading={dial.loading as LoadingStyle}
        hover={dial.hover as HoverStyle}
        entrance={dial.entrance as EntranceStyle}
      />
    </div>
  );
}
