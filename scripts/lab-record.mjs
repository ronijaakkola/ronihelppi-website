#!/usr/bin/env node
// Render a lab demo to a smooth, sharp clip by stepping a virtual clock.
//
//   npm run lab:record -- <slug> "Balances@0.6,Billing@1.5,Payments@2.4" [--dpr 2] [--fps 60] [--duration 6] [--base http://localhost:4321]
//
// Each step is "<button text>@<seconds>": the first button in the stage whose
// text matches is clicked at that time. Append "~<seconds>" to hold the press
// that long instead of clicking (e.g. "Press me@0.6~0.25"), so whileTap-style
// press animations have time to play. Two prefixes cover other input:
// "type:<text>@<s>" fills the stage's search box with <text> and presses Enter,
// "hover:<text>@<s>" moves the pointer onto the first button containing <text>,
// "key:<Key>@<s>" presses a key (Playwright names, e.g. ArrowDown, Enter).
// The page's requestAnimationFrame and performance.now are replaced with a
// manual clock, so Motion advances exactly one frame per screenshot no matter
// how slow the capture is. Pass --timers to also drive setTimeout from that
// clock, for demos that simulate latency with a timer. Frames are stitched with
// ffmpeg and then handed to lab-preview.mjs for the final assets.
//
// Run against a production build (`npm run build && npm run preview`) so the
// DialKit panel isn't in frame.
import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const args = process.argv.slice(2);
const fail = (msg) => {
  console.error(msg);
  process.exit(1);
};
const flag = (name, def) => {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return def;
  const value = args[i + 1];
  if (value === undefined || value.startsWith('--')) fail(`--${name} needs a value`);
  return value;
};
const [slug, stepsArg] = args.filter((a, i) => !a.startsWith('--') && (i === 0 || !args[i - 1].startsWith('--')));
if (!slug) {
  console.error('Usage: npm run lab:record -- <slug> "<Button>@<s>,<Button>@<s>" [--dpr 2] [--fps 60] [--duration 6] [--base url]');
  process.exit(1);
}
const dpr = Number(flag('dpr', 2));
const fps = Number(flag('fps', 60));
const duration = Number(flag('duration', 6));
if ([dpr, fps, duration].some((n) => !Number.isFinite(n) || n <= 0)) fail('--dpr, --fps and --duration must be positive numbers');
const base = flag('base', 'http://localhost:4321');
const virtualTimers = args.includes('--timers');
const steps = (stepsArg ?? '')
  .split(',')
  .filter(Boolean)
  .map((s) => {
    const [text, timing] = s.split('@');
    if (!timing) fail(`Step "${s}" is missing "@<seconds>"`);
    const [at, hold] = timing.split('~');
    const step = { text: text.trim(), at: Number(at), hold: hold ? Number(hold) : 0 };
    if (!Number.isFinite(step.at) || !Number.isFinite(step.hold)) fail(`Step "${s}" has a non-numeric time`);
    return step;
  })
  .sort((a, b) => a.at - b.at);

const framesDir = join(tmpdir(), `lab-record-${slug}-${Date.now()}`);
mkdirSync(framesDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: dpr });

// Virtual clock. Installed before any page script runs so Motion's frameloop
// picks up the mocked requestAnimationFrame at import time.
await page.addInitScript(() => {
  let now = 0;
  const queue = [];
  performance.now = () => now;
  window.requestAnimationFrame = (cb) => {
    queue.push(cb);
    return queue.length;
  };
  window.cancelAnimationFrame = () => {};
  window.__step = (ms) => {
    now += ms;
    const cbs = queue.splice(0);
    for (const cb of cbs) cb(now);
  };
});

await page.goto(`${base}/lab/${slug}`);
const stage = page.locator('[data-lab-stage]');
await stage.waitFor();
// Let the lazy demo chunk and fonts arrive (real time, unaffected by the clock).
// Poll on a timer: Playwright's default rAF polling would never fire here.
await page.waitForFunction(() => document.fonts.status === 'loaded', null, { polling: 100 });
await page.waitForFunction(() => document.querySelector('[data-lab-stage] [data-lab-poster]')?.getAttribute('data-ready') === 'true', null, { polling: 100 });
await page.waitForTimeout(300);
await stage.scrollIntoViewIfNeeded();

// Installed only now, after hydration, so nothing the page needed while
// loading waited on a clock that was not ticking yet.
if (virtualTimers) {
  await page.evaluate(() => {
    const timers = new Map();
    let id = 0;
    window.setTimeout = (cb, ms = 0, ...a) => {
      timers.set(++id, { at: performance.now() + ms, cb, a });
      return id;
    };
    window.clearTimeout = (t) => timers.delete(t);
    const step = window.__step;
    window.__step = (ms) => {
      step(ms);
      const now = performance.now();
      for (const [t, timer] of [...timers]) {
        if (timer.at <= now) {
          timers.delete(t);
          timer.cb(...timer.a);
        }
      }
    };
  });
}

const frameMs = 1000 / fps;
const total = Math.round(duration * fps);
let next = 0;
let releaseAt = null;
for (let i = 0; i < total; i++) {
  const t = i / fps;
  if (releaseAt !== null && releaseAt <= t) {
    await page.mouse.up();
    releaseAt = null;
  }
  while (next < steps.length && steps[next].at <= t) {
    const step = steps[next++];
    if (step.text.startsWith('type:')) {
      const input = stage.getByRole('searchbox').first();
      await input.fill(step.text.slice(5));
      await input.press('Enter');
      continue;
    }
    if (step.text.startsWith('key:')) {
      await page.keyboard.press(step.text.slice(4));
      continue;
    }
    if (step.text.startsWith('hover:')) {
      await stage.locator('button', { hasText: step.text.slice(6) }).first().hover();
      continue;
    }
    const button = stage.locator('button', { hasText: step.text }).first();
    if (step.hold > 0) {
      const b = await button.boundingBox();
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
      await page.mouse.down();
      releaseAt = step.at + step.hold;
    } else {
      await button.click();
    }
  }
  await page.evaluate((ms) => window.__step(ms), frameMs);
  await stage.screenshot({ path: join(framesDir, `frame_${String(i).padStart(5, '0')}.png`) });
  if (i % fps === 0) process.stdout.write(`\r${t.toFixed(0)}s / ${duration}s`);
}
process.stdout.write('\n');
await browser.close();

const raw = join(framesDir, 'raw.mp4');
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', join(framesDir, 'frame_%05d.png'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '12', raw], { stdio: 'inherit' });
execFileSync('node', ['scripts/lab-preview.mjs', slug, raw], { stdio: 'inherit' });
rmSync(framesDir, { recursive: true, force: true });
