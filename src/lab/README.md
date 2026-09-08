# Lab

Small React prototypes shown at `/lab`. Each demo is one folder here.

## Adding a demo

1. Create `src/lab/<slug>/` with:
   - `meta.ts` — default-exports the metadata (`title`, `date`, `published`,
     optional `description` (shown under the demo), `tags`, `aspectRatio` like `"16 / 9"`, `requiresPointer`,
     `post`). See `schema.ts`. The folder name is the slug.
   - `index.tsx` — default-exports the demo component. It renders inside
     `LabStage`, a `position: relative; overflow: hidden` box with a reset font
     and colour; position your content absolutely or fill it with a grid.
   - `styles.module.css` — CSS Modules keep each demo's styles to itself.
2. Render the preview. Build and start the preview server
   (`npm run build && npm run preview`), then:
   `npm run lab:record -- <slug> "Balances@0.5,Billing@1.3" --duration 4`
   Steps are `<button text>@<seconds>`; add `~<seconds>` to hold a press
   (`"Press me@0.5~0.3"`). The recorder steps a virtual clock at 60fps and
   screenshots the stage at 2x, so the clip is smooth regardless of machine
   load, then writes `public/lab/<slug>/preview.mp4` and `poster.webp`.
   For demos that need real input (drag, scroll), screen-record instead and run
   `npm run lab:preview -- <slug> recording.mov`.
3. Set `published: true`. Unpublished demos are excluded from every page.

Animations: CSS where possible, `motion/react` otherwise. Each demo is its own
lazy chunk, so Motion is only downloaded by demos that import it.

## Tuning with DialKit

Import `useDialKit` from `dialkit` inside a demo; the panel appears in `astro dev`
only. Production builds alias `dialkit` to `dialkit-stub.ts`, which returns each
control's default, so the defaults in code are what ships. Copy tuned values
back into the config by hand.
