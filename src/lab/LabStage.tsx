import { lazy, Suspense, type ComponentType } from 'react';
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

interface Props {
  slug: string;
  aspectRatio: string;
  poster: string;
}

export default function LabStage({ slug, aspectRatio, poster }: Props) {
  const Demo = demoFor(slug);
  return (
    <div className={styles.stage} style={{ aspectRatio }} data-lab-stage>
      <Suspense fallback={<img className={styles.poster} src={poster} alt="" />}>
        <Demo />
      </Suspense>
      <DialRoot />
    </div>
  );
}
