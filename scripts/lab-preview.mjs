#!/usr/bin/env node
// Turn a screen recording of a lab demo into the preview assets the Lab pages
// expect: public/lab/<slug>/preview.mp4 and poster.webp.
//
//   npm run lab:preview -- <slug> <recording.(mov|mp4|webm)>
//
// Encoding follows LEARNINGS.md: downscale to 1600px (2x the 750px content
// width), crf 22 / preset slow, faststart so playback begins before the whole
// file arrives. The poster is a representative frame chosen by ffmpeg's
// thumbnail filter (frame 0 is often a fade-in), converted to webp with sharp.
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const [slug, input] = process.argv.slice(2);
if (!slug || !input) {
  console.error('Usage: npm run lab:preview -- <slug> <recording>');
  process.exit(1);
}
if (!existsSync(input)) {
  console.error(`Recording not found: ${input}`);
  process.exit(1);
}
if (!existsSync(join('src', 'lab', slug, 'meta.ts'))) {
  console.error(`No demo at src/lab/${slug}/ — create the demo folder first.`);
  process.exit(1);
}

const outDir = join('public', 'lab', slug);
mkdirSync(outDir, { recursive: true });
const video = join(outDir, 'preview.mp4');
const posterPng = join(outDir, 'poster.png');
const poster = join(outDir, 'poster.webp');

execFileSync('ffmpeg', [
  '-y', '-i', input,
  '-an',
  '-vf', 'scale=min(1600\\,iw):-2',
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '22', '-preset', 'slow',
  '-movflags', '+faststart',
  video,
], { stdio: 'inherit' });

execFileSync('ffmpeg', [
  '-y', '-i', video,
  '-vf', 'thumbnail=120', '-frames:v', '1', '-update', '1',
  posterPng,
], { stdio: 'inherit' });

await sharp(posterPng).webp({ quality: 80 }).toFile(poster);
rmSync(posterPng);

console.log(`\nWrote ${video} and ${poster}`);
