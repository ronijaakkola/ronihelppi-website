# Lab

Small React prototypes shown at `/lab`. Each demo is one folder here.

## Adding a demo

1. Create `src/lab/<slug>/` with:
   - `meta.ts` — default-exports the metadata (`title`, `date`, `published`,
     optional `description` (shown under the demo), `tags`, `aspectRatio` like `"16 / 9"`, `requiresPointer`,
     `post`). See `schema.ts`. The folder name is the slug.
   - `index.tsx` — default-exports the demo component. It renders inside
     `LabStage`, a `position: absolute; inset: 0` box (clipped by its shell) with a reset font
     and colour; position your content absolutely or fill it with a grid.
   - `styles.module.css` — CSS Modules keep each demo's styles to itself.
   - `description.md` (optional) — a long-form write-up rendered under the
     stage, after the short `description` and the "Read the post" link. See
     "Writing a description" below.
2. Render the preview. Build and start the preview server
   (`npm run build && npm run preview`), then:
   `npm run lab:record -- <slug> "Balances@0.5,Billing@1.3" --duration 4`
   Steps are `<button text>@<seconds>`; add `~<seconds>` to hold a press
   (`"Press me@0.5~0.3"`), `type:<text>@<s>` to fill the stage's search box
   and press Enter, `hover:<text>@<s>` to hover a button. Demos that fake
   latency with `setTimeout` need `--timers` so the timer runs on the virtual
   clock too. The recorder steps a virtual clock at 60fps and
   screenshots the stage at 2x, so the clip is smooth regardless of machine
   load, then writes `public/lab/<slug>/preview.mp4` and `poster.webp`.
   For demos that need real input (drag, scroll), screen-record instead and run
   `npm run lab:preview -- <slug> recording.mov`.
3. Set `published: true`. Unpublished demos are excluded from every page.

Animations: CSS where possible, `motion/react` otherwise. Each demo is its own
lazy chunk, so Motion is only downloaded by demos that import it.

## Writing a description

`meta.description` stays a one-liner: it is the list-page blurb and the SEO
meta description. For anything longer, add `src/lab/<slug>/description.md`.
When the file exists the page renders it beneath the stage inside the same
`.prose-content` styles the writing posts use; when it is absent nothing changes.

The file goes through the same markdown pipeline as `content/posts`, so
headings (with anchor links), paragraphs, fenced code blocks with a language
tag, external links (opening in a new tab) and `![[file|Caption|WxH]]` embeds all
behave as in a post. Write body copy only, no frontmatter and no top-level `# title`
(the page already has one). A couple of plain paragraphs is fine; if you do add
sections, start them at `##`.

Caveats:
- Image embeds resolve relative to the markdown file, so a `![[still.jpg]]`
  must live in `src/lab/images/` (not `content/images/`). Videos are served
  from `/images/`, so `.mp4` embeds still go in `content/images/` with a poster.
- `[toc]` works but is usually overkill here; the heading rail from posts is not
  rendered on demo pages.
- The "Copy post" button, read time and `.md` mirror are post-only features.

## Tuning with DialKit

Import `useDialKit` from `dialkit` inside a demo; the panel appears in `astro dev`
only. Production builds alias `dialkit` to `dialkit-stub.ts`, which returns each
control's default, so the defaults in code are what ships. Copy tuned values
back into the config by hand.
