import { useState } from 'react';
import { useDialKit } from 'dialkit';
import SlidingTabs from './SlidingTabs';
import styles from './styles.module.css';

// Tuned with DialKit from the prototyped variants: a quick pill with a light
// bounce and a touch of squash while it is stretched by overshoot. Tune live
// with DialKit in dev; these defaults ship.
export default function SlidingTabsDemo() {
  const [active, setActive] = useState(0);
  const dial = useDialKit(
    'Sliding tabs',
    {
      duration: [0.28, 0.15, 0.8, 0.01],
      bounce: [0.18, 0, 0.5, 0.01],
      squash: [1.5, 0, 8, 0.5],
      squashRange: [100, 20, 400, 5],
    },
    { id: 'sliding-tabs', persist: true },
  );

  return (
    <div className={styles.root}>
      <SlidingTabs
        spring={{ visualDuration: dial.duration, bounce: dial.bounce }}
        squash={dial.squash}
        squashRange={dial.squashRange}
        active={active}
        onChange={setActive}
      />
    </div>
  );
}
