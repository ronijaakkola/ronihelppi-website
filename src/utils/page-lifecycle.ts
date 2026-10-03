/**
 * Run a page behaviour exactly once per page under Astro View Transitions.
 *
 * `setup` runs immediately for the page the script loaded on, then again after
 * every client-side navigation, with the previous run's cleanup called first.
 *
 * Why `astro:after-swap` and not `astro:page-load`: a bundled script executes
 * once per session, and the router fires `astro:page-load` both on the initial
 * window load and right after a script first executes during a navigation. So
 * "call it now and on page-load" ran setup twice for the first page. after-swap
 * fires only for navigations, after the new DOM is in place and scroll is
 * restored, and before the view transition captures the new page, so
 * client-only state (active nav link, breadcrumb, filters) is in the new frame.
 */
export function onPage(setup: () => void | (() => void)): void {
  let cleanup = setup();
  document.addEventListener('astro:after-swap', () => {
    cleanup?.();
    cleanup = setup();
  });
}
