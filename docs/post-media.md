# Images and video in posts

Posts embed media with Obsidian syntax: `![[file|Caption|WxH]]`. `src/utils/remark-obsidian-images.ts` turns the embed into an `<img>` or `<video>`, and `rehype-image-figure.ts` wraps captioned media in `<figure>`/`<figcaption>`.

## Images

Put stills in `content/images/`. Astro's asset pipeline optimises them (webp, `srcset`, hashing).

Captions may contain markdown links (`See [this post](https://…) by X`). They render as real anchors in the figcaption, and the `alt` gets the plain text. Links are the only markdown a caption supports: emphasis or code splits the embed and it renders as raw text.

## Video

Astro does not process video, so each clip is served raw from `/images/` (`content/images` is symlinked to `public/images`).

1. **Encode by hand** with the same settings as `scripts/lab-preview.mjs`: scale to 1600px wide (2× the 750px content width), `-crf 22 -preset slow`, `-movflags +faststart`. To verify faststart, run `ffprobe -v trace` and check that `moov` comes before `mdat`.
2. **Add a poster.** Save `<name>-poster.webp` next to the clip; the plugin derives the path. Pick the frame with ffmpeg's `thumbnail` filter, because frame 0 is often a black fade-in, and convert it with `sharp(png).webp({ quality: 80 })`. A video without a poster paints as a blank box until it plays.
3. **Pass `WxH`** (the intrinsic size) as the third segment so the browser reserves the space.

The `<video>` ships as `loop muted playsinline` with `data-autoplay` and no `autoplay` attribute. `writing/[...slug].astro` plays it when it scrolls into view (`IntersectionObserver`, threshold 0.4) and pauses it when it leaves. Under `prefers-reduced-motion` it never plays and stays on its poster. Silent clips need no captions track; the figcaption is the text alternative.
