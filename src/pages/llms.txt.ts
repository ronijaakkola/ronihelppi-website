import { bio, tagline, contact } from '../data/profile';
import type { APIContext } from 'astro';

// The llms.txt index/summary, generated so the bio and contact links stay in
// sync with the About page and JSON-LD (all sourced from src/data/profile.ts).
// The full-content companion is llms-full.txt.
export function GET(context: APIContext) {
  const site = context.site!.origin; // e.g. https://ronihelppi.com (no trailing slash)
  const abs = (path: string) => new URL(path, context.site).href.replace(/\/$/, '');

  const sections = [
    { title: 'About', path: '/about', note: 'Background, experience, and contact info' },
    { title: 'Writing', path: '/writing', note: 'Articles on design, technology, and creative work' },
    { title: 'Projects', path: '/projects', note: 'UX design projects and case studies' },
    { title: 'Contact', path: '/contact', note: 'Email, LinkedIn, X, and GitHub links' },
  ];

  const feeds = [
    { title: 'RSS Feed', path: '/rss.xml', note: 'Blog posts in XML format' },
    { title: 'Full Content for LLMs', path: '/llms-full.txt', note: 'All writing and project content in plain text' },
  ];

  const lines: string[] = [];

  lines.push('# Roni Helppi');
  lines.push('');
  lines.push(`> ${tagline}`);
  lines.push('');

  lines.push('## About');
  lines.push('');
  lines.push(bio);
  lines.push('');
  lines.push(`- Site: ${site}`);
  lines.push(`- Email: ${contact.email}`);
  lines.push(`- LinkedIn: ${contact.linkedin}`);
  lines.push(`- GitHub: ${contact.github}`);
  lines.push(`- X: ${contact.x}`);
  lines.push('');

  lines.push('## Sections');
  lines.push('');
  for (const s of sections) {
    lines.push(`- [${s.title}](${abs(s.path)}): ${s.note}`);
  }
  lines.push('');

  lines.push('## Content Feeds');
  lines.push('');
  for (const f of feeds) {
    lines.push(`- [${f.title}](${abs(f.path)}): ${f.note}`);
  }
  lines.push('');

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
