import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { animate, motion, useMotionTemplate, useMotionValue, useTransform, type SpringOptions } from 'motion/react';
import styles from './SlidingTabs.module.css';

export const TABS = ['Photos', 'Albums', 'People', 'Places'];

interface Props {
  spring: SpringOptions;
  /**
   * Squash: how many px the pill thins (per edge) while stretched. 0 disables
   * it. Derived from the clip edges, not a third spring, so it stays in
   * lockstep with the motion. `squashRange` is the extra width, in px, at
   * which the thinning is ~76% of `squash`; it eases toward the cap after that.
   */
  squash?: number;
  squashRange?: number;
  active: number;
  onChange: (index: number) => void;
}

/**
 * Four tabs with an active pill. The pill is a clipped duplicate of the tab
 * list: two motion values hold the clip's left edge and right inset, and each
 * tab change springs them to the target tab, so the pill both moves and
 * resizes, and the label colour inverts exactly where the pill covers it.
 */
export default function SlidingTabs({ spring, squash = 0, squashRange = 120, active, onChange }: Props) {
  const listRef = useRef<HTMLUListElement>(null);
  const [rects, setRects] = useState<{ left: number; right: number }[]>([]);

  const left = useMotionValue(0);
  const rightInset = useMotionValue(0);
  const [listWidth, setListWidth] = useState(0);
  // Width the pill would have at rest: the wider of the tab it left and the
  // tab it is heading to, so a move to a narrower tab doesn't count as
  // "stretched" before the pill has moved.
  const restWidth = useRef(0);
  const vertical = useTransform([left, rightInset], ([l, r]: number[]) => {
    if (!squash) return 0;
    const extra = Math.max(0, listWidth - l - r - restWidth.current);
    // tanh: proportional for small stretches, easing into the cap instead of
    // slamming into it, so the thinning reads as tension rather than a step.
    return Math.tanh(extra / squashRange) * squash;
  });
  const clipPath = useMotionTemplate`inset(${vertical}px ${rightInset}px ${vertical}px ${left}px round 999px)`;

  const previous = useRef(active);
  const measured = useRef(false);
  const inFlight = useRef<ReturnType<typeof animate>[]>([]);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const width = list.offsetWidth;
      setListWidth(width);
      const items = Array.from(list.querySelectorAll<HTMLButtonElement>('button'));
      setRects(items.map((el) => ({ left: el.offsetLeft, right: width - (el.offsetLeft + el.offsetWidth) })));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const target = rects[active];
    if (!target) return;
    const from = rects[previous.current] ?? target;
    const widthOf = (r: { left: number; right: number }) => listWidth - r.left - r.right;
    restWidth.current = Math.max(widthOf(from), widthOf(target));

    if (!measured.current) {
      // First layout: place the pill without motion.
      left.set(target.left);
      rightInset.set(target.right);
      measured.current = true;
      previous.current = active;
      return;
    }

    previous.current = active;
    // `animate` retargets an in-flight spring from its current position and
    // velocity, so a click mid-move reverses with momentum instead of jumping.
    inFlight.current = [
      animate(left, target.left, { type: 'spring', ...spring }),
      animate(rightInset, target.right, { type: 'spring', ...spring }),
    ];
  }, [active, rects, spring, left, rightInset, listWidth]);

  // Stop any spring still ticking when the component unmounts mid-move.
  useEffect(() => () => inFlight.current.forEach((c) => c.stop()), []);

  return (
    <div className={styles.tabs}>
      <ul className={styles.list} ref={listRef}>
        {TABS.map((tab, i) => (
          <li key={tab}>
            <button
              type="button"
              className={styles.tab}
              aria-pressed={i === active}
              onClick={() => onChange(i)}
            >
              {tab}
            </button>
          </li>
        ))}
      </ul>
      <motion.div className={styles.overlay} style={{ clipPath }} aria-hidden="true">
        <ul className={styles.list}>
          {TABS.map((tab) => (
            <li key={tab}>
              <button type="button" className={styles.tab} tabIndex={-1}>
                {tab}
              </button>
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
