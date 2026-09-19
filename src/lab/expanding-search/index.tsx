import { useDialKit } from 'dialkit';
import ExpandingSearch from './ExpandingSearch';
import styles from './styles.module.css';

// Tune live with DialKit in dev; these defaults ship.
export default function ExpandingSearchDemo() {
  const dial = useDialKit(
    'Expanding search',
    {
      expandDuration: [0.32, 0.15, 1, 0.01],
      loadDelay: [900, 0, 3000, 50],
      resultDuration: [0.26, 0.1, 0.8, 0.01],
      stagger: [0.035, 0, 0.15, 0.005],
      selectHold: [120, 0, 400, 10],
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
        selectHold={dial.selectHold}
      />
    </div>
  );
}
