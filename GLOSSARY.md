# Glossary

The repo's domain terms as code, docs and PRs use them. Use these words for names, commit messages and PR bodies.

## Content

| Term | Meaning | Where |
|------|---------|-------|
| post | A writing entry. Collection `posts`, served under `/writing/<slug>`; the UI says "writing", the code says "post". | `content/posts`, `src/pages/writing/` |
| project | A work entry. Collection `projects`, with `order` and a grid `span`. | `content/projects`, `src/pages/projects/` |
| vault | `content/`, an Obsidian vault holding posts, projects and images. | `content/` |
| embed | Obsidian media syntax `![[file\|Caption\|WxH]]` in markdown. | `src/utils/remark-obsidian-images.ts`, `docs/post-media.md` |
| `.md` mirror | A post's or project's plain-markdown twin at a `.md` URL; "Copy post" copies the same text. | `src/utils/markdown-endpoint.ts`, `src/pages/writing/[slug].md.ts` |
| pull quote | A repeated sentence set apart in a post: `<aside class="pull-quote" aria-hidden="true">`. | `src/styles/global.css`, `CODING_STANDARDS.md` |
| heading rail | The left-edge section navigator on a post, driven by scroll position. | `src/components/HeadingRail.astro`, `src/utils/heading-rail.ts` |
| lightbox | The fullscreen image viewer for images in posts and projects. | `src/components/Lightbox.astro` |

## Lab

| Term | Meaning | Where |
|------|---------|-------|
| Lab | The `/lab` section of interaction prototypes. | `src/lab/`, `src/pages/lab/` |
| demo | One Lab prototype, a folder `src/lab/<slug>/`; the folder name is its slug. Unpublished demos appear on no page. | `src/lab/README.md` |
| stage | The box a demo renders into (`[data-lab-stage]`), filled client-side by `LabStage`. | `src/lab/LabStage.tsx` |
| shell | The server-rendered box around the stage (`[data-lab-shell]`): size, clipping, hairline, poster. | `src/pages/lab/[slug].astro` |
| readiness (`STAGE_READY`) | The stage's `data-ready="true"` once the demo has mounted. Tests and the recorder wait on it; `SHELL_READY` is the shell's copy. | `src/lab/stage-contract.mjs` |
| poster | The still image (`poster.webp`) that covers the stage until it is ready and stands in for the preview under reduced motion. | `public/lab/<slug>/`, `src/lab/preview-assets.mjs` |
| preview | A demo's short looping clip (`preview.mp4`) on the Lab list. | `public/lab/<slug>/`, `src/lab/preview-assets.mjs` |
| `lab:record` | The npm script that renders a preview from a demo on a virtual clock; `lab:preview` encodes a screen recording instead. | `scripts/lab-record.mjs`, `scripts/lab-preview.mjs` |
| capture mode | `[data-lab-capture]` on the shell: drops its corners and hairline so the recorder screenshots a bare rectangle. | `src/lab/stage-contract.mjs`, `src/pages/lab/[slug].astro` |
| DialKit | The dev-only panel for tuning a demo's values; production builds alias it to a stub that returns the defaults. | `src/lab/dialkit-stub.ts`, `astro.config.mjs` |
| description write-up | A demo's optional long-form `description.md`, rendered under the stage. Distinct from `meta.description`, the one-line blurb. | `src/lab/<slug>/description.md` |

## Site behaviour

| Term | Meaning | Where |
|------|---------|-------|
| card frame | `.card-frame`: clips media and draws its hairline on an `::after` overlay, never as a `border`. | `src/styles/global.css` |
| cascade | The staggered entrance of a group: the home, projects and Lab lists on first page load (not after client-side navigation), the mobile menu on open. Each item carries its index (`--i`, or `--cascade-delay` on page lists) that sets its delay. | `src/components/CascadeAnimation.astro`, `src/components/Header.astro`, `CODING_STANDARDS.md` |
| page script / `onPage` | A client script wrapped in `onPage(setup)`: runs once per page under View Transitions, with the previous page's cleanup called first. | `src/utils/page-lifecycle.ts` |
| theme wipe | The circular reveal that grows from the toggle button when switching light and dark. | `src/layouts/BaseLayout.astro`, `src/components/Header.astro` |
