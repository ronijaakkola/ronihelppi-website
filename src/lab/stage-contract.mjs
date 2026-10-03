// What the Lab stage publishes to the outside: tests and scripts/lab-record.mjs
// read these instead of guessing from what a demo happens to render. LabStage.tsx
// and pages/lab/[slug].astro write the attributes (JSX and scoped CSS cannot
// import them, so the names appear there literally). Plain .mjs so the recorder
// can import it without a TypeScript loader.

/** The box a demo renders into. */
export const STAGE = '[data-lab-stage]';

/** Matches once the demo has committed to the DOM; the poster fades from here. */
export const STAGE_READY = '[data-lab-stage][data-ready="true"]';

/** The server-rendered shell around the stage: size, clipping, hairline, poster. */
export const SHELL = '[data-lab-shell]';

/** Set on the shell to drop its rounded corners and hairline, so a screenshot of the stage is a bare rectangle. */
export const CAPTURE_ATTRIBUTE = 'data-lab-capture';
