import { lazy, Suspense, useCallback, useEffect, useRef, useState, type ComponentType } from 'react';
import { DialRoot } from 'dialkit';
import 'dialkit/styles.css';
import styles from './LabStage.module.css';
import { SHELL } from './stage-contract.mjs';

// One chunk per demo: the page for `/lab/<slug>` only downloads that demo (and
// whatever it imports, e.g. Motion). The registry never touches these.
const demoLoaders = import.meta.glob<{ default: ComponentType }>('./*/index.tsx');

const loaderFor = (slug: string) => demoLoaders[`./${slug}/index.tsx`];

/** Whether `slug` has a component to load; `completeness.test.ts` checks every meta against this. */
export function hasDemo(slug: string): boolean {
  return loaderFor(slug) !== undefined;
}

const demoComponents = new Map<string, ReturnType<typeof lazy>>();

function demoFor(slug: string) {
  let component = demoComponents.get(slug);
  if (!component) {
    const load = loaderFor(slug);
    if (!load) throw new Error(`No lab demo found for slug "${slug}"`);
    component = lazy(load);
    demoComponents.set(slug, component);
  }
  return component;
}

// Rendered next to the lazy demo inside the same Suspense boundary, so its
// effect only runs once the demo has actually committed to the DOM.
function Mounted({ onMount }: { onMount: () => void }) {
  useEffect(() => {
    onMount();
  }, [onMount]);
  return null;
}

interface Props {
  slug: string;
}

// Fills the server-rendered shell in `pages/lab/[slug].astro`. The stage marks
// itself and its shell `data-ready="true"` once the demo has committed (see
// stage-contract.mjs); the shell fades its poster from its own attribute, so the
// reveal does not need `:has()`. Tests and the recorder wait on the stage's.
// Nothing is on a timer.
export default function LabStage({ slug }: Props) {
  const Demo = demoFor(slug);
  const stage = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const markReady = useCallback(() => {
    setReady(true);
    stage.current?.closest(SHELL)?.setAttribute('data-ready', 'true');
  }, []);
  return (
    <div ref={stage} className={styles.stage} data-lab-stage data-ready={ready}>
      <Suspense fallback={null}>
        <Demo />
        <Mounted onMount={markReady} />
      </Suspense>
      <DialRoot />
    </div>
  );
}
