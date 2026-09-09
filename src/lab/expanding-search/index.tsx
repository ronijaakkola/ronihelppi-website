import { useDialKit } from 'dialkit';
import ExpandingSearch, { type EntranceStyle, type HoverStyle, type LoadingStyle } from './ExpandingSearch';
import styles from './styles.module.css';

// Defaults are the shipped variation (A in prototypes/variations.html): height
// reveal, skeleton, shared sliding highlight, staggered rows. The selects swap
// in the other prototyped options live in dev; change the defaults here to ship
// a different one.
export default function ExpandingSearchDemo() {
  const dial = useDialKit(
    'Expanding search',
    {
      expandDuration: [0.42, 0.15, 1, 0.01],
      loadDelay: [900, 0, 3000, 50],
      resultDuration: [0.26, 0.1, 0.8, 0.01],
      stagger: [0.035, 0, 0.15, 0.005],
      highlight: { visualDuration: [0.22, 0.1, 0.6, 0.01], bounce: [0, 0, 0.5, 0.01] },
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
        highlight={dial.highlight}
        loading={dial.loading as LoadingStyle}
        hover={dial.hover as HoverStyle}
        entrance={dial.entrance as EntranceStyle}
      />
    </div>
  );
}
