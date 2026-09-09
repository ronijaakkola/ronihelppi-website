import { lazy, Suspense, useCallback, useEffect, useState, type ComponentType } from 'react';
import { DialRoot } from 'dialkit';
import 'dialkit/styles.css';
import styles from './LabStage.module.css';

// One chunk per demo: the page for `/lab/<slug>` only downloads that demo (and
// whatever it imports, e.g. Motion). The registry never touches these.
const demoLoaders = import.meta.glob<{ default: ComponentType }>('./*/index.tsx');

const demoComponents = new Map<string, ReturnType<typeof lazy>>();

function demoFor(slug: string) {
  let component = demoComponents.get(slug);
  if (!component) {
    const load = demoLoaders[`./${slug}/index.tsx`];
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
  poster: string;
}

// Fills the server-rendered shell in `pages/lab/[slug].astro`, which shows the
// same poster before this island hydrates. The poster here covers the demo until
// it has mounted, then fades out; nothing is on a timer.
export default function LabStage({ slug, poster }: Props) {
  const Demo = demoFor(slug);
  const [ready, setReady] = useState(false);
  const markReady = useCallback(() => setReady(true), []);
  return (
    <div className={styles.stage} data-lab-stage>
      <Suspense fallback={null}>
        <Demo />
        <Mounted onMount={markReady} />
      </Suspense>
      <img className={styles.poster} src={poster} alt="" data-lab-poster data-ready={ready} />
      <DialRoot />
    </div>
  );
}
