const ROOT_PATH = '/';

export const DEFAULT_SITE_URL = 'https://ronihelppi.com/';

interface SiteConfigEnv {
  SITE_URL?: string;
  BASE_PATH?: string;
  [key: string]: string | undefined;
}

type SiteLike = string | URL | undefined;

function normalizeSiteUrl(siteUrl: string): string {
  const url = new URL(siteUrl);
  const pathname = url.pathname.replace(/\/+$/, '');
  url.pathname = pathname ? `${pathname}/` : ROOT_PATH;
  return url.toString();
}

function normalizeBasePath(basePath?: string): string {
  if (!basePath) {
    return ROOT_PATH;
  }

  const trimmed = basePath.trim();
  if (!trimmed || trimmed === ROOT_PATH) {
    return ROOT_PATH;
  }

  if (trimmed.includes('://') || trimmed.includes('?') || trimmed.includes('#') || trimmed.includes('..')) {
    throw new Error('BASE_PATH must be a root-relative path');
  }

  const segments = trimmed.split('/').filter(Boolean);
  return segments.length === 0 ? ROOT_PATH : `/${segments.join('/')}`;
}

export function getSiteConfig(env: SiteConfigEnv = {}): { site: string; base: string } {
  const normalizedSite = normalizeSiteUrl(env.SITE_URL || DEFAULT_SITE_URL);
  const normalizedBase = normalizeBasePath(env.BASE_PATH);
  const site = normalizeSiteUrl(toSiteUrl(normalizedBase, normalizedSite));

  return {
    site,
    base: normalizedBase,
  };
}

export function toSiteUrl(pathname: string, site: SiteLike): string {
  const baseUrl = typeof site === 'string'
    ? site
    : site?.toString() || DEFAULT_SITE_URL;
  const siteBasePath = new URL(baseUrl).pathname.replace(/\/$/, '');

  if (siteBasePath && (pathname === siteBasePath || pathname === `${siteBasePath}/` || pathname.startsWith(`${siteBasePath}/`))) {
    return new URL(pathname, new URL(baseUrl).origin).toString();
  }

  const normalizedPath = pathname === ROOT_PATH ? '' : pathname.replace(/^\/+/, '');
  return new URL(normalizedPath, baseUrl).toString();
}

export function toSitePath(pathname: string, site: SiteLike): string {
  const resolvedUrl = new URL(toSiteUrl(pathname, site));
  return `${resolvedUrl.pathname}${resolvedUrl.search}${resolvedUrl.hash}`;
}

export function stripSiteBase(pathname: string, site: SiteLike): string {
  const basePath = new URL(toSiteUrl('/', site)).pathname.replace(/\/$/, '');

  if (!basePath) {
    return pathname;
  }

  if (pathname === basePath) {
    return ROOT_PATH;
  }

  return pathname.startsWith(basePath) ? pathname.slice(basePath.length) || ROOT_PATH : pathname;
}
