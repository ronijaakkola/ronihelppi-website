import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SITE_URL,
  getSiteConfig,
  stripSiteBase,
  toSitePath,
  toSiteUrl,
} from './site-config';

describe('getSiteConfig', () => {
  it('returns the production site URL by default', () => {
    expect(getSiteConfig({})).toEqual({
      base: '/',
      site: DEFAULT_SITE_URL,
    });
  });

  it('builds a preview site URL from env overrides', () => {
    expect(
      getSiteConfig({
        BASE_PATH: 'pr-preview/pr-42',
        SITE_URL: 'https://ronijaakkola.github.io/ronihelppi-website',
      })
    ).toEqual({
      base: '/pr-preview/pr-42',
      site: 'https://ronijaakkola.github.io/ronihelppi-website/pr-preview/pr-42/',
    });
  });

  it('normalizes leading and trailing slashes in the preview base path', () => {
    expect(
      getSiteConfig({
        BASE_PATH: '/pr-preview/pr-42/',
        SITE_URL: 'https://ronijaakkola.github.io/ronihelppi-website/',
      })
    ).toEqual({
      base: '/pr-preview/pr-42',
      site: 'https://ronijaakkola.github.io/ronihelppi-website/pr-preview/pr-42/',
    });
  });

  it('rejects non-root-relative base paths', () => {
    expect(() => getSiteConfig({ BASE_PATH: '../nope' })).toThrow(
      'BASE_PATH must be a root-relative path'
    );
  });
});

describe('toSiteUrl', () => {
  it('resolves absolute URLs against the configured site URL without dropping the base path', () => {
    const site = 'https://ronijaakkola.github.io/ronihelppi-website/pr-preview/pr-42/';

    expect(toSiteUrl('/', site)).toBe(
      'https://ronijaakkola.github.io/ronihelppi-website/pr-preview/pr-42/'
    );
    expect(toSiteUrl('/writing/test-post/', site)).toBe(
      'https://ronijaakkola.github.io/ronihelppi-website/pr-preview/pr-42/writing/test-post/'
    );
    expect(toSiteUrl('/og-default.png', site)).toBe(
      'https://ronijaakkola.github.io/ronihelppi-website/pr-preview/pr-42/og-default.png'
    );
  });
});

describe('toSitePath', () => {
  it('builds base-aware internal hrefs for preview deployments', () => {
    const site = 'https://ronijaakkola.github.io/ronihelppi-website/pr-preview/pr-42/';

    expect(toSitePath('/', site)).toBe('/ronihelppi-website/pr-preview/pr-42/');
    expect(toSitePath('/about', site)).toBe('/ronihelppi-website/pr-preview/pr-42/about');
    expect(toSitePath('/rss.xml', site)).toBe('/ronihelppi-website/pr-preview/pr-42/rss.xml');
  });
});

describe('stripSiteBase', () => {
  it('removes the configured base path from Astro pathname values', () => {
    const site = 'https://ronijaakkola.github.io/ronihelppi-website/pr-preview/pr-42/';

    expect(stripSiteBase('/ronihelppi-website/pr-preview/pr-42/', site)).toBe('/');
    expect(stripSiteBase('/ronihelppi-website/pr-preview/pr-42/writing/test-post/', site)).toBe('/writing/test-post/');
  });
});
